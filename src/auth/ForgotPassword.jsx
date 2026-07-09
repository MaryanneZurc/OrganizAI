import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../utils/supabaseClient'
import toast from 'react-hot-toast'
import { ArrowLeft, Mail, Send, CheckCircle } from 'lucide-react'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email.trim()) {
      toast.error('Digite seu email.')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      toast.error(error.message)
    } else {
      setSent(true)
      toast.success('Email enviado! Verifique sua caixa de entrada.')
    }

    setLoading(false)
  }

  // Tela de confirmação (após envio)
  if (sent) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md text-center">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          
          <h1 className="text-3xl font-bold text-white mb-4">
            Email Enviado!
          </h1>
          
          <p className="text-gray-400 mb-6">
            Enviamos um link de recuperação para{' '}
            <span className="text-white font-semibold">{email}</span>.
            Verifique sua caixa de entrada e spam.
          </p>

          <div className="bg-gray-700/50 p-4 rounded-lg mb-6 text-left">
            <p className="text-sm text-gray-300 mb-2">📌 Dicas:</p>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• O link expira em 1 hora</li>
              <li>• Verifique a pasta de spam</li>
              <li>• Não recebeu? Tente novamente</li>
            </ul>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setSent(false)}
              className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition"
            >
              Tentar com outro email
            </button>
            
            <Link
              to="/login"
              className="block w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
            >
              Voltar para o Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Tela do formulário
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md">
        {/* Ícone */}
        <div className="bg-blue-600/20 w-14 h-14 rounded-full flex items-center justify-center mb-6">
          <Mail className="w-7 h-7 text-blue-400" />
        </div>

        {/* Título */}
        <h1 className="text-3xl font-bold text-white mb-2">
          Recuperar Senha
        </h1>
        <p className="text-gray-400 mb-6">
          Digite seu email e enviaremos um link para redefinir sua senha.
        </p>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition placeholder-gray-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                Enviando...
              </>
            ) : (
              <>
                <Send size={18} />
                Enviar Link de Recuperação
              </>
            )}
          </button>
        </form>

        {/* Link voltar */}
        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1 text-gray-400 hover:text-blue-400 transition text-sm"
          >
            <ArrowLeft size={16} />
            Voltar para o Login
          </Link>
        </div>
      </div>
    </div>
  )
}