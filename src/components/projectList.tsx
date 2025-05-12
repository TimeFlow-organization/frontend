import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

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
}

export default function ProjectList({ projects, onDelete }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const truncate = (text: string | undefined, maxLength: number) => {
    if (!text) return t('no_description');
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  const handleEdit = (id: string) => navigate(`/projects/edit/${id}`);
  const handleView = (id: string) => navigate(`/projects/${id}`);

  return (
    <div className="row">
      {projects.map((project) => (
        <div key={project.id} className="col-md-6 col-lg-4 mb-4">
          <div className="card shadow-sm h-100 position-relative" role="button" onClick={() => handleView(project.id)}>
            <div className="position-absolute top-0 end-0 p-2" onClick={(e) => e.stopPropagation()}>
              <div className="dropdown">
                <button
                  className="btn btn-sm bg-transparent border-0"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  ⋮
                </button>
                <ul className="dropdown-menu">
                  <li>
                    <button className="dropdown-item" onClick={() => handleEdit(project.id)}>
                      ✏️ {t('edit')}
                    </button>
                  </li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={() => onDelete(project.id)}>
                      🗑️ {t('delete')}
                    </button>
                  </li>
                </ul>
              </div>
            </div>
            <div className="card-body">
              <h5 className="card-title">📁 {project.name}</h5>
              <p className="card-text text-muted">{truncate(project.description, 60)}</p>
              <p className="card-text">
                💰 <strong>{project.totalEarned.toFixed(2)}</strong> | 🕒{' '}
                <strong>{project.totalTimeSpent} {t('minutes')}</strong>
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}