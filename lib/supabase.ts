import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy-key'

export const supabaseAdmin = createClient(supabaseUrl, supabaseKey)