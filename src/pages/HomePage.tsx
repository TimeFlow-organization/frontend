import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { getToken, logout } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { getAllProjects, deleteProject } from '../services/projectService';
import ProjectList from '../components/projectList';

interface Project {
  id: string;
  name: string;
  description: string;
  totalEarned: number;
  totalTimeSpent: number;
  createdAt: string;
}

export default function HomePage() {
  const { t } = useTranslation();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [sortKey, setSortKey] = useState<'name' | 'createdAt'>('createdAt');
  const navigate = useNavigate();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setError('No token found');
      return;
    }

    fetch('http://localhost:8080/api/test/hello', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.text();
      })
      .then(setMessage)
      .catch(() => setError('Authorization failed'));

    getAllProjects()
      .then(setProjects)
      .catch(() => setError(t('load_projects_error')));
  }, [t]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch {
      setError(t('delete_project_error'));
    }
  };

  const sortedProjects = [...projects].sort((a, b) => {
    if (sortKey === 'name') return a.name.localeCompare(b.name);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <LanguageSwitcher />
        <button onClick={handleLogout} className="btn btn-outline-danger">
          🔓 {t('logout')}
        </button>
      </div>

      <h1>{t('welcome')}</h1>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <label className="me-2">{t('sort_by')}</label>
          <select
            className="form-select d-inline-block w-auto"
            onChange={(e) => setSortKey(e.target.value as 'name' | 'createdAt')}
            value={sortKey}
          >
            <option value="createdAt">📅 {t('sort_by_date')}</option>
            <option value="name">🔤 {t('sort_by_name')}</option>
          </select>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/projects/create')}>
          ➕ {t('create_project')}
        </button>
      </div>

      {message && <div className="alert alert-success mt-4">{message}</div>}
      {error && <div className="alert alert-danger mt-4">{error}</div>}

      <ProjectList projects={sortedProjects} onDelete={handleDelete} />
    </div>
  );
}
