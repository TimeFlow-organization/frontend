import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getProjectById, updateProject } from '../services/projectService';

export default function EditProjectPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [totalEarned, setTotalEarned] = useState(0);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getProjectById(id)
      .then(data => {
        setName(data.name);
        setDescription(data.description);
        setTotalEarned(data.totalEarned);
        setTotalTimeSpent(data.totalTimeSpent);
      })
      .catch(() => setError(t('load_project_error')));
  }, [id, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await updateProject(id, { name, description, totalEarned, totalTimeSpent });
      navigate('/');
    } catch {
      setError(t('update_project_error'));
    }
  };

  return (
    <div className="container mt-4">
      <h2>{t('edit')} 📁</h2>
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
        <button type="submit" className="btn btn-success">{t('update')}</button>
      </form>
    </div>
  );
}
