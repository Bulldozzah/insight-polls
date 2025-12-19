
-- Drop existing trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create enums (use IF NOT EXISTS pattern via DO block)
DO $$ BEGIN
  CREATE TYPE public.age_range AS ENUM ('18-26', '27-35', '36-45', '46-55', '56-65', '65+');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.employment_status AS ENUM ('employed', 'self_employed', 'unemployed', 'student', 'retired', 'other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.poll_type AS ENUM ('single_choice', 'multiple_choice', 'yes_no');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  age_range public.age_range,
  location TEXT,
  job_title TEXT,
  occupation_category TEXT,
  employment_status public.employment_status,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, role)
);

-- Create polls table
CREATE TABLE IF NOT EXISTS public.polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  poll_type public.poll_type NOT NULL DEFAULT 'single_choice',
  category poll_category NOT NULL DEFAULT 'other',
  status poll_status NOT NULL DEFAULT 'draft',
  required_demographics BOOLEAN DEFAULT false,
  max_selections INTEGER DEFAULT 1,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  total_votes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create poll_options table
CREATE TABLE IF NOT EXISTS public.poll_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE NOT NULL,
  option_text TEXT NOT NULL,
  vote_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create votes table
CREATE TABLE IF NOT EXISTS public.votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (poll_id, user_id)
);

-- Create vote_answers table
CREATE TABLE IF NOT EXISTS public.vote_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vote_id UUID REFERENCES public.votes(id) ON DELETE CASCADE NOT NULL,
  option_id UUID REFERENCES public.poll_options(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_polls_updated_at ON public.polls;
CREATE TRIGGER update_polls_updated_at
  BEFORE UPDATE ON public.polls
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create increment_vote_counts function
CREATE OR REPLACE FUNCTION public.increment_vote_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.poll_options SET vote_count = vote_count + 1 WHERE id = NEW.option_id;
  UPDATE public.polls SET total_votes = total_votes + 1 WHERE id = (SELECT poll_id FROM public.votes WHERE id = NEW.vote_id);
  RETURN NEW;
END;
$$;

-- Create vote count trigger
DROP TRIGGER IF EXISTS increment_vote_counts_trigger ON public.vote_answers;
CREATE TRIGGER increment_vote_counts_trigger
  AFTER INSERT ON public.vote_answers
  FOR EACH ROW EXECUTE FUNCTION public.increment_vote_counts();

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vote_answers ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- User roles policies
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Polls policies
DROP POLICY IF EXISTS "Anyone can view active polls" ON public.polls;
CREATE POLICY "Anyone can view active polls" ON public.polls
  FOR SELECT USING (status = 'active' OR status = 'closed');

DROP POLICY IF EXISTS "Admins can view all polls" ON public.polls;
CREATE POLICY "Admins can view all polls" ON public.polls
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can create polls" ON public.polls;
CREATE POLICY "Admins can create polls" ON public.polls
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update polls" ON public.polls;
CREATE POLICY "Admins can update polls" ON public.polls
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete polls" ON public.polls;
CREATE POLICY "Admins can delete polls" ON public.polls
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Poll options policies
DROP POLICY IF EXISTS "Anyone can view poll options" ON public.poll_options;
CREATE POLICY "Anyone can view poll options" ON public.poll_options
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage poll options" ON public.poll_options;
CREATE POLICY "Admins can manage poll options" ON public.poll_options
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Votes policies
DROP POLICY IF EXISTS "Users can view their own votes" ON public.votes;
CREATE POLICY "Users can view their own votes" ON public.votes
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can create votes" ON public.votes;
CREATE POLICY "Authenticated users can create votes" ON public.votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Vote answers policies
DROP POLICY IF EXISTS "Users can view their own vote answers" ON public.vote_answers;
CREATE POLICY "Users can view their own vote answers" ON public.vote_answers
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.votes WHERE votes.id = vote_answers.vote_id AND votes.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can create vote answers for their votes" ON public.vote_answers;
CREATE POLICY "Users can create vote answers for their votes" ON public.vote_answers
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.votes WHERE votes.id = vote_answers.vote_id AND votes.user_id = auth.uid())
  );
