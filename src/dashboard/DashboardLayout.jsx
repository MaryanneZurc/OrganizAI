import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../utils/supabaseClient";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { 
  LogOut, 
  User, 
  CheckSquare, 
  TrendingUp, 
  Bot,
  BookOpen // 👈 Ícone para Técnicas
} from "lucide-react";

import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/Sidebar';
import TaskList from '../tasks/TaskList';
import ProgressCharts from './ProgressCharts';
import AIAssistantChat from '../ai/AIAssistantChat';

/**
 * DashboardLayout - Página principal após login
 * Gerencia as abas e organiza o layout
 */
export default function DashboardLayout() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('tasks'); // tasks, progress, ai

  // Renderiza o componente correto baseado na aba ativa
  const renderContent = () => {
    switch (activeTab) {
      case 'tasks':
        return <TaskList />;
      case 'progress':
        return <ProgressCharts />;
      case 'ai':
        return <AIAssistantChat />;
      default:
        return <TaskList />;
    }
  };

  const tabs = [
    { path: "/dashboard/tasks", label: "Tarefas", icon: CheckSquare },
    { path: "/dashboard/progress", label: "Progresso", icon: TrendingUp },
    { path: "/dashboard/assistant", label: "IA Assistente", icon: Bot },
    { path: "/dashboard/techniques", label: "Técnicas", icon: BookOpen }, // 👈 NOVA ABA
  ];

  return (
    <div className="flex min-h-screen bg-gray-900">
      {/* Sidebar fixa */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Área principal com scroll */}
      <main className="flex-1 overflow-y-auto">
        {/* Header com boas-vindas */}
        <div className="bg-gray-800 border-b border-gray-700 p-6">
          <h1 className="text-2xl font-bold text-white">
            Olá, {user?.user_metadata?.full_name || 'Usuário'}! 👋
          </h1>
          <p className="text-gray-400 mt-1">
            Aqui está sua visão geral de hoje
          </p>
        </div>

        {/* Conteúdo dinâmico */}
        <div className="p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}