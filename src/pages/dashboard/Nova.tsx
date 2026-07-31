import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Plus, Send, Loader2, Trash2, Sparkles, Wrench, ChevronDown, MessageSquarePlus, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import novaLogo from "@/assets/nova-logo.png";

interface Thread {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
  tools?: Array<{ name: string; args: any; result: any }>;
}

const SUGGESTIONS = [
  "Pourquoi je n'ai pas beaucoup de ventes ?",
  "Audite ma boutique et donne-moi 3 actions prioritaires",
  "Crée un code promo de 20% sur mon meilleur produit",
  "Donne-moi des angles marketing pour la Côte d'Ivoire",
  "Réécris la description de mon dernier produit",
];

export default function Nova() {
  const { user, profile } = useAuth();
  const qc = useQueryClient();
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [openTools, setOpenTools] = useState<Record<string, boolean>>({});
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const skipNextLoadRef = useRef(false);

  const { data: threads = [] } = useQuery({
    queryKey: ["nova-threads", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nova_threads")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data as Thread[];
    },
    enabled: !!user,
  });

  // Load messages when thread changes
  useEffect(() => {
    if (!activeThreadId) {
      setMessages([]);
      return;
    }
    if (skipNextLoadRef.current) {
      skipNextLoadRef.current = false;
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("nova_messages")
        .select("*")
        .eq("thread_id", activeThreadId)
        .order("created_at", { ascending: true });
      const loaded: Message[] = (data || []).map((m: any) => ({
        id: m.id,
        role: m.role,
        content: m.content?.text || "",
        tools: m.content?.tools,
      }));
      setMessages(loaded);
    })();
  }, [activeThreadId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [activeThreadId, loading]);

  const newThread = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("nova_threads")
      .insert({ user_id: user.id, title: "Nouvelle conversation" })
      .select()
      .single();
    if (error) {
      toast.error("Impossible de créer la conversation");
      return;
    }
    qc.invalidateQueries({ queryKey: ["nova-threads"] });
    setActiveThreadId(data.id);
    setMessages([]);
  };

  const deleteThread = async (id: string) => {
    await supabase.from("nova_threads").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["nova-threads"] });
    if (activeThreadId === id) {
      setActiveThreadId(null);
      setMessages([]);
    }
  };

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading || !user) return;

    let threadId = activeThreadId;
    if (!threadId) {
      const { data, error } = await supabase
        .from("nova_threads")
        .insert({ user_id: user.id, title: content.slice(0, 60) })
        .select()
        .single();
      if (error) {
        toast.error("Erreur création conversation");
        return;
      }
      threadId = data.id;
      skipNextLoadRef.current = true; // prevent the useEffect from wiping the optimistic message
      setActiveThreadId(threadId);
      qc.invalidateQueries({ queryKey: ["nova-threads"] });
    }

    const newMsgs = [...messages, { role: "user" as const, content }];
    setMessages(newMsgs);
    setInput("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("nova-chat", {
        body: {
          thread_id: threadId,
          messages: newMsgs.map((m) => ({ role: m.role, content: m.content })),
        },
      });
      if (error) throw error;
      if (data.error) {
        toast.error(data.error);
        return;
      }
      setMessages((prev) => [...prev, { role: "assistant", content: data.message, tools: data.tools }]);
      qc.invalidateQueries({ queryKey: ["nova-threads"] });
    } catch (err: any) {
      toast.error(err.message || "Erreur Nova");
      setMessages((prev) => [...prev, { role: "assistant", content: "Désolé, une erreur est survenue. Réessayez." }]);
    } finally {
      setLoading(false);
    }
  };

  const firstName = (profile as any)?.first_name || profile?.display_name?.split(" ")[0] || "";

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100dvh-4rem)] -m-4 md:-m-6 lg:-m-8 overflow-hidden">
        {/* Threads sidebar (desktop) */}
        <aside className="hidden lg:flex w-72 flex-col border-r border-border bg-card/50">
          <div className="p-4 border-b border-border">
            <button
              onClick={newThread}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-sm font-semibold hover:opacity-90 transition"
            >
              <MessageSquarePlus className="h-4 w-4" /> Nouvelle conversation
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {threads.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-8">Aucune conversation</p>
            )}
            {threads.map((t) => (
              <div
                key={t.id}
                className={`group flex items-center gap-2 rounded-lg px-3 py-2 cursor-pointer transition ${
                  activeThreadId === t.id ? "bg-primary/10 text-foreground" : "hover:bg-muted text-muted-foreground"
                }`}
              >
                <button onClick={() => setActiveThreadId(t.id)} className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium truncate">{t.title}</p>
                  <p className="text-[10px] opacity-60">{format(new Date(t.updated_at), "d MMM HH:mm", { locale: fr })}</p>
                </button>
                <button
                  onClick={() => deleteThread(t.id)}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </aside>

        {/* Chat */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 px-3 md:px-4 py-2.5 md:py-3 border-b border-border bg-card/30 shrink-0">
            <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
              <Sheet>
                <SheetTrigger asChild>
                  <button className="lg:hidden h-9 w-9 -ml-1 rounded-lg hover:bg-muted flex items-center justify-center text-foreground shrink-0">
                    <Menu className="h-5 w-5" />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0 flex flex-col">
                  <SheetHeader className="p-4 border-b border-border">
                    <SheetTitle className="flex items-center gap-2 text-left">
                      <img src={novaLogo} alt="" width={24} height={24} className="h-6 w-6" />
                      Conversations
                    </SheetTitle>
                  </SheetHeader>
                  <div className="p-4 border-b border-border">
                    <button
                      onClick={newThread}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-sm font-semibold hover:opacity-90 transition"
                    >
                      <MessageSquarePlus className="h-4 w-4" /> Nouvelle conversation
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {threads.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-8">Aucune conversation</p>
                    )}
                    {threads.map((t) => (
                      <div
                        key={t.id}
                        className={`group flex items-center gap-2 rounded-lg px-3 py-2.5 transition ${
                          activeThreadId === t.id ? "bg-primary/10 text-foreground" : "hover:bg-muted text-muted-foreground"
                        }`}
                      >
                        <button onClick={() => setActiveThreadId(t.id)} className="flex-1 text-left min-w-0">
                          <p className="text-sm font-medium truncate">{t.title}</p>
                          <p className="text-[10px] opacity-60">{format(new Date(t.updated_at), "d MMM HH:mm", { locale: fr })}</p>
                        </button>
                        <button
                          onClick={() => deleteThread(t.id)}
                          className="text-muted-foreground hover:text-destructive transition p-1"
                          aria-label="Supprimer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
              <img src={novaLogo} alt="Nova" width={32} height={32} className="h-8 w-8 md:h-9 md:w-9 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground leading-tight">Nova</p>
                <p className="text-[10px] text-muted-foreground truncate leading-tight">Votre assistant Dukaio</p>
              </div>
            </div>
            <button
              onClick={newThread}
              className="lg:hidden flex items-center gap-1 text-xs font-semibold text-primary shrink-0 px-2 py-1.5 rounded-lg hover:bg-primary/10"
            >
              <Plus className="h-4 w-4" /> Nouveau
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 md:px-4 py-4 md:py-6">
            {messages.length === 0 ? (
              <div className="max-w-2xl mx-auto text-center pt-8">
                <img src={novaLogo} alt="Nova" width={80} height={80} className="h-20 w-20 mx-auto mb-4" />
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">Hey {firstName}, je suis Nova</h1>
                <p className="mt-2 text-base font-semibold text-primary">Comment puis-je vous aider ?</p>
                <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">
                  Je peux analyser vos ventes, auditer votre boutique, créer des codes promo, rédiger des descriptions et vous donner des angles marketing.
                </p>
                <div className="mt-8 flex flex-col gap-2 max-w-md mx-auto">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="text-left text-sm rounded-full border border-border bg-card hover:border-primary/50 hover:bg-primary/5 px-4 py-2.5 transition text-foreground"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto space-y-6">
                {messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={m.role === "user" ? "flex justify-end" : ""}
                  >
                    {m.role === "user" ? (
                      <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-primary text-primary-foreground px-4 py-2.5 text-sm whitespace-pre-wrap">
                        {m.content}
                      </div>
                    ) : (
                      <div className="flex items-start gap-3">
                        <img src={novaLogo} alt="" width={28} height={28} className="h-7 w-7 shrink-0 mt-1" />
                        <div className="flex-1 min-w-0 space-y-2">
                          {m.tools && m.tools.length > 0 && (
                            <div className="space-y-1.5">
                              {m.tools.map((t, k) => {
                                const key = `${i}-${k}`;
                                const open = openTools[key];
                                return (
                                  <div key={k} className="rounded-lg border border-border bg-muted/40 text-xs">
                                    <button
                                      onClick={() => setOpenTools((p) => ({ ...p, [key]: !p[key] }))}
                                      className="w-full flex items-center justify-between gap-2 px-3 py-1.5 text-left"
                                    >
                                      <span className="flex items-center gap-2 text-foreground">
                                        <Wrench className="h-3.5 w-3.5 text-primary" />
                                        <span className="font-mono">{t.name}</span>
                                        {t.result?.success === false && <span className="text-destructive">erreur</span>}
                                        {t.result?.success === true && <span className="text-emerald-600">✓</span>}
                                      </span>
                                      <ChevronDown className={`h-3.5 w-3.5 transition ${open ? "rotate-180" : ""}`} />
                                    </button>
                                    {open && (
                                      <div className="border-t border-border px-3 py-2 space-y-2 max-h-64 overflow-auto">
                                        <div>
                                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Args</p>
                                          <pre className="text-[10px] whitespace-pre-wrap break-all">{JSON.stringify(t.args, null, 2)}</pre>
                                        </div>
                                        <div>
                                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Résultat</p>
                                          <pre className="text-[10px] whitespace-pre-wrap break-all">{JSON.stringify(t.result, null, 2)}</pre>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          <div className="prose prose-sm max-w-none dark:prose-invert text-foreground [&_p]:mb-2 [&_p]:last:mb-0 [&_ul]:my-2 [&_ol]:my-2 [&_h2]:mt-3 [&_h2]:mb-1.5 [&_h2]:text-base [&_h3]:text-sm [&_h3]:mt-2">
                            <ReactMarkdown>{m.content}</ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
                <AnimatePresence>
                  {loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-start gap-3">
                      <img src={novaLogo} alt="" width={28} height={28} className="h-7 w-7" />
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Sparkles className="h-3.5 w-3.5 animate-pulse text-primary" />
                        <span className="bg-gradient-to-r from-muted-foreground via-foreground to-muted-foreground bg-[length:200%_100%] bg-clip-text text-transparent animate-[shimmer_2s_linear_infinite]">
                          Nova réfléchit…
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {/* Composer */}
          <div className="border-t border-border bg-card/40 px-3 md:px-4 py-2.5 md:py-3 shrink-0">
            <form
              onSubmit={(e) => { e.preventDefault(); send(); }}
              className="max-w-3xl mx-auto flex items-end gap-2 rounded-2xl border border-border bg-background px-3 py-2 focus-within:border-primary/50 transition"
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Demandez à Nova…"
                rows={1}
                disabled={loading}
                className="flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none py-1.5 max-h-32"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50 transition"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </form>
            <p className="text-[10px] text-muted-foreground text-center mt-2">
              Nova est une IA et peut faire des erreurs. Vérifiez les informations importantes.
            </p>
          </div>
        </main>
      </div>
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
    </DashboardLayout>
  );
}
