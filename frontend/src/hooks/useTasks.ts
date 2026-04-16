import { useState, useCallback } from 'react';
import type { Task, CreateTaskRequest, UpdateTaskRequest, TasksResponse, TaskStatus } from '@/types';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async (projectId: string, filters?: { status?: TaskStatus; assignee?: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.set('status', filters.status);
      if (filters?.assignee) params.set('assignee', filters.assignee);
      const query = params.toString() ? `?${params.toString()}` : '';
      const response = await apiGet<TasksResponse>(`/projects/${projectId}/tasks${query}`);
      setTasks(response.tasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createTask = useCallback(async (projectId: string, data: CreateTaskRequest) => {
    const task = await apiPost<Task>(`/projects/${projectId}/tasks`, data);
    setTasks((prev) => [...prev, task]);
    return task;
  }, []);

  const updateTask = useCallback(async (id: string, data: UpdateTaskRequest) => {
    // Optimistic UI: immediately update local state
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, ...data, updated_at: new Date().toISOString() }
          : t,
      ),
    );

    try {
      const updated = await apiPatch<Task>(`/tasks/${id}`, data);
      // Confirm with server response
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      return updated;
    } catch (err) {
      // Revert on error — refetch from MSW (which still has the old data)
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, ...revertOptimistic(data, t) } : t,
        ),
      );
      throw err;
    }
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    await apiDelete(`/tasks/${id}`);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return {
    tasks,
    isLoading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  };
}

/**
 * Build a revert object that undoes the optimistic update fields.
 */
function revertOptimistic(update: UpdateTaskRequest, current: Task): Partial<Task> {
  const revert: Partial<Task> = {};
  if (update.status !== undefined) revert.status = current.status;
  if (update.priority !== undefined) revert.priority = current.priority;
  if (update.title !== undefined) revert.title = current.title;
  if (update.description !== undefined) revert.description = current.description;
  if (update.assignee_id !== undefined) revert.assignee_id = current.assignee_id;
  if (update.due_date !== undefined) revert.due_date = current.due_date;
  revert.updated_at = current.updated_at;
  return revert;
}
