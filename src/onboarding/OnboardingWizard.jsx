// src/onboarding/OnboardingWizard.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  FaRocket, 
  FaTasks, 
  FaChartLine, 
  FaRobot,
  FaArrowRight,
  FaCheck 
} from 'react-icons/fa';

const OnboardingWizard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const steps = [
    {
      icon: <FaRocket className="text-6xl text-blue-500" />,
      title: 'Bem-vindo ao OrganizAI!',
      description: 'Sua plataforma inteligente para gestão de tarefas e produtividade pessoal. Vamos te ajudar a organizar seu dia de forma eficiente.'
    },
    {
      icon: <FaTasks className="text-6xl text-green-500" />,
      title: 'Gerencie suas Tarefas',
      description: 'Crie, organize e priorize suas tarefas com facilidade. Use o timer Pomodoro para manter o foco e acompanhe seu progresso em tempo real.'
    },
    {
      icon: <FaChartLine className="text-6xl text-purple-500" />,
      title: 'Acompanhe seu Progresso',
      description: 'Visualize gráficos e estatísticas do seu desempenho. Identifique padrões e áreas de melhoria para ser cada vez mais produtivo.'
    },
    {
      icon: <FaRobot className="text-6xl text-cyan-500" />,
      title: 'Assistente IA Integrado',
      description: 'Conte com a ajuda do nosso assistente virtual para recomendações personalizadas, dicas de organização e muito mais!'
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      navigate('/dashboard');
    }
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  const currentStep = steps[step];

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-gray-800 rounded-2xl shadow-2xl p-8 md:p-12">
        <div className="flex justify-center gap-2 mb-8">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-12 rounded-full transition-all duration-300 ${
                index === step ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>

        <div className="flex flex-col items-center text-center">
          <div className="mb-6 p-4 bg-gray-700 rounded-full">
            {currentStep.icon}
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            {currentStep.title}
          </h2>
          <p className="text-gray-300 text-lg leading-relaxed max-w-lg">
            {currentStep.description}
          </p>
        </div>

        <div className="flex justify-between items-center mt-10">
          {step > 0 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Voltar
            </button>
          ) : (
            <button
              onClick={handleSkip}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Pular
            </button>
          )}

          <button
            onClick={handleNext}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            {step === steps.length - 1 ? (
              <>
                Começar <FaCheck />
              </>
            ) : (
              <>
                Próximo <FaArrowRight />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;