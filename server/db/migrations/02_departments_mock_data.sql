-- Migration for Departments table mock data
-- This script populates the departments table with sample departments data

-- Create the departments table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add UUID extension if it's not already available (required for uuid_generate_v4)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clear existing departments data (uncomment if needed)
-- TRUNCATE TABLE public.departments CASCADE;

-- Insert sample departments data
INSERT INTO public.departments (id, name, description)
VALUES 
  -- Use fixed IDs for departments referenced in the 01_mock_data.sql file
  ('d0000000-0000-0000-0000-000000000001', 'Engineering', 'Software development and technical operations'),
  ('d0000000-0000-0000-0000-000000000002', 'Marketing', 'Marketing, advertising and brand management'),
  ('d0000000-0000-0000-0000-000000000003', 'Human Resources', 'Personnel management and organizational development'),
  ('d0000000-0000-0000-0000-000000000004', 'Finance', 'Financial planning, accounting and reporting'),
  ('d0000000-0000-0000-0000-000000000005', 'Product', 'Product management and development')
ON CONFLICT (name) DO UPDATE
SET 
  description = EXCLUDED.description,
  updated_at = NOW();

-- Add additional departments
INSERT INTO public.departments (name, description)
VALUES 
  ('Customer Support', 'Customer service and technical support'),
  ('Sales', 'Business development and client acquisition'),
  ('Quality Assurance', 'Testing and quality control'),
  ('Research', 'Research and development of new technologies'),
  ('Operations', 'Day-to-day business operations')
ON CONFLICT (name) DO UPDATE
SET 
  description = EXCLUDED.description,
  updated_at = NOW();