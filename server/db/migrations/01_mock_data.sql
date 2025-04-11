-- Mock Data for Employee Evaluation System
-- This script populates the database with sample data for development and testing

-- Clear existing data (if needed)
-- TRUNCATE TABLE public.goals CASCADE;
-- TRUNCATE TABLE public.evaluation_scores CASCADE;
-- TRUNCATE TABLE public.evaluations CASCADE;
-- TRUNCATE TABLE public.evaluation_criteria CASCADE;
-- TRUNCATE TABLE public.evaluation_templates CASCADE;
-- TRUNCATE TABLE public.employee_profiles CASCADE;
-- TRUNCATE TABLE public.departments CASCADE;

-- Sample Users (will be created via the auth system)
-- These UUIDs will be used to reference users in other tables
-- In a real implementation, you'd use auth.users, but we're providing UUIDs here for reference
DO $$
DECLARE
  admin_id UUID := '00000000-0000-0000-0000-000000000001';
  manager1_id UUID := '00000000-0000-0000-0000-000000000002';
  manager2_id UUID := '00000000-0000-0000-0000-000000000003';
  emp1_id UUID := '00000000-0000-0000-0000-000000000004';
  emp2_id UUID := '00000000-0000-0000-0000-000000000005';
  emp3_id UUID := '00000000-0000-0000-0000-000000000006';
  emp4_id UUID := '00000000-0000-0000-0000-000000000007';
  emp5_id UUID := '00000000-0000-0000-0000-000000000008';
  
  eng_dept_id UUID;
  marketing_dept_id UUID;
  hr_dept_id UUID;
  finance_dept_id UUID;
  product_dept_id UUID;
  
  template1_id UUID;
  template2_id UUID;
  
  criteria1_id UUID;
  criteria2_id UUID;
  criteria3_id UUID;
  criteria4_id UUID;
  criteria5_id UUID;
  criteria6_id UUID;
  criteria7_id UUID;
  criteria8_id UUID;
  
  eval1_id UUID;
  eval2_id UUID;
  eval3_id UUID;
BEGIN
  -- Get department IDs (these are already created in the schema)
  SELECT id INTO eng_dept_id FROM public.departments WHERE name = 'Engineering';
  SELECT id INTO marketing_dept_id FROM public.departments WHERE name = 'Marketing';
  SELECT id INTO hr_dept_id FROM public.departments WHERE name = 'Human Resources';
  SELECT id INTO finance_dept_id FROM public.departments WHERE name = 'Finance';
  SELECT id INTO product_dept_id FROM public.departments WHERE name = 'Product';
  
  -- Create employee profiles
  -- Admin profile
  INSERT INTO public.employee_profiles (id, department_id, job_title, hire_date, manager_id)
  VALUES (admin_id, hr_dept_id, 'HR Director', '2020-01-15', NULL)
  ON CONFLICT (id) DO NOTHING;
  
  -- Manager profiles
  INSERT INTO public.employee_profiles (id, department_id, job_title, hire_date, manager_id)
  VALUES 
    (manager1_id, eng_dept_id, 'Engineering Manager', '2021-03-10', admin_id),
    (manager2_id, marketing_dept_id, 'Marketing Manager', '2021-02-01', admin_id)
  ON CONFLICT (id) DO NOTHING;
  
  -- Employee profiles
  INSERT INTO public.employee_profiles (id, department_id, job_title, hire_date, manager_id)
  VALUES 
    (emp1_id, eng_dept_id, 'Senior Developer', '2022-01-10', manager1_id),
    (emp2_id, eng_dept_id, 'Junior Developer', '2023-03-15', manager1_id),
    (emp3_id, marketing_dept_id, 'Content Specialist', '2022-04-01', manager2_id),
    (emp4_id, marketing_dept_id, 'Digital Marketer', '2023-01-20', manager2_id),
    (emp5_id, product_dept_id, 'Product Designer', '2022-07-12', admin_id)
  ON CONFLICT (id) DO NOTHING;
  
  -- Create evaluation templates
  INSERT INTO public.evaluation_templates (id, title, description, creator_id, is_active)
  VALUES 
    (uuid_generate_v4(), 'Annual Performance Review', 'Comprehensive annual performance evaluation for all employees', admin_id, true),
    (uuid_generate_v4(), 'Engineering Skills Assessment', 'Technical skills evaluation for engineering team members', manager1_id, true),
    (uuid_generate_v4(), 'Marketing Performance Metrics', 'KPI and performance metrics for marketing team', manager2_id, true)
  RETURNING id INTO template1_id;
  
  SELECT id INTO template2_id FROM public.evaluation_templates WHERE title = 'Engineering Skills Assessment';
  
  -- Create evaluation criteria for templates
  -- Annual Review Criteria
  INSERT INTO public.evaluation_criteria (id, template_id, title, description, weight, sort_order)
  VALUES 
    (uuid_generate_v4(), template1_id, 'Communication Skills', 'Ability to communicate effectively with team members and stakeholders', 1.0, 1),
    (uuid_generate_v4(), template1_id, 'Job Knowledge', 'Understanding of job responsibilities and technical requirements', 1.0, 2),
    (uuid_generate_v4(), template1_id, 'Quality of Work', 'Accuracy, thoroughness, and effectiveness of work output', 1.0, 3),
    (uuid_generate_v4(), template1_id, 'Teamwork', 'Collaboration and contribution to team objectives', 1.0, 4),
    (uuid_generate_v4(), template1_id, 'Initiative', 'Self-motivation and proactivity in tasks and problem-solving', 1.0, 5)
  RETURNING id INTO criteria1_id;
  
  SELECT id INTO criteria2_id FROM public.evaluation_criteria WHERE template_id = template1_id AND title = 'Job Knowledge';
  SELECT id INTO criteria3_id FROM public.evaluation_criteria WHERE template_id = template1_id AND title = 'Quality of Work';
  SELECT id INTO criteria4_id FROM public.evaluation_criteria WHERE template_id = template1_id AND title = 'Teamwork';
  SELECT id INTO criteria5_id FROM public.evaluation_criteria WHERE template_id = template1_id AND title = 'Initiative';
  
  -- Engineering Skills Criteria
  INSERT INTO public.evaluation_criteria (id, template_id, title, description, weight, sort_order)
  VALUES 
    (uuid_generate_v4(), template2_id, 'Technical Proficiency', 'Mastery of programming languages and technical tools', 1.2, 1),
    (uuid_generate_v4(), template2_id, 'Problem-Solving', 'Ability to analyze and solve complex technical problems', 1.0, 2),
    (uuid_generate_v4(), template2_id, 'Code Quality', 'Adherence to coding standards and best practices', 1.0, 3)
  RETURNING id INTO criteria6_id;
  
  SELECT id INTO criteria7_id FROM public.evaluation_criteria WHERE template_id = template2_id AND title = 'Problem-Solving';
  SELECT id INTO criteria8_id FROM public.evaluation_criteria WHERE template_id = template2_id AND title = 'Code Quality';
  
  -- Create sample evaluations
  INSERT INTO public.evaluations (id, employee_id, evaluator_id, template_id, department_id, evaluation_date, status, overall_score, strengths, areas_to_improve, comments)
  VALUES 
    (uuid_generate_v4(), emp1_id, manager1_id, template1_id, eng_dept_id, '2024-12-15', 'completed', 4.2, 'Strong technical skills and team collaboration', 'Could improve documentation habits', 'Overall excellent performer with consistent results.'),
    (uuid_generate_v4(), emp2_id, manager1_id, template2_id, eng_dept_id, '2024-11-05', 'completed', 3.7, 'Fast learner with good problem-solving abilities', 'Needs to improve code quality and testing', 'Showing good progress for a junior developer.'),
    (uuid_generate_v4(), emp3_id, manager2_id, template1_id, marketing_dept_id, '2025-01-10', 'completed', 4.0, 'Excellent content creation and strategic thinking', 'Could improve on meeting deadlines', 'Valuable team member with creative ideas.')
  RETURNING id INTO eval1_id;
  
  SELECT id INTO eval2_id FROM public.evaluations WHERE employee_id = emp2_id;
  SELECT id INTO eval3_id FROM public.evaluations WHERE employee_id = emp3_id;
  
  -- Create evaluation scores
  -- Scores for eval1
  INSERT INTO public.evaluation_scores (evaluation_id, criteria_id, score, comments)
  VALUES 
    (eval1_id, criteria1_id, 4.0, 'Communicates clearly with team and clients'),
    (eval1_id, criteria2_id, 4.5, 'Excellent understanding of technical requirements'),
    (eval1_id, criteria3_id, 4.2, 'Consistently delivers high-quality code'),
    (eval1_id, criteria4_id, 4.3, 'Great team player'),
    (eval1_id, criteria5_id, 4.0, 'Takes initiative on complex problems');
  
  -- Scores for eval2
  INSERT INTO public.evaluation_scores (evaluation_id, criteria_id, score, comments)
  VALUES 
    (eval2_id, criteria6_id, 3.5, 'Good grasp of programming fundamentals'),
    (eval2_id, criteria7_id, 4.0, 'Creative problem-solver'),
    (eval2_id, criteria8_id, 3.6, 'Improving in code organization');
  
  -- Scores for eval3
  INSERT INTO public.evaluation_scores (evaluation_id, criteria_id, score, comments)
  VALUES 
    (eval3_id, criteria1_id, 4.2, 'Excellent communication with stakeholders'),
    (eval3_id, criteria2_id, 4.0, 'Strong knowledge of marketing principles'),
    (eval3_id, criteria3_id, 4.0, 'Consistently produces quality content'),
    (eval3_id, criteria4_id, 3.8, 'Works well with cross-functional teams'),
    (eval3_id, criteria5_id, 4.0, 'Self-starter with many innovative ideas');
  
  -- Create employee goals
  INSERT INTO public.goals (employee_id, title, description, start_date, end_date, status, progress)
  VALUES 
    (emp1_id, 'Learn New Framework', 'Master the latest JavaScript framework', '2025-01-01', '2025-06-30', 'in_progress', 30),
    (emp1_id, 'Improve Code Quality', 'Enhance test coverage to 90%', '2025-01-15', '2025-03-31', 'completed', 100),
    (emp2_id, 'Professional Certification', 'Complete cloud certification', '2025-02-01', '2025-05-31', 'in_progress', 50),
    (emp3_id, 'Content Strategy', 'Develop Q2 content calendar', '2025-01-05', '2025-03-15', 'completed', 100),
    (emp4_id, 'Campaign Performance', 'Improve conversion rates by 15%', '2025-02-15', '2025-06-15', 'in_progress', 40),
    (emp5_id, 'Design System', 'Create unified design system for products', '2025-01-10', '2025-04-30', 'in_progress', 60);
    
END $$;

-- Notes on using this mock data:
-- 1. This script assumes you've already created users in the auth.users table with matching IDs
-- 2. For development, you'll need to replace the hardcoded UUIDs with actual user IDs from your auth system
-- 3. In a real app, you would typically create users through the auth system, then create profiles