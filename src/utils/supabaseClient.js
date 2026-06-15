import { createClient } from '@supabase/supabase-js'

// ⚠️ COLOQUE SEUS DADOS REAIS AQUI
const supabaseUrl = 'https://hosjuyeopdnfpehksjie.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhvc2p1eWVvcGRuZnBlaGtzamllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3NTMxNjUsImV4cCI6MjA4OTMyOTE2NX0.mlJrjsBQWCp5MCSoQ5jwUfbeJdveCc1NiqRTz97iy0k'

console.log('🔍 Supabase URL:', supabaseUrl)
console.log('🔍 Supabase Key existe:', !!supabaseAnonKey)

export const supabase = createClient(supabaseUrl, supabaseAnonKey)