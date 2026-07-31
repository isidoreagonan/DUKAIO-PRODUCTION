import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { MessageCircle, Send, Loader2, User, Bot, CheckCircle, Mail, Phone, Clock, Reply } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Conversation {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  subject: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_type: string;
  sender_id: string | null;
  content: string;
  created_at: string;
}

interface ContactMessage {
  id: string;
  store_owner_id: string;
  sender_name: string;
  sender_email: string;
  sender_phone: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

const DashboardSupport = () => {
  const { user } = useAuth();
  const isAdmin = user?.email === "isidoreagonan@gmail.com";

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [selectedContact, setSelectedContact] = useState<ContactMessage | null>(null);
  const [contactLoading, setContactLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    if (user) {
      loadConversations();
      loadContactMessages();
    }
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!selectedConv) return;
    const channel = supabase
      .channel(`support-msgs-${selectedConv.id}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "support_messages",
        filter: `conversation_id=eq.${selectedConv.id}`,
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedConv]);

  const loadConversations = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("support_conversations")
      .select("*")
      .order("updated_at", { ascending: false });
    setConversations((data as any) || []);
    setLoading(false);
  };

  const loadContactMessages = async () => {
    setContactLoading(true);
    const { data } = await supabase
      .from("store_contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
    setContactMessages((data as any) || []);
    setContactLoading(false);
  };

  const selectConversation = async (conv: Conversation) => {
    setSelectedConv(conv);
    const { data } = await supabase
      .from("support_messages")
      .select("*")
      .eq("conversation_id", conv.id)
      .order("created_at", { ascending: true });
    setMessages((data as any) || []);
  };

  const sendReply = async () => {
    if (!input.trim() || !selectedConv || !user) return;
    setSending(true);

    try {
      await supabase.from("support_messages").insert({
        conversation_id: selectedConv.id,
        sender_type: "admin",
        sender_id: user.id,
        content: input.trim(),
      } as any);

      if (isAdmin) {


        await supabase.functions.invoke("notify-support-ticket", {
          body: {
            action: "admin_reply",
            recipientEmail: selectedConv.user_email,
            recipientName: selectedConv.user_name,
            replyMessage: input.trim(),
            subject: selectedConv.subject,
          } as any,
        });
      }

      setInput("");
    } finally {
      setSending(false);
    }
  };

  const closeTicket = async (convId: string) => {
    await supabase
      .from("support_conversations")
      .update({ status: "closed" } as any)
      .eq("id", convId);
    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, status: "closed" } : c))
    );
    if (selectedConv?.id === convId) {
      setSelectedConv({ ...selectedConv, status: "closed" });
    }
    toast.success("Ticket fermé");
  };

  const markContactAsRead = async (msg: ContactMessage) => {
    setSelectedContact(msg);
    setReplyText("");
    if (!msg.is_read) {
      await supabase
        .from("store_contact_messages")
        .update({ is_read: true } as any)
        .eq("id", msg.id);
      setContactMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, is_read: true } : m))
      );
    }
  };

  const sendContactReply = async () => {
    if (!selectedContact || !replyText.trim() || !user) return;
    setSendingReply(true);
    try {
      const { error } = await supabase.functions.invoke("store-contact", {
        body: {
          action: "reply",
          store_owner_id: user.id,
          recipient_email: selectedContact.sender_email,
          recipient_name: selectedContact.sender_name,
          reply_message: replyText.trim(),
          original_message: selectedContact.message,
        },
      });
      if (error) throw error;
      toast.success("Réponse envoyée par email !");
      setReplyText("");
    } catch (err: any) {
      console.error("Reply error:", err);
      toast.error("Erreur lors de l'envoi: " + (err.message || "Réessayez"));
    } finally {
      setSendingReply(false);
    }
  };

  const unreadContactCount = contactMessages.filter((m) => !m.is_read).length;

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Messages</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gérez vos tickets de support et les messages de votre boutique
          </p>
        </div>

        <Tabs defaultValue="contact" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="contact" className="gap-2">
              <Mail className="h-4 w-4" />
              Messages boutique
              {unreadContactCount > 0 && (
                <Badge variant="destructive" className="text-[10px] h-5 min-w-5 px-1.5">
                  {unreadContactCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="support" className="gap-2">
              <MessageCircle className="h-4 w-4" />
              {isAdmin ? "Support Admin" : "Mes tickets"}
            </TabsTrigger>
          </TabsList>

          {/* ===== Contact Messages Tab ===== */}
          <TabsContent value="contact">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-280px)]">
              {/* List */}
              <div className="border border-border rounded-xl bg-card overflow-hidden flex flex-col">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-semibold text-foreground">Messages reçus</p>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {contactLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : contactMessages.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Mail className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Aucun message reçu</p>
                    </div>
                  ) : (
                    contactMessages.map((msg) => (
                      <button
                        key={msg.id}
                        onClick={() => markContactAsRead(msg)}
                        className={`w-full text-left px-4 py-3 border-b border-border transition-colors hover:bg-muted/50 ${
                          selectedContact?.id === msg.id ? "bg-primary/5" : ""
                        } ${!msg.is_read ? "bg-primary/[0.03]" : ""}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className={`text-sm truncate ${!msg.is_read ? "font-bold text-foreground" : "font-medium text-foreground"}`}>
                            {msg.sender_name}
                          </p>
                          {!msg.is_read && (
                            <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{msg.message}</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">
                          {new Date(msg.created_at).toLocaleDateString("fr", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Detail + Reply */}
              <div className="lg:col-span-2 border border-border rounded-xl bg-card overflow-hidden flex flex-col">
                {!selectedContact ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                    <Mail className="h-12 w-12 mb-3 opacity-20" />
                    <p className="text-sm">Sélectionnez un message</p>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto flex flex-col">
                    <div className="px-6 py-5 border-b border-border">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-foreground">{selectedContact.sender_name}</h3>
                        <Badge variant={selectedContact.is_read ? "secondary" : "default"} className="text-[10px]">
                          {selectedContact.is_read ? "Lu" : "Non lu"}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5" />
                          <a href={`mailto:${selectedContact.sender_email}`} className="hover:text-primary transition-colors">
                            {selectedContact.sender_email}
                          </a>
                        </span>
                        {selectedContact.sender_phone && (
                          <span className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5" />
                            <a href={`tel:${selectedContact.sender_phone}`} className="hover:text-primary transition-colors">
                              {selectedContact.sender_phone}
                            </a>
                          </span>
                        )}
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          {new Date(selectedContact.created_at).toLocaleDateString("fr", {
                            day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
                          })}
                        </span>
                      </div>
                    </div>
                    
                    {/* Original message */}
                    <div className="px-6 py-5 flex-1">
                      <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{selectedContact.message}</p>
                    </div>

                    {/* Reply section */}
                    <div className="px-6 py-4 border-t border-border bg-muted/30">
                      <div className="flex items-center gap-2 mb-3">
                        <Reply className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-medium text-foreground">Répondre à {selectedContact.sender_name}</p>
                      </div>
                      <Textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Écrivez votre réponse..."
                        className="min-h-[100px] mb-3"
                      />
                      <Button
                        onClick={sendContactReply}
                        disabled={sendingReply || !replyText.trim()}
                        size="sm"
                        className="gap-2"
                      >
                        {sendingReply ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                        Envoyer la réponse par email
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ===== Support Tickets Tab ===== */}
          <TabsContent value="support">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-280px)]">
              <div className="border border-border rounded-xl bg-card overflow-hidden flex flex-col">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-semibold text-foreground">Conversations</p>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : conversations.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Aucune conversation</p>
                    </div>
                  ) : (
                    conversations.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => selectConversation(conv)}
                        className={`w-full text-left px-4 py-3 border-b border-border transition-colors hover:bg-muted/50 ${
                          selectedConv?.id === conv.id ? "bg-primary/5" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-foreground truncate">{conv.user_name}</p>
                          <Badge variant={conv.status === "open" ? "default" : "secondary"} className="text-[10px]">
                            {conv.status === "open" ? "Ouvert" : "Fermé"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{conv.subject}</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">
                          {new Date(conv.created_at).toLocaleDateString("fr", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div className="lg:col-span-2 border border-border rounded-xl bg-card overflow-hidden flex flex-col">
                {!selectedConv ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                    <MessageCircle className="h-12 w-12 mb-3 opacity-20" />
                    <p className="text-sm">Sélectionnez une conversation</p>
                  </div>
                ) : (
                  <>
                    <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{selectedConv.user_name}</p>
                        <p className="text-[11px] text-muted-foreground">{selectedConv.user_email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedConv.status === "open" && isAdmin && (
                          <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => closeTicket(selectedConv.id)}>
                            <CheckCircle className="h-3 w-3" />
                            Fermer
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                      {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender_type === "admin" ? "justify-end" : "justify-start"}`}>
                          <div className={`flex items-start gap-2 max-w-[80%] ${msg.sender_type === "admin" ? "flex-row-reverse" : ""}`}>
                            <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${
                              msg.sender_type === "user" ? "bg-primary/10 text-primary" :
                              msg.sender_type === "ai" ? "bg-muted text-muted-foreground" :
                              "bg-emerald-500/10 text-emerald-600"
                            }`}>
                              {msg.sender_type === "user" ? <User className="h-3 w-3" /> :
                               msg.sender_type === "ai" ? <Bot className="h-3 w-3" /> :
                               <User className="h-3 w-3" />}
                            </div>
                            <div className={`rounded-2xl px-3 py-2 text-sm ${
                              msg.sender_type === "admin"
                                ? "bg-primary text-primary-foreground rounded-tr-sm"
                                : msg.sender_type === "ai"
                                ? "bg-muted/50 text-muted-foreground rounded-tl-sm italic"
                                : "bg-muted text-foreground rounded-tl-sm"
                            }`}>
                              {msg.content}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={bottomRef} />
                    </div>

                    {selectedConv.status === "open" && (
                      <div className="border-t border-border px-3 py-3">
                        <form onSubmit={(e) => { e.preventDefault(); sendReply(); }} className="flex items-center gap-2">
                          <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Votre réponse..."
                            className="flex-1 bg-muted rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                            disabled={sending}
                          />
                          <button
                            type="submit"
                            disabled={!input.trim() || sending}
                            className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50"
                          >
                            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                          </button>
                        </form>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default DashboardSupport;
