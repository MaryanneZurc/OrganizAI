import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../utils/supabaseClient'
import toast from 'react-hot-toast'

export default function Register() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    console.log('📝 Tentando cadastrar:', { email, fullName })
    
    // Etapa 1: Criar usuário no Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    
    // MOSTRAR TUDO no console
    console.log('📦 Resposta completa:', { data, error })
    
    if (error) {
      console.error('❌ ERRO COMPLETO:', JSON.stringify(error, null, 2))
      console.error('❌ Mensagem:', error.message)
      console.error('❌ Status:', error.status)
      console.error('❌ Nome:', error.name)
      toast.error(error.message || 'Erro ao criar conta')
      setLoading(false)
      return
    }
    
    console.log('✅ Usuário criado:', data)
    
    // Etapa 2: Criar perfil
    if (data?.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          full_name: fullName,
          diagnosis_level: 'iniciante',
          diagnosis_completed: false,
        })
      
      if (profileError) {
        console.error('❌ Erro perfil:', profileError)
      } else {
        console.log('✅ Perfil criado')
      }
    }
    
    toast.success('Conta criada com sucesso!')
    navigate('/diagnosis')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h1 className="text-4xl font-bold text-white text-center mb-8">Criar Conta</h1>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
            placeholder="Nome completo"
            className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 outline-none" />
          
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 outline-none" />
          
          <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 outline-none" />
          
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50">
            {loading ? 'Criando...' : 'Criar conta'}
          </button>
        </form>
        
        <p className="text-gray-400 text-sm text-center mt-6">
          Já tem conta? <Link to="/login" className="text-blue-400 hover:underline">Fazer login</Link>
        </p>
      </div>
    </div>
  )
}