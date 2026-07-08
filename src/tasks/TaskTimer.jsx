import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Clock } from "lucide-react";
import { supabase } from "../utils/supabaseClient";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";

export default function TaskTimer({ task, onUpdate }) {
  const { user } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(task.elapsed_seconds || 0);
  const [duration, setDuration] = useState(task.duration_minutes || 25);
  const intervalRef = useRef(null);

  // Carrega o tempo salvo quando o componente monta
  useEffect(() => {
    setElapsed(task.elapsed_seconds || 0);
    setDuration(task.duration_minutes || 25);
  }, [task]);

  // Limpa o intervalo quando desmonta
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Formata segundos para MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Salva o tempo no banco
  const saveElapsedTime = async (newElapsed) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ elapsed_seconds: newElapsed })
        .eq("id", task.id)
        .eq("user_id", user.id);

      if (error) throw error;
      if (onUpdate) onUpdate(); // Atualiza a lista de tarefas
    } catch (error) {
      toast.error("Erro ao salvar tempo");
      console.error(error);
    }
  };

  // Iniciar timer
  const handleStart = () => {
    if (elapsed >= duration * 60) {
      toast.error("Tempo já finalizado!");
      return;
    }
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setElapsed((prev) => {
        const newElapsed = prev + 1;
        if (newElapsed >= duration * 60) {
          clearInterval(intervalRef.current);
          setIsRunning(false);
          saveElapsedTime(newElapsed);
          toast.success("⏰ Tempo finalizado!");
          return newElapsed;
        }
        return newElapsed;
      });
    }, 1000);
  };

  // Pausar timer
  const handlePause = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
    saveElapsedTime(elapsed);
    toast.success("⏸️ Timer pausado");
  };

  // Resetar timer
  const handleReset = async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
    setElapsed(0);
    await saveElapsedTime(0);
    toast.success("🔄 Timer resetado");
  };

  // Calcular progresso
  const progress = duration * 60 > 0 ? (elapsed / (duration * 60)) * 100 : 0;
  const isComplete = elapsed >= duration * 60;

  return (
    <div className="flex items-center gap-3 bg-gray-700/50 rounded-lg px-3 py-2">
      {/* Ícone do relógio */}
      <Clock size={18} className="text-blue-400" />

      {/* Display do tempo */}
      <span
        className={`font-mono text-lg font-bold min-w-[60px] ${
          isComplete ? "text-green-500" : "text-white"
        }`}
      >
        {formatTime(elapsed)} / {duration}:00
      </span>

      {/* Barra de progresso */}
      <div className="w-20 h-1.5 bg-gray-600 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${
            isComplete ? "bg-green-500" : "bg-blue-500"
          }`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>

      {/* Botões */}
      <div className="flex gap-1">
        {!isRunning ? (
          <button
            onClick={handleStart}
            disabled={isComplete}
            className={`p-1.5 rounded-lg transition ${
              isComplete
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 text-white"
            }`}
            title="Iniciar"
          >
            <Play size={16} />
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="p-1.5 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white transition"
            title="Pausar"
          >
            <Pause size={16} />
          </button>
        )}

        <button
          onClick={handleReset}
          className="p-1.5 rounded-lg bg-gray-600 hover:bg-gray-500 text-white transition"
          title="Resetar"
        >
          <RotateCcw size={16} />
        </button>
      </div>
    </div>
  );
}
