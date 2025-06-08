import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { createTask } from '../services/taskService';


export default function CreateTaskPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [expected, setExpected] = useState(0);
  const [error, setError] = useState<string | null>(null);

  if (!projectId) {
    return <p className="text-danger text-center mt-5">Project ID missing 🤔</p>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTask(projectId, {
        name,
        description,
        expectedEarnings: expected? expected : 0,
      });
      navigate(`/projects/${projectId}`);
    } catch {
      setError(t('create_task_error'));
    }
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4">🆕 {t('create_task')}</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit} className="border rounded-4 p-4 shadow-sm bg-white">
        {/* Name */}
        <div className="mb-3">
          <label className="form-label fw-bold">📝 {t('name')}</label>
          <input
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder={t('task_name_placeholder') || 'Design landing page'}
          />
        </div>

        {/* Description */}
        <div className="mb-3">
          <label className="form-label fw-bold">📄 {t('description')}</label>
          <textarea
            className="form-control"
            style={{ minHeight: '120px' }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('task_description_placeholder') || 'All details, acceptance criteria, links…'}
          />
        </div>

        {/* Expected earnings */}
        <div className="mb-4">
          <label className="form-label fw-bold">💰 {t('expected_earnings')}</label>
          <input
            type="number"
            min="0"
            step="0.01"
            className="form-control"
            value={expected}
            onChange={(e) => setExpected(Number(e.target.value))}
            onFocus={(e) => e.target.select()}
            required
          />
        </div>

        <button className="btn btn-success btn-lg w-100" type="submit">
          ✅ {t('create')}
        </button>
      </form>
    </div>
  );
}
