-- Create goals table
CREATE TABLE IF NOT EXISTS public.goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES public.employee_profiles(id),
    title VARCHAR NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    status VARCHAR DEFAULT 'not_started',
    progress INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);