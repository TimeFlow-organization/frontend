const API_URL = `${import.meta.env.VITE_API_URL}/projects`;

import { getToken } from './authService';

/* ---------- DTO, которые приходят из бэка ---------- */



export interface StatsTotal {
  id: string;
  minutes: number | null;
  earnings: number | null;
}

export interface StatsByTask {
  id: string;
  name?: string;
  minutes: number | null;
  earnings: number | null;
}

export interface StatsByDay {
  day: string;           // "2025-05-28"
  minutes: number | null;
  earnings: number | null;
}

export interface WorkLogEntry {
  taskId: string;
  type: 'TIME' | 'EARNINGS' | 'FIELD_CHANGE';
  minutes: number | null;
  earnings: number | null;
  field: string | null;
  oldValue: string | null;
  newValue: string | null;
  loggedAt: string;      // "2025-05-28T18:10:05.954326"
}

export interface ProjectStats {
  total: StatsTotal;
  byTask: StatsByTask[];
  byDay: StatsByDay[];
  timeline: WorkLogEntry[];
}

/* ---------- API-запрос ---------- */
/** Получить статистику проекта.
 *  @param projectId – UUID проекта
 *  @param period    – { from?: Date | string, to?: Date | string }
 */
export async function getProjectStats(
  projectId: string,
  period?: { from?: Date | string; to?: Date | string }
): Promise<ProjectStats> {
  const token = getToken();

  const params = new URLSearchParams();
  if (period?.from) params.append('from', toIso(period.from, 'start'));
  if (period?.to)   params.append('to',   toIso(period.to  , 'end'));

  const res = await fetch(
    `${API_URL}/${projectId}/stats${params.toString() ? `?${params}` : ''}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) throw new Error('Failed to fetch project stats');
  return res.json();
}

function toIso(value: Date | string, bound: 'start' | 'end'): string {
  if (typeof value === 'string') {
    return `${value}T${bound === 'start' ? '00:00:00' : '23:59:59'}`;
  }
  const d = new Date(value);
  bound === 'start'
    ? d.setHours(0, 0, 0, 0)
    : d.setHours(23, 59, 59, 999);

  return d.toISOString().replace(/\.\d{3}Z$/, '');
}

/* ---------- Мапперы «ответ → данные для графиков» ---------- */

/** [{date:'2025-05-28', earnings:12, minutes:2}, …] */
export function mapByDayForChart(byDay: StatsByDay[]) {
  return byDay.map(d => ({
    date: d.day,
    earnings: Number(d.earnings ?? 0),
    minutes:  Number(d.minutes  ?? 0)
  }));
}

/** Данные по задачам (столбчатая диаграмма) */
export function mapByTaskForChart(byTask: StatsByTask[]) {
  return byTask.map(t => ({
    name   : t.name ?? t.id,
    earnings: Number(t.earnings ?? 0),
    minutes:  Number(t.minutes  ?? 0)
  }));
}