/**
 * Google Calendar 카테고리의 order 값을 999에서 1로 업데이트
 * (반복 카테고리 바로 아래로 이동)
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  console.error('Please check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateGoogleCalendarOrder() {
  console.log('🔄 Updating Google Calendar category order...\n');

  try {
    // 1. Google Calendar 카테고리 찾기
    const { data: googleCalendars, error: fetchError } = await supabase
      .from('categories')
      .select('*')
      .eq('name', 'Google Calendar');

    if (fetchError) {
      throw new Error(`Failed to fetch Google Calendar categories: ${fetchError.message}`);
    }

    if (!googleCalendars || googleCalendars.length === 0) {
      console.log('ℹ️  No Google Calendar categories found.');
      return;
    }

    console.log(`📊 Found ${googleCalendars.length} Google Calendar category(ies):\n`);

    // 2. 각 Google Calendar 카테고리의 order 값을 1로 업데이트
    let successCount = 0;
    let errorCount = 0;

    for (const category of googleCalendars) {
      console.log(`  User: ${category.user_id}`);
      console.log(`  Current order: ${category.order}`);
      
      if (category.order === 1) {
        console.log(`  ✅ Already has order 1, skipping\n`);
        successCount++;
        continue;
      }

      const { error: updateError } = await supabase
        .from('categories')
        .update({ order: 1 })
        .eq('id', category.id);

      if (updateError) {
        console.log(`  ❌ Failed to update: ${updateError.message}\n`);
        errorCount++;
      } else {
        console.log(`  ✅ Updated order: ${category.order} → 1\n`);
        successCount++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}`);
    console.log('='.repeat(50));

    if (errorCount === 0) {
      console.log('\n🎉 All Google Calendar categories updated successfully!');
      console.log('📍 Google Calendar is now positioned right below "반복" category.');
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
updateGoogleCalendarOrder()
  .then(() => {
    console.log('\n✨ Migration completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Unexpected error:', error);
    process.exit(1);
  });

