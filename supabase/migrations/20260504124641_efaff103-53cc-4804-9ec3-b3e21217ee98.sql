
-- 1. Étendre l'enum product_type
ALTER TYPE public.product_type ADD VALUE IF NOT EXISTS 'community';

-- 2. Colonnes tarification communauté
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS community_price_monthly numeric,
  ADD COLUMN IF NOT EXISTS community_price_yearly numeric,
  ADD COLUMN IF NOT EXISTS community_price_one_time numeric;

-- 3. communities
CREATE TABLE IF NOT EXISTS public.communities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL UNIQUE,
  creator_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  cover_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;

-- 4. memberships (créée AVANT les fonctions qui la référencent)
CREATE TABLE IF NOT EXISTS public.community_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL,
  billing_cycle text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  started_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  last_order_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(community_id, customer_id)
);
ALTER TABLE public.community_memberships ENABLE ROW LEVEL SECURITY;

-- 5. Helper functions (security definer)
CREATE OR REPLACE FUNCTION public.is_active_community_member(_community_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.community_memberships m
    JOIN public.customers c ON c.id = m.customer_id
    WHERE m.community_id = _community_id
      AND c.auth_id = auth.uid()
      AND m.status = 'active'
      AND (m.expires_at IS NULL OR m.expires_at > now())
  );
$$;

CREATE OR REPLACE FUNCTION public.is_community_creator(_community_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.communities WHERE id = _community_id AND creator_id = auth.uid());
$$;

-- Policies communities
CREATE POLICY "Public can view communities" ON public.communities
  FOR SELECT USING (true);
CREATE POLICY "Creators can manage own communities" ON public.communities
  FOR ALL USING (auth.uid() = creator_id) WITH CHECK (auth.uid() = creator_id);

-- Policies memberships
CREATE POLICY "Customer reads own membership" ON public.community_memberships
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.customers c WHERE c.id = customer_id AND c.auth_id = auth.uid())
  );
CREATE POLICY "Creator reads memberships of own community" ON public.community_memberships
  FOR SELECT USING (public.is_community_creator(community_id));
CREATE POLICY "System inserts memberships" ON public.community_memberships
  FOR INSERT WITH CHECK (true);
CREATE POLICY "System updates memberships" ON public.community_memberships
  FOR UPDATE USING (true);
CREATE POLICY "Creator can revoke membership" ON public.community_memberships
  FOR DELETE USING (public.is_community_creator(community_id));

-- 6. channels
CREATE TABLE IF NOT EXISTS public.community_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  type text NOT NULL DEFAULT 'chat',
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.community_channels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members and creator view channels" ON public.community_channels
  FOR SELECT USING (public.is_active_community_member(community_id) OR public.is_community_creator(community_id));
CREATE POLICY "Creator manages channels" ON public.community_channels
  FOR ALL USING (public.is_community_creator(community_id)) WITH CHECK (public.is_community_creator(community_id));

-- 7. messages
CREATE TABLE IF NOT EXISTS public.community_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid NOT NULL REFERENCES public.community_channels(id) ON DELETE CASCADE,
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  sender_auth_id uuid,
  sender_customer_id uuid,
  sender_name text NOT NULL,
  sender_avatar text,
  content text NOT NULL,
  attachment_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members and creator read messages" ON public.community_messages
  FOR SELECT USING (public.is_active_community_member(community_id) OR public.is_community_creator(community_id));
CREATE POLICY "Members and creator post messages" ON public.community_messages
  FOR INSERT WITH CHECK (
    (public.is_active_community_member(community_id) OR public.is_community_creator(community_id))
    AND sender_auth_id = auth.uid()
  );
CREATE POLICY "Author or creator delete message" ON public.community_messages
  FOR DELETE USING (sender_auth_id = auth.uid() OR public.is_community_creator(community_id));

-- 8. posts
CREATE TABLE IF NOT EXISTS public.community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  author_id uuid NOT NULL,
  title text,
  content text NOT NULL,
  image_url text,
  likes_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members and creator read posts" ON public.community_posts
  FOR SELECT USING (public.is_active_community_member(community_id) OR public.is_community_creator(community_id));
CREATE POLICY "Creator manages posts" ON public.community_posts
  FOR ALL USING (public.is_community_creator(community_id)) WITH CHECK (public.is_community_creator(community_id));

-- 9. comments
CREATE TABLE IF NOT EXISTS public.community_post_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  author_auth_id uuid NOT NULL,
  author_name text NOT NULL,
  author_avatar text,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.community_post_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members and creator read comments" ON public.community_post_comments
  FOR SELECT USING (public.is_active_community_member(community_id) OR public.is_community_creator(community_id));
CREATE POLICY "Members and creator comment" ON public.community_post_comments
  FOR INSERT WITH CHECK (
    (public.is_active_community_member(community_id) OR public.is_community_creator(community_id))
    AND author_auth_id = auth.uid()
  );
CREATE POLICY "Author or creator delete comment" ON public.community_post_comments
  FOR DELETE USING (author_auth_id = auth.uid() OR public.is_community_creator(community_id));

-- 10. likes
CREATE TABLE IF NOT EXISTS public.community_post_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_auth_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_auth_id)
);
ALTER TABLE public.community_post_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members and creator read likes" ON public.community_post_likes
  FOR SELECT USING (public.is_active_community_member(community_id) OR public.is_community_creator(community_id));
CREATE POLICY "Members and creator like" ON public.community_post_likes
  FOR INSERT WITH CHECK (
    (public.is_active_community_member(community_id) OR public.is_community_creator(community_id))
    AND user_auth_id = auth.uid()
  );
CREATE POLICY "User unlikes own like" ON public.community_post_likes
  FOR DELETE USING (user_auth_id = auth.uid());

-- 11. resources
CREATE TABLE IF NOT EXISTS public.community_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  resource_type text NOT NULL DEFAULT 'file',
  url text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.community_resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members and creator read resources" ON public.community_resources
  FOR SELECT USING (public.is_active_community_member(community_id) OR public.is_community_creator(community_id));
CREATE POLICY "Creator manages resources" ON public.community_resources
  FOR ALL USING (public.is_community_creator(community_id)) WITH CHECK (public.is_community_creator(community_id));

-- 12. events
CREATE TABLE IF NOT EXISTS public.community_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  meeting_url text,
  cover_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.community_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members and creator read events" ON public.community_events
  FOR SELECT USING (public.is_active_community_member(community_id) OR public.is_community_creator(community_id));
CREATE POLICY "Creator manages events" ON public.community_events
  FOR ALL USING (public.is_community_creator(community_id)) WITH CHECK (public.is_community_creator(community_id));

-- 13. Triggers
CREATE TRIGGER trg_communities_updated BEFORE UPDATE ON public.communities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_memberships_updated BEFORE UPDATE ON public.community_memberships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.update_post_likes_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END; $$;
CREATE TRIGGER trg_post_likes_count
  AFTER INSERT OR DELETE ON public.community_post_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_post_likes_count();

-- 14. Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_post_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_post_likes;

-- 15. Indexes
CREATE INDEX IF NOT EXISTS idx_community_messages_channel ON public.community_messages(channel_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_community ON public.community_posts(community_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_memberships_lookup ON public.community_memberships(community_id, customer_id);
CREATE INDEX IF NOT EXISTS idx_channels_community ON public.community_channels(community_id, position);
