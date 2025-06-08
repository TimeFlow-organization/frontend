import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

/* ---------- тип ---------- */
export interface TaskCardTask {
  id: string;
  name: string;
  description?: string;
  totalTimeSpentMinutes: number;
  startTime?: string | null;
  timerRunning: boolean;
  actualEarnings: number;
  // expectedEarnings?: number;
}

interface Props {
  task: TaskCardTask;
  onStart:  (id: string) => void;
  onStop:   (id: string) => void;
  onDelete: (id: string) => void;
  onOpen:   (id: string) => void;
  onEdit?:  (id: string) => void;
}

export default function TaskCard({
  task, onStart, onStop, onDelete, onEdit, onOpen,
}: Props) {
  const { t } = useTranslation();
  const [elapsed, setElapsed] = useState(task.totalTimeSpentMinutes);

  /* ---------- live-timer ---------- */
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (task.timerRunning && task.startTime) {
      const startMs = new Date(task.startTime).getTime();
      interval = setInterval(() => {
        const diff = Math.floor((Date.now() - startMs) / 60000);
        setElapsed(task.totalTimeSpentMinutes + diff);
      }, 1000);
    } else {
      setElapsed(task.totalTimeSpentMinutes);
    }
    return () => clearInterval(interval);
  }, [task]);

  /* ---------- локальные хэндлеры, “гасят” всплытие ---------- */
  const handleStart  = (e: React.MouseEvent) => { e.stopPropagation(); onStart(task.id); };
  const handleStop   = (e: React.MouseEvent) => { e.stopPropagation(); onStop(task.id);  };
  const handleDelete = (e: React.MouseEvent) => { e.stopPropagation(); onDelete(task.id); };

  return (
    <div
      className="card shadow-sm position-relative"
      role="button"
      onClick={() => onOpen(task.id)}
    >
      {/* --- меню --- */}
      <div
        className="position-absolute top-0 end-0 p-2"
        onClick={e => e.stopPropagation()}
      >
        <div className="dropdown">
          <button
            className="btn btn-sm bg-transparent border-0"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            ⋮
          </button>
          <ul className="dropdown-menu">
            {onEdit && (
              <li>
                <button className="dropdown-item" onClick={() => onEdit(task.id)}>
                  ✏️ {t('edit')}
                </button>
              </li>
            )}
            <li>
              <button className="dropdown-item text-danger" onClick={handleDelete}>
                🗑️ {t('delete')}
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div className="card-body">
        <h5 className="card-title mb-1">📝 {task.name}</h5>

        {task.description && (
          <p className="card-text text-muted small mb-2">{task.description}</p>
        )}

        {/* --- заработок --- */}
        <p className="mb-1">
          💵 {t('actual_earnings')}:&nbsp;
          <strong>{task.actualEarnings.toFixed(2)}</strong>
        </p>
        {/* если нужен ожидаемый доход — раскомментируй
        <p className="mb-1">
          💰 {t('expected_earnings')}:&nbsp;
          <strong>{task.expectedEarnings?.toFixed(2)}</strong>
        </p> */}

        <p className="mb-3">
          ⏱ {t('time_spent')}:&nbsp;
          <strong>{elapsed} {t('minutes')}</strong>
        </p>

        {task.timerRunning ? (
          <button className="btn btn-danger w-100" onClick={handleStop}>
            ⏹ {t('stop_timer')}
          </button>
        ) : (
          <button className="btn btn-success w-100" onClick={handleStart}>
            ▶️ {t('start_timer')}
          </button>
        )}
      </div>
    </div>
  );
}
