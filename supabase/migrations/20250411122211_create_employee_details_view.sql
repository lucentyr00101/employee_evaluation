-- Create a view that joins auth.users with employee_profiles for easier querying
CREATE OR REPLACE VIEW public.employee_details AS
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'first_name' as first_name,
  u.raw_user_meta_data->>'last_name' as last_name,
  p.department_id,
  d.name as department_name,
  p.job_title,
  p.hire_date,
  p.manager_id,
  p.bio,
  p.phone,
  p.address,
  p.is_admin,
  p.created_at,
  p.updated_at
FROM 
  auth.users u
LEFT JOIN 
  public.employee_profiles p ON u.id = p.id
LEFT JOIN
  public.departments d ON p.department_id = d.id
WHERE
  u.deleted_at IS NULL;

-- Grant permissions on the view
GRANT SELECT ON public.employee_details TO anon, authenticated, service_role;