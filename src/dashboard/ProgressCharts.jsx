import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import { useAuth } from "../hooks/useAuth";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import toast from "react-hot-toast";

export default function ProgressCharts() {
  const { user } = useAuth();
  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchSnapshots();
  }, [user]);

  const fetchSnapshots = async () => {
    const { data, error } = await supabase
      .from("progress_snapshots")
      .select("*")
      .eq("user_id", user.id)
      .order("recorded_at", { ascending: true });

    if (error) {
      toast.error("Erro ao carregar dados de progresso.");
      setLoading(false);
      return;
    }

    setSnapshots(data || []);
    setLoading(false);
  };

  // Agrupa snapshots por categoria
  const getCategoryData = (category) => {
    return snapshots
      .filter((s) => s.category === category)
      .map((s) => ({
        date: new Date(s.recorded_at).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
        }),
        value: s.value,
        rawDate: s.recorded_at,
      }));
  };

  const tarefasData = getCategoryData("tarefas_concluidas");
  const taxaData = getCategoryData("taxa_conclusao");
  const nivelData = getCategoryData("nivel_perfil");

  // Calcula a taxa de conclusão real se não tivermos dados
  useEffect(() => {
    const calcTaxa = async () => {
      if (taxaData.length === 0 && user) {
        const { data: tasks } = await supabase
          .from("tasks")
          .select("status, created_at, scheduled_date")
          .eq("user_id", user.id);

        if (!tasks) return;
        const totalPorDia = {};
        const concluidasPorDia = {};
        tasks.forEach((t) => {
          const dia = t.scheduled_date || t.created_at?.split("T")[0];
          if (!dia) return;
          totalPorDia[dia] = (totalPorDia[dia] || 0) + 1;
          if (t.status === "concluida") {
            concluidasPorDia[dia] = (concluidasPorDia[dia] || 0) + 1;
          }
        });
        const novos = Object.keys(totalPorDia).map((dia) => ({
          date: new Date(dia + "T00:00:00").toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
          }),
          value: totalPorDia[dia]
            ? Math.round(
                ((concluidasPorDia[dia] || 0) / totalPorDia[dia]) * 100,
              )
            : 0,
          rawDate: dia,
        }));
        // Substitui os dados de taxa com cálculo real
        setSnapshots((prev) => [
          ...prev,
          ...novos.map((n) => ({
            user_id: user.id,
            category: "taxa_conclusao",
            value: n.value,
            recorded_at: n.rawDate,
          })),
        ]);
      }
    };
    calcTaxa();
  }, [user, snapshots]);

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Seu Progresso</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tarefas concluídas por dia */}
        <div className="bg-gray-800 p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-gray-300 mb-4">
            Tarefas Concluídas por Dia
          </h3>
          {tarefasData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={tarefasData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" tick={{ fill: "#9CA3AF" }} />
                <YAxis allowDecimals={false} tick={{ fill: "#9CA3AF" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "0.5rem",
                  }}
                  labelStyle={{ color: "#F3F4F6" }}
                />
                <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-12">
              Nenhum dado ainda. Conclua tarefas para ver seu progresso!
            </p>
          )}
        </div>

        {/* Taxa de conclusão */}
        <div className="bg-gray-800 p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-gray-300 mb-4">
            Taxa de Conclusão (%)
          </h3>
          {taxaData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={taxaData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" tick={{ fill: "#9CA3AF" }} />
                <YAxis domain={[0, 100]} tick={{ fill: "#9CA3AF" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "0.5rem",
                  }}
                  labelStyle={{ color: "#F3F4F6" }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ fill: "#10B981" }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-12">
              Sem dados de taxa. Crie e conclua tarefas.
            </p>
          )}
        </div>

        {/* Nível de perfil ao longo do tempo */}
        <div className="bg-gray-800 p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-gray-300 mb-4">
            Evolução do Nível
          </h3>
          {nivelData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={nivelData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" tick={{ fill: "#9CA3AF" }} />
                <YAxis
                  domain={[0, 3]}
                  ticks={[1, 2, 3]}
                  tickFormatter={(v) =>
                    ["", "Iniciante", "Intermediário", "Avançado"][v]
                  }
                  tick={{ fill: "#9CA3AF" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "0.5rem",
                  }}
                  labelStyle={{ color: "#F3F4F6" }}
                  formatter={(value) =>
                    ["", "Iniciante", "Intermediário", "Avançado"][value]
                  }
                />
                <Line
                  type="stepAfter"
                  dataKey="value"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  dot={{ fill: "#F59E0B" }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-12">
              Nível estático. Complete o diagnóstico para registrar.
            </p>
          )}
        </div>

        {/* Interações com IA (placeholder) */}
        <div className="bg-gray-800 p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-gray-300 mb-4">
            Interações com IA
          </h3>
          <p className="text-gray-500 text-center py-12">
            Disponível quando o chat da IA estiver ativo.
          </p>
        </div>
      </div>
    </div>
  );
}
