import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
  type DroppableProvided,
  type DraggableProvided,
} from '@hello-pangea/dnd';

import { getProjectById } from '../services/projectService';
import {
  getTasksByProject,
  startTaskTimer,
  stopTaskTimer,
  changeTaskStatus,
  deleteTask,
  type Task,
  type TaskStatus,
} from '../services/taskService';
import TaskCard from '../components/TaskCard';
import { useNavigate } from 'react-router-dom';


export default function ProjectPage() {
  const { t } = useTranslation();
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /* ---------- загрузка данных ---------- */
  useEffect(() => {
    if (!projectId) return;
    Promise.all([getProjectById(projectId), getTasksByProject(projectId)])
      .then(([proj, ts]) => {
        setProject(proj);
        setTasks(ts);
      })
      .catch(() => setError(t('load_project_error')))
      .finally(() => setLoading(false));
  }, [projectId, t]);

  /* ---------- группировка задач ---------- */
  const columns = useMemo(() => {
    return {
      PLANNED: tasks.filter((t) => t.status === 'PLANNED'),
      IN_PROGRESS: tasks.filter((t) => t.status === 'IN_PROGRESS'),
      DONE: tasks.filter((t) => t.status === 'DONE'),
    } as Record<TaskStatus, Task[]>;
  }, [tasks]);

  /* ---------- drag & drop ---------- */
  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination || source.droppableId === destination.droppableId) return;

    const newStatus = destination.droppableId as TaskStatus;
    setTasks((prev) => prev.map((task) => (task.id === draggableId ? { ...task, status: newStatus } : task)));
    try {
      await changeTaskStatus(draggableId, newStatus);
    } catch {
      setTasks((prev) => prev.map((t) => (t.id === draggableId ? { ...t, status: source.droppableId as TaskStatus } : t)));
      setError(t('update_project_error'));
    }
  };

  /* ---------- таймеры ---------- */
  const handleStart = async (taskId: string) => {
    try {
      const updated = await startTaskTimer(taskId);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    } catch {
      setError(t('start_timer_error'));
    }
  };

  const handleStop = async (taskId: string) => {
    try {
      const updated = await stopTaskTimer(taskId);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    } catch {
      setError(t('stop_timer_error'));
    }
  };

  /* ---------- удаление ---------- */
  const handleDelete = async (taskId: string) => {
    if (!window.confirm(t('delete_confirm') || 'Delete task?')) return;
    try {
      await deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch {
      setError(t('delete_task_error'));
    }
  };

  /* ---------- создание задачи ---------- */
const handleAddTask = () => {
  if (!projectId) return;
  navigate(`/projects/${projectId}/tasks/create`);
};




  if (loading) return <p className="text-center mt-5">{t('loading')}...</p>;
  if (error) return <div className="alert alert-danger mt-3">{error}</div>;
  if (!project) return null;

  return (
    <div className="container py-4">
      {/* ------ Header ------ */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div className="flex-grow-1">
          <h1 className="display-4 fw-bold mb-1">{project.name}</h1>
          {project.description && <p className="lead text-muted mb-0">{project.description}</p>}
        </div>
        <button className="btn btn-primary btn-lg" onClick={handleAddTask}>
          ➕ {t('add_task')}
        </button>
      </div>

      {/* ------ Stats ------ */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="p-3 border rounded-4 bg-light h-100 text-center">
            💰 <h4 className="fw-bold d-inline">{project.totalEarned?.toFixed(2) || 0}</h4>
            <p className="mb-0">{t('earned')}</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="p-3 border rounded-4 bg-light h-100 text-center">
            ⏱ <h4 className="fw-bold d-inline">{project.totalTimeSpent || 0}</h4>
            <p className="mb-0">{t('time_spent')} ({t('minutes')})</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="p-3 border rounded-4 bg-light h-100 text-center">
            📅 <h4 className="fw-bold d-inline">{new Date(project.createdAt).toLocaleDateString()}</h4>
            <p className="mb-0">{t('created')}</p>
          </div>
        </div>
      </div>

      {/* ------ Board ------ */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="row g-3">
          {(['PLANNED', 'IN_PROGRESS', 'DONE'] as TaskStatus[]).map((col) => (
            <div key={col} className="col-md-4">
              <div className="rounded-4 p-3 bg-white shadow-sm h-100">
                <h5 className="text-center mb-3">
                  {col === 'PLANNED' && '🗒 '}
                  {col === 'IN_PROGRESS' && '🚧 '}
                  {col === 'DONE' && '✅ '}
                  {t(col.toLowerCase())}
                </h5>
                <Droppable droppableId={col}>
                  {(provided: DroppableProvided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="d-flex flex-column gap-3">
                      {columns[col].map((task, index) => (
                        <Draggable draggableId={task.id} index={index} key={task.id}>
                          {(prov: DraggableProvided) => (
                            <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps}>
                              <TaskCard
                                task={{ ...task, startTime: task.startTime ?? undefined }}
                                onStart={handleStart}
                                onStop={handleStop}
                                onDelete={handleDelete}
                                onOpen={(id) => navigate(`/tasks/${id}`)}   // 🆕 переход
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
