import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";

const STEPS = [
  {
    title: "Dados Pessoais",
    fields: [
      {
        name: "full_name",
        label: "Nome completo",
        type: "text",
        required: true,
      },
      {
        name: "age",
        label: "Idade",
        type: "number",
        required: true,
      },
      {
        name: "occupation",
        label: "Ocupação",
        type: "text",
        required: true,
        placeholder: "Estudante, profissional...",
      },
    ],
  },
  {
    title: "Gestão do Tempo",
    questions: [
      {
        id: "q_overwhelm",
        label: "Com que frequência você se sente sobrecarregado(a)?",
        options: ["Nunca", "Às vezes", "Frequentemente"],
        weights: [3, 2, 1], // menos sobrecarga = melhor gestão → mais pontos
      },
      {
        id: "q_planning",
        label: "Você costuma planejar seu dia ou semana?",
        options: ["Nunca", "Às vezes", "Sempre"],
        weights: [1, 2, 3],
      },
      {
        id: "q_estimate",
        label: "Você consegue estimar quanto tempo uma tarefa levará?",
        options: ["Não", "Mais ou menos", "Sim, com precisão"],
        weights: [1, 2, 3],
      },
    ],
  },
  {
    title: "Gestão Financeira",
    questions: [
      {
        id: "q_budget",
        label: "Você mantém um orçamento mensal?",
        options: ["Não", "Às vezes", "Sim"],
        weights: [1, 2, 3],
      },
      {
        id: "q_savings",
        label: "Consegue poupar regularmente?",
        options: ["Não", "Pouco", "Sim, consistentemente"],
        weights: [1, 2, 3],
      },
      {
        id: "q_track",
        label: "Você sabe para onde seu dinheiro está indo?",
        options: [
          "Não faço ideia",
          "Tenho uma noção",
          "Sim, controlo cada gasto",
        ],
        weights: [1, 2, 3],
      },
    ],
  },
  {
    title: "Rotina e Hábitos",
    questions: [
      {
        id: "q_peak",
        label: "Em que período você se sente mais produtivo(a)?",
        options: ["Manhã", "Tarde", "Noite", "Varia muito"],
        // esta pergunta não tem peso — é informativa
        noWeight: true,
      },
      {
        id: "q_distractions",
        label: "Quais são seus maiores ladrões de tempo?",
        type: "multiselect",
        options: [
          "Redes sociais",
          "Interrupções de colegas",
          "Procrastinação",
          "Falta de planejamento",
        ],
        noWeight: true,
      },
      {
        id: "q_areas",
        label: "Quais áreas da sua vida pessoal precisam de mais atenção?",
        type: "multiselect",
        options: ["Saúde", "Relacionamentos", "Estudos", "Finanças", "Lazer"],
        noWeight: true,
      },
    ],
  },
];

export default function QuestionnaireWizard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Verifica se o usuário já completou o questionário
  useEffect(() => {
    if (!user) return;

    supabase
      .from("profiles")
      .select("diagnosis_completed, diagnosis_level")
      .eq("id", user.id)
      .single()
      .then(({ data, error }) => {
        if (!error && data?.diagnosis_completed) {
          toast.success(`Bem-vindo de volta! Nível: ${data.diagnosis_level}`);
          navigate("/dashboard", { replace: true });
        } else {
          setLoading(false);
        }
      });
  }, [user, navigate]);

  const handleFieldChange = (name, value) => {
    setResponses((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuestionChange = (id, value) => {
    setResponses((prev) => ({ ...prev, [id]: value }));
  };

  const canProceed = () => {
    const currentStep = STEPS[step];
    if (currentStep.fields) {
      return currentStep.fields.every((f) => !f.required || responses[f.name]);
    }
    if (currentStep.questions) {
      return currentStep.questions.every((q) => q.noWeight || responses[q.id]);
    }
    return true;
  };

  const calculateLevel = () => {
    let total = 0;
    STEPS.forEach((s) => {
      s.questions?.forEach((q) => {
        if (!q.noWeight && responses[q.id]) {
          const idx = q.options.indexOf(responses[q.id]);
          if (idx !== -1 && q.weights) {
            total += q.weights[idx];
          }
        }
      });
    });
    if (total <= 5) return "iniciante";
    if (total <= 8) return "intermediário";
    return "avancado";
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const level = calculateLevel();
    const goals = generateGoals(level, responses);

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: responses.full_name,
      age: responses.age,
      occupation: responses.occupation,
      diagnosis_level: level,
      goals: goals,
      diagnosis_completed: true,
    });

    if (error) {
      toast.error("Erro ao salvar diagnóstico.");
      setSaving(false);
      return;
    }

    toast.success("Diagnóstico concluído! Redirecionando...");
    setTimeout(() => navigate("/dashboard", { replace: true }), 1500);
  };

  const generateGoals = (level, responses) => {
    const goals = [];
    if (level === "iniciante") {
      goals.push("Criar hábito de planejamento diário");
      goals.push("Registrar gastos por 7 dias");
    } else if (level === "intermediário") {
      goals.push("Otimizar agenda com método Eisenhower");
      goals.push("Revisar orçamento mensal");
    } else {
      goals.push("Mentorar alguém em produtividade");
      goals.push("Investir 10% da renda");
    }
    // metas personalizadas baseadas em respostas
    if (responses.q_distractions?.includes("Redes sociais")) {
      goals.push("Reduzir uso de redes sociais em 30 min/dia");
    }
    return goals;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const currentStep = STEPS[step];
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-2xl">
        {/* Barra de progresso */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>
              Etapa {step + 1} de {STEPS.length}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Título da etapa */}
        <h2 className="text-2xl font-bold text-white mb-6">
          {currentStep.title}
        </h2>

        {/* Campos da etapa */}
        <div className="space-y-5">
          {currentStep.fields?.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                {field.label}
              </label>
              <input
                type={field.type || "text"}
                required={field.required}
                value={responses[field.name] || ""}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder={field.placeholder || field.label}
              />
            </div>
          ))}

          {currentStep.questions?.map((q) => (
            <div key={q.id} className="bg-gray-750 p-4 rounded-lg">
              <p className="text-white font-medium mb-3">{q.label}</p>
              {q.type === "multiselect" ? (
                <div className="flex flex-wrap gap-2">
                  {q.options.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        const prev = responses[q.id] || [];
                        const newVal = prev.includes(opt)
                          ? prev.filter((v) => v !== opt)
                          : [...prev, opt];
                        handleQuestionChange(q.id, newVal);
                      }}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
                        (responses[q.id] || []).includes(opt)
                          ? "bg-blue-600 border-blue-500 text-white"
                          : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {q.options.map((opt, i) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleQuestionChange(q.id, opt)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                        responses[q.id] === opt
                          ? "bg-blue-600 border-blue-500 text-white"
                          : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Botões de navegação */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => setStep((prev) => prev - 1)}
            disabled={step === 0}
            className="px-6 py-2.5 rounded-lg bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Voltar
          </button>
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep((prev) => prev + 1)}
              disabled={!canProceed()}
              className="px-6 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Próximo
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving || !canProceed()}
              className="px-6 py-2.5 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {saving ? "Salvando..." : "Concluir"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
