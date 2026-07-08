import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../utils/supabaseClient'
import toast from 'react-hot-toast'
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
<<<<<<< HEAD

=======
>>>>>>> f954ffcda68601a251e31035003dc25041fe506c
    if (password.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres.')
      return
    }
<<<<<<< HEAD

=======
>>>>>>> f954ffcda68601a251e31035003dc25041fe506c
    if (password !== confirmPassword) {
      toast.error('As senhas não conferem.')
      return
    }
<<<<<<< HEAD

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    
=======
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
>>>>>>> f954ffcda68601a251e31035003dc25041fe506c
    if (error) {
      toast.error(error.message)
    } else {
      setDone(true)
<<<<<<< HEAD
      toast.success('Senha atualizada com sucesso!')
      setTimeout(() => navigate('/login'), 3000)
    }
    
=======
      toast.success('Senha atualizada!')
      setTimeout(() => navigate('/login'), 3000)
    }
>>>>>>> f954ffcda68601a251e31035003dc25041fe506c
    setLoading(false)
  }

  if (done) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md text-center">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-4">Senha Atualizada!</h1>
          <p className="text-gray-400">Redirecionando para o login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="bg-blue-600/20 w-14 h-14 rounded-full flex items-center justify-center mb-6">
          <Lock className="w-7 h-7 text-blue-400" />
        </div>
<<<<<<< HEAD

        <h1 className="text-3xl font-bold text-white mb-2">Redefinir Senha</h1>
        <p className="text-gray-400 mb-6">Digite sua nova senha abaixo.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Nova senha
            </label>
=======
        <h1 className="text-3xl font-bold text-white mb-2">Redefinir Senha</h1>
        <p className="text-gray-400 mb-6">Digite sua nova senha abaixo.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Nova senha</label>
>>>>>>> f954ffcda68601a251e31035003dc25041fe506c
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
<<<<<<< HEAD
                className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-white"
              >
=======
                className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 outline-none pr-10"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-white">
>>>>>>> f954ffcda68601a251e31035003dc25041fe506c
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
<<<<<<< HEAD

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Confirmar nova senha
            </label>
=======
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Confirmar senha</label>
>>>>>>> f954ffcda68601a251e31035003dc25041fe506c
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repita a senha"
              required
<<<<<<< HEAD
              className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
=======
              className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 outline-none"
            />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50">
>>>>>>> f954ffcda68601a251e31035003dc25041fe506c
            {loading ? 'Atualizando...' : 'Redefinir Senha'}
          </button>
        </form>
      </div>
    </div>
  )
}