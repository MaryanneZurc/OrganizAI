import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User } from 'lucide-react'

// Simulação inteligente: responde com base em palavras-chave
const respostas = {
  'produtividade': 'Para melhorar sua produtividade, sugiro a Técnica Pomodoro: ciclos de 25 minutos de foco total com pausas de 5 minutos. Nosso sistema já tem um timer integrado para isso!',
  'tarefa': 'Analisando suas tarefas, sugiro priorizar usando a Matriz de Eisenhower. Tarefas urgentes e importantes devem ser feitas primeiro. Veja na aba "Tarefas" como classificamos isso!',
  'tempo': 'Para gerenciar melhor seu tempo, recomendo planejar o dia na noite anterior. Liste 3 prioridades máximas. Nosso questionário de diagnóstico pode ajudar a identificar seu perfil.',
  'default': 'Ótima pergunta! Como assistente OrganizAI, posso ajudar com técnicas de produtividade, gestão de tempo e finanças. Que tal começarmos com um diagnóstico do seu perfil?'
}

export default function AIAssistantChat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const getResposta = (pergunta) => {
    const p = pergunta.toLowerCase()
    if (p.includes('produtiv')) return respostas.produtividade
    if (p.includes('tarefa') || p.includes('prior')) return respostas.tarefa
    if (p.includes('tempo') || p.includes('organ')) return respostas.tempo
    return respostas.default
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMsg = { role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    setTimeout(() => {
      const resposta = getResposta(input)
      setMessages(prev => [...prev, { role: 'assistant', content: resposta }])
      setLoading(false)
    }, 1500)
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <h2 className="text-2xl font-bold text-white mb-4">🤖 Assistente IA</h2>
      
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-8">
            <Bot size={48} className="mx-auto mb-4 opacity-50" />
            <p>Olá! Sou seu assistente de produtividade.</p>
            <p className="text-sm mt-2">Pergunte sobre técnicas, organização ou finanças!</p>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {['Como melhorar minha produtividade?', 'Como priorizar tarefas?', 'Dicas de gestão de tempo'].map(p => (
                <button key={p} onClick={() => setInput(p)} className="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-full">{p}</button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
              <div className="flex items-center gap-2 mb-1">
                {msg.role === 'user' ? <User size={14} /> : <Bot size={14} className="text-blue-400" />}
                <span className="text-xs opacity-70">{msg.role === 'user' ? 'Você' : 'Assistente'}</span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 p-3 rounded-2xl rounded-bl-none flex items-center gap-2">
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
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
          placeholder="Pergunte sobre produtividade, tarefas, tempo..."
          className="flex-1 px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-600 focus:border-blue-500 outline-none" />
        <button type="submit" disabled={loading || !input.trim()}
          className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition disabled:opacity-50">
          <Send size={20} />
        </button>
      </form>
    </div>
  )
}