import { http } from 'msw';
import { getProjects, saveProjects, getTasks, saveTasks, getUsers } from '../data';
import { verifyAuth } from '../utils';
import type { Project, ProjectDetailResponse } from '@/types';

const BASE_URL = 'http://localhost:4000';

interface CreateProjectBody {
  name?: string;
  description?: string;
}

interface UpdateProjectBody {
  name?: string;
  description?: string;
}

export const projectHandlers = [
  // GET /projects
  http.get(`${BASE_URL}/projects`, ({ request }) => {
    const userId = verifyAuth(request);
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const projects = getProjects().filter((p) => p.owner_id === userId);
    return new Response(
      JSON.stringify({ projects }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  }),

  // POST /projects
  http.post(`${BASE_URL}/projects`, async ({ request }) => {
    const userId = verifyAuth(request);
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const body = (await request.json()) as CreateProjectBody;

    if (!body.name || body.name.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'validation failed', fields: { name: 'is required' } }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const newProject: Project = {
      id: `project-${Date.now()}`,
      name: body.name.trim(),
      description: body.description?.trim() || null,
      owner_id: userId,
      created_at: new Date().toISOString(),
    };

    const projects = getProjects();
    projects.push(newProject);
    saveProjects(projects);

    return new Response(
      JSON.stringify(newProject),
      { status: 201, headers: { 'Content-Type': 'application/json' } },
    );
  }),

  // GET /projects/:id
  http.get(`${BASE_URL}/projects/:id`, ({ request, params }) => {
    const userId = verifyAuth(request);
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } },
      );
    }

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

    const tasks = getTasks().filter((t) => t.project_id === project.id);
    const response: ProjectDetailResponse = { ...project, tasks };

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  }),

  // PATCH /projects/:id
  http.patch(`${BASE_URL}/projects/:id`, async ({ request, params }) => {
    const userId = verifyAuth(request);
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const projects = getProjects();
    const index = projects.findIndex((p) => p.id === params.id);

    if (index === -1) {
      return new Response(
        JSON.stringify({ error: 'not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } },
      );
    }

    if (projects[index].owner_id !== userId) {
      return new Response(
        JSON.stringify({ error: 'forbidden' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const body = (await request.json()) as UpdateProjectBody;

    if (body.name !== undefined) {
      projects[index] = { ...projects[index], name: body.name.trim() };
    }
    if (body.description !== undefined) {
      projects[index] = { ...projects[index], description: body.description.trim() || null };
    }

    saveProjects(projects);

    return new Response(
      JSON.stringify(projects[index]),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  }),

  // DELETE /projects/:id
  http.delete(`${BASE_URL}/projects/:id`, ({ request, params }) => {
    const userId = verifyAuth(request);
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const projects = getProjects();
    const project = projects.find((p) => p.id === params.id);

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

    // Remove project
    const updatedProjects = projects.filter((p) => p.id !== params.id);
    saveProjects(updatedProjects);

    // Remove all tasks belonging to this project
    const tasks = getTasks().filter((t) => t.project_id !== params.id);
    saveTasks(tasks);

    return new Response(null, { status: 204 });
  }),
];
