import { useTranslation } from 'react-i18next';
import { useNavigate }     from 'react-router-dom';

/* ─── типи ─── */
interface Project {
  id: string;
  name: string;
  description?: string;
  totalEarned: number;
  totalTimeSpent: number;
}

interface Props {
  projects: Project[];
  onDelete: (id: string) => void;
  cardClass?: string;            // 🆕 <— власний клас для карток
}

export default function ProjectList({ projects, onDelete, cardClass }: Props) {
  const { t }      = useTranslation();
  const navigate   = useNavigate();

  const truncate = (txt: string | undefined, max: number) =>
    !txt ? t('no_description') : txt.length > max ? txt.slice(0, max) + '…' : txt;

  const toEdit  = (id: string) => navigate(`/projects/edit/${id}`);
  const toView  = (id: string) => navigate(`/projects/${id}`);

  return (
    <div className="row">
      {projects.map(p => (
        <div key={p.id} className="col-md-6 col-lg-4 mb-4">
          {/* ——— картка ——— */}
          <div
            className={`card shadow-sm h-100 position-relative ${cardClass ?? ''}`}
            role="button"
            onClick={() => toView(p.id)}
          >
            {/* керування (⋮) */}
            <div
              className="position-absolute top-0 end-0 p-2"
              onClick={e => e.stopPropagation()}
            >
              <div className="dropdown">
                <button
                  className="btn btn-sm bg-transparent border-0"
                  data-bs-toggle="dropdown"
                >
                  ⋮
                </button>

                <ul className="dropdown-menu">
                  <li>
                    <button
                      className="dropdown-item"
                      onClick={() => toEdit(p.id)}
                    >
                      ✏️ {t('edit')}
                    </button>
                  </li>
                  <li>
                    <button
                      className="dropdown-item text-danger"
                      onClick={() => onDelete(p.id)}
                    >
                      🗑️ {t('delete')}
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            {/* контент картки */}
            <div className="card-body">
              <h5 className="card-title">📁 {p.name}</h5>
              <p className="card-text text-muted">
                {truncate(p.description, 60)}
              </p>

              <p className="card-text">
                💰 <strong>{p.totalEarned.toFixed(2)}</strong> &nbsp;|&nbsp; 🕒{' '}
                <strong>
                  {p.totalTimeSpent} {t('minutes')}
                </strong>
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
