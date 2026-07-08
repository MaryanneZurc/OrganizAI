// src/techniques/Techniques.jsx
import React from 'react';
import { 
  FaClock, 
  FaListCheck, 
  FaChartPie, 
  FaBrain,
  FaFire,
  FaStar,
  FaArrowRight
} from 'react-icons/fa6';

const techniquesData = [
  {
    id: 1,
    icon: <FaClock className="text-4xl text-blue-400" />,
    title: 'Técnica Pomodoro',
    description: 'Trabalhe em blocos de 25 minutos com pausas de 5 minutos. Aumenta o foco e reduz a fadiga mental.',
    benefits: ['Melhora a concentração', 'Reduz a procrastinação', 'Aumenta a produtividade'],
    color: 'border-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    id: 2,
    icon: <FaListCheck className="text-4xl text-green-400" />,
    title: 'GTD (Getting Things Done)',
    description: 'Capte, organize e execute tarefas de forma sistemática. Libere sua mente para o que realmente importa.',
    benefits: ['Menos estresse', 'Mais clareza mental', 'Maior eficiência'],
    color: 'border-green-500',
    bg: 'bg-green-500/10',
  },
  {
    id: 3,
    icon: <FaChartPie className="text-4xl text-purple-400" />,
    title: 'Matriz de Eisenhower',
    description: 'Priorize tarefas por urgência e importância. Saiba o que fazer agora, planejar, delegar ou eliminar.',
    benefits: ['Decisões mais rápidas', 'Foco no essencial', 'Menos desperdício de tempo'],
    color: 'border-purple-500',
    bg: 'bg-purple-500/10',
  },
  {
    id: 4,
    icon: <FaBrain className="text-4xl text-yellow-400" />,
    title: 'Mind Mapping',
    description: 'Organize ideias e projetos visualmente. Estimule a criatividade e a conexão entre conceitos.',
    benefits: ['Estimula a criatividade', 'Facilita o planejamento', 'Melhora a memória'],
    color: 'border-yellow-500',
    bg: 'bg-yellow-500/10',
  },
  {
    id: 5,
    icon: <FaFire className="text-4xl text-red-400" />,
    title: 'Deep Work',
    description: 'Dedique-se a tarefas cognitivamente exigentes sem distrações. Produza trabalho de alta qualidade.',
    benefits: ['Resultados superiores', 'Domínio de habilidades', 'Destaque profissional'],
    color: 'border-red-500',
    bg: 'bg-red-500/10',
  },
  {
    id: 6,
    icon: <FaStar className="text-4xl text-indigo-400" />,
    title: 'Regra 80/20 (Pareto)',
    description: 'Identifique os 20% de esforço que geram 80% dos resultados. Foque no que realmente importa.',
    benefits: ['Maximiza resultados', 'Economiza tempo', 'Estratégia inteligente'],
    color: 'border-indigo-500',
    bg: 'bg-indigo-500/10',
  },
];

const Techniques = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Técnicas de Produtividade</h1>
        <p className="text-gray-400 mt-2">
          Conheça métodos comprovados para melhorar sua gestão de tempo e foco.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {techniquesData.map((tech) => (
          <div
            key={tech.id}
            className={`bg-gray-800 border-l-4 ${tech.color} rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300`}
          >
            <div className={`p-6 ${tech.bg}`}>
              <div className="flex items-center gap-4 mb-3">
                {tech.icon}
                <h3 className="text-xl font-semibold text-white">{tech.title}</h3>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                {tech.description}
              </p>
              <div className="space-y-1">
                {tech.benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-gray-400 text-sm">
                    <FaArrowRight className="text-blue-400 text-xs" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Techniques;