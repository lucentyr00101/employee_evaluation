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

-- Create admin user with proper metadata and structure
DO $$
DECLARE
    admin_id uuid;
BEGIN
    -- Create admin user
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_user_meta_data,
        is_super_admin,
        created_at,
        updated_at,
        confirmation_sent_at,
        email_change_sent_at,
        last_sign_in_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        'admin@email.com',
        '$2a$10$nQK1g1Xv/yQUnmZkaXq.EOLDPkkzdGlp31.YoHQmG4q0neNllEIXa', -- hash for '12345678'
        now(),
        jsonb_build_object(
            'first_name', 'System',
            'last_name', 'Administrator',
            'provider', 'email'
        ),
        false,
        now(),
        now(),
        null,
        null,
        now(),
        '',
        '',
        '',
        ''
    )
    RETURNING id INTO admin_id;

    -- Set admin identity with proper structure
    INSERT INTO auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        provider_id,
        last_sign_in_at,
        created_at,
        updated_at
    ) VALUES (
        admin_id,  -- Using same ID as user_id for consistency
        admin_id,
        jsonb_build_object(
            'sub', admin_id,
            'email', 'admin@email.com',
            'email_verified', true,
            'phone_verified', false
        ),
        'email',
        'admin@email.com',  -- provider_id for email auth is the email address
        now(),
        now(),
        now()
    );

    -- Create admin's employee profile with proper structure
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
        admin_id,
        d.id as department_id,
        'Chief Executive Officer',
        '2025-01-01'::date,
        NULL, -- CEO has no manager
        'System administrator and chief executive of the organization',
        '+1 (555) 123-4567',
        '123 Admin Street, Tech City, TC 12345',
        true,
        now(),
        now()
    FROM (
        SELECT id 
        FROM public.departments 
        WHERE name = 'Human Resources' 
        LIMIT 1
    ) d;
END $$;