
-- Fix function search_path security warnings
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_poll_statuses()
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE polls SET status = 'active' WHERE status = 'scheduled' AND start_date <= NOW();
  UPDATE polls SET status = 'closed' WHERE status = 'active' AND end_date <= NOW();
END;
$$;

CREATE OR REPLACE FUNCTION public.has_user_voted(p_poll_id uuid, p_voter_id text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM votes WHERE poll_id = p_poll_id AND user_id::text = p_voter_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_poll_votes(p_poll_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE polls SET total_votes = total_votes + 1 WHERE id = p_poll_id;
END;
$$;
