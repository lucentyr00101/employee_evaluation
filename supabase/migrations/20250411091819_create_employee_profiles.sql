-- Create employee_profiles table
CREATE TABLE IF NOT EXISTS public.employee_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    department_id UUID REFERENCES public.departments(id),
    job_title VARCHAR,
    hire_date DATE,
    manager_id UUID REFERENCES public.employee_profiles(id),
    bio TEXT,
    phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);