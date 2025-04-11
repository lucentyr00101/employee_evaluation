import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import * as dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config()

// For ES modules compatibility (replace __dirname)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Supabase connection details - check for both possible env var names
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

// Mock user data with predefined UUIDs for consistent references
const mockUsers = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'admin@example.com',
    password: 'password123',
    user_metadata: { 
      role: 'admin', 
      full_name: 'Admin User',
      first_name: 'Admin',
      last_name: 'User'
    }
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'engineering.manager@example.com',
    password: 'password123',
    user_metadata: { 
      role: 'manager', 
      full_name: 'Engineering Manager',
      first_name: 'Engineering',
      last_name: 'Manager'
    }
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    email: 'marketing.manager@example.com',
    password: 'password123',
    user_metadata: { 
      role: 'manager', 
      full_name: 'Marketing Manager',
      first_name: 'Marketing',
      last_name: 'Manager'
    }
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    email: 'developer1@example.com',
    password: 'password123',
    user_metadata: { 
      role: 'employee', 
      full_name: 'Developer One',
      first_name: 'Developer',
      last_name: 'One'
    }
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    email: 'developer2@example.com',
    password: 'password123',
    user_metadata: { 
      role: 'employee', 
      full_name: 'Developer Two',
      first_name: 'Developer',
      last_name: 'Two'
    }
  },
  {
    id: '00000000-0000-0000-0000-000000000006',
    email: 'marketing1@example.com',
    password: 'password123',
    user_metadata: { 
      role: 'employee', 
      full_name: 'Marketing Specialist',
      first_name: 'Marketing',
      last_name: 'Specialist'
    }
  },
  {
    id: '00000000-0000-0000-0000-000000000007',
    email: 'marketing2@example.com',
    password: 'password123',
    user_metadata: { 
      role: 'employee', 
      full_name: 'Content Creator',
      first_name: 'Content',
      last_name: 'Creator'
    }
  },
  {
    id: '00000000-0000-0000-0000-000000000008',
    email: 'designer@example.com',
    password: 'password123',
    user_metadata: { 
      role: 'employee', 
      full_name: 'UX Designer',
      first_name: 'UX',
      last_name: 'Designer'
    }
  }
]

// Function to create a user via Supabase Admin API
async function createUser(userData) {
  try {
    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase.auth.admin.getUserById(userData.id)
    
    if (checkError) {
      console.log('Error checking existing user:', checkError.message)
      // Continue to create user anyway
    } else if (existingUser && existingUser.user) {
      console.log(`User ${userData.email} already exists, skipping...`)
      return
    }

    // Create user with admin API
    const { data, error } = await supabase.auth.admin.createUser({
      uuid: userData.id,
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: userData.user_metadata
    })

    if (error) {
      throw error
    }

    console.log(`Created user: ${userData.email}`)
    return data
  } catch (error) {
    console.error(`Error creating user ${userData.email}:`, error.message)
  }
}

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

// Function to run SQL migration files
async function runMigrations() {
  try {
    console.log('Attempting to create SQL execution function...')
    
    // Create SQL execution function - this might fail if no permissions
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
    
    const funcCreated = await executeSql(createFunctionSQL)
    if (!funcCreated) {
      console.log('Could not create exec_sql function - you may need admin privileges')
      console.log('Please run this SQL in the Supabase SQL Editor:')
      console.log(createFunctionSQL)
      console.log('Then run this script again')
      return false
    }
    
    // List of migration files to run in order
    const migrationFiles = [
      '02_departments_mock_data.sql', // Run departments first as they're referenced by other tables
      '01_mock_data.sql'
    ]
    
    // Process each migration file
    for (const migrationFile of migrationFiles) {
      // Read the SQL file
      const migrationPath = path.join(__dirname, 'migrations', migrationFile)
      console.log(`Migration path: ${migrationPath}`)
      
      if (!fs.existsSync(migrationPath)) {
        console.error('Migration file not found:', migrationPath)
        continue // Skip to next file instead of failing completely
      }
      
      const sql = fs.readFileSync(migrationPath, 'utf8')
      console.log(`Migration file ${migrationFile} read successfully`)
      
      // Execute SQL as a series of smaller statements
      console.log(`Executing SQL migration ${migrationFile} in chunks...`)
      
      // Split by semicolons but keep DO blocks intact (for PL/pgSQL)
      let inDoBlock = false
      let currentStatement = ''
      const statements = []
      
      sql.split('\n').forEach(line => {
        const trimmedLine = line.trim()
        
        // Check for DO block start/end
        if (trimmedLine.startsWith('DO ')) {
          inDoBlock = true
        } else if (inDoBlock && trimmedLine === 'END $$;') {
          inDoBlock = false
          currentStatement += line + '\n'
          statements.push(currentStatement)
          currentStatement = ''
          return
        }
        
        // Add line to current statement
        currentStatement += line + '\n'
        
        // If we hit a semicolon and not in a DO block, end the statement
        if (!inDoBlock && trimmedLine.endsWith(';')) {
          statements.push(currentStatement)
          currentStatement = ''
        }
      })
      
      // Execute each statement
      for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i].trim()
        if (!stmt) continue
        
        console.log(`Executing statement ${i+1}/${statements.length} (${stmt.length} chars)`)
        
        if (stmt.startsWith('--')) {
          console.log('Skipping comment statement')
          continue
        }
        
        const success = await executeSql(stmt)
        if (!success) {
          console.error('Failed to execute statement. Continuing with next statement...')
        }
      }
      
      console.log(`Migration ${migrationFile} completed`)
    }
    
    console.log('All migrations completed')
    return true
  } catch (error) {
    console.error('Error running migration:', error.message)
    return false
  }
}

// Main function to set up mock data
async function setupMockData() {
  console.log('Setting up mock data...')
  
  // Create users
  console.log('Creating mock users...')
  for (const userData of mockUsers) {
    await createUser(userData)
  }
  
  // Run database migrations
  console.log('Running database migrations...')
  const success = await runMigrations()
  
  if (success) {
    console.log('Mock data setup completed successfully!')
  } else {
    console.log('Mock data setup completed with some errors.')
  }
}

// Run the setup
setupMockData()
  .catch(error => {
    console.error('Error during setup:', error)
    process.exit(1)
  })