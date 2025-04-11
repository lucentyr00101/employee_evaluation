-- Add missing columns to employee_profiles if they don't exist
ALTER TABLE IF EXISTS public.employee_profiles 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS address TEXT;