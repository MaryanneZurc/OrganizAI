import { LayoutDashboard, CheckSquare, TrendingUp, Bot, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

/**
 * Sidebar - Menu lateral fixo
 * @param {string} activeTab - Aba ativa ('tasks', 'progress', 'ai')
 * @param {function} onTabChange - Função para mudar de aba
 */
export default function Sidebar({ activeTab, onTabChange }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { id: 'tasks', label: 'Minhas Tarefas', icon: CheckSquare },
    { id: 'progress', label: 'Meu Progresso', icon: TrendingUp },
    { id: 'ai', label: 'Assistente IA', icon: Bot },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-gray-800 h-screen sticky top-0 flex flex-col shadow-lg">
      {/* Logo / Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="text-blue-500" size={28} />
          <h1 className="text-xl font-bold text-white">OrganizAI</h1>
        </div>
        <p className="text-xs text-gray-400 mt-1">Gerencie seu tempo com IA</p>
      </div>

      {/* Menu de Navegação */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                ${isActive 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }
              `}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer com Logout */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-all"
        >
          <LogOut size={20} />
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </aside>
  );
}