const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗')
  process.exit(1)
}

console.log('🔗 Connecting to Supabase...')
console.log('URL:', supabaseUrl)

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function runMigration() {
  try {
    // Read migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/20250101000000_initial_schema.sql')
    const sql = fs.readFileSync(migrationPath, 'utf8')

    console.log('📄 Migration file loaded')
    console.log('📊 Executing SQL...\n')

    // Execute SQL using Supabase RPC
    const { data, error } = await supabase.rpc('exec_sql', { sql_string: sql })

    if (error) {
      // RPC might not exist, try direct SQL execution via REST API
      console.log('⚠️  RPC method not available, trying direct execution...\n')

      // Split SQL into individual statements
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'))

      console.log(`📝 Found ${statements.length} SQL statements to execute\n`)

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i]
        console.log(`[${i + 1}/${statements.length}] Executing...`)

        try {
          // Use fetch to execute SQL via PostgREST
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseServiceKey,
              'Authorization': `Bearer ${supabaseServiceKey}`
            },
            body: JSON.stringify({ query: statement })
          })

          if (!response.ok) {
            console.log(`⚠️  Statement ${i + 1} may have failed (this might be ok)`)
          } else {
            console.log(`✅ Statement ${i + 1} executed`)
          }
        } catch (err) {
          console.log(`⚠️  Error on statement ${i + 1}:`, err.message)
        }
      }

      console.log('\n✅ Migration execution completed!')
      console.log('🔍 Checking if tables were created...\n')

      // Verify tables exist
      const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('*')
        .limit(1)

      const { data: todos, error: todoError } = await supabase
        .from('todos')
        .select('*')
        .limit(1)

      console.log('Categories table:', catError ? '❌ ' + catError.message : '✅ Created')
      console.log('Todos table:', todoError ? '❌ ' + todoError.message : '✅ Created')

      if (!catError && !todoError) {
        console.log('\n🎉 Migration successful! All tables created.')
      } else {
        console.log('\n⚠️  Some tables may not have been created. Please check Supabase Dashboard.')
      }
    } else {
      console.log('✅ Migration executed successfully!')
      console.log(data)
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    console.error(error)
    process.exit(1)
  }
}

runMigration()
