import type { User, Project, Task } from '@/types';

// Seed data for mock API only — NOT a real database.
// In production, passwords would be bcrypt-hashed server-side.

const STORAGE_KEYS = {
  users: 'taskflow_mock_users',
  projects: 'taskflow_mock_projects',
  tasks: 'taskflow_mock_tasks',
} as const;

function loadFromStorage<T>(key: string, fallback: T[]): T[] {
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      return JSON.parse(stored) as T[];
    } catch {
      return fallback;
    }
  }
  return fallback;
}

function saveToStorage<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// --- Default seed data ---

const defaultUsers: (User & { password: string })[] = [
  {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    created_at: '2026-04-01T10:00:00Z',
  },
];

const defaultProjects: Project[] = [
  {
    id: 'project-1',
    name: 'Website Redesign',
    description: 'Q2 project — refresh the company homepage and marketing pages',
    owner_id: 'user-1',
    created_at: '2026-04-01T10:00:00Z',
  },
  {
    id: 'project-2',
    name: 'Mobile App',
    description: 'Build a cross-platform mobile app for TaskFlow',
    owner_id: 'user-1',
    created_at: '2026-04-05T14:30:00Z',
  },
];

const defaultTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Design homepage mockup',
    description: 'Create high-fidelity mockups for the new homepage layout',
    status: 'done',
    priority: 'high',
    project_id: 'project-1',
    assignee_id: 'user-1',
    due_date: '2026-04-10',
    created_at: '2026-04-01T10:00:00Z',
    updated_at: '2026-04-08T16:00:00Z',
  },
  {
    id: 'task-2',
    title: 'Implement responsive header',
    description: 'Build the navbar component with mobile hamburger menu',
    status: 'in_progress',
    priority: 'high',
    project_id: 'project-1',
    assignee_id: 'user-1',
    due_date: '2026-04-15',
    created_at: '2026-04-02T09:00:00Z',
    updated_at: '2026-04-10T11:30:00Z',
  },
  {
    id: 'task-3',
    title: 'Set up CI/CD pipeline',
    description: null,
    status: 'todo',
    priority: 'medium',
    project_id: 'project-1',
    assignee_id: null,
    due_date: '2026-04-20',
    created_at: '2026-04-03T12:00:00Z',
    updated_at: '2026-04-03T12:00:00Z',
  },
  {
    id: 'task-4',
    title: 'Research React Native vs Flutter',
    description: 'Compare frameworks and recommend one for the mobile app',
    status: 'in_progress',
    priority: 'high',
    project_id: 'project-2',
    assignee_id: 'user-1',
    due_date: '2026-04-12',
    created_at: '2026-04-05T14:30:00Z',
    updated_at: '2026-04-09T10:00:00Z',
  },
  {
    id: 'task-5',
    title: 'Create wireframes',
    description: 'Design initial wireframes for core screens',
    status: 'todo',
    priority: 'medium',
    project_id: 'project-2',
    assignee_id: null,
    due_date: null,
    created_at: '2026-04-06T09:00:00Z',
    updated_at: '2026-04-06T09:00:00Z',
  },
];

// --- Exported getters and setters with localStorage sync ---

export function getUsers(): (User & { password: string })[] {
  return loadFromStorage(STORAGE_KEYS.users, defaultUsers);
}

export function getProjects(): Project[] {
  return loadFromStorage(STORAGE_KEYS.projects, defaultProjects);
}

export function getTasks(): Task[] {
  return loadFromStorage(STORAGE_KEYS.tasks, defaultTasks);
}

export function saveUsers(users: (User & { password: string })[]): void {
  saveToStorage(STORAGE_KEYS.users, users);
}

export function saveProjects(projects: Project[]): void {
  saveToStorage(STORAGE_KEYS.projects, projects);
}

export function saveTasks(tasks: Task[]): void {
  saveToStorage(STORAGE_KEYS.tasks, tasks);
}
