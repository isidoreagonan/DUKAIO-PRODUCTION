ALTER TABLE public.identity_verifications REPLICA IDENTITY FULL;
DO $$ BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.identity_verifications;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;