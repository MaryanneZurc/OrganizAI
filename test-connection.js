import { createClient } from '@supabase/supabase-js'

// COLOQUE SEUS DADOS REAIS AQUI
const supabaseUrl = 'https://clbjjfpakkoteqbqpkqz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsYmpqZnBha2tvdGVxYnFwa3F6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NzM0MDQsImV4cCI6MjA5NDI0OTQwNH0.vzGkpQGyE8e6JZUCID-Er5gkNw05ttpT8iy8Utexbik'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function test() {
  console.log('🔍 Testando conexão...')
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(1)
  
  if (error) {
    console.error('❌ Erro:', error)
  } else {
    console.log('✅ Conexão OK! Dados:', data)
  }
}

test()