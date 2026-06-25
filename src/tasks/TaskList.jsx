import { useState, useEffect } from 'react';
import { Plus, Clock, CheckCircle, Circle } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import TaskTimer from './TaskTimer';

export default function TaskList() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [loading, setLoading] = useState(true);

  // Buscar tarefas do banco
  useEffect(() => {
    if (!user) return;
    fetchTasks();
  }, [user]);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      toast.error('Erro ao carregar tarefas');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([
          {
            title: newTaskTitle,
            user_id: user.id,
            status: 'pendente',
            is_important: false,
            is_urgent: false,
            duration_minutes: 25,
            elapsed_seconds: 0,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      
      setTasks([data, ...tasks]);
      setNewTaskTitle('');
      toast.success('Tarefa criada!');
    } catch (error) {
      toast.error('Erro ao criar tarefa');
      console.error(error);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) throw error;
      
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
      toast.success('Status atualizado!');
    } catch (error) {
      toast.error('Erro ao atualizar');
    }
  };

  if (loading) {
    return <div className="text-white">Carregando tarefas...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Formulário de nova tarefa */}
      <form onSubmit={addTask} className="flex gap-2">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="O que você precisa fazer?"
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-lg flex items-center gap-2 transition"
        >
          <Plus size={20} />
          Adicionar
        </button>
      </form>

      {/* Lista de tarefas */}
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            Nenhuma tarefa ainda. Comece adicionando uma!
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateTaskStatus(
                        task.id,
                        task.status === 'concluida' ? 'pendente' : 'concluida'
                      )}
                      className="text-gray-400 hover:text-green-500 transition"
                    >
                      {task.status === 'concluida' ? (
                        <CheckCircle size={24} className="text-green-500" />
                      ) : (
                        <Circle size={24} />
                      )}
                    </button>
                    <h3 className={`text-lg font-medium ${
                      task.status === 'concluida' ? 'line-through text-gray-500' : 'text-white'
                    }`}>
                      {task.title}
                    </h3>
                  </div>
                  
                  {/* Timer da tarefa */}
                  <div className="ml-11 mt-3">
                    <TaskTimer task={task} onUpdate={fetchTasks} />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
