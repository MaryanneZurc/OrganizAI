import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../utils/supabaseClient";
import { Play, Pause, Square, Clock } from "lucide-react";

export default function TaskTimer({ task, onStatusChange }) {
  const [timeLeft, setTimeLeft] = useState(0); // segundos restantes
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const elapsedBeforePauseRef = useRef(0); // segundos já decorridos antes da pausa

  // Sincroniza o estado inicial com a tarefa
  useEffect(() => {
    if (task.status === "em_andamento") {
      if (task.start_time) {
        const start = new Date(task.start_time).getTime();
        const now = Date.now();
        const elapsed = Math.floor((now - start) / 1000);
        const remaining = Math.max(
          0,
          (task.duration_minutes || 25) * 60 - elapsed,
        );
        setTimeLeft(remaining);
        elapsedBeforePauseRef.current = elapsed;
        startTimeRef.current = start;
        setIsRunning(true);
        setIsPaused(false);
      }
    } else if (task.status === "pausada") {
      // Se pausada, precisamos do elapsedBeforePause armazenado no banco (não temos campo ainda, então tratamos como 0)
      setTimeLeft(
        Math.max(
          0,
          (task.duration_minutes || 25) * 60 - (task.elapsed_seconds || 0),
        ),
      );
      setIsRunning(false);
      setIsPaused(true);
    } else {
      setTimeLeft((task.duration_minutes || 25) * 60);
      setIsRunning(false);
      setIsPaused(false);
      elapsedBeforePauseRef.current = 0;
    }
  }, [task]);

  // Loop do cronômetro
  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            // Tempo esgotado: concluir automaticamente
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, isPaused]);

  const handleStart = async () => {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("tasks")
      .update({
        status: "em_andamento",
        start_time: now,
        elapsed_seconds: elapsedBeforePauseRef.current,
      })
      .eq("id", task.id);

    if (!error) {
      setIsRunning(true);
      setIsPaused(false);
      startTimeRef.current = new Date(now).getTime();
      onStatusChange?.();
    }
  };

  const handlePause = async () => {
    const elapsed =
      elapsedBeforePauseRef.current +
      Math.floor((Date.now() - startTimeRef.current) / 1000);
    const { error } = await supabase
      .from("tasks")
      .update({
        status: "pausada",
        elapsed_seconds: elapsed,
      })
      .eq("id", task.id);

    if (!error) {
      setIsRunning(false);
      setIsPaused(true);
      elapsedBeforePauseRef.current = elapsed;
      onStatusChange?.();
    }
  };

  const handleComplete = async () => {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("tasks")
      .update({
        status: "concluida",
        end_time: now,
      })
      .eq("id", task.id);

    if (!error) {
      setIsRunning(false);
      setIsPaused(false);
      onStatusChange?.();
    }
  };

  const handleStop = async () => {
    clearInterval(intervalRef.current);
    const { error } = await supabase
      .from("tasks")
      .update({
        status: "pendente",
        start_time: null,
        elapsed_seconds: null,
      })
      .eq("id", task.id);

    if (!error) {
      setIsRunning(false);
      setIsPaused(false);
      setTimeLeft((task.duration_minutes || 25) * 60);
      elapsedBeforePauseRef.current = 0;
      onStatusChange?.();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center gap-3">
      <Clock className="w-4 h-4 text-gray-400" />
      <span
        className={`font-mono text-lg ${isRunning ? "text-blue-400" : "text-gray-300"}`}
      >
        {formatTime(timeLeft)}
      </span>
      <div className="flex gap-1">
        {!isRunning && !isPaused && (
          <button
            onClick={handleStart}
            className="p-1.5 rounded hover:bg-green-600 text-green-400"
            title="Iniciar"
          >
            <Play size={16} />
          </button>
        )}
        {isRunning && (
          <button
            onClick={handlePause}
            className="p-1.5 rounded hover:bg-yellow-600 text-yellow-400"
            title="Pausar"
          >
            <Pause size={16} />
          </button>
        )}
        {isPaused && (
          <button
            onClick={handleStart}
            className="p-1.5 rounded hover:bg-green-600 text-green-400"
            title="Retomar"
          >
            <Play size={16} />
          </button>
        )}
        {(isRunning || isPaused) && (
          <button
            onClick={handleStop}
            className="p-1.5 rounded hover:bg-red-600 text-red-400"
            title="Parar"
          >
            <Square size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
