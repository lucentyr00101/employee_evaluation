-- Create evaluations table
CREATE TABLE IF NOT EXISTS public.evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES public.employee_profiles(id),
    evaluator_id UUID NOT NULL REFERENCES public.employee_profiles(id),
    template_id UUID REFERENCES public.evaluation_templates(id),
    department_id UUID REFERENCES public.departments(id),
    evaluation_date DATE,
    status VARCHAR DEFAULT 'draft',
    overall_score NUMERIC,
    strengths TEXT,
    areas_to_improve TEXT,
    comments TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);