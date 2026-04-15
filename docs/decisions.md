# TaskFlow — Architecture & Design Decisions

> All decisions made during planning for the Frontend-only role implementation. This document serves as the foundation for the README's "Architecture Decisions" and "What You'd Do With More Time" sections.

---

## 1. Tech Stack Decisions

### Framework: React + TypeScript + Vite

| Choice | Reason |
| ------ | ------ |
| **React** | Required by the project spec |
| **TypeScript** | Strongly preferred by the spec. Adds type safety for data models (User, Project, Task) and catches bugs at compile time |
| **Vite** | Fastest dev server and build tool for React. Better DX than Create React App (which is deprecated). Native TypeScript support |

### Styling: Tailwind CSS + shadcn/ui

| Choice | Reason |
| ------ | ------ |
| **Tailwind CSS** | Utility-first CSS. Fast to write, no context-switching to separate CSS files. Responsive breakpoints built in. Wide industry adoption |
| **shadcn/ui** | Pre-built accessible components (modals, selects, dialogs, dropdowns) on top of Radix UI + Tailwind. Not a heavy dependency — components are copied into your project. Full control and customization. Handles keyboard navigation, ARIA, and focus management that would take hours to build from scratch |

**Why not MUI or Chakra:** MUI is more opinionated and harder to customize with Tailwind. Chakra is good but less popular. shadcn/ui is the current industry standard for React + Tailwind projects.

### Animation: Framer Motion

| Choice | Reason |
| ------ | ------ |
| **Framer Motion** | Declarative animation library for React. Used for page transitions, hover effects on cards, modal animations, drag-and-drop visual feedback. Not required by spec but adds polish |

### Icons: Lucide React

| Choice | Reason |
| ------ | ------ |
| **Lucide React** | Comes bundled with shadcn/ui. Tree-shakeable (only icons you use are included in bundle). Clean, consistent icon style |

### Date Handling: date-fns

| Choice | Reason |
| ------ | ------ |
| **date-fns** | Lightweight date formatting library. Used for displaying `created_at`, `due_date`, and `updated_at` in human-readable format |

### Drag and Drop: @dnd-kit

| Choice | Reason |
| ------ | ------ |
| **@dnd-kit/core + @dnd-kit/sortable** | Modern, accessible drag-and-drop library for React. Supports both kanban column-to-column moves and list reordering. Touch-friendly for mobile. Active maintenance and good documentation |

**Why not react-beautiful-dnd:** That library is no longer maintained. @dnd-kit is the modern replacement.

---

## 2. Mock API Decision: MSW (Mock Service Worker)

### What We Chose

**MSW** to simulate the backend API entirely in the browser.

### Why MSW Over Alternatives

| Alternative | Why Not |
| ----------- | ------- |
| **json-server** | Creates a real lightweight server, but harder to simulate auth (JWT), custom error codes (401, 403, 404), and validation errors. Requires running a separate process |
| **Direct localStorage** | Skips the API layer entirely. No fetch calls, no loading states, no error handling. The evaluator wants to see proper HTTP integration |
| **Manual fetch mocking** | More boilerplate, less maintainable than MSW's handler-based approach |

### How MSW Works

1. A service worker (`mockServiceWorker.js`) is registered in the browser
2. All `fetch()` calls from the React app are intercepted by the service worker
3. MSW handlers match requests by method + URL pattern and return mock responses
4. The React code is identical to what it would be with a real backend
5. Loading states, error handling, and auth flow all work naturally

### Data Persistence with MSW

- Seed data is defined as JavaScript arrays in `src/mocks/data.ts`
- On app load, MSW checks localStorage for existing data — if found, uses it; otherwise uses seed defaults
- On every create/update/delete, MSW syncs changes to localStorage
- On page refresh, data is restored from localStorage (not lost)
- Auth token is also stored in localStorage (required by spec)
- This hybrid approach shows proper API integration while maintaining a usable demo experience

---

## 3. Fonts & Typography

### Font Choices

| Font | Type | Usage |
| ---- | ---- | ----- |
| **Playfair Display** | Serif | Headings (h1, h2, h3) — adds elegance and character |
| **Karla** | Sans-serif | Body text, labels, buttons — clean and highly readable |

### Why Two Fonts

Contrast between serif headings and sans-serif body text creates visual hierarchy and makes the UI feel designed rather than generic.

### Typography Rules

- Headings: Playfair Display, weights 600-700
- Body: Karla, weights 400-500
- Small labels: Karla, weight 500-600
- Consistent scale: defined via Tailwind's `fontSize` configuration
- Line heights: 1.2 for headings, 1.5 for body text

---

## 4. Layout & View Decisions

### Projects Page

- Responsive grid of project cards
- **Collapsible sidebar** listing all projects for quick navigation
- Sidebar visible on desktop, accessible via hamburger menu on mobile

### Project Detail / Tasks Page

**Desktop view (1280px+):**
- Toggle between **Kanban Board View** and **Task List View**
- Kanban: 3 columns (Todo, In Progress, Done) with drag-and-drop between columns
- Task List: vertical list with drag-and-drop reordering

**Mobile view (375px):**
- Task List View only (kanban columns too cramped on small screens)
- Drag-and-drop reordering supported

### Why Kanban + List Toggle

The spec says "Tasks listed or grouped, filter by status and assignee." Offering both views:
- Kanban is ideal for visual status tracking
- List view is better for detailed information and mobile screens
- Shows UI component design skill to the evaluator

---

## 5. State Management Decisions

### No External State Library (No Redux, Zustand, etc.)

| Concern | Solution |
| ------- | -------- |
| Auth state | React Context (`AuthContext`) — wraps entire app, persists to localStorage |
| Project data | Custom hook (`useProjects`) — fetches from API, manages loading/error state |
| Task data | Custom hook (`useTasks`) — fetches from API, handles optimistic updates |
| Theme (dark mode) | Custom hook (`useTheme`) — toggles CSS class, persists to localStorage |

### Why Not Redux/Zustand

The app has 3 pieces of global state: auth, theme, and current data. React Context + custom hooks handle this cleanly without the overhead of a state management library. Adding Redux for this scope would be over-engineering.

### Auth Context Design

```
AuthProvider (wraps entire app)
  ├── LoginPage / RegisterPage (public routes)
  └── AppLayout (protected routes)
       ├── Navbar (reads user from context)
       ├── Sidebar (reads projects from hook)
       └── Page Content (reads data from hooks)
```

- Context provides: `user`, `isAuthenticated`, `login()`, `register()`, `logout()`
- On mount: reads token from localStorage to restore session
- On login/register: stores token + user in localStorage
- On logout: clears localStorage, redirects to login

---

## 6. What We Are NOT Building (And Why)

| Feature | Why Skipped |
| ------- | ----------- |
| **Real backend (Go)** | Not required for frontend-only role per the spec |
| **PostgreSQL database** | Not required for frontend-only role. MSW handles data |
| **Database migrations** | Not required — no database. Mentioned in README as N/A |
| **Seed SQL scripts** | Not required — seed data is in JavaScript files for MSW |
| **Real-time updates (WebSocket/SSE)** | Bonus feature that explicitly "requires backend support." Cannot implement without a real server |
| **Landing page** | Not listed as a required view. Time better spent polishing required pages |
| **Vercel deployment** | Not required. Could add as bonus but risks complicating Docker setup. Focus on `docker compose up` reliability first |
| **Pagination** | Backend bonus feature, not required for frontend-only |
| **Project stats endpoint** | Backend bonus feature, not required for frontend-only |
| **Backend integration tests** | Backend-only requirement |

---

## 7. What We ARE Building (Bonus Features)

| Bonus Feature | Decision | Rationale |
| ------------- | -------- | --------- |
| **Dark mode toggle** | Implementing | shadcn/ui has built-in dark mode support via CSS variables. Low effort, high impact. Persists in localStorage |
| **Drag-and-drop tasks** | Implementing | Using @dnd-kit. Works in both kanban board (desktop) and task list (mobile + desktop). Shows advanced React skills |
| **Real-time updates** | Skipping | Requires real backend WebSocket/SSE support |

---

## 8. Docker Strategy

### Multi-Stage Dockerfile

| Stage | Base Image | Purpose |
| ----- | ---------- | ------- |
| **Build** | `node:20-alpine` | Install dependencies, build React app (`npm run build`) |
| **Serve** | `nginx:alpine` | Serve static files from `dist/` directory. Tiny image (~25MB) |

### Why Multi-Stage

- Build stage has Node.js + all `devDependencies` (large, ~500MB)
- Runtime stage only has nginx + built HTML/JS/CSS files (small, ~25MB)
- The final Docker image is tiny and secure (no source code exposed)
- This is explicitly required by the spec: "multi-stage build"

### Why Nginx Instead of `npm run preview`

- Nginx is production-grade, handles routing for SPA (single-page application)
- `npm run preview` is Vite's preview tool, not meant for production
- Nginx config handles client-side routing: all paths serve `index.html` so React Router works
- Nginx adds proper caching headers for static assets

### docker-compose.yml

- Only one service: `frontend`
- Maps port 3000 to nginx port 80
- No PostgreSQL service needed
- No backend API service needed

---

## 9. Automatic Disqualifiers — How We Avoid Them

| Disqualifier | Our Status | How We Handle |
| ------------ | ---------- | ------------- |
| App does not run with `docker compose up` | **Covered** | Multi-stage Dockerfile + docker-compose.yml. Test before submission |
| No database migrations | **N/A** | Frontend-only role. README states migrations are not applicable |
| Passwords stored in plaintext | **N/A** | No real database. Mock seed data uses plaintext which is expected for a frontend mock |
| JWT secret hardcoded in source | **N/A** | No JWT signing in frontend. MSW generates tokens without a cryptographic secret |
| No README | **Covered** | Comprehensive README with all 7 sections |
| Late submission | **Covered** | User manages deadline |

---

## 10. Evaluation Rubric — Targeting 25/25 + Bonus

### Core Points (25)

| Area (5 pts each) | Strategy |
| ----------------- | -------- |
| **Correctness** | Every flow works: register, login, CRUD projects, CRUD tasks, auth persists, responsive |
| **Code quality** | Small focused components, hooks for logic, types for data, clear naming |
| **UI/UX** | Loading skeletons, error toasts, empty state illustrations, responsive at 375px and 1280px |
| **Component design** | Context for auth, hooks for data fetching, components for rendering only |
| **Docker & DevEx** | One-command setup, multi-stage Dockerfile, `.env.example` present |

### Bonus Points (+5)

| Bonus (pts) | Strategy |
| ----------- | -------- |
| **Dark mode** (+2-3) | CSS variable toggle, localStorage persistence, system preference detection |
| **Drag-and-drop** (+2-3) | Kanban column drag + list reorder, touch support, @dnd-kit |

---

## 11. README Sections Plan

### 1. Overview

- What: TaskFlow task management system (frontend-only implementation)
- Stack: React, TypeScript, Vite, Tailwind CSS, shadcn/ui, MSW, Framer Motion
- Role: Frontend Engineer application

### 2. Architecture Decisions

- Reference `docs/decisions.md` for full details
- Key points: MSW for mock API, React Context for auth, custom hooks for data, shadcn/ui for components
- Tradeoffs: no real backend (data resets concept), no pagination, no real-time updates

### 3. Running Locally

```bash
git clone https://github.com/snehaagarwal/taskflow-sneha
cd taskflow-sneha
cp .env.example .env
docker compose up
# App available at http://localhost:3000
```

### 4. Running Migrations

"Not applicable — this is a frontend-only implementation using MSW (Mock Service Worker) for API simulation. No database or migrations are required."

### 5. Test Credentials

```
Email:    test@example.com
Password: password123
```

### 6. API Reference

Document all endpoints inline in README with request/response examples matching Appendix A of the project spec.

### 7. What You'd Do With More Time

- Real backend integration (Go API + PostgreSQL)
- Data persistence beyond localStorage (actual database)
- Real-time updates via WebSocket
- Pagination on list endpoints
- Comprehensive test suite (unit + integration tests)
- Accessibility audit and WCAG compliance
- Performance optimization (virtual scrolling for large task lists)
- Offline support via service workers
- E2E tests with Playwright or Cypress

---

## 12. Color Theme

**Status:** Pending — user will provide color palette references.

Default: shadcn/ui default theme (Slate color palette) will be used as a starting point, customized once user provides references.

Dark mode variants will be derived from the light theme using shadcn/ui's CSS variable system.
