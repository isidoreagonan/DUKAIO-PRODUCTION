
-- Nova AI Assistant: threads + messages
CREATE TABLE public.nova_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  store_id uuid,
  title text NOT NULL DEFAULT 'Nouvelle conversation',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_nova_threads_user ON public.nova_threads(user_id, updated_at DESC);

ALTER TABLE public.nova_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own threads" ON public.nova_threads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own threads" ON public.nova_threads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own threads" ON public.nova_threads FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own threads" ON public.nova_threads FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE public.nova_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES public.nova_threads(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL CHECK (role IN ('user','assistant','system','tool')),
  content jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_nova_messages_thread ON public.nova_messages(thread_id, created_at ASC);

ALTER TABLE public.nova_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own messages" ON public.nova_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own messages" ON public.nova_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own messages" ON public.nova_messages FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_nova_threads_updated_at
BEFORE UPDATE ON public.nova_threads
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
