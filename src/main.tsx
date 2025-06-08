import React            from 'react';
import ReactDOM         from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import './i18n/i18n';

import RequireAuth        from './components/RequireAuth';
import AppLayout          from './components/AppLayout';

import LoginPage          from './pages/LoginPage';
import RegisterPage       from './pages/RegisterPage';
import HomePage           from './pages/HomePage';
import ProjectPage        from './pages/ProjectPage';
import CreateProjectPage  from './pages/CreateProjectPage';
import EditProjectPage    from './pages/EditProjectPage';
import CreateTaskPage     from './pages/CreateTaskPage';
import TaskPage           from './pages/TaskPage';
import ReportsPage        from './pages/ReportsPage';

const qc = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Routes>
          {/* ─── auth-free ─── */}
          <Route path="/login"    element={<LoginPage    />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* ─── защищённая «ракушка» с сайдбаром ─── */}
          <Route element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }>
            {/* главная (список проектов) */}
            <Route index element={<HomePage />} />

            {/* проекты и задачи */}
            <Route path="projects">
              <Route index           element={<HomePage />} />         {/* alias */}
              <Route path="create"   element={<CreateProjectPage />} />
              <Route path="edit/:id" element={<EditProjectPage   />} />
              <Route path=":id"      element={<ProjectPage      />} />
              <Route path=":projectId/tasks/create" element={<CreateTaskPage />} />
            </Route>

            {/* отдельная задача */}
            <Route path="tasks/:taskId" element={<TaskPage />} />

            {/* отчёты */}
            <Route path="reports" element={<ReportsPage />} />
          </Route>

          {/* fallback: 404 simple */}
          <Route path="*" element={<p className="text-center mt-5">🤔 404</p>} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
