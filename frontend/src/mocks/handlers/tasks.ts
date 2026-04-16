import { http } from 'msw';
import { getTasks, saveTasks, getProjects } from '../data';
import { verifyAuth } from '../utils';
import type { Task, TaskStatus, TaskPriority } from '@/types';

const BASE_URL = 'http://localhost:4000';

interface CreateTaskBody {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  assignee_id?: string;
  due_date?: string;
}

interface UpdateTaskBody {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee_id?: string | null;
  due_date?: string | null;
}

export const taskHandlers = [
  // GET /projects/:id/tasks?status=&assignee=
  http.get(`${BASE_URL}/projects/:id/tasks`, ({ request, params }) => {
    const userId = verifyAuth(request);
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Verify project exists and belongs to user
    const project = getProjects().find((p) => p.id === params.id);
    if (!project) {
      return new Response(
        JSON.stringify({ error: 'not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } },
      );
    }
    if (project.owner_id !== userId) {
      return new Response(
        JSON.stringify({ error: 'forbidden' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Get tasks for this project
    let tasks = getTasks().filter((t) => t.project_id === params.id);

    // Apply filters from query params
    const url = new URL(request.url);
    const statusFilter = url.searchParams.get('status');
    const assigneeFilter = url.searchParams.get('assignee');

    if (statusFilter) {
      tasks = tasks.filter((t) => t.status === statusFilter);
    }
    if (assigneeFilter) {
      tasks = tasks.filter((t) => t.assignee_id === assigneeFilter);
    }

    return new Response(
      JSON.stringify({ tasks }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  }),

  // POST /projects/:id/tasks
  http.post(`${BASE_URL}/projects/:id/tasks`, async ({ request, params }) => {
    const userId = verifyAuth(request);
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Verify project exists and belongs to user
    const project = getProjects().find((p) => p.id === params.id);
    if (!project) {
      return new Response(
        JSON.stringify({ error: 'not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } },
      );
    }
    if (project.owner_id !== userId) {
      return new Response(
        JSON.stringify({ error: 'forbidden' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const body = (await request.json()) as CreateTaskBody;

    // Validation
    const fields: Record<string, string> = {};
    if (!body.title || body.title.trim().length === 0) {
      fields.title = 'is required';
    }
    if (!body.priority || !['low', 'medium', 'high'].includes(body.priority)) {
      fields.priority = 'must be low, medium, or high';
    }

    if (Object.keys(fields).length > 0) {
      return new Response(
        JSON.stringify({ error: 'validation failed', fields }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const now = new Date().toISOString();
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: body.title!.trim(),
      description: body.description?.trim() || null,
      status: 'todo',
      priority: body.priority!,
      project_id: params.id as string,
      assignee_id: body.assignee_id || null,
      due_date: body.due_date || null,
      created_at: now,
      updated_at: now,
    };

    const tasks = getTasks();
    tasks.push(newTask);
    saveTasks(tasks);

    return new Response(
      JSON.stringify(newTask),
      { status: 201, headers: { 'Content-Type': 'application/json' } },
    );
  }),

  // PATCH /tasks/:id
  http.patch(`${BASE_URL}/tasks/:id`, async ({ request, params }) => {
    const userId = verifyAuth(request);
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const tasks = getTasks();
    const index = tasks.findIndex((t) => t.id === params.id);

    if (index === -1) {
      return new Response(
        JSON.stringify({ error: 'not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Verify the task's project belongs to the user
    const project = getProjects().find((p) => p.id === tasks[index].project_id);
    if (!project || project.owner_id !== userId) {
      return new Response(
        JSON.stringify({ error: 'forbidden' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const body = (await request.json()) as UpdateTaskBody;

    tasks[index] = {
      ...tasks[index],
      ...(body.title !== undefined && { title: body.title.trim() }),
      ...(body.description !== undefined && { description: body.description?.trim() || null }),
      ...(body.status !== undefined && { status: body.status }),
      ...(body.priority !== undefined && { priority: body.priority }),
      ...(body.assignee_id !== undefined && { assignee_id: body.assignee_id }),
      ...(body.due_date !== undefined && { due_date: body.due_date }),
      updated_at: new Date().toISOString(),
    };

    saveTasks(tasks);

    return new Response(
      JSON.stringify(tasks[index]),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  }),

  // DELETE /tasks/:id
  http.delete(`${BASE_URL}/tasks/:id`, ({ request, params }) => {
    const userId = verifyAuth(request);
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const tasks = getTasks();
    const task = tasks.find((t) => t.id === params.id);

    if (!task) {
      return new Response(
        JSON.stringify({ error: 'not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Verify the task's project belongs to the user
    const project = getProjects().find((p) => p.id === task.project_id);
    if (!project || project.owner_id !== userId) {
      return new Response(
        JSON.stringify({ error: 'forbidden' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const updatedTasks = tasks.filter((t) => t.id !== params.id);
    saveTasks(updatedTasks);

    return new Response(null, { status: 204 });
  }),
];
