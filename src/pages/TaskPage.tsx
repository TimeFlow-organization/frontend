import { useEffect, useState } from 'react';
import type { ChangeEvent }    from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation }      from 'react-i18next';
import {
  getTaskById,
  updateTask,
  deleteTask,
  startTaskTimer,
  stopTaskTimer,
  addActualEarnings,
  type Task,
  type TaskStatus,
} from '../services/taskService';

/* ---------- util ---------- */
const fmtTime = (m: number) => `${Math.floor(m / 60) ? Math.floor(m / 60) + 'h ' : ''}${m % 60}m`;

export default function TaskPage() {
  const { t }     = useTranslation();
  const navigate   = useNavigate();
  const { taskId } = useParams<{ taskId: string }>();

  /* ---------- state ---------- */
  const [task,      setTask]      = useState<Task | null>(null);
  const [earnInput, setEarnInput] = useState('');        // буфер «добавить сумму»
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  /* ---------- load ---------- */
  useEffect(() => {
    if (!taskId) return;
    getTaskById(taskId)
      .then(setTask)
      .catch(() => setError(t('load_task_error')));
  }, [taskId, t]);

  /* ---------- helpers ---------- */
  async function patch(payload: Partial<Task>) {
    if (!task) return;
    setSaving(true);
    try {
      setTask(await updateTask(task.id, payload));
    } catch {
      setError(t('update_task_error'));
    } finally {
      setSaving(false);
    }
  }
  const handleChange = <K extends keyof Task>(f: K, v: Task[K]) =>
    setTask(prev => (prev ? { ...prev, [f]: v } : prev));

  /* ---------- status & timer ---------- */
  const changeStatus = (s: TaskStatus) => {
    handleChange('status', s);
    patch({ status: s });
  };
  const toggleTimer = async () => {
    if (!task) return;
    setTask(task.timerRunning ? await stopTaskTimer(task.id)
                              : await startTaskTimer(task.id));
  };

  /* ---------- earnings ---------- */
  const handleAddEarnings = async () => {
    if (!task) return;
    const amount = Number(earnInput);
    if (Number.isNaN(amount) || amount <= 0) return;

    setSaving(true);
    try {
      setTask(await addActualEarnings(task.id, amount));
      setEarnInput('');
    } catch {
      setError(t('add_earnings_error'));
    } finally {
      setSaving(false);
    }
  };

  /* ---------- delete ---------- */
  const handleDelete = async () => {
    if (!task) return;
    if (!window.confirm(t('delete_confirm') ?? 'Delete?')) return;
    try {
      await deleteTask(task.id);
      navigate(-1);
    } catch {
      setError(t('delete_task_error'));
    }
  };

  /* ---------- UI ---------- */
  if (error)  return <div className="alert alert-danger mt-4">{error}</div>;
  if (!task)  return <p className="text-center mt-5">{t('loading')}…</p>;

  return (
    <div className="container py-4" style={{ maxWidth: 800 }}>
      {/* ───── header ───── */}
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
        <h1
          className="fw-bold flex-grow-1 display-6"
          contentEditable
          suppressContentEditableWarning
          onInput={e => handleChange('name', (e.currentTarget.textContent ?? '').trim())}
          onBlur={() => patch({ name: task.name })}
        >
          📝 {task.name || t('name')}
        </h1>

        <div className="btn-group">
          <button className="btn btn-outline-danger" onClick={handleDelete}>🗑️</button>
          <button
            className={`btn ${task.timerRunning ? 'btn-danger' : 'btn-success'}`}
            onClick={toggleTimer}
            disabled={saving}
          >
            {task.timerRunning ? `⏹️ ${t('stop_timer')}` : `▶️ ${t('start_timer')}`}
          </button>
        </div>
      </div>

      {/* ───── description ───── */}
      <div className="mb-4">
        <label className="form-label fw-bold">📄 {t('description')}</label>
        <textarea
          className="form-control"
          style={{ minHeight: 140 }}
          value={task.description ?? ''}
          placeholder={t('task_description_placeholder') ?? ''}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
            handleChange('description', e.target.value)}
          onBlur={() => patch({ description: task.description })}
        />
      </div>

      {/* ───── earnings ───── */}
      <div className="row g-3 mb-4 text-center">
        {/* expected */}
        <div className="col-md-6">
          <div className="border rounded-4 p-3 bg-light h-100">
            💰{' '}
            <input
              type="number"
              min="0"
              step="0.01"
              className="form-control d-inline-block w-auto text-center fw-bold"
              style={{ maxWidth: 140 }}
              value={task.expectedEarnings}
              onChange={e => handleChange('expectedEarnings', Number(e.target.value))}
              onFocus={e => e.target.select()}
              onBlur={() => patch({ expectedEarnings: task.expectedEarnings })}
            />
            <p className="mb-0 small text-muted">{t('expected_earnings')}</p>
          </div>
        </div>

        {/* actual (add-on) */}
        <div className="col-md-6">
          <div className="border rounded-4 p-3 bg-light h-100">
            💵{' '}
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder={task.actualEarnings.toFixed(2)}
              className="form-control d-inline-block w-auto text-center fw-bold"
              style={{ maxWidth: 140 }}
              value={earnInput}
              onChange={e => setEarnInput(e.target.value)}
              onFocus={e => e.target.select()}
            />
            <button
              className="btn btn-sm btn-outline-primary ms-2"
              onClick={handleAddEarnings}
              disabled={saving || !earnInput || Number(earnInput) <= 0}
            >
              ➕
            </button>

            <p className="mb-0 small text-muted">
              {t('actual_earnings')}:&nbsp;
              <span className="fw-bold">{task.actualEarnings.toFixed(2)}</span>
            </p>
          </div>
        </div>
      </div>

      {/* ───── status & time ───── */}
      <div className="row g-3 mb-5 text-center">
        <div className="col-md-6">
          <div className="p-3 border rounded-4 h-100">
            ⏱ <span className="fw-bold">{fmtTime(task.totalTimeSpentMinutes)}</span>
            <p className="mb-0 small text-muted">{t('time_spent')}</p>
          </div>
        </div>

        <div className="col-md-6">
          <div className="p-3 border rounded-4 h-100">
            <select
              className="form-select text-center fw-bold"
              value={task.status}
              onChange={e => changeStatus(e.target.value as TaskStatus)}
            >
              <option value="PLANNED">🗒 {t('planned')}</option>
              <option value="IN_PROGRESS">🚧 {t('in_progress')}</option>
              <option value="DONE">✅ {t('done')}</option>
            </select>
            <p className="mb-0 small text-muted">{t('status')}</p>
          </div>
        </div>
      </div>

      {saving && <p className="text-center text-muted">{t('saving')}…</p>}
    </div>
  );
}
