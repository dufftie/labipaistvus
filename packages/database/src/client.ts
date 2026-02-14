import { createClient } from '@supabase/supabase-js';
import type { Database } from './types/database.types';

const supabaseUrl = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false, // For server-side usage (crawler)
  },
});

