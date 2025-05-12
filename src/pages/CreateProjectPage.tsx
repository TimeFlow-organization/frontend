import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { createProject } from '../services/projectService';

export default function CreateProjectPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [totalEarned, setTotalEarned] = useState(0);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProject({ name, description, totalEarned, totalTimeSpent });
      navigate('/');
    } catch {
      setError(t('create_project_error'));
    }
  };

  return (
    <div className="container mt-4">
      <h2>{t('create_project')}</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">{t('name')}</label>
          <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label className="form-label">{t('description')}</label>
          <textarea className="form-control" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="form-label">💰 {t('earned')}</label>
          <input type="number" className="form-control" value={totalEarned} onChange={(e) => setTotalEarned(Number(e.target.value))} required />
        </div>
        <div className="mb-3">
          <label className="form-label">🕒 {t('time_spent')} ({t('minutes')})</label>
          <input type="number" className="form-control" value={totalTimeSpent} onChange={(e) => setTotalTimeSpent(Number(e.target.value))} required />
        </div>
        <button type="submit" className="btn btn-primary">{t('create')}</button>
      </form>
    </div>
  );
}
