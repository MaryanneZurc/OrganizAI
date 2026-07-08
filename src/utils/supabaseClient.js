import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://clbjjfpakkoteqbqpkqz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsYmpqZnBha2tvdGVxYnFwa3F6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NzM0MDQsImV4cCI6MjA5NDI0OTQwNH0.vzGkpQGyE8e6JZUCID-Er5gkNw05ttpT8iy8Utexbik'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)