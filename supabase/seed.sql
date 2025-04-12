-- Seed departments first
DO $$
BEGIN
    INSERT INTO public.departments (name, description) VALUES
        ('Human Resources', 'Manages employee relations, recruitment, and workplace policies');
    INSERT INTO public.departments (name, description) VALUES
        ('Information Technology', 'Handles technical infrastructure and software development');
    INSERT INTO public.departments (name, description) VALUES
        ('Finance', 'Manages company finances, budgeting, and accounting');
    INSERT INTO public.departments (name, description) VALUES
        ('Marketing', 'Handles brand management, marketing strategies, and communications');
    INSERT INTO public.departments (name, description) VALUES
        ('Operations', 'Oversees day-to-day business operations and logistics');
    INSERT INTO public.departments (name, description) VALUES
        ('Research & Development', 'Focuses on innovation and product development');
    INSERT INTO public.departments (name, description) VALUES
        ('Sales', 'Manages client relationships and revenue generation');
    INSERT INTO public.departments (name, description) VALUES
        ('Customer Service', 'Provides support and assistance to customers');
    EXCEPTION WHEN unique_violation THEN
        -- Do nothing, departments already exist
END $$;

-- Create admin user with mock data
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@email.com',
    '$2a$10$5I.S8FGIA0SroPCGrUWPkuE9wBBPVWGxVRU9eDXPsmEKJQmm9dZPq', -- hash for '1234'
    now(),
    jsonb_build_object(
        'first_name', 'System',
        'last_name', 'Administrator'
    ),
    now(),
    now()
) ON CONFLICT DO NOTHING;

-- Set admin identity
INSERT INTO auth.identities (
    provider_id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
)
SELECT
    'email',
    id,
    jsonb_build_object(
        'sub', id,
        'email', email
    ),
    'email',
    now(),
    now(),
    now()
FROM auth.users
WHERE email = 'admin@email.com'
ON CONFLICT DO NOTHING;

-- Create admin's employee profile (after departments are created)
INSERT INTO public.employee_profiles (
    id,
    department_id,
    job_title,
    hire_date,
    manager_id,
    bio,
    phone,
    address,
    is_admin,
    created_at,
    updated_at
)
SELECT
    u.id,
    d.id as department_id,
    'Chief Executive Officer',
    '2025-01-01'::date,
    NULL, -- CEO has no manager
    'System administrator and chief executive of the organization',
    '+1 (555) 123-4567',
    '123 Admin Street, Tech City, TC 12345',
    true, -- Set as admin
    now(),
    now()
FROM auth.users u
CROSS JOIN (
    SELECT id 
    FROM public.departments 
    WHERE name = 'Human Resources' 
    LIMIT 1
) d
WHERE u.email = 'admin@email.com'
ON CONFLICT (id) DO NOTHING;