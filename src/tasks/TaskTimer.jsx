import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../utils/supabaseClient";
import { Play, Pause, Square, Clock } from "lucide-react";

const getDurationSeconds = (task) => (task.duration_minutes || 25) * 60;

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

export default function TaskTimer({ task, onStatusChange }) {
  const [nowTick, setNowTick] = useState(0);
  const [savingAction, setSavingAction] = useState(null);
  const autoCompletedRef = useRef(false);

  const durationSeconds = getDurationSeconds(task);
  const savedElapsed = task.elapsed_seconds || 0;
  const isRunning = task.status === "em_andamento";
  const isPaused = task.status === "pausada";
  const startTime = task.start_time ? new Date(task.start_time).getTime() : null;
  const effectiveNow = nowTick || startTime || 0;
  const elapsedSinceStart =
    isRunning && startTime
      ? Math.max(0, Math.floor((effectiveNow - startTime) / 1000))
      : 0;
  const totalElapsed = isRunning ? savedElapsed + elapsedSinceStart : savedElapsed;
  const timeLeft = Math.max(0, durationSeconds - totalElapsed);
  const progressPercent = Math.min(
    100,
    Math.max(0, 100 - (timeLeft / durationSeconds) * 100),
  );

  const handleComplete = useCallback(async () => {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("tasks")
      .update({
        status: "concluida",
        end_time: now,
      })
      .eq("id", task.id);

    if (!error) {
      onStatusChange?.();
    }
  }, [task.id, onStatusChange]);

  useEffect(() => {
    autoCompletedRef.current = false;
  }, [task.id, task.status]);

  useEffect(() => {
    if (!isRunning) return undefined;

    const interval = setInterval(() => {
      setNowTick(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    if (!isRunning || timeLeft > 0 || autoCompletedRef.current) return;

    autoCompletedRef.current = true;
    handleComplete();
  }, [isRunning, timeLeft, handleComplete]);

  const handleStart = async () => {
    setSavingAction("start");
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("tasks")
      .update({
        status: "em_andamento",
        start_time: now,
        elapsed_seconds: savedElapsed,
      })
      .eq("id", task.id);

    setSavingAction(null);

    if (!error) {
      setNowTick(Date.now());
      onStatusChange?.();
    }
  };

  const handlePause = async () => {
    setSavingAction("pause");
    const { error } = await supabase
      .from("tasks")
      .update({
        status: "pausada",
        elapsed_seconds: Math.min(durationSeconds, totalElapsed),
      })
      .eq("id", task.id);

    setSavingAction(null);

    if (!error) {
      onStatusChange?.();
    }
  };

  const handleStop = async () => {
    setSavingAction("stop");

    const { error } = await supabase
      .from("tasks")
      .update({
        status: "pendente",
        start_time: null,
        elapsed_seconds: null,
      })
      .eq("id", task.id);

    setSavingAction(null);

    if (!error) {
      setNowTick(Date.now());
      onStatusChange?.();
    }
  };

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2 rounded-lg border border-gray-800 bg-gray-950/70 px-2.5 py-2">
      <div className="flex min-w-[92px] items-center gap-2">
        <Clock className="h-4 w-4 text-gray-500" />
        <span
          className={`font-mono text-base font-semibold ${
            isRunning ? "text-blue-300" : "text-gray-300"
          }`}
        >
          {formatTime(timeLeft)}
        </span>
      </div>

      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-800 sm:w-20">
        <div
          className="h-full rounded-full bg-blue-500 transition-all"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex gap-1">
        {!isRunning && !isPaused && (
          <button
            type="button"
            onClick={handleStart}
            disabled={savingAction !== null}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-green-300 transition hover:bg-green-600/15 hover:text-green-200 disabled:opacity-50"
            title="Iniciar"
          >
            <Play size={16} />
          </button>
        )}
        {isRunning && (
          <button
            type="button"
            onClick={handlePause}
            disabled={savingAction !== null}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-yellow-300 transition hover:bg-yellow-600/15 hover:text-yellow-200 disabled:opacity-50"
            title="Pausar"
          >
            <Pause size={16} />
          </button>
        )}
        {isPaused && (
          <button
            type="button"
            onClick={handleStart}
            disabled={savingAction !== null}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-green-300 transition hover:bg-green-600/15 hover:text-green-200 disabled:opacity-50"
            title="Retomar"
          >
            <Play size={16} />
          </button>
        )}
        {(isRunning || isPaused) && (
          <button
            type="button"
            onClick={handleStop}
            disabled={savingAction !== null}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-red-300 transition hover:bg-red-600/15 hover:text-red-200 disabled:opacity-50"
            title="Parar"
          >
            <Square size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
