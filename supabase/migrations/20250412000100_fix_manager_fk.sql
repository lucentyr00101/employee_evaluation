-- Drop the existing foreign key constraint
ALTER TABLE public.employee_profiles
DROP CONSTRAINT IF EXISTS employee_profiles_manager_id_fkey;

-- Add the correct foreign key constraint
ALTER TABLE public.employee_profiles
ADD CONSTRAINT employee_profiles_manager_id_fkey
FOREIGN KEY (manager_id) REFERENCES auth.users(id) ON DELETE SET NULL;