# TaskFlow — Implementation Plan (Frontend-Only Role)

> This document covers every requirement from `docs/project.md` that applies to the **Frontend-only** role, organized as a step-by-step implementation guide.

---

## Table of Contents

1. [Role Scope — What You Build](#1-role-scope--what-you-build)
2. [Prerequisites & Installation](#2-prerequisites--installation)
3. [Project Scaffolding](#3-project-scaffolding)
4. [Tech Stack](#4-tech-stack)
5. [Project Structure](#5-project-structure)
6. [Step-by-Step Implementation](#6-step-by-step-implementation)
7. [Docker Setup](#7-docker-setup)
8. [Automatic Disqualifiers Checklist](#8-automatic-disqualifiers-checklist)
9. [Evaluation Rubric Checklist](#9-evaluation-rubric-checklist)
10. [Submission Checklist](#10-submission-checklist)

---

## 1. Role Scope — What You Build

Per the "Who Builds What" table in the project spec:

| Requirement | Status |
|---|---|
| Backend (Go + PostgreSQL) | **NOT required** |
| Frontend (React + TypeScript) | **Required** |
| Docker + README | **Required** |
| Migrations / Seed Scripts | **NOT required** (no database) |
| Mock API (Appendix A spec) | **Required** — use MSW |

### What the Evaluator Will Test

1. `docker compose up` — app runs at `http://localhost:3000`
2. Register a new user
3. Log in with seed credentials: `test@example.com` / `password123`
4. Create a project
5. Add tasks to the project
6. Edit task status, priority, assignee
7. Delete a task and a project
8. Check responsive layout at 375px and 1280px
9. Check loading states, error states, empty states
10. Check that auth persists across page refresh
11. Check that dark mode toggle persists

---

## 2. Prerequisites & Installation

### Required Software

| Software | Purpose | Install |
|---|---|---|
| **Node.js** (v18+) | Runtime for React dev server | https://nodejs.org/ |
| **Docker Desktop** | Container runtime for `docker compose up` | https://www.docker.com/products/docker-desktop/ |
| **Git** | Version control | Usually pre-installed on macOS |

### Verify Installations

```bash
node --version      # Should show v18+ or v20+
npm --version       # Comes with Node.js
docker --version    # Should show Docker version
docker compose version  # Should show compose version
git --version       # Should show git version
```

### Start Docker Desktop

Open the Docker Desktop app on your Mac before running any docker commands. Wait until the Docker icon in the menu bar shows "Docker Desktop is running."

---

## 3. Project Scaffolding

### Step 1: Create Vite + React + TypeScript Project

From the TaskFlow root directory:

```bash
npm create vite@latest frontend -- --template react-ts
```

This creates a `frontend/` directory with React + TypeScript + Vite configured.

### Step 2: Install Dependencies

```bash
cd frontend
npm install
```

### Step 3: Install Tailwind CSS

```bash
npm install -D tailwindcss @tailwindcss/vite
```

### Step 4: Install shadcn/ui

```bash
npx shadcn@latest init
```

During setup, select:
- Style: **Default** (or New York)
- Base color: **Slate** (can customize later)
- CSS variables: **Yes**
- Components path: `src/components`
- Utils path: `src/lib/utils`

### Step 5: Install shadcn/ui Components

Install components needed for the project:

```bash
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add select
npx shadcn@latest add dropdown-menu
npx shadcn@latest add badge
npx shadcn@latest add avatar
npx shadcn@latest add separator
npx shadcn@latest add sheet
npx shadcn@latest add skeleton
npx shadcn@latest add toast
npx shadcn@latest add textarea
npx shadcn@latest add popover
npx shadcn@latest add calendar
npx shadcn@latest add tabs
npx shadcn@latest add switch
```

### Step 6: Install Additional Libraries

```bash
# React Router for navigation
npm install react-router-dom

# MSW for mock API
npm install msw --save-dev

# Framer Motion for animations
npm install framer-motion

# dnd-kit for drag and drop
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# Date formatting
npm install date-fns

# Icon library (comes with shadcn/ui, but ensure it's installed)
npm install lucide-react

# Class name utility (comes with shadcn/ui)
npm install clsx tailwind-merge
```

### Step 7: Initialize MSW Service Worker

```bash
npx msw init public/ --save
```

This creates `public/mockServiceWorker.js` — the service worker file that MSW uses to intercept requests in the browser.

### Step 8: Install Google Fonts

In `frontend/index.html`, add font links in the `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Karla:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet">
```

---

## 4. Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| React | 18+ | UI framework |
| TypeScript | 5+ | Type safety |
| Vite | 5+ | Build tool and dev server |
| Tailwind CSS | 4+ | Utility-first styling |
| shadcn/ui | latest | Pre-built accessible components (Radix + Tailwind) |
| Framer Motion | 11+ | Animations and transitions |
| React Router | 6+ | Client-side routing |
| MSW | 2+ | Mock API (service worker intercepts fetch calls) |
| @dnd-kit | latest | Drag and drop for tasks |
| Lucide React | latest | Icons |
| date-fns | 3+ | Date formatting |
| Karla | — | Sans-serif font (body text) |
| Playfair Display | — | Serif font (headings) |

---

## 5. Project Structure

```
taskflow-sneha/
├── frontend/
│   ├── public/
│   │   └── mockServiceWorker.js       ← MSW service worker file
│   ├── src/
│   │   ├── main.tsx                   ← App entry point, MSW init
│   │   ├── App.tsx                    ← Root component with router
│   │   ├── index.css                  ← Global styles, Tailwind directives, fonts, CSS variables
│   │   │
│   │   ├── components/                ← Reusable UI components
│   │   │   ├── ui/                    ← shadcn/ui components (auto-generated)
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.tsx         ← Top navbar with user name, logout, dark mode toggle
│   │   │   │   ├── Sidebar.tsx        ← Collapsible project sidebar
│   │   │   │   └── AppLayout.tsx      ← Wrapper layout with Navbar + Sidebar
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.tsx      ← Login form
│   │   │   │   └── RegisterForm.tsx   ← Register form
│   │   │   ├── projects/
│   │   │   │   ├── ProjectCard.tsx    ← Single project card in list
│   │   │   │   ├── ProjectList.tsx    ← Grid/list of project cards
│   │   │   │   └── CreateProjectDialog.tsx  ← Modal to create new project
│   │   │   ├── tasks/
│   │   │   │   ├── TaskCard.tsx       ← Single task card
│   │   │   │   ├── TaskList.tsx       ← List view of tasks
│   │   │   │   ├── KanbanBoard.tsx    ← Kanban board view (3 columns)
│   │   │   │   ├── KanbanColumn.tsx   ← Single column in kanban board
│   │   │   │   ├── TaskFormDialog.tsx ← Modal for create/edit task
│   │   │   │   └── TaskStatusBadge.tsx ← Badge showing task status with color
│   │   │   └── common/
│   │   │       ├── LoadingSpinner.tsx ← Reusable loading indicator
│   │   │       ├── EmptyState.tsx     ← Reusable empty state with icon + message
│   │   │       ├── ErrorState.tsx     ← Reusable error display
│   │   │       └── ConfirmDialog.tsx  ← Confirmation dialog for deletes
│   │   │
│   │   ├── pages/                     ← Route-level page components
│   │   │   ├── LoginPage.tsx          ← Login page
│   │   │   ├── RegisterPage.tsx       ← Register page
│   │   │   ├── ProjectsPage.tsx       ← Projects list page
│   │   │   ├── ProjectDetailPage.tsx  ← Single project with tasks
│   │   │   └── NotFoundPage.tsx       ← 404 page
│   │   │
│   │   ├── mocks/                     ← MSW mock API setup
│   │   │   ├── browser.ts             ← MSW worker setup for development
│   │   │   ├── handlers/
│   │   │   │   ├── auth.ts            ← Auth handlers (login, register)
│   │   │   │   ├── projects.ts        ← Project CRUD handlers
│   │   │   │   └── tasks.ts           ← Task CRUD handlers
│   │   │   ├── data.ts                ← Seed data (users, projects, tasks)
│   │   │   └── utils.ts               ← MSW helper functions (JWT gen, auth check)
│   │   │
│   │   ├── lib/                       ← Utilities and helpers
│   │   │   ├── api.ts                 ← Fetch wrapper with auth header injection
│   │   │   ├── auth.ts                ← Auth utilities (get token, get user, is authenticated)
│   │   │   └── utils.ts               ← shadcn/ui cn() utility (auto-generated)
│   │   │
│   │   ├── hooks/                     ← Custom React hooks
│   │   │   ├── useAuth.ts             ← Auth state hook (login, logout, register, user info)
│   │   │   ├── useProjects.ts         ← Projects CRUD hook
│   │   │   ├── useTasks.ts            ← Tasks CRUD hook with optimistic updates
│   │   │   └── useTheme.ts            ← Dark mode toggle hook
│   │   │
│   │   ├── types/                     ← TypeScript type definitions
│   │   │   └── index.ts               ← All interfaces (User, Project, Task, API responses)
│   │   │
│   │   └── context/                   ← React context providers
│   │       └── AuthContext.tsx         ← Auth context provider (wraps entire app)
│   │
│   ├── Dockerfile                     ← Multi-stage build for production
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts
│   ├── components.json               ← shadcn/ui config
│   ├── tailwind.config.ts            ← (if needed, otherwise in CSS)
│   └── index.html
│
├── docker-compose.yml                 ← Runs the frontend container
├── .env.example                       ← Template for environment variables
├── .gitignore                         ← Ignore node_modules, .env, dist, etc.
├── docs/
│   ├── project.md                     ← Original assignment spec
│   ├── implementation.md              ← This file
│   └── decisions.md                   ← All decisions and tradeoffs
└── README.md                          ← Main README (evaluated as part of rubric)
```

---

## 6. Step-by-Step Implementation

### Phase 1: Foundation (Setup & Configuration)

#### Step 1.1: Configure Tailwind CSS and Fonts

**File: `frontend/src/index.css`**

- Add Tailwind directives (`@import "tailwindcss"`)
- Define CSS variables for colors (shadcn/ui does this on init, customize later with user's color palette)
- Set font families: `--font-sans: 'Karla', sans-serif` and `--font-serif: 'Playfair Display', serif`
- Add dark mode CSS variable variants (shadcn/ui provides `.dark` class support)

#### Step 1.2: Configure Vite

**File: `frontend/vite.config.ts`**

- Add Tailwind CSS Vite plugin
- Configure path aliases (`@/` pointing to `src/`) for clean imports
- Set server port to 5173 (Vite default, will be 3000 via Docker/nginx)

#### Step 1.3: Configure TypeScript Paths

**File: `frontend/tsconfig.json` / `tsconfig.app.json`**

- Add path mapping: `"@/*": ["./src/*"]` so imports like `@/components/ui/button` work

#### Step 1.4: Environment Variables

**File: `frontend/.env.example`**
```
VITE_API_BASE_URL=http://localhost:4000
```

**File: `frontend/.env`** (gitignored, for local dev)
```
VITE_API_BASE_URL=http://localhost:4000
```

---

### Phase 2: TypeScript Types

#### Step 2.1: Define All Types

**File: `frontend/src/types/index.ts`**

```typescript
// User entity
export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

// Project entity
export interface Project {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  created_at: string;
}

// Task entity
export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  project_id: string;
  assignee_id: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

// Auth request/response types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// API response wrappers
export interface ProjectsResponse {
  projects: Project[];
}

export interface TasksResponse {
  tasks: Task[];
}

export interface ProjectDetailResponse extends Project {
  tasks: Task[];
}

// API error response
export interface ApiError {
  error: string;
  fields?: Record<string, string>;
}

// Create/update request types
export interface CreateProjectRequest {
  name: string;
  description?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority: TaskPriority;
  assignee_id?: string;
  due_date?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee_id?: string | null;
  due_date?: string | null;
}
```

---

### Phase 3: Mock API (MSW)

#### Step 3.1: Create Seed Data

**File: `frontend/src/mocks/data.ts`**

Define the seed data arrays:
- `seedUsers` — 1 pre-seeded user: `test@example.com` / `password123`, plus any users created during the session
- `seedProjects` — 1 pre-seeded project owned by the seed user
- `seedTasks` — 3 tasks with different statuses (`todo`, `in_progress`, `done`) in the seed project

**Data persistence approach:** Use a helper that checks localStorage for existing data on load. If localStorage has data, use that. Otherwise, use the seed defaults. On every create/update/delete, sync the in-memory state back to localStorage.

```typescript
// Helper pattern:
function loadFromStorage<T>(key: string, fallback: T[]): T[] {
  const stored = localStorage.getItem(key);
  if (stored) {
    try { return JSON.parse(stored); }
    catch { return fallback; }
  }
  return fallback;
}

function saveToStorage<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}
```

**Important:** The `seedUsers` array stores passwords in plain text as a comment in code makes clear this is mock-only. In a real backend, bcrypt would be used. The evaluator will not flag this for a frontend mock.

#### Step 3.2: Create MSW Utility Functions

**File: `frontend/src/mocks/utils.ts`**

- `generateToken(user)` — creates a JWT-like string (base64 encoded header + payload)
- `verifyAuth(request)` — checks `Authorization: Bearer <token>` header, returns user info or null
- `createResponse(data, status)` — helper for JSON responses
- `ErrorResponse(status, message, fields?)` — returns proper error format

#### Step 3.3: Create Auth Handlers

**File: `frontend/src/mocks/handlers/auth.ts`**

MSW handlers for:
- `POST /auth/register` — validates name, email, password. Checks email uniqueness. Creates user. Returns `{ token, user }` with status 201.
- `POST /auth/login` — validates email, password. Checks credentials against stored users. Returns `{ token, user }` with status 200.

Validation rules:
- Name: required, min 2 characters (register only)
- Email: required, valid format
- Password: required, min 8 characters

Error responses:
- 400 with `{ "error": "validation failed", "fields": { ... } }` for invalid input
- 401 with `{ "error": "unauthorized" }` for wrong credentials
- 409 (conflict) for duplicate email on register

#### Step 3.4: Create Project Handlers

**File: `frontend/src/mocks/handlers/projects.ts`**

MSW handlers for:
- `GET /projects` — returns projects owned by the authenticated user (from localStorage/memory). Status 200.
- `POST /projects` — creates a new project with owner = authenticated user. Status 201.
- `GET /projects/:id` — returns project details + its tasks. Status 200. Returns 404 if not found.
- `PATCH /projects/:id` — updates name/description. Only owner can update. Returns 200. Returns 403 if not owner.
- `DELETE /projects/:id` — deletes project and all its tasks. Only owner can delete. Returns 204. Returns 403 if not owner.

#### Step 3.5: Create Task Handlers

**File: `frontend/src/mocks/handlers/tasks.ts`**

MSW handlers for:
- `GET /projects/:id/tasks` — returns tasks for the project. Supports `?status=` and `?assignee=` query params for filtering. Status 200.
- `POST /projects/:id/tasks` — creates a task in the project. Status 201.
- `PATCH /tasks/:id` — updates task fields. All fields optional. Status 200.
- `DELETE /tasks/:id` — deletes the task. Returns 204.

#### Step 3.6: Initialize MSW Browser Worker

**File: `frontend/src/mocks/browser.ts`**

```typescript
import { setupWorker } from 'msw/browser';
import { authHandlers } from './handlers/auth';
import { projectHandlers } from './handlers/projects';
import { taskHandlers } from './handlers/tasks';

export const worker = setupWorker(
  ...authHandlers,
  ...projectHandlers,
  ...taskHandlers,
);
```

#### Step 3.7: Start MSW in App Entry Point

**File: `frontend/src/main.tsx`**

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

async function enableMocking() {
  if (import.meta.env.DEV) {
    const { worker } = await import('./mocks/browser');
    return worker.start({
      onUnhandledRequest: 'bypass', // don't warn on non-API requests
    });
  }
}

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});
```

---

### Phase 4: API Client & Auth Layer

#### Step 4.1: Create API Fetch Wrapper

**File: `frontend/src/lib/api.ts`**

A wrapper around `fetch()` that:
- Prepends `VITE_API_BASE_URL` to all endpoints
- Automatically adds `Authorization: Bearer <token>` header from localStorage
- Parses JSON responses
- Throws structured errors for non-2xx status codes
- Handles 401 by clearing auth and redirecting to login

Functions:
- `apiGet<T>(path)` — GET request
- `apiPost<T>(path, body)` — POST request
- `apiPatch<T>(path, body)` — PATCH request
- `apiDelete(path)` — DELETE request (expects 204)

#### Step 4.2: Create Auth Utilities

**File: `frontend/src/lib/auth.ts`**

Functions:
- `getToken()` — read JWT from localStorage
- `setToken(token)` — save JWT to localStorage
- `removeToken()` — clear JWT from localStorage
- `getUser()` — read stored user info from localStorage
- `setUser(user)` — save user object to localStorage
- `isAuthenticated()` — check if token exists and is not expired

---

### Phase 5: React Context & Hooks

#### Step 5.1: Create Auth Context

**File: `frontend/src/context/AuthContext.tsx`**

Provides:
- `user` — current logged-in user (null if not authenticated)
- `isAuthenticated` — boolean
- `isLoading` — loading state during initial auth check
- `login(email, password)` — calls API, stores token + user
- `register(name, email, password)` — calls API, stores token + user
- `logout()` — clears token + user, redirects to login

The context reads from localStorage on mount to persist auth across refreshes.

#### Step 5.2: Create useAuth Hook

**File: `frontend/src/hooks/useAuth.ts`**

Simple hook to consume the AuthContext. Throws error if used outside AuthProvider.

#### Step 5.3: Create useProjects Hook

**File: `frontend/src/hooks/useProjects.ts`**

Manages projects state:
- `projects` — list of projects
- `isLoading` — loading state
- `error` — error state
- `fetchProjects()` — GET /projects
- `createProject(data)` — POST /projects
- `updateProject(id, data)` — PATCH /projects/:id
- `deleteProject(id)` — DELETE /projects/:id

#### Step 5.4: Create useTasks Hook

**File: `frontend/src/hooks/useTasks.ts`**

Manages tasks state for a specific project:
- `tasks` — list of tasks
- `isLoading` — loading state
- `error` — error state
- `fetchTasks(projectId, filters?)` — GET /projects/:id/tasks with status/assignee filters
- `createTask(projectId, data)` — POST /projects/:id/tasks
- `updateTask(id, data)` — PATCH /tasks/:id — **with optimistic UI**
- `deleteTask(id)` — DELETE /tasks/:id

**Optimistic UI for status changes (required by spec):**
When user changes a task status:
1. Immediately update the task in local state (optimistic)
2. Send PATCH request in background
3. If request succeeds, keep the optimistic update
4. If request fails, revert to previous status and show error toast

#### Step 5.5: Create useTheme Hook

**File: `frontend/src/hooks/useTheme.ts`**

Manages dark/light mode:
- Reads from localStorage on mount (key: `theme`)
- Toggles `.dark` class on `<html>` element
- Persists preference in localStorage
- Uses `prefers-color-scheme` media query as default if no stored preference

---

### Phase 6: Routing & Layout

#### Step 6.1: Configure React Router

**File: `frontend/src/App.tsx`**

Routes:
- `/login` — LoginPage (public)
- `/register` — RegisterPage (public)
- `/` — ProjectsPage (protected)
- `/projects/:id` — ProjectDetailPage (protected)
- `*` — NotFoundPage (public)

Protected routes check `isAuthenticated()`. If false, redirect to `/login`.

Structure:
```tsx
<AuthProvider>
  <ThemeProvider>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<AppLayout />}>  {/* Contains Navbar + Sidebar */}
        <Route path="/" element={<ProjectsPage />} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </ThemeProvider>
</AuthProvider>
```

#### Step 6.2: Create AppLayout

**File: `frontend/src/components/layout/AppLayout.tsx`**

- Wraps protected routes
- Contains Navbar at top
- Contains collapsible Sidebar on the left
- Main content area on the right
- If not authenticated, redirect to `/login` via `Navigate` component

#### Step 6.3: Create Navbar

**File: `frontend/src/components/layout/Navbar.tsx`**

Requirements from spec: "Show logged-in user's name, logout button"

Contents:
- App logo/name ("TaskFlow") — links to `/`
- User's name (from auth context)
- Dark mode toggle (sun/moon icon using Switch or button)
- Logout button

Desktop: full horizontal navbar
Mobile: hamburger menu that opens a sheet/drawer

#### Step 6.4: Create Sidebar

**File: `frontend/src/components/layout/Sidebar.tsx`**

Collapsible sidebar showing:
- List of projects (clickable, navigates to project detail)
- "Create Project" button
- Active project highlight

Desktop: collapsible sidebar (toggle icon to expand/collapse)
Mobile: hidden by default, opens via hamburger menu in navbar (Sheet component)

---

### Phase 7: Pages

#### Step 7.1: Login Page

**File: `frontend/src/pages/LoginPage.tsx`**

- Email input + password input
- Client-side validation:
  - Email: required, valid email format
  - Password: required, min 8 characters
- Show validation errors inline below each field
- On submit: call `login(email, password)` from auth context
- On API error: show error message (e.g., "Invalid email or password")
- Loading state: disable button, show spinner
- Link to register page ("Don't have an account? Register")
- If already authenticated, redirect to `/`

#### Step 7.2: Register Page

**File: `frontend/src/pages/RegisterPage.tsx`**

- Name input + email input + password input
- Client-side validation:
  - Name: required, min 2 characters
  - Email: required, valid email format
  - Password: required, min 8 characters
- Same error/loading handling as login
- On success: automatically logged in, redirect to `/`
- Link to login page ("Already have an account? Login")

#### Step 7.3: Projects List Page

**File: `frontend/src/pages/ProjectsPage.tsx`**

- Fetches projects on mount via `useProjects` hook
- Shows project cards in a responsive grid
- Each card shows: project name, description, task count, created date
- Click card → navigate to `/projects/:id`
- "Create Project" button opens CreateProjectDialog modal
- **Empty state:** If no projects, show friendly message + "Create your first project" button
- **Loading state:** Show skeleton cards
- **Error state:** Show error message with retry button

#### Step 7.4: Project Detail Page

**File: `frontend/src/pages/ProjectDetailPage.tsx`**

- Fetches project details + tasks on mount
- Shows project name, description, edit/delete buttons (if owner)
- **Task display — desktop (1280px):**
  - Tabs or toggle to switch between **Kanban Board View** and **Task List View**
  - Kanban: 3 columns (Todo, In Progress, Done) with draggable task cards
  - List: table/card list with sortable columns, drag to reorder
- **Task display — mobile (375px):**
  - Task list view only
  - Drag to reorder
- **Filter controls:** Filter by status (dropdown) and assignee (dropdown)
- **Create task** button opens TaskFormDialog modal
- **Empty state:** "No tasks yet. Add your first task."
- **Loading state:** Skeleton placeholders
- **Error state:** Error message with retry

#### Step 7.5: Not Found Page

**File: `frontend/src/pages/NotFoundPage.tsx`**

- Simple 404 page
- "Page not found" message
- Link back to home/projects

---

### Phase 8: Components

#### Step 8.1: Auth Components

**LoginForm** (`frontend/src/components/auth/LoginForm.tsx`)
- Form with email, password inputs using shadcn/ui Input + Label
- Submit button with loading state
- Inline validation error messages
- Uses `useForm` pattern (React state, no form library needed)

**RegisterForm** (`frontend/src/components/auth/RegisterForm.tsx`)
- Same pattern as LoginForm, with additional name field

#### Step 8.2: Project Components

**ProjectCard** (`frontend/src/components/projects/ProjectCard.tsx`)
- Card component showing project name, description (truncated), date
- Click handler to navigate to project detail
- Framer Motion hover animation

**ProjectList** (`frontend/src/components/projects/ProjectList.tsx`)
- Maps over projects array, renders ProjectCard for each
- Responsive grid: 1 column on mobile, 2-3 columns on desktop

**CreateProjectDialog** (`frontend/src/components/projects/CreateProjectDialog.tsx`)
- shadcn/ui Dialog component
- Name input (required), description textarea (optional)
- Cancel + Create buttons
- Validation + loading state

#### Step 8.3: Task Components

**TaskCard** (`frontend/src/components/tasks/TaskCard.tsx`)
- Shows title, status badge, priority badge, assignee, due date
- Click opens edit mode (TaskFormDialog with pre-filled data)
- Drag handle for drag-and-drop

**TaskList** (`frontend/src/components/tasks/TaskList.tsx`)
- Vertical list of TaskCard components
- Uses @dnd-kit sortable for drag-and-drop reordering
- Grouped by status or flat list based on filters

**KanbanBoard** (`frontend/src/components/tasks/KanbanBoard.tsx`)
- 3 columns: Todo | In Progress | Done
- Tasks rendered as draggable cards within columns
- Uses @dnd-kit for drag between columns (changes task status)
- Desktop only (hidden on mobile)

**KanbanColumn** (`frontend/src/components/tasks/KanbanColumn.tsx`)
- Single column with header (status name + count)
- Droppable area for tasks
- Visual feedback on drag over

**TaskFormDialog** (`frontend/src/components/tasks/TaskFormDialog.tsx`)
- shadcn/ui Dialog (modal)
- Fields: title (required), description (optional), status (select), priority (select), assignee (select from project members), due date (calendar picker)
- Mode: "create" or "edit" (pre-fills fields in edit mode)
- Validation + loading state

**TaskStatusBadge** (`frontend/src/components/tasks/TaskStatusBadge.tsx`)
- Color-coded badge: todo = yellow/blue, in_progress = orange/amber, done = green
- Uses shadcn/ui Badge component

#### Step 8.4: Common Components

**LoadingSpinner** (`frontend/src/components/common/LoadingSpinner.tsx`)
- Centered spinner with optional "Loading..." text
- Uses shadcn/ui Skeleton or Lucide Loader icon

**EmptyState** (`frontend/src/components/common/EmptyState.tsx`)
- Icon + message + optional action button
- Props: `icon`, `title`, `description`, `actionLabel`, `onAction`

**ErrorState** (`frontend/src/components/common/ErrorState.tsx`)
- Error icon + message + retry button
- Props: `message`, `onRetry`

**ConfirmDialog** (`frontend/src/components/common/ConfirmDialog.tsx`)
- Confirmation dialog for destructive actions (delete project, delete task)
- "Are you sure?" message with Cancel + Delete buttons

---

### Phase 9: Drag and Drop (Bonus Feature)

#### Step 9.1: Configure dnd-kit

Install (already done in Step 6):
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

#### Step 9.2: Kanban Board Drag-and-Drop

In `KanbanBoard.tsx`:
- Wrap board in `DndContext` from @dnd-kit/core
- Each column is a `Droppable` area
- Each task card is a `Draggable` item
- On drag end: if task moved to a different column, update its status via `updateTask(id, { status: newStatus })` with optimistic UI

#### Step 9.3: Task List Drag-and-Drop

In `TaskList.tsx`:
- Use `SortableContext` from @dnd-kit/sortable
- Each task card has a drag handle
- On drag end: reorder tasks in the list (visual reordering)

#### Step 9.4: Mobile Drag-and-Drop

- Task list view is the only view on mobile
- Same `SortableContext` drag-and-drop as desktop list
- Touch-friendly drag handles

---

### Phase 10: Dark Mode (Bonus Feature)

#### Step 10.1: Theme Provider

Already covered in `useTheme` hook (Step 5.5).

#### Step 10.2: Toggle in Navbar

- Sun/Moon icon button in Navbar
- Click toggles between light/dark
- Persists in localStorage key `theme`
- Respects system preference on first load

#### Step 10.3: Dark Mode CSS Variables

shadcn/ui generates `.dark` CSS variables in `index.css`. These handle most of the work. Ensure:
- All custom colors use CSS variables (not hardcoded values)
- Background, text, border colors all switch properly
- Images and badges have proper contrast in both modes

---

### Phase 11: Responsive Design

#### Breakpoints (Tailwind defaults)

| Breakpoint | Width | Target |
|---|---|---|
| Default | 0+ | Mobile first |
| `sm` | 640px+ | Large phones |
| `md` | 768px+ | Tablets |
| `lg` | 1024px+ | Small desktops |
| `xl` | 1280px+ | Desktops |

#### Key Responsive Rules

- **375px (mobile):** Single column layout, no sidebar, no kanban view, hamburger menu, full-width cards
- **1280px (desktop):** Sidebar visible, kanban + list toggle, multi-column grid, horizontal navbar
- **Between:** Smooth transitions, sidebar auto-collapses, kanban hides below `lg` breakpoint

#### Typography Scale

- Headings: Playfair Display (serif) — larger sizes, bold
- Body: Karla (sans-serif) — readable sizes, regular weight
- Consistent spacing scale: 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px

---

### Phase 12: Error Handling & Edge Cases

#### All States Must Be Handled

For every data-fetching operation, handle these states:

| State | What to Show |
|---|---|
| **Loading** | Skeleton placeholders or spinner |
| **Success (empty)** | EmptyState component with message + action |
| **Success (data)** | Actual data rendered |
| **Error** | ErrorState component with message + retry |
| **Mutation loading** | Disable submit button, show spinner |
| **Mutation error** | Toast notification with error message |

#### Optimistic UI (Required by Spec)

For task status changes:
1. Update task status in local state immediately
2. Show the change (task moves to new column or updates badge)
3. Fire PATCH request in background
4. If success: keep the change (optionally refetch to confirm)
5. If error: revert the status change, show error toast

#### Form Validation (Client-Side)

Every form must validate before submitting:
- Show inline error messages below each field
- Disable submit button until form is valid
- Validate on blur (when user leaves a field) and on submit

#### No Console Errors

- No `undefined` rendered in the UI
- No broken image references
- No missing keys in lists
- No uncaught promise rejections

---

## 7. Docker Setup

### Dockerfile (Multi-Stage Build)

**File: `frontend/Dockerfile`**

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Configuration

**File: `frontend/nginx.conf`**

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # SPA routing — all paths serve index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Docker Compose

**File: `docker-compose.yml`** (at repo root)

```yaml
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    environment:
      - VITE_API_BASE_URL=http://localhost:4000
```

### .env.example

**File: `.env.example`** (at repo root)

```
# TaskFlow Frontend Configuration
VITE_API_BASE_URL=http://localhost:4000
```

### .gitignore

**File: `.gitignore`** (at repo root)

```
.env
node_modules/
dist/
.DS_Store
*.local
```

---

## 8. Automatic Disqualifiers Checklist

Per the project spec, these cause immediate rejection. Here's how each applies to you:

| Disqualifier | Applies? | How to Avoid |
|---|---|---|
| App does not run with `docker compose up` | **YES** | Test `docker compose up` before submitting. App must appear at `http://localhost:3000` |
| No database migrations | **NO** | Frontend-only role, no database. Mention "N/A" in README |
| Passwords stored in plaintext | **NO** | No real database. Mock seed data has plaintext passwords, which is expected |
| JWT secret hardcoded in source code | **NO** | No JWT signing in frontend. MSW generates tokens without a secret |
| No README | **YES** | Must include comprehensive README.md at repo root |
| Submission after 72-hour deadline | **YES** | Submit on time |

---

## 9. Evaluation Rubric Checklist

Your score is evaluated out of 25 points (need 16 to pass):

| Area | Points | How to Score Well |
|---|---|---|
| **Correctness** (5) | App runs, auth works end-to-end, all core flows work | Test every flow: register, login, create project, create task, edit task, delete task, delete project |
| **Code quality** (5) | Naming, structure, separation of concerns, no god functions | Keep components small, hooks handle logic, clear file organization |
| **UI/UX** (5) | Usable, consistent, handles loading/error/empty states, responsive | Every state handled, 375px and 1280px layouts work, no blank screens |
| **Component design** (5) | Sensible breakdown, state managed at right level, no prop drilling | Context for auth, hooks for data, components for UI only |
| **Docker & DevEx** (5) | `docker compose up` works, multi-stage Dockerfile, `.env.example` present | Test Docker before submitting |
| **README quality** (5) | Clear setup, architecture reasoning, honest "what's missing" | Follow all 7 sections from the spec |
| **Bonus** (+5) | Dark mode, drag-and-drop | Implement both for max bonus points |

---

## 10. Submission Checklist

Before submitting, verify:

- [ ] `docker compose up` works — app loads at `http://localhost:3000`
- [ ] Can register a new user
- [ ] Can log in with `test@example.com` / `password123`
- [ ] Can create a project
- [ ] Can create tasks in a project
- [ ] Can edit task status, priority, assignee, due date
- [ ] Can delete a task
- [ ] Can delete a project
- [ ] Optimistic UI works for task status changes
- [ ] Loading states visible on every data fetch
- [ ] Error states visible when things fail
- [ ] Empty states visible when no projects / no tasks
- [ ] Auth persists across page refresh
- [ ] Protected routes redirect to login when unauthenticated
- [ ] Responsive at 375px (mobile)
- [ ] Responsive at 1280px (desktop)
- [ ] No console errors in production build
- [ ] Dark mode toggle works and persists
- [ ] Drag and drop works in kanban board (desktop)
- [ ] Drag and drop works in task list (mobile + desktop)
- [ ] `.env.example` present at repo root
- [ ] `docker-compose.yml` present at repo root
- [ ] `README.md` present with all 7 required sections
- [ ] `.env` is NOT committed (in .gitignore)
- [ ] `node_modules` is NOT committed (in .gitignore)
- [ ] Public GitHub repo named `taskflow-sneha-agarwal` (or similar)
