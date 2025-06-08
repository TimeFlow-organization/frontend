import { useState }                         from 'react';
import { useNavigate }                      from 'react-router-dom';
import { useTranslation }                   from 'react-i18next';
import {
  useQuery,          // читання списку
  useMutation,       // видалення
  useQueryClient
} from '@tanstack/react-query';

import { getToken }                           from '../services/authService';
import {
  getAllProjects,
  deleteProject
} from '../services/projectService';

import ProjectList                            from '../components/projectList';

/* ——— тип Project ——— */
interface Project {
  id: string;
  name: string;
  description?: string;
  totalEarned: number;
  totalTimeSpent: number;
  createdAt: string;
}

/* ——————————————————————————————————————————————— */

export default function HomePage() {
  const { t }   = useTranslation();
  const nav     = useNavigate();
  const qc      = useQueryClient();

  /* локальне сортування / UI-стан */
  const [sortKey, setSortKey] =
    useState<'name' | 'createdAt'>('createdAt');

  /* ——— LOAD ——— */
  const {
    data: projects = [],
    isLoading,
    error: loadErr
  } = useQuery<Project[]>({
    queryKey : ['projects'],          // 🔑 єдиний кеш-ключ
    queryFn  : getAllProjects,
    enabled  : Boolean(getToken())    // якщо токена нема — запит не йде
  });

  /* ——— DELETE ——— */
  const delMut = useMutation({
    mutationFn : (id: string) => deleteProject(id),
    onSuccess  : () => qc.invalidateQueries({ queryKey: ['projects'] }),
    onError    : () => alert(t('delete_project_error'))
  });

  /* ——— відсортований масив для рендера ——— */
  const sorted = [...projects].sort((a, b) =>
    sortKey === 'name'
      ? a.name.localeCompare(b.name)
      : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  /* ——— UI ——— */
  return (
    <div className="container mt-4">

      <h1 className="fw-bold mb-4">{t('welcome')}</h1>

      {/* панель інструментів */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">

        {/* сортування */}
        <div className="d-flex align-items-center gap-2">
          <label className="fw-semibold">{t('sort_by')}:</label>

          <select
            className="form-select form-select-sm w-auto"
            value={sortKey}
            onChange={e => setSortKey(e.target.value as any)}
          >
            <option value="createdAt">📅 {t('sort_by_date')}</option>
            <option value="name">🔤 {t('sort_by_name')}</option>
          </select>
        </div>

        {/* «Новий проєкт» */}
        <button
          className="btn btn-primary"
          onClick={() => nav('/projects/create')}
        >
          ➕ {t('create_project')}
        </button>
      </div>

      {/* повідомлення про помилки / завантаження */}
      {loadErr   && <div className="alert alert-danger">{t('load_projects_error')}</div>}
      {isLoading && <p>{t('loading')}…</p>}

      {/* список проєктів */}
      {!isLoading && (
        <ProjectList
          projects={sorted}
          onDelete={id => delMut.mutate(id)}
        />
      )}
    </div>
  );
}