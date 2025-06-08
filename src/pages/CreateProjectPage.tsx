import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { createProject } from '../services/projectService';
import { useMutation,
         useQueryClient }     from '@tanstack/react-query'; 

export default function CreateProjectPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const qc     = useQueryClient();  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  /* ——— мутація замість ручного fetch ——— */
  const createMut = useMutation({
    mutationFn : () => createProject({
      name,
      description,
      totalEarned    : 0,
      totalTimeSpent : 0,
    }),
    onSuccess : () => {
      /* оновлюємо кеш усіх запитів 'projects' */
      qc.invalidateQueries({ queryKey: ['projects'] });      // 🆕
      navigate('/');                                              // назад на Home
    },
    onError   : () => setError(t('create_project_error')),
  });

    const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMut.mutate();                                     // 🆕
  };

  return (
    <div className="container mt-4">
      <h2>{t('create_project')}</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">{t('name')}</label>
          <input
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">{t('description')}</label>
          <textarea
            className="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-primary">
          {t('create')}
        </button>
      </form>
    </div>
  );
}
