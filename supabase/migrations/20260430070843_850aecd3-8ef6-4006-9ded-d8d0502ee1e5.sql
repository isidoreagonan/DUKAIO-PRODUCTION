-- Bot polling state (singleton)
CREATE TABLE public.telegram_bot_state (
  id INT PRIMARY KEY CHECK (id = 1),
  update_offset BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO public.telegram_bot_state (id, update_offset) VALUES (1, 0);

ALTER TABLE public.telegram_bot_state ENABLE ROW LEVEL SECURITY;
-- No policies: only service_role can access

-- Incoming Telegram messages
CREATE TABLE public.telegram_messages (
  update_id BIGINT PRIMARY KEY,
  chat_id BIGINT NOT NULL,
  from_user_id BIGINT,
  username TEXT,
  text TEXT,
  raw_update JSONB NOT NULL,
  ai_reply TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_telegram_messages_chat_id ON public.telegram_messages (chat_id);

ALTER TABLE public.telegram_messages ENABLE ROW LEVEL SECURITY;
-- service_role only

-- Seller -> Telegram chat linkage
CREATE TABLE public.telegram_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  chat_id BIGINT NOT NULL UNIQUE,
  username TEXT,
  first_name TEXT,
  notify_sales BOOLEAN NOT NULL DEFAULT true,
  notify_payouts BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_telegram_links_user_id ON public.telegram_links (user_id);

ALTER TABLE public.telegram_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their own telegram link"
  ON public.telegram_links FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete their own telegram link"
  ON public.telegram_links FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users update their own telegram link"
  ON public.telegram_links FOR UPDATE
  USING (auth.uid() = user_id);

-- Linking tokens (one-shot codes for /link CODE)
CREATE TABLE public.telegram_link_tokens (
  token TEXT PRIMARY KEY,
  user_id UUID NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_telegram_link_tokens_user ON public.telegram_link_tokens (user_id);

ALTER TABLE public.telegram_link_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own link tokens"
  ON public.telegram_link_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users create own link tokens"
  ON public.telegram_link_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admin chats receiving global platform alerts
CREATE TABLE public.telegram_admin_chats (
  chat_id BIGINT PRIMARY KEY,
  username TEXT,
  first_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.telegram_admin_chats ENABLE ROW LEVEL SECURITY;
-- service_role only

-- Realtime for messages (so the dashboard could show conversations live later)
ALTER PUBLICATION supabase_realtime ADD TABLE public.telegram_messages;