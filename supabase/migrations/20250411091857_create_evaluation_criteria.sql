-- Create evaluation_criteria table
CREATE TABLE IF NOT EXISTS public.evaluation_criteria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID REFERENCES public.evaluation_templates(id),
    title VARCHAR NOT NULL,
    description TEXT,
    weight NUMERIC DEFAULT 1.0,
    sort_order INTEGER,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);