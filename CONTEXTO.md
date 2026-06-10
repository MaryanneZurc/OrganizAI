# 📚 CONTEXTO DO PROJETO - OrganizAI

> **Atualizado em:** 10/06/2026  
> **Scrum Master:** Mary  
> **Equipe:** Fabi (Dev), Gabriel (Dev)

---

## 🎯 Visão Geral

OrganizAI é um sistema web de **gestão de tempo e finanças** com inteligência artificial.  
Ajuda o usuário a organizar sua rotina usando diagnóstico de perfil, agenda cronometrada e assistente IA.

---

## 🛠️ Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 + Vite + JavaScript |
| Estilização | Tailwind CSS (tema escuro) |
| Backend/DB | Supabase (PostgreSQL + Auth + Realtime) |
| IA | Google Gemini (via Edge Function) |
| Gráficos | Recharts |
| Ícones | Lucide React |
| Notificações | React Hot Toast |
| Roteamento | React Router DOM v6 |

---

## 📁 Estrutura de Pastas
src/
├── ai/
│ └── AIAssistantChat.jsx # Chat com IA (Gemini)
├── auth/
│ ├── ForgotPassword.jsx # Recuperação de senha
│ ├── Login.jsx # Tela de login
│ ├── Register.jsx # Tela de cadastro
│ └── RequireAuth.jsx # Proteção de rotas
├── dashboard/
│ ├── DashboardLayout.jsx # Layout com sidebar
│ └── ProgressCharts.jsx # Gráficos de progresso
├── diagnosis/
│ └── QuestionnaireWizard.jsx # Questionário 4 etapas
├── hooks/
│ ├── useAuth.js # Autenticação (login/register/logout)
│ ├── useRealtime.js # Tempo real (Supabase)
│ └── useTimer.js # Cronômetro regressivo
├── tasks/
│ ├── TaskList.jsx # CRUD de tarefas + Eisenhower
│ └── TaskTimer.jsx # Cronômetro por tarefa
├── utils/
│ └── supabaseClient.js # Conexão com Supabase
├── App.jsx # Rotas principais
├── index.css # Estilos globais (Tailwind)
└── main.jsx # Ponto de entrada


---

## 🗄️ Banco de Dados (Supabase)

### Tabelas

```sql
-- Perfis dos usuários
profiles (
  id UUID PRIMARY KEY,
  full_name TEXT,
  age INT,
  occupation TEXT,
  diagnosis_level TEXT,  -- 'iniciante' | 'intermediário' | 'avancado'
  goals TEXT[],           -- Array de metas
  diagnosis_completed BOOLEAN
)

-- Tarefas com Matriz de Eisenhower
tasks (
  id BIGINT PRIMARY KEY,
  user_id UUID,
  title TEXT,
  description TEXT,
  duration_minutes INT,
  is_important BOOLEAN,
  is_urgent BOOLEAN,
  priority INT,           -- 1 a 4 (Eisenhower)
  status TEXT,            -- 'pendente'|'em_andamento'|'pausada'|'concluida'
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  elapsed_seconds INT     -- Para pausa/retomada do timer
)

-- Histórico de conversas com IA
ai_logs (
  id BIGINT PRIMARY KEY,
  user_id UUID,
  role TEXT,              -- 'user' | 'assistant'
  content TEXT,
  created_at TIMESTAMPTZ
)

-- Snapshots de progresso (gráficos)
progress_snapshots (
  id BIGINT PRIMARY KEY,
  user_id UUID,
  category TEXT,          -- 'tarefas_concluidas'|'taxa_conclusao'|'nivel_perfil'
  value REAL,
  recorded_at DATE
)

Segurança (RLS)
Todas as tabelas têm Row Level Security ativado.
Cada usuário só acessa seus próprios dados (auth.uid() = user_id).

Realtime
Tabelas tasks e ai_logs têm realtime habilitado.

🔐 Autenticação
Método: Supabase Auth (email + senha)

Hook: useAuth() fornece { user, loading, login, register, logout }

Proteção: Componente RequireAuth bloqueia rotas privadas

Trigger: Ao registrar, cria automaticamente um registro em profiles

🎨 Design System
Elemento	Classes Tailwind
Fundo principal	bg-gray-900
Cards/Containers	bg-gray-800 rounded-2xl shadow-2xl
Inputs	bg-gray-700 border-gray-600 focus:border-blue-500
Botão primário	bg-blue-600 hover:bg-blue-700
Botão sucesso	bg-green-600 hover:bg-green-700
Texto principal	text-white
Texto secundário	text-gray-400
Tema	Escuro (dark mode)
📊 Fluxo do Usuário
text
1. Cadastro (Register)
   └── Redireciona para Questionário

2. Questionário (4 etapas)
   ├── Dados Pessoais
   ├── Gestão do Tempo
   ├── Gestão Financeira
   └── Rotina e Hábitos
   └── Calcula nível (iniciante/intermediário/avancado)
   └── Gera metas automáticas
   └── Redireciona para Dashboard

3. Dashboard (3 abas)
   ├── 📋 Tarefas
   │   ├── Criar/editar/excluir tarefas
   │   ├── Classificar por prioridade (Eisenhower)
   │   └── Cronômetro por tarefa
   ├── 📊 Progresso
   │   └── Gráficos (Recharts)
   └── 🤖 IA Assistente
       └── Chat com Gemini
🌿 Estratégia de Branches
text
main (protegida - ninguém mexe direto)
└── develop (integração - PRs são mergeados aqui)
    ├── feature/mary/auth-supervision (já mergeado ✅)
    ├── feature/mary/forgot-password (em andamento 🚧)
    ├── feature/fabi/questionnaire (em andamento 🚧)
    └── feature/gabriel/dashboard-tasks (em andamento 🚧)
Fluxo Git Diário
bash
# Iniciar o dia
git checkout develop && git pull origin develop
git checkout minha-branch && git merge develop

# Trabalhar...
git add . && git commit -m "tipo: descrição"

# Enviar
git push origin minha-branch
Tipos de Commit
feat: Nova funcionalidade

fix: Correção de bug

style: CSS/formatação

docs: Documentação

refactor: Melhoria de código

🤖 Integração com IA (Gemini)
Arquitetura
text
Usuário → AIAssistantChat.jsx → supabase.functions.invoke('call-gemini')
                                       ↓
                               Edge Function (Deno)
                                       ↓
                              API Gemini (gemini-1.5-flash)
                                       ↓
                              Resposta salva em ai_logs
                                       ↓
                              Realtime notifica frontend
Arquivos Relacionados
src/ai/AIAssistantChat.jsx - Interface do chat

supabase/functions/call-gemini/index.ts - Edge Function

Status
✅ Código criado

⚠️ Deploy pendente (requer PC sem restrições de API)

📋 Status Atual do Projeto
Funcionalidade	Status	Responsável	Branch
Setup do projeto	✅ Concluído	Mary	-
Banco de dados	✅ Concluído	Mary	-
Login/Register	✅ Concluído	Mary	auth-supervision (merged)
Proteção de rotas	✅ Concluído	Mary	auth-supervision (merged)
Recuperação senha	🚧 Em andamento	Mary	forgot-password
Questionário	🚧 Em andamento	Fabi	questionnaire
Dashboard layout	🚧 Em andamento	Gabriel	dashboard-tasks
Lista de tarefas	🚧 Em andamento	Gabriel	dashboard-tasks
Timer de tarefas	📋 To Do	Gabriel	dashboard-tasks
Gráficos progresso	📋 To Do	Fabi	charts (futuro)
Chat IA	⚠️ Pendente deploy	Mary	gemini-integration (futuro)
🔗 Links Importantes
GitHub: https://github.com/MaryanneZurc/OrganizAI

Trello: [link do quadro]

Supabase: [link do projeto]

DeepSeek (IA assistente): chat.deepseek.com