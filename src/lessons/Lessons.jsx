// src/lessons/Lessons.jsx
import React from 'react';
import { 
  FaPlayCircle, 
  FaFileAlt, 
  FaLightbulb, 
  FaClock,
  FaArrowRight
} from 'react-icons/fa';

const lessonsData = [
  {
    id: 1,
    type: 'video',
    icon: <FaPlayCircle className="text-4xl text-red-400" />,
    title: 'Como começar a usar o OrganizAI',
    description: 'Um guia rápido para novos usuários: configure seu perfil, entenda o dashboard e comece a gerenciar tarefas.',
    duration: '5 min',
    level: 'Iniciante',
    tags: ['Guia', 'Primeiros Passos'],
    bg: 'bg-red-500/10',
    border: 'border-red-500',
  },
  {
    id: 2,
    type: 'article',
    icon: <FaFileAlt className="text-4xl text-blue-400" />,
    title: 'Técnica Pomodoro: O guia definitivo',
    description: 'Aprenda a usar a técnica Pomodoro para aumentar seu foco e produtividade com dicas práticas.',
    duration: '10 min',
    level: 'Intermediário',
    tags: ['Foco', 'Produtividade'],
    bg: 'bg-blue-500/10',
    border: 'border-blue-500',
  },
  {
    id: 3,
    type: 'tip',
    icon: <FaLightbulb className="text-4xl text-yellow-400" />,
    title: '5 dicas para priorizar tarefas',
    description: 'Descubra como identificar o que realmente importa e eliminar o que não agrega valor ao seu dia.',
    duration: '8 min',
    level: 'Todos',
    tags: ['Priorização', 'Eficiência'],
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500',
  },
  {
    id: 4,
    type: 'video',
    icon: <FaPlayCircle className="text-4xl text-green-400" />,
    title: 'Como definir metas SMART',
    description: 'Metas específicas, mensuráveis, alcançáveis, relevantes e com prazo definido – o segredo do sucesso.',
    duration: '12 min',
    level: 'Intermediário',
    tags: ['Metas', 'Planejamento'],
    bg: 'bg-green-500/10',
    border: 'border-green-500',
  },
  {
    id: 5,
    type: 'article',
    icon: <FaFileAlt className="text-4xl text-purple-400" />,
    title: 'Matriz de Eisenhower na prática',
    description: 'Exemplos reais de como usar a matriz de Eisenhower para tomar decisões mais inteligentes.',
    duration: '7 min',
    level: 'Iniciante',
    tags: ['Decisões', 'Organização'],
    bg: 'bg-purple-500/10',
    border: 'border-purple-500',
  },
  {
    id: 6,
    type: 'tip',
    icon: <FaLightbulb className="text-4xl text-indigo-400" />,
    title: 'Como evitar a procrastinação',
    description: 'Estratégias comprovadas para vencer a procrastinação e manter o foco no que realmente importa.',
    duration: '6 min',
    level: 'Todos',
    tags: ['Motivação', 'Foco'],
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500',
  },
];

const Lessons = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Aulas e Conteúdos</h1>
        <p className="text-gray-400 mt-2">
          Aprenda técnicas e estratégias para melhorar sua produtividade diária.
        </p>
        <div className="flex gap-3 mt-4">
          <span className="px-3 py-1 bg-blue-600/20 text-blue-400 text-xs rounded-full flex items-center gap-1">
            <FaPlayCircle size={12} /> Vídeos
          </span>
          <span className="px-3 py-1 bg-green-600/20 text-green-400 text-xs rounded-full flex items-center gap-1">
            <FaFileAlt size={12} /> Artigos
          </span>
          <span className="px-3 py-1 bg-yellow-600/20 text-yellow-400 text-xs rounded-full flex items-center gap-1">
            <FaLightbulb size={12} /> Dicas
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lessonsData.map((lesson) => (
          <div
            key={lesson.id}
            className={`bg-gray-800 border-l-4 ${lesson.border} rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1`}
          >
            <div className={`p-6 ${lesson.bg}`}>
              <div className="flex items-center gap-4 mb-3">
                {lesson.icon}
                <div>
                  <span className="text-xs text-gray-400 uppercase tracking-wider">
                    {lesson.type === 'video' && '🎬 Vídeo'}
                    {lesson.type === 'article' && '📄 Artigo'}
                    {lesson.type === 'tip' && '💡 Dica'}
                  </span>
                  <h3 className="text-lg font-semibold text-white">{lesson.title}</h3>
                </div>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                {lesson.description}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <FaClock size={12} /> {lesson.duration}
                  </span>
                  <span className="px-2 py-0.5 bg-gray-700 rounded-full">
                    {lesson.level}
                  </span>
                </div>
                <button className="text-blue-400 hover:text-blue-300 transition-colors text-sm flex items-center gap-1">
                  Acessar <FaArrowRight size={12} />
                </button>
              </div>
              <div className="flex gap-2 mt-3 flex-wrap">
                {lesson.tags.map((tag, idx) => (
                  <span key={idx} className="text-xs text-gray-500 bg-gray-700 px-2 py-0.5 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-gray-400 text-sm">
          📚 Novos conteúdos adicionados semanalmente. Fique de olho!
        </p>
      </div>
    </div>
  );
};

export default Lessons;