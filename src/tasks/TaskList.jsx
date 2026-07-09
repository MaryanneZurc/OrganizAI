import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../utils/supabaseClient'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'
import { Plus, Trash2, Play, Pause, Square, Clock } from 'lucide-react'

export default function TaskList() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [newTitle, setNewTitle] = useState('')
  const [newDuration, setNewDuration] = useState(25)
  const [newImportant, setNewImportant] = useState(true)
  const [newUrgent, setNewUrgent] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchTasks = useCallback(async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      toast.error('Erro ao carregar tarefas.')
      return
    }
    setTasks(data || [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const handleAddTask = async (e) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    const priority = newImportant && newUrgent ? 1 : newImportant ? 2 : newUrgent ? 3 : 4
    const { error } = await supabase.from('tasks').insert({
      user_id: user.id,
      title: newTitle,
      duration_minutes: newDuration,
      is_important: newImportant,
      is_urgent: newUrgent,
      priority,
      status: 'pendente',
    })

    if (error) {
      toast.error('Erro ao criar tarefa.')
      return
    }

    toast.success('Tarefa criada!')
    setNewTitle('')
    fetchTasks()
  }

  const handleDelete = async (id) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) toast.error('Erro ao deletar.')
    else {
      toast.success('Tarefa removida.')
      fetchTasks()
    }
  }

  const getStatusLabel = (status) => {
    const map = { pendente: 'bg-gray-600', em_andamento: 'bg-blue-600', pausada: 'bg-yellow-600', concluida: 'bg-green-600' }
    return map[status] || 'bg-gray-600'
  }

  if (loading) {
    return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div></div>
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Suas Tarefas</h2>

      {/* Formulário */}
      <form onSubmit={handleAddTask} className="bg-gray-800 p-4 rounded-xl mb-6 space-y-3">
        <div className="flex gap-3">
          <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Nova tarefa..." required
            className="flex-1 px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 outline-none" />
          <input type="number" value={newDuration} onChange={(e) => setNewDuration(Number(e.target.value))}
            className="w-20 px-3 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 outline-none" min="1" title="Duração (minutos)" />
          <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center gap-2">
            <Plus size={18} /> Adicionar
          </button>
        </div>
        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-2 text-gray-300">
            <input type="checkbox" checked={newImportant} onChange={(e) => setNewImportant(e.target.checked)} className="rounded" /> Importante
          </label>
          <label className="flex items-center gap-2 text-gray-300">
            <input type="checkbox" checked={newUrgent} onChange={(e) => setNewUrgent(e.target.checked)} className="rounded" /> Urgente
          </label>
        </div>
      </form>

      {/* Lista */}
      <div className="space-y-3">
        {tasks.length === 0 && <p className="text-gray-400 text-center py-8">Nenhuma tarefa ainda. Crie sua primeira tarefa acima!</p>}
        {tasks.map((task) => (
          <div key={task.id} className={`bg-gray-800 p-4 rounded-xl border-l-4 ${task.status === 'concluida' ? 'border-green-500 opacity-70' : task.status === 'em_andamento' ? 'border-blue-500' : 'border-gray-600'}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className={`text-white font-semibold ${task.status === 'concluida' ? 'line-through' : ''}`}>{task.title}</h3>
                <div className="flex items-center gap-3 mt-2 text-sm text-gray-400">
                  <span>{task.duration_minutes} min</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusLabel(task.status)}`}>{task.status.replace('_', ' ')}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TaskTimerSmall task={task} onUpdate={fetchTasks} />
                <button onClick={() => handleDelete(task.id)} className="p-1.5 rounded hover:bg-red-600/20 text-red-400" title="Excluir">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Mini Timer
function TaskTimerSmall({ task, onUpdate }) {
  const [timeLeft, setTimeLeft] = useState((task.duration_minutes || 25) * 60)
  const [isRunning, setIsRunning] = useState(task.status === 'em_andamento')
  const intervalRef = useRef(null)

  useEffect(() => {
    if (task.status === 'em_andamento') {
      startTimer()
    }
    return () => clearInterval(intervalRef.current)
  }, [task.status])

  const startTimer = async () => {
    await supabase.from('tasks').update({ status: 'em_andamento', start_time: new Date().toISOString() }).eq('id', task.id)
    setIsRunning(true)
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          supabase.from('tasks').update({ status: 'concluida', end_time: new Date().toISOString() }).eq('id', task.id)
          onUpdate()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const pauseTimer = async () => {
    clearInterval(intervalRef.current)
    await supabase.from('tasks').update({ status: 'pausada' }).eq('id', task.id)
    setIsRunning(false)
    onUpdate()
  }

  const stopTimer = async () => {
    clearInterval(intervalRef.current)
    await supabase.from('tasks').update({ status: 'pendente', start_time: null }).eq('id', task.id)
    setIsRunning(false)
    setTimeLeft((task.duration_minutes || 25) * 60)
    onUpdate()
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex items-center gap-2">
      <Clock className="w-4 h-4 text-gray-400" />
      <span className="font-mono text-sm text-gray-300">{formatTime(timeLeft)}</span>
      {!isRunning ? (
        <button onClick={startTimer} className="p-1 rounded hover:bg-green-600/20 text-green-400"><Play size={14} /></button>
      ) : (
        <>
          <button onClick={pauseTimer} className="p-1 rounded hover:bg-yellow-600/20 text-yellow-400"><Pause size={14} /></button>
          <button onClick={stopTimer} className="p-1 rounded hover:bg-red-600/20 text-red-400"><Square size={14} /></button>
        </>
      )}
    </div>
  )
}