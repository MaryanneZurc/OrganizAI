import { useState, useEffect, useCallback } from "react";
import { supabase } from "../utils/supabaseClient";
import { useAuth } from "../hooks/useAuth";
import { useRealtime } from "../hooks/useRealtime";
import TaskTimer from "./TaskTimer";
import toast from "react-hot-toast";
import { Plus, CheckCircle, AlertTriangle, Clock, Trash2 } from "lucide-react";

export default function TaskList() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDuration, setNewDuration] = useState(25);
  const [newImportant, setNewImportant] = useState(true);
  const [newUrgent, setNewUrgent] = useState(false);
  const [loading, setLoading] = useState(true);

  // Busca inicial
  const fetchTasks = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .order("priority", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar tarefas.");
      return;
    }
    setTasks(data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Realtime: escuta mudanças na tabela tasks do usuário
  useRealtime("tasks", `user_id=eq.${user?.id}`, (payload) => {
    if (payload.eventType === "INSERT") {
      setTasks((prev) => [payload.new, ...prev]);
    } else if (payload.eventType === "UPDATE") {
      setTasks((prev) =>
        prev.map((t) => (t.id === payload.new.id ? payload.new : t)),
      );
    } else if (payload.eventType === "DELETE") {
      setTasks((prev) => prev.filter((t) => t.id !== payload.old.id));
    }
  });

  // Adicionar nova tarefa
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const priority = calculatePriority(newImportant, newUrgent);
    const { error } = await supabase.from("tasks").insert({
      user_id: user.id,
      title: newTitle,
      duration_minutes: newDuration,
      is_important: newImportant,
      is_urgent: newUrgent,
      priority,
      status: "pendente",
    });

    if (error) {
      toast.error("Erro ao criar tarefa.");
      return;
    }

    toast.success("Tarefa criada!");
    setNewTitle("");
    setNewDuration(25);
    setNewImportant(true);
    setNewUrgent(false);
  };

  // Deletar tarefa
  const handleDelete = async (id) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) toast.error("Erro ao deletar.");
    else toast.success("Tarefa removida.");
  };

  // Prioridade Eisenhower
  const calculatePriority = (important, urgent) => {
    if (important && urgent) return 1; // Faça agora
    if (important && !urgent) return 2; // Agende
    if (!important && urgent) return 3; // Delegue
    return 4; // Elimine
  };

  const getPriorityLabel = (p) => {
    const map = {
      1: "Urgente+Importante",
      2: "Importante",
      3: "Urgente",
      4: "Opcional",
    };
    return map[p] || "";
  };

  const getStatusBadge = (status) => {
    const map = {
      pendente: "bg-gray-600",
      em_andamento: "bg-blue-600",
      pausada: "bg-yellow-600",
      concluida: "bg-green-600",
    };
    return map[status] || "bg-gray-600";
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Suas Tarefas</h2>

      {/* Formulário de criação */}
      <form
        onSubmit={handleAddTask}
        className="bg-gray-800 p-4 rounded-xl mb-6 space-y-3"
      >
        <div className="flex gap-3">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Nova tarefa..."
            className="flex-1 px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 outline-none"
            required
          />
          <input
            type="number"
            value={newDuration}
            onChange={(e) => setNewDuration(Number(e.target.value))}
            className="w-20 px-3 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 outline-none"
            min="1"
            title="Duração (minutos)"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center gap-2"
          >
            <Plus size={18} />
            Adicionar
          </button>
        </div>
        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-2 text-gray-300">
            <input
              type="checkbox"
              checked={newImportant}
              onChange={(e) => setNewImportant(e.target.checked)}
              className="rounded"
            />
            Importante
          </label>
          <label className="flex items-center gap-2 text-gray-300">
            <input
              type="checkbox"
              checked={newUrgent}
              onChange={(e) => setNewUrgent(e.target.checked)}
              className="rounded"
            />
            Urgente
          </label>
          <span className="text-gray-400 ml-auto">
            Prioridade:{" "}
            {getPriorityLabel(calculatePriority(newImportant, newUrgent))}
          </span>
        </div>
      </form>

      {/* Lista de tarefas */}
      <div className="space-y-3">
        {tasks.length === 0 && (
          <p className="text-gray-400 text-center py-8">
            Nenhuma tarefa ainda. Crie sua primeira tarefa acima!
          </p>
        )}
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`bg-gray-800 p-4 rounded-xl border-l-4 ${
              task.status === "concluida"
                ? "border-green-500 opacity-70"
                : task.status === "em_andamento"
                  ? "border-blue-500"
                  : task.status === "pausada"
                    ? "border-yellow-500"
                    : "border-gray-600"
            } transition-all`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3
                  className={`text-white font-semibold ${task.status === "concluida" ? "line-through" : ""}`}
                >
                  {task.title}
                </h3>
                <div className="flex items-center gap-3 mt-2 text-sm text-gray-400">
                  <span>{task.duration_minutes} min</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${getStatusBadge(task.status)}`}
                  >
                    {task.status.replace("_", " ")}
                  </span>
                  <span className="text-xs">P{task.priority}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {task.status !== "concluida" && (
                  <TaskTimer task={task} onStatusChange={fetchTasks} />
                )}
                <button
                  onClick={() => handleDelete(task.id)}
                  className="p-1.5 rounded hover:bg-red-600/20 text-red-400"
                  title="Excluir"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
