-- Employee Evaluation System Database Schema

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create departments table
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create employee_profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.employee_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  job_title VARCHAR(255),
  hire_date DATE,
  manager_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  bio TEXT,
  phone VARCHAR(50),
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create evaluation_templates table
CREATE TABLE IF NOT EXISTS public.evaluation_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  creator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create evaluation_criteria table
CREATE TABLE IF NOT EXISTS public.evaluation_criteria (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES public.evaluation_templates(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  weight FLOAT DEFAULT 1.0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create evaluations table
CREATE TABLE IF NOT EXISTS public.evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  evaluator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  template_id UUID REFERENCES public.evaluation_templates(id) ON DELETE SET NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  evaluation_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'draft', -- draft, in_progress, completed, reviewed
  overall_score FLOAT,
  strengths TEXT,
  areas_to_improve TEXT,
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create evaluation_scores table
CREATE TABLE IF NOT EXISTS public.evaluation_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  evaluation_id UUID REFERENCES public.evaluations(id) ON DELETE CASCADE,
  criteria_id UUID REFERENCES public.evaluation_criteria(id) ON DELETE CASCADE,
  score FLOAT,
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create goals table for employee goals
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  status VARCHAR(50) DEFAULT 'in_progress', -- not_started, in_progress, completed, cancelled
  progress INTEGER DEFAULT 0, -- 0-100 percent
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row-Level Security (RLS) with policies
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluation_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluation_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluation_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- Create a view for employee details
CREATE OR REPLACE VIEW public.employee_details AS
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'first_name', '') as first_name,
  COALESCE(u.raw_user_meta_data->>'last_name', '') as last_name,
  ep.department_id,
  d.name as department_name,
  ep.job_title,
  ep.hire_date,
  ep.manager_id,
  ep.bio,
  ep.phone,
  ep.address,
  u.created_at,
  ep.updated_at
FROM auth.users u
LEFT JOIN public.employee_profiles ep ON u.id = ep.id
LEFT JOIN public.departments d ON ep.department_id = d.id;

-- Insert some sample data for departments
INSERT INTO public.departments (name, description)
VALUES 
  ('Engineering', 'Software development and engineering team'),
  ('Marketing', 'Marketing and communications team'),
  ('Human Resources', 'HR and talent management'),
  ('Finance', 'Financial operations and accounting'),
  ('Product', 'Product management and design')
ON CONFLICT DO NOTHING;