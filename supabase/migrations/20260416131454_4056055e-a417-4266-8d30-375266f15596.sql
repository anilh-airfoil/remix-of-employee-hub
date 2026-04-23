
-- Add email column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;

-- Update handle_new_user to also insert a profile row with email
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  new_user_id uuid;
BEGIN
  INSERT INTO public.users (auth_id, role, status)
  VALUES (NEW.id, 'member', 'active')
  RETURNING id INTO new_user_id;

  INSERT INTO public.profiles (user_id, email)
  VALUES (new_user_id, NEW.email)
  ON CONFLICT (user_id) DO UPDATE SET email = EXCLUDED.email;

  RETURN NEW;
END;
$function$;
