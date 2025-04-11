import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import path from 'path'

// Load environment variables from .env file
dotenv.config()

// For ES modules compatibility
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Supabase connection details
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env')
  process.exit(1)
}

console.log('Using Supabase URL:', supabaseUrl)
console.log('Service Role Key exists:', !!supabaseKey)

// Create Supabase client with admin privileges
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Function to execute SQL directly
async function executeSql(sqlQuery) {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sqlQuery })
    
    if (error) {
      console.error('SQL execution error:', error.message)
      return false
    }
    
    return true
  } catch (err) {
    console.error('SQL execution exception:', err.message)
    return false
  }
}

// Function to set up the exec_sql function
async function setupExecSqlFunction() {
  try {
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION exec_sql(sql_query TEXT) RETURNS VOID
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        EXECUTE sql_query;
      END;
      $$;
    `
    
    // Execute the SQL directly without using the function itself
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: createFunctionSQL })
    
    if (error && error.message.includes('function exec_sql() does not exist')) {
      console.log('exec_sql function does not exist yet, creating it directly...')
      
      // Try creating it using raw SQL query
      const { error: rawError } = await supabase.sql(createFunctionSQL)
      
      if (rawError) {
        console.error('Error creating exec_sql function:', rawError.message)
        console.log('Please run this SQL in the Supabase SQL Editor manually:')
        console.log(createFunctionSQL)
        console.log('Then run this script again')
        return false
      } else {
        console.log('exec_sql function created successfully')
        return true
      }
    } else if (error) {
      console.error('Error checking for exec_sql function:', error.message)
      return false
    }
    
    console.log('exec_sql function already exists or was updated')
    return true
  } catch (error) {
    console.error('Error setting up exec_sql function:', error.message)
    return false
  }
}

// Function to reset the database
async function resetDatabase() {
  console.log('Starting database reset process...')
  
  // Setup the SQL execution function
  const setupSuccess = await setupExecSqlFunction()
  if (!setupSuccess) {
    console.error('Failed to set up SQL execution function. Aborting reset.')
    return false
  }

  // List of tables to truncate, in order (child tables first)
  const tablesToTruncate = [
    'goals',                   // Depends on evaluations and employee_profiles
    'evaluation_scores',       // Depends on evaluations and criteria
    'evaluations',             // Depends on templates and employee_profiles
    'evaluation_criteria',     // Depends on templates
    'evaluation_templates',    // Standalone
    'employee_profiles',       // Depends on departments
    'departments'              // Standalone
  ]
  
  // Truncate tables in correct order
  console.log('Truncating tables...')
  
  for (const table of tablesToTruncate) {
    console.log(`Truncating table: ${table}`)
    const success = await executeSql(`TRUNCATE TABLE public.${table} CASCADE;`)
    
    if (!success) {
      console.error(`Failed to truncate ${table}. Continuing with next table...`)
    }
  }

  // Reset auth tables
  console.log('Resetting auth schema...')
  
  try {
    // Keep any admin users but clear others (optional - comment out if you want to keep all users)
    const resetAuthSQL = `
      DELETE FROM auth.users 
      WHERE email NOT LIKE '%@yourdomain.com' 
      AND email != 'admin@example.com';
    `
    
    const success = await executeSql(resetAuthSQL)
    if (!success) {
      console.warn('Could not reset auth users - may need to be done manually')
    }
  } catch (error) {
    console.error('Error resetting auth schema:', error.message)
  }

  console.log('Database reset completed!')
  console.log('To repopulate with mock data, run the setup-mock-data.ts script')
  
  return true
}

// Run the reset
resetDatabase()
  .catch(error => {
    console.error('Error during database reset:', error)
    process.exit(1)
  })