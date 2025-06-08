import { useState }                     from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation }               from 'react-i18next';
import { useQuery }                     from '@tanstack/react-query';

import { logout }           from '../services/authService';
import { getAllProjects }   from '../services/projectService';
import LanguageSwitcher     from './LanguageSwitcher';

/* ширина панели на десктопе */
const SIDE_W = 240;

export default function AppLayout() {
  const { t }  = useTranslation();
  const nav    = useNavigate();

  /* открыта ли панель? – для мобилок */
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen(v => !v);
  const close  = () => setOpen(false);

  /* тип проекта */
  type Project = {
    id: string;
    name: string;
    // добавьте другие поля, если они есть в объекте проекта
  };

  /* проекты для списка внизу */
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: getAllProjects,
  });

  /* logout */
  const handleLogout = async () => {
    await logout();
    nav('/login');
  };

  /* ───────────── UI ───────────── */
  return (
    <>
      {/* ——— гамбургер (виден только < md) ——— */}
      <button
        className="btn btn-light position-fixed top-0 start-0 m-2  shadow-sm"
        style={{ zIndex: 1040 }}
        onClick={toggle}
      >
        ☰
      </button>

      {/* ——— полупрозрачный фон при открытой панели (mobile) ——— */}
      {open && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-25"
          style={{ zIndex: 1035 }}
          onClick={close}
        />
      )}

      {/* ——— сам сайдбар ——— */}
      <aside
        className="position-fixed top-0 bottom-0 bg-light border-end d-flex flex-column p-3"
        style={{
          width: SIDE_W,
          zIndex: 1040,
          /* выезжает только на xs-sm; на md+ всегда открыт */
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform .3s',
        }}
      >
        {/* верх: logout + language */}
        <div className="d-flex flex-column gap-2 mb-4">
          <button className="btn btn-outline-danger w-100" onClick={handleLogout}>
            🔓 {t('logout')}
          </button>
          <LanguageSwitcher className="w-100" />
        </div>

        {/* навигация */}
        <nav className="nav nav-pills flex-column gap-2 mb-3">
          <SideLink to="/"        label={t('home')}          emoji="🏠" end onClick={close} />
          <SideLink to="/reports" label={t('reports.title')} emoji="📈"      onClick={close} />
        </nav>

        <hr />

        {/* список проектов пользователя */}
        <p className="text-muted small mb-2">📂 {t('projects')}</p>
        <div className="flex-grow-1 overflow-auto">
          <nav className="nav flex-column small">
            {projects.map(p => (
              <SideLink
                key={p.id}
                to={`/projects/${p.id}`}
                label={p.name}
                emoji="📂"
                onClick={close}
              />
            ))}
          </nav>
        </div>

        {/* кнопка «закрыть» только на мобилках */}
        <button className="btn btn-light w-100 mt-3 d-md-none" onClick={close}>
          ✖︎ {t('close')}
        </button>
      </aside>

      {/* ——— основной контент ——— */}
      <main
        className="flex-grow-1"
        /* отступ слева для видимого сайдбара ≥ md */
        style={{ marginLeft: `clamp(0px, 100vw - 100%, ${SIDE_W}px)` }}
      >
        <Outlet />
      </main>
    </>
  );
}

/* ─────────── маленький помощник для ссылок ─────────── */
function SideLink({
  to,
  label,
  emoji,
  end = false,
  onClick,
}: {
  to: string;
  label: React.ReactNode;
  emoji: string;
  end?: boolean;
  onClick?: () => void;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `nav-link d-flex align-items-center gap-1 ${
          isActive ? 'active fw-semibold' : ''
        }`
      }
      onClick={onClick}
    >
      <span style={{ fontSize: '1.1em' }}>{emoji}</span>
      <span className="text-truncate">{label}</span>
    </NavLink>
  );
}