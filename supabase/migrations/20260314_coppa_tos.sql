-- COPPA Age Gate + TOS Acceptance
-- Adds date_of_birth to profiles, legal_agreements audit table, and server-side age check

-- 1. Add date_of_birth column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS date_of_birth date;

-- 2. Create legal_agreements audit table (append-only)
CREATE TABLE IF NOT EXISTS legal_agreements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  agreement_type text NOT NULL,       -- 'tos', 'privacy_policy'
  version text NOT NULL DEFAULT '1.0',
  accepted_at timestamptz DEFAULT now(),
  user_agent text
);

CREATE INDEX IF NOT EXISTS idx_legal_agreements_user ON legal_agreements(user_id);

-- RLS: insert own, select own, no update/delete (immutable audit log)
ALTER TABLE legal_agreements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "insert_own" ON legal_agreements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "select_own" ON legal_agreements
  FOR SELECT USING (auth.uid() = user_id);

-- 3. Server-side age backstop trigger (rejects under-13 profiles)
CREATE OR REPLACE FUNCTION public.check_minimum_age()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.date_of_birth IS NOT NULL
     AND age(current_date, NEW.date_of_birth) < interval '13 years' THEN
    RAISE EXCEPTION 'User must be at least 13 years old';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_minimum_age ON profiles;
CREATE TRIGGER enforce_minimum_age
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE public.check_minimum_age();

-- 4. Update handle_new_user trigger to pass date_of_birth from user_metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, date_of_birth)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    (NEW.raw_user_meta_data->>'date_of_birth')::date
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
