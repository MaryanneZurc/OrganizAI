import { createClient } from '@supabase/supabase-js'

<<<<<<< HEAD
const supabaseUrl ='https://hosjuyeopdnfpehksjie.supabase.co'
const supabaseAnonKey ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhvc2p1eWVvcGRuZnBlaGtzamllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3NTMxNjUsImV4cCI6MjA4OTMyOTE2NX0.mlJrjsBQWCp5MCSoQ5jwUfbeJdveCc1NiqRTz97iy0k'

console.log('🔍 Supabase URL:', supabaseUrl)
console.log('🔍 Supabase Key existe:', !!supabaseAnonKey)

=======
const supabaseUrl = 'https://clbjjfpakkoteqbqpkqz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsYmpqZnBha2tvdGVxYnFwa3F6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NzM0MDQsImV4cCI6MjA5NDI0OTQwNH0.vzGkpQGyE8e6JZUCID-Er5gkNw05ttpT8iy8Utexbik'

>>>>>>> f954ffcda68601a251e31035003dc25041fe506c
export const supabase = createClient(supabaseUrl, supabaseAnonKey)