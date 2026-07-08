// src/diagnosis/QuestionnaireWizard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../utils/supabaseClient';
import toast from 'react-hot-toast';

const QuestionnaireWizard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Estado unificado para todos os dados do formulário
  const [formData, setFormData] = useState({
    // Etapa 1: Dados Pessoais
    full_name: '',
    age: '',
    occupation: '',
    
    // Etapa 2: Gestão do Tempo (Pontuação 1-5)
    q1_planejamento: 3,
    q2_prioridades: 3,
    q3_interrupcoes: 3,
    q4_prazos: 3,
    
    // Etapa 3: Produtividade e Foco (Pontuação 1-5)
    q5_foco: 3,
    q6_procrastinacao: 3,
    q7_revisao: 3,
    q8_ferramentas: 3,
    
    // Etapa 4: Organização e Metas (Pontuação 1-5)
    q9_organizacao: 3,
    q10_metas: 3,
    q11_equilibrio: 3,
    q12_aprendizado: 3,
  });

  // Carregar dados do localStorage ao iniciar
  useEffect(() => {
    const savedData = localStorage.getItem('questionnaire_progress');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

  // Salvar dados no localStorage sempre que o estado mudar
  useEffect(() => {
    localStorage.setItem('questionnaire_progress', JSON.stringify(formData));
  }, [formData]);

  // Gerenciar mudanças nos campos do formulário
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Gerenciar mudanças nos radio buttons
  const handleRadioChange = (questionName, value) => {
    setFormData(prev => ({ ...prev, [questionName]: parseInt(value, 10) }));
  };

  // Validação da etapa 1
  const validateStep1 = () => {
    if (!formData.full_name.trim()) {
      toast.error('Por favor, informe seu nome completo.');
      return false;
    }
    if (!formData.age || formData.age < 18 || formData.age > 100) {
      toast.error('Por favor, informe uma idade válida (entre 18 e 100 anos).');
      return false;
    }
    if (!formData.occupation.trim()) {
      toast.error('Por favor, informe sua profissão.');
      return false;
    }
    return true;
  };

  // Validação genérica para etapas com perguntas
  const validateQuestions = (questions) => {
    const unanswered = questions.some(q => !formData[q]);
    if (unanswered) {
      toast.error('Por favor, responda todas as perguntas antes de continuar.');
      return false;
    }
    return true;
  };

  // Avançar para a próxima etapa
  const nextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateQuestions(['q1_planejamento', 'q2_prioridades', 'q3_interrupcoes', 'q4_prazos'])) {
      setStep(3);
    } else if (step === 3 && validateQuestions(['q5_foco', 'q6_procrastinacao', 'q7_revisao', 'q8_ferramentas'])) {
      setStep(4);
    } else if (step === 4 && validateQuestions(['q9_organizacao', 'q10_metas', 'q11_equilibrio', 'q12_aprendizado'])) {
      handleSubmit();
    }
  };

  // Voltar para a etapa anterior
  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };
    const { error } = await supabase.from('profiles').upsert({
  id: user.id,
  full_name: responses.full_name,
  age: responses.age,
  occupation: responses.occupation,
  diagnosis_level: level,
  goals: goals,
  diagnosis_completed: true,

    });


  // Calcular nível de diagnóstico baseado na pontuação total (12 perguntas)
  const calculateDiagnosisLevel = () => {
    const allQuestions = [
      'q1_planejamento', 'q2_prioridades', 'q3_interrupcoes', 'q4_prazos',
      'q5_foco', 'q6_procrastinacao', 'q7_revisao', 'q8_ferramentas',
      'q9_organizacao', 'q10_metas', 'q11_equilibrio', 'q12_aprendizado'
    ];
    
    const totalScore = allQuestions.reduce((acc, q) => acc + (formData[q] || 0), 0);
    const maxScore = allQuestions.length * 5; // 12 * 5 = 60
    const percentage = (totalScore / maxScore) * 100;

    if (percentage <= 40) return 'iniciante';
    if (percentage <= 70) return 'intermediário';
    return 'avancado';
  };

  // Gerar metas personalizadas baseadas no diagnóstico e respostas
  const generateGoalsFromAnswers = (level) => {
    const goals = [];
    const weakAreas = [];
    
    // Identificar áreas fracas (perguntas com pontuação <= 2)
    if (formData.q1_planejamento <= 2) weakAreas.push('planejamento diário');
    if (formData.q3_interrupcoes <= 2) weakAreas.push('gestão de interrupções');
    if (formData.q5_foco <= 2) weakAreas.push('manutenção de foco');
    if (formData.q6_procrastinacao <= 2) weakAreas.push('combate à procrastinação');
    if (formData.q9_organizacao <= 2) weakAreas.push('organização de tarefas');

    if (level === 'iniciante') {
      goals.push('Estabelecer uma rotina básica de planejamento diário');
      goals.push('Aprender a usar ferramentas de gestão de tarefas');
      if (weakAreas.length > 0) {
        goals.push(`Focar em melhorar: ${weakAreas.slice(0, 2).join(' e ')}`);
      }
    } else if (level === 'intermediário') {
      goals.push('Aprimorar técnicas de priorização e gestão de tempo');
      goals.push('Implementar sistemas de revisão semanal de metas');
      if (weakAreas.length > 0) {
        goals.push(`Desenvolver habilidades em: ${weakAreas.slice(0, 2).join(' e ')}`);
      }
    } else {
      goals.push('Otimizar fluxos de trabalho para máxima eficiência');
      goals.push('Implementar técnicas avançadas como Pomodoro e GTD');
      goals.push('Atuar como mentor para outros membros da equipe');
    }
    
    return goals;
  };

  // Enviar dados para o Supabase
  const handleSubmit = async () => {
    setLoading(true);
    const diagnosisLevel = calculateDiagnosisLevel();
    const goals = generateGoalsFromAnswers(diagnosisLevel);

    // Preparar dados das respostas para salvar
    const answers = {
      q1: formData.q1_planejamento,
      q2: formData.q2_prioridades,
      q3: formData.q3_interrupcoes,
      q4: formData.q4_prazos,
      q5: formData.q5_foco,
      q6: formData.q6_procrastinacao,
      q7: formData.q7_revisao,
      q8: formData.q8_ferramentas,
      q9: formData.q9_organizacao,
      q10: formData.q10_metas,
      q11: formData.q11_equilibrio,
      q12: formData.q12_aprendizado,
    };

    try {
      // Atualizar o perfil do usuário na tabela 'profiles'
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          age: parseInt(formData.age, 10),
          occupation: formData.occupation,
          diagnosis_level: diagnosisLevel,
          goals: goals,
          diagnosis_completed: true,
          answers: answers,
          completed_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      // Limpar o progresso salvo e redirecionar
      localStorage.removeItem('questionnaire_progress');
      toast.success('Questionário concluído com sucesso! 🎉');
      navigate('/dashboard');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar seus dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Renderização Condicional das Etapas
  const renderStep = () => {
    if (step === 1) {
      return (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-white">Dados Pessoais</h2>
          <p className="text-gray-400 text-sm">Vamos começar conhecendo um pouco sobre você.</p>
          
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-300 mb-1">
              Nome Completo
            </label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Digite seu nome completo"
              required
            />
          </div>
          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-300 mb-1">
              Idade
            </label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Digite sua idade"
              min="18"
              max="100"
              required
            />
          </div>
          <div>
            <label htmlFor="occupation" className="block text-sm font-medium text-gray-300 mb-1">
              Profissão
            </label>
            <input
              type="text"
              id="occupation"
              name="occupation"
              value={formData.occupation}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Digite sua profissão"
              required
            />
          </div>
        </div>
      );
    }

    if (step === 2) {
      const questions = [
        { name: 'q1_planejamento', text: 'Como você avalia seu nível de planejamento diário/semanal?' },
        { name: 'q2_prioridades', text: 'Como você define suas prioridades ao longo do dia?' },
        { name: 'q3_interrupcoes', text: 'Como você lida com interrupções inesperadas?' },
        { name: 'q4_prazos', text: 'Como você se sente em relação ao cumprimento de prazos?' },
      ];

      return (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-white">Gestão do Tempo</h2>
          <p className="text-gray-400 text-sm">Avalie seu nível de gestão do tempo (1 = Muito Ruim, 5 = Excelente).</p>
          
          {questions.map((q) => (
            <div key={q.name} className="border-b border-gray-700 pb-4">
              <p className="text-white font-medium mb-3">{q.text}</p>
              <div className="flex gap-4 flex-wrap">
                {[1, 2, 3, 4, 5].map((value) => (
                  <label key={value} className="flex items-center gap-2 text-gray-300">
                    <input
                      type="radio"
                      name={q.name}
                      value={value}
                      checked={formData[q.name] === value}
                      onChange={(e) => handleRadioChange(q.name, e.target.value)}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500"
                    />
                    <span>{value}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (step === 3) {
      const questions = [
        { name: 'q5_foco', text: 'Como você avalia sua capacidade de manter o foco em tarefas importantes?' },
        { name: 'q6_procrastinacao', text: 'Com que frequência você procrastina tarefas importantes?' },
        { name: 'q7_revisao', text: 'Como você avalia seu hábito de revisar o progresso das tarefas?' },
        { name: 'q8_ferramentas', text: 'Como você utiliza ferramentas digitais para organizar seu trabalho?' },
      ];

      return (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-white">Produtividade e Foco</h2>
          <p className="text-gray-400 text-sm">Avalie sua produtividade e capacidade de foco (1 = Muito Ruim, 5 = Excelente).</p>
          
          {questions.map((q) => (
            <div key={q.name} className="border-b border-gray-700 pb-4">
              <p className="text-white font-medium mb-3">{q.text}</p>
              <div className="flex gap-4 flex-wrap">
                {[1, 2, 3, 4, 5].map((value) => (
                  <label key={value} className="flex items-center gap-2 text-gray-300">
                    <input
                      type="radio"
                      name={q.name}
                      value={value}
                      checked={formData[q.name] === value}
                      onChange={(e) => handleRadioChange(q.name, e.target.value)}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500"
                    />
                    <span>{value}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (step === 4) {
      const questions = [
        { name: 'q9_organizacao', text: 'Como você avalia sua organização pessoal e de tarefas?' },
        { name: 'q10_metas', text: 'Como você define e acompanha suas metas de curto e longo prazo?' },
        { name: 'q11_equilibrio', text: 'Como você avalia seu equilíbrio entre vida pessoal e trabalho?' },
        { name: 'q12_aprendizado', text: 'Como você busca aprender novas habilidades e se desenvolver?' },
      ];

      return (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-white">Organização e Metas</h2>
          <p className="text-gray-400 text-sm">Avalie sua organização e capacidade de alcançar metas (1 = Muito Ruim, 5 = Excelente).</p>
          
          {questions.map((q) => (
            <div key={q.name} className="border-b border-gray-700 pb-4">
              <p className="text-white font-medium mb-3">{q.text}</p>
              <div className="flex gap-4 flex-wrap">
                {[1, 2, 3, 4, 5].map((value) => (
                  <label key={value} className="flex items-center gap-2 text-gray-300">
                    <input
                      type="radio"
                      name={q.name}
                      value={value}
                      checked={formData[q.name] === value}
                      onChange={(e) => handleRadioChange(q.name, e.target.value)}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500"
                    />
                    <span>{value}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }
  };

  // Obter título da etapa atual
  const getStepTitle = () => {
    const titles = {
      1: 'Dados Pessoais',
      2: 'Gestão do Tempo',
      3: 'Produtividade e Foco',
      4: 'Organização e Metas'
    };
    return titles[step] || '';
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-gray-800 rounded-xl shadow-xl p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white">Diagnóstico OrganizAI</h1>
            <span className="text-sm text-gray-400">
              {step} de 4
            </span>
          </div>
          <p className="text-gray-400 mt-1">{getStepTitle()}</p>
          
          {/* Barra de Progresso */}
          <div className="w-full bg-gray-700 rounded-full h-2 mt-4">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        <form onSubmit={(e) => e.preventDefault()}>
          {renderStep()}

          <div className="flex justify-between mt-8">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
              >
                Voltar
              </button>
            )}
            <button
              type="button"
              onClick={nextStep}
              disabled={loading}
              className={`px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors ml-auto ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Salvando...' : step === 4 ? 'Finalizar' : 'Próximo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuestionnaireWizard;