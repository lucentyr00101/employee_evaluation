-- Create evaluation_scores table
CREATE TABLE IF NOT EXISTS public.evaluation_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evaluation_id UUID REFERENCES public.evaluations(id),
    criteria_id UUID REFERENCES public.evaluation_criteria(id),
    score NUMERIC,
    comments TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);