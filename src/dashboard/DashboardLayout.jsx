import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../utils/supabaseClient";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { LogOut, User, CheckSquare, TrendingUp, Bot } from "lucide-react";

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()
      .then(({ data }) => setProfile(data));
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const tabs = [
    { path: "/dashboard/tasks", label: "Tarefas", icon: CheckSquare },
    { path: "/dashboard/progress", label: "Progresso", icon: TrendingUp },
    { path: "/dashboard/assistant", label: "IA Assistente", icon: Bot },
  ];

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-2xl font-bold text-white">OrganizAI</h1>
          {profile && (
            <div className="mt-3">
              <span className="text-sm text-gray-400">
                Olá, {profile.full_name}
              </span>
              <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-blue-600 text-white capitalize">
                {profile.diagnosis_level}
              </span>
            </div>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition ${
                  location.pathname === tab.path
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:bg-gray-700 hover:text-white"
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </Link>
            );
          })}
        </nav>

        {/* Metas rápidas */}
        {profile?.goals?.length > 0 && (
          <div className="p-4 border-t border-gray-700">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Metas
            </h3>
            <ul className="space-y-1">
              {profile.goals.slice(0, 3).map((goal, i) => (
                <li
                  key={i}
                  className="text-xs text-gray-400 flex items-start gap-2"
                >
                  <span className="text-blue-400 mt-0.5">•</span>
                  {goal}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Logout */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition w-full px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
