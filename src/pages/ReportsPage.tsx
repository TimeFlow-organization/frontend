// src/pages/ReportsPage.tsx
import { useEffect, useState } from 'react';
import { useTranslation }      from 'react-i18next';
import { useQuery }            from '@tanstack/react-query';
import { useNavigate }         from 'react-router-dom';

import { getAllProjects }      from '../services/projectService';
import {
  getProjectStats,
  mapByDayForChart,
  mapByTaskForChart,
  type StatsByDay,
  type StatsByTask
} from '../services/statsService';

import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';

/* ↓ минимальный тип для выпадашки проектов */
interface Project { id: string; name: string; }

export default function ReportsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  /* ---------- выбор проекта ---------- */
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ['projects', 'all'],
    queryFn : getAllProjects
  });

  /* ---------- период ---------- */
  const today    = new Date().toISOString().slice(0, 10);
  const firstDay = new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10);

  const [from, setFrom] = useState(firstDay);
  const [to,   setTo]   = useState(today);

  /* ---------- статистика ---------- */
  const statsQuery = useQuery({
    queryKey : ['stats', selectedId, from, to],
    enabled  : Boolean(selectedId),
    queryFn  : () => getProjectStats(selectedId!, { from, to })
  });

  /* ---------- первый проект по-умолчанию ---------- */
  useEffect(() => {
    if (!selectedId && projects.length) setSelectedId(projects[0].id);
  }, [projects, selectedId]);

  /* ---------- рендер ---------- */
  return (
    <div className="container mt-4">
      {/* ───── шапка ───── */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>{t('reports.title', 'Project reports')}</h1>
        <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
          ← {t('back', 'Back')}
        </button>
      </div>

      {/* ───── фильтры ───── */}
      <div className="row gy-2 align-items-end mb-4">
        {/* 📂 проект */}
        <div className="col-auto">
          <label className="form-label fw-semibold">📂 {t('reports.choose_project', 'Project')}:</label>
          <select
            className="form-select"
            value={selectedId ?? ''}
            onChange={e => setSelectedId(e.target.value)}
          >
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        {/* 📅 from */}
        <div className="col-auto">
          <label className="form-label fw-semibold">📅 {t('from', 'From')}:</label>
          <input
            type="date"
            className="form-control"
            value={from}
            max={to}
            onChange={e => setFrom(e.target.value)}
          />
        </div>

        {/* 📅 to */}
        <div className="col-auto">
          <label className="form-label fw-semibold">📅 {t('to', 'To')}:</label>
          <input
            type="date"
            className="form-control"
            value={to}
            min={from}
            max={today}
            onChange={e => setTo(e.target.value)}
          />
        </div>
      </div>

      {/* ───── индикаторы ───── */}
      {statsQuery.isLoading && <p>{t('loading', 'Loading')}…</p>}
      {statsQuery.error && (
        <div className="alert alert-danger">
          {t('reports.load_error', 'Failed to load statistics')}
        </div>
      )}

      {/* ───── графики ───── */}
      {statsQuery.data && (
        <>
          {/* ⏱ Time by day */}
          <Card title={`⏱ ${t('reports.time_by_day', 'Time spent per day')}`}>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart
                data={mapByDayForChart(statsQuery.data.byDay as StatsByDay[])}
                margin={{ top: 5, right: 30, left: 0, bottom: 45 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  interval={0}
                  angle={-35}
                  textAnchor="end"
                  tickFormatter={(d) => d.slice(5)}
                  height={60}
                />
                <YAxis tickFormatter={(v) => `${v} min`} />
                <Tooltip
                  labelFormatter={(d) => `🗓 ${d}`}
                  formatter={(v) => [`${v} ${t('minutes','min')}`, `${t('minutes','Minutes')}`]}
                />
                <Legend formatter={() => `⏱ ${t('minutes', 'Minutes')}`} />
                <Line type="monotone" dataKey="minutes" stroke="#3b82f6" strokeWidth={2} dot={false}/>
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* 💰 Earnings by day */}
          <Card title={`💰 ${t('reports.earnings_by_day', 'Earnings per day')}`}>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart
                data={mapByDayForChart(statsQuery.data.byDay)}
                margin={{ top: 5, right: 30, left: 0, bottom: 45 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  interval={0}
                  angle={-35}
                  textAnchor="end"
                  tickFormatter={(d) => d.slice(5)}
                  height={60}
                />
                <YAxis tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  labelFormatter={(d) => `🗓 ${d}`}
                  formatter={(v) => [`$${v}`, `${t('earnings','Earnings')}`]}
                />
                <Legend formatter={() => `💰 ${t('earnings', 'Earnings')}`} />
                <Line type="monotone" dataKey="earnings" stroke="#10b981" strokeWidth={2} dot={false}/>
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* 📊 By task */}
          <Card title={`📊 ${t('reports.by_task', 'Work-load & earnings per task')}`}>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={mapByTaskForChart(statsQuery.data.byTask as StatsByTask[])}
                margin={{ top: 5, right: 30, left: 0, bottom: 55 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  interval={0}
                  angle={-35}
                  textAnchor="end"
                  height={80}
                />
                <YAxis yAxisId="left"  tickFormatter={(v) => `${v} min`} />
                <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  formatter={(value: number, key: string) =>
                    key === 'minutes'
                      ? [`${value} ${t('minutes','min')}`, `⏱ ${t('minutes','Minutes')}`]
                      : [`$${value}`, `💰 ${t('earnings','Earnings')}`]
                  }
                />
                <Legend
                  payload={[
                    { value: `⏱ ${t('minutes','Minutes')}`, type: 'square', color: '#3b82f6', id:'min' },
                    { value: `💰 ${t('earnings','Earnings')}`, type: 'square', color: '#10b981', id:'earn' }
                  ]}
                />
                <Bar yAxisId="left"  dataKey="minutes"  fill="#3b82f6" barSize={22}/>
                <Bar yAxisId="right" dataKey="earnings" fill="#10b981" barSize={22}/>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </>
      )}
    </div>
  );
}

/* ───────── helper карточка ───────── */
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card shadow-sm rounded-4 mb-4">
      <div className="card-header bg-white border-0 fw-semibold">{title}</div>
      <div className="card-body">{children}</div>
    </div>
  );
}
