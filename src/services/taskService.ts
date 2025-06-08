import { getToken } from './authService';

/** -------------------- Типы -------------------- */
export type TaskStatus = 'PLANNED' | 'IN_PROGRESS' | 'DONE';

export interface TaskPayload {
  name: string;
  description?: string;
  /** Ожидаемый заработок, задаётся при создании */
  expectedEarnings: number;
}

export interface Task extends TaskPayload {
  id: string;
  projectId: string;
  /** Фактический заработок, увеличивается кнопкой💸 */
  actualEarnings: number;
  totalTimeSpentMinutes: number;
  startTime?: string | null;
  timerRunning: boolean;
  status: TaskStatus;
  createdAt: string;
}

const API_URL = `${import.meta.env.VITE_API_URL}/tasks`;

function authHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

/** -------------------- CRUD -------------------- */
export async function getTasksByProject(projectId: string): Promise<Task[]> {
  const res = await fetch(`${API_URL}/project/${projectId}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch tasks');
  return res.json();
}

export async function createTask(projectId: string, payload: TaskPayload): Promise<Task> {
  const res = await fetch(`${API_URL}/project/${projectId}`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create task');
  return res.json();
}

export async function updateTask(
  id: string,
  payload: Partial<TaskPayload & { status: TaskStatus; actualEarnings: number }>,
): Promise<Task> {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to update task');
  return res.json();
}

export async function deleteTask(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete task');
}

/** -------------------- Таймер -------------------- */
export async function startTaskTimer(id: string): Promise<Task> {
  const res = await fetch(`${API_URL}/${id}/start`, {
    method: 'POST',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to start timer');
  return res.json();
}

export async function stopTaskTimer(id: string): Promise<Task> {
  const res = await fetch(`${API_URL}/${id}/stop`, {
    method: 'POST',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to stop timer');
  return res.json();
}

/** -------------------- Drag‑and‑Drop статус -------------------- */
export async function changeTaskStatus(id: string, status: TaskStatus): Promise<Task> {
  const res = await fetch(`${API_URL}/${id}/status?status=${status}`, {
    method: 'PATCH',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to change status');
  return res.json();
}

/** -------------------- Фактический заработок -------------------- */
export async function addActualEarnings(id: string, amount: number): Promise<Task> {
  const res = await fetch(`${API_URL}/${id}/earnings?amount=${amount}`, {
    method: 'POST',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to add earnings');
  return res.json();
}
/** Получить конкретную задачу */
export async function getTaskById(id: string): Promise<Task> {
  const res = await fetch(`${API_URL}/${id}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch task');
  return res.json();
}
