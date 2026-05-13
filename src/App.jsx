import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "./auth/Login";
import Register from "./auth/Register";
import RequireAuth from "./auth/RequireAuth";
import QuestionnaireWizard from "./diagnosis/QuestionnaireWizard";
import DashboardLayout from "./dashboard/DashboardLayout";
import TaskList from "./tasks/TaskList";
import ProgressCharts from "./dashboard/ProgressCharts";
import AIAssistantChat from "./ai/AIAssistantChat";

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1f2937",
            color: "#f3f4f6",
            border: "1px solid #374151",
          },
        }}
      />
      <Routes>
        {/* Rotas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rotas protegidas */}
        <Route
          path="/diagnosis"
          element={
            <RequireAuth>
              <QuestionnaireWizard />
            </RequireAuth>
          }
        />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <DashboardLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="tasks" replace />} />
          <Route path="tasks" element={<TaskList />} />
          <Route path="progress" element={<ProgressCharts />} />
          <Route path="assistant" element={<AIAssistantChat />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
