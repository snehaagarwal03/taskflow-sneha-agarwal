import { useState, useCallback } from 'react';
import type { Project, CreateProjectRequest, UpdateProjectRequest, ProjectsResponse } from '@/types';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiGet<ProjectsResponse>('/projects');
      setProjects(response.projects);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createProject = useCallback(async (data: CreateProjectRequest) => {
    const project = await apiPost<Project>('/projects', data);
    setProjects((prev) => [...prev, project]);
    return project;
  }, []);

  const updateProject = useCallback(async (id: string, data: UpdateProjectRequest) => {
    const updated = await apiPatch<Project>(`/projects/${id}`, data);
    setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
    return updated;
  }, []);

  const deleteProject = useCallback(async (id: string) => {
    await apiDelete(`/projects/${id}`);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return {
    projects,
    isLoading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
  };
}
