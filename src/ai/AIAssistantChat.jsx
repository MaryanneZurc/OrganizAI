import { useState, useEffect, useRef } from 'react'
import { supabase } from '../utils/supabaseClient'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'
import { Send, Bot, User } from 'lucide-react'

export default function AIAssistantChat() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (!user) return
    fetchHistory()
  }, [user])

  const fetchHistory = async () => {
    const { data, error } = await supabase
      .from('ai_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(50)

    if (error) {
      toast.error('Erro ao carregar histórico.')
      return
    }
    setMessages(data || [])
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || loading) return

    const userMessage = { role: 'user', content: trimmed }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      await supabase.from('ai_logs').insert({
        user_id: user.id,
        role: 'user',
        content: trimmed,
      })

      const { error } = await supabase.functions.invoke('call-gemini', {
        body: {
          message: trimmed,
          history: messages.slice(-10),
          userId: user.id,
        },
      })

      if (error) {
        toast.error('Erro ao comunicar com a IA.')
      }
    } catch (err) {
      toast.error('Erro ao enviar mensagem.')
    } finally {
      setLoading(false)
    }
  }

  const quickPrompts = [
    'Como melhorar minha produtividade?',
    'Sugira uma técnica de gestão de tempo.',
    'Dicas para evitar procrastinação.',
  ]

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <h2 className="text-2xl font-bold text-white mb-4">Assistente IA</h2>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-8">
            <Bot size={48} className="mx-auto mb-4 opacity-50" />
            <p>Olá! Sou seu assistente OrganizAI.</p>
            <p className="text-sm mt-2">Como posso ajudar você hoje?</p>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {quickPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => setInput(prompt)}
                  className="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-full transition"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-gray-700 text-gray-200 rounded-bl-none'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {msg.role === 'user' ? (
                  <User size={14} />
                ) : (
                  <Bot size={14} className="text-blue-400" />
                )}
                <span className="text-xs opacity-70">
                  {msg.role === 'user' ? 'Você' : 'Assistente'}
                </span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 text-gray-300 p-3 rounded-2xl rounded-bl-none flex items-center gap-2">
              <Bot size={14} className="text-blue-400" />
              <div className="flex gap-1">
                <span className="animate-bounce">●</span>
                <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>●</span>
                <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>●</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Digite sua mensagem..."
          className="flex-1 px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-600 focus:border-blue-500 outline-none"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  )
}
