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
    const migrationPath = path.join(__dirname, '../supabase/migrations/20250102000000_add_google_event_id.sql')
    const sql = fs.readFileSync(migrationPath, 'utf8')

    console.log('📄 Migration file loaded: 20250102000000_add_google_event_id.sql')
    console.log('📊 Executing SQL...\n')

    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`)

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      console.log(`[${i + 1}/${statements.length}] Executing: ${statement.substring(0, 50)}...`)

      try {
        // Use Supabase client to execute raw SQL
        const { error } = await supabase.rpc('exec_sql', { sql: statement })
        
        if (error) {
          // If RPC doesn't work, we'll check the column manually
          console.log(`⚠️  RPC not available, checking column existence...`)
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`)
        }
      } catch (err) {
        console.log(`⚠️  Error on statement ${i + 1}:`, err.message)
      }
    }

    console.log('\n✅ Migration execution completed!')
    console.log('🔍 Verifying google_event_id column...\n')

    // Verify column exists by trying to select it
    const { data, error } = await supabase
      .from('todos')
      .select('id, google_event_id')
      .limit(1)

    if (error) {
      console.log('❌ google_event_id column not found:', error.message)
      console.log('\n⚠️  Please add the column manually in Supabase Dashboard:')
      console.log('   1. Go to https://supabase.com/dashboard')
      console.log('   2. Select your project')
      console.log('   3. Go to Table Editor → todos')
      console.log('   4. Click "New Column"')
      console.log('   5. Name: google_event_id')
      console.log('   6. Type: text')
      console.log('   7. Nullable: Yes')
      console.log('   8. Save')
    } else {
      console.log('✅ google_event_id column exists!')
      console.log('\n🎉 Migration successful! You can now sync with Google Calendar.')
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    console.error(error)
    process.exit(1)
  }
}

runMigration()

