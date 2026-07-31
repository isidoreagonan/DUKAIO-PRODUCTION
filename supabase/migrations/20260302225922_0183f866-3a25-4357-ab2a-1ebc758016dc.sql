
-- Create updated_at function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Support conversations table
CREATE TABLE public.support_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT 'Support',
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.support_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations" ON public.support_conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create conversations" ON public.support_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin can view all conversations" ON public.support_conversations FOR SELECT USING (auth.email() = 'isidoreagonan@gmail.com');
CREATE POLICY "Admin can update all conversations" ON public.support_conversations FOR UPDATE USING (auth.email() = 'isidoreagonan@gmail.com');

CREATE TRIGGER update_support_conversations_updated_at
  BEFORE UPDATE ON public.support_conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Support messages table
CREATE TABLE public.support_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.support_conversations(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL DEFAULT 'user',
  sender_id UUID,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own conversation messages" ON public.support_messages FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.support_conversations c WHERE c.id = support_messages.conversation_id AND c.user_id = auth.uid()));

CREATE POLICY "Users can send messages" ON public.support_messages FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.support_conversations c WHERE c.id = support_messages.conversation_id AND c.user_id = auth.uid()) OR auth.email() = 'isidoreagonan@gmail.com');

CREATE POLICY "Admin can read all messages" ON public.support_messages FOR SELECT
  USING (auth.email() = 'isidoreagonan@gmail.com');

ALTER PUBLICATION supabase_realtime ADD TABLE public.support_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_conversations;

-- Store contact messages
CREATE TABLE public.store_contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_owner_id UUID NOT NULL,
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  sender_phone TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.store_contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can send contact messages" ON public.store_contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Store owners can read contact messages" ON public.store_contact_messages FOR SELECT USING (auth.uid() = store_owner_id);
CREATE POLICY "Store owners can update contact messages" ON public.store_contact_messages FOR UPDATE USING (auth.uid() = store_owner_id);
