# 🚀 FlowBoard — Enterprise Full-Stack Kanban Board

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.3.4-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/NestJS-12-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Redux_Toolkit-2.x-764ABC?style=for-the-badge&logo=redux&logoColor=white" alt="Redux Toolkit" />
  <img src="https://img.shields.io/badge/Prisma-7-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/Swagger-OpenAPI_3.0-85EA2D?style=for-the-badge&logo=swagger&logoColor=black" alt="Swagger" />
</p>

---

A high-performance, modern full-stack Kanban application designed for seamless task orchestration and team collaboration. Built with **NestJS**, **Next.js 16 (App Router)**, **PostgreSQL 16**, and **Prisma ORM**, featuring fluid drag-and-drop powered by `@dnd-kit`, **O(1) Fractional Indexing**, robust role-based board sharing, atomic transaction safety, and optimistic Redux state management.

---

## 📑 Table of Contents

- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Database Schema (ERD)](#-database-schema-erd)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Option 1: Run with Docker Compose (Recommended)](#option-1-run-with-docker-compose-recommended)
  - [Option 2: Manual Local Setup](#option-2-manual-local-setup)
- [Environment Variables](#-environment-variables)
- [API Reference & Documentation](#-api-reference--documentation)
- [Core Engineering Highlights](#-core-engineering-highlights)
  - [1. O(1) Fractional Positioning Algorithm](#1-o1-fractional-positioning-algorithm)
  - [2. Hierarchical BoardAccessGuard](#2-hierarchical-boardaccessguard)
  - [3. Concurrent Move Transaction Safety](#3-concurrent-move-transaction-safety)
  - [4. Optimistic UI Updates via Redux Toolkit](#4-optimistic-ui-updates-via-redux-toolkit)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [Available Scripts](#-available-scripts)
- [Roadmap & Limitations](#-roadmap--limitations)
- [License](#-license)

---

## ✨ Key Features

- 🎯 **Fluid Drag-and-Drop Experience**: Smooth, tactile card dragging across and within columns powered by `@dnd-kit` with collision detection and smooth drag overlays.
- ⚡ **Optimistic UI Updates**: State transitions execute immediately on user interaction via Redux Toolkit, keeping the UI instantly responsive with automatic rollback on network failure.
- 🧮 **O(1) Fractional Positioning**: Insert or reorder items with zero re-indexing overhead using middle-point mathematics `(prev + next) / 2` with auto-healing reindex fallback.
- 🔐 **JWT Authentication & RBAC**: Secure Bearer Token authentication with granular role-based authorization (`OWNER` vs. `MEMBER`).
- 👥 **Team Workspaces & Board Sharing**: Invite teammates to boards via email with instant access to board state.
- 🛡️ **Race Condition Prevention**: All move operations execute within PostgreSQL `prisma.$transaction` blocks with cross-board movement validation.
- 📖 **Interactive OpenAPI (Swagger) Documentation**: Complete, interactive REST API explorer available at `/api/docs`.
- 🐳 **Production-Ready Containerization**: Multi-container Docker Compose setup with health checks and volume persistence.

---

## 🏗 System Architecture

```mermaid
flowchart TD
    subgraph Client ["Frontend (Next.js 16 App Router)"]
        UI["React 19 UI + Tailwind CSS v4"]
        DND["@dnd-kit Drag-and-Drop Context"]
        Store["Redux Toolkit (authSlice & boardSlice)"]
        AxiosClient["Axios HTTP Client (Bearer JWT)"]

        UI <--> DND
        UI <--> Store
        Store <--> AxiosClient
    end

    subgraph Gateway ["API Layer (NestJS 12)"]
        Prefix["Global Prefix: /api"]
        Cors["CORS & ValidationPipe"]
        AuthG["JwtAuthGuard"]
        AccessG["BoardAccessGuard (Resource Traversal)"]

        Prefix --> Cors --> AuthG --> AccessG
    end

    subgraph Controllers ["NestJS Controllers & Services"]
        AuthCtrl["AuthController (/api/auth)"]
        BoardCtrl["BoardsController (/api/boards)"]
        ColCtrl["ColumnsController (/api/columns)"]
        TaskCtrl["TasksController (/api/tasks)"]
        UserCtrl["UsersController (/api/users)"]

        AccessG --> AuthCtrl
        AccessG --> BoardCtrl
        AccessG --> ColCtrl
        AccessG --> TaskCtrl
        AccessG --> UserCtrl
    end

    subgraph DataLayer ["Data & Persistence"]
        Prisma["Prisma ORM Client 7.x"]
        PG[("PostgreSQL 16 Database")]

        BoardCtrl --> Prisma
        ColCtrl --> Prisma
        TaskCtrl --> Prisma
        UserCtrl --> Prisma
        Prisma <--> PG
    end

    AxiosClient -- "REST HTTPS Requests" --> Prefix
```

---

## 🗄 Database Schema (ERD)

```mermaid
erDiagram
    User ||--o{ Board : "owns (BoardOwner)"
    User ||--o{ BoardMember : "belongs to"
    Board ||--o{ BoardMember : "has members"
    Board ||--o{ Column : "contains"
    Column ||--o{ Task : "holds"

    User {
        String id PK "UUID"
        String email UK "unique index"
        String passwordHash "bcrypt"
        String name
        DateTime createdAt
        DateTime updatedAt
    }

    Board {
        String id PK "UUID"
        String title
        String ownerId FK "references User.id (Cascade)"
        DateTime createdAt
        DateTime updatedAt
    }

    BoardMember {
        String id PK "UUID"
        String boardId FK "references Board.id (Cascade)"
        String userId FK "references User.id (Cascade)"
        BoardRole role "OWNER | MEMBER"
        DateTime createdAt
    }

    Column {
        String id PK "UUID"
        String boardId FK "references Board.id (Cascade)"
        String title
        Float position "Indexed ordering"
        DateTime createdAt
        DateTime updatedAt
    }

    Task {
        String id PK "UUID"
        String columnId FK "references Column.id (Cascade)"
        String title
        String description "nullable"
        Float position "Indexed ordering"
        DateTime createdAt
        DateTime updatedAt
    }
```

---

## 🛠 Tech Stack

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | [Next.js](https://nextjs.org/) | `16.3.4` | React Server Components & App Router |
| **Frontend UI Library** | [React](https://react.dev/) | `19.2.8` | Declarative UI rendering |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | `^4.0.0` | Modern, high-performance styling engine |
| **State Management** | [Redux Toolkit](https://redux-toolkit.js.org/) | `^2.12.0` | Global state, optimistic updates & session hydration |
| **Drag and Drop** | [@dnd-kit](https://dndkit.com/) | `^6.3.1` | Accessible, touch-enabled drag-and-drop primitives |
| **Backend Framework** | [NestJS](https://nestjs.com/) | `12.0.1` | Modular, scalable Node.js enterprise backend |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | `5.x / 6.x` | End-to-end type safety |
| **Database** | [PostgreSQL](https://www.postgresql.org/) | `16-alpine` | ACID-compliant relational database |
| **ORM** | [Prisma](https://www.prisma.io/) | `^7.10.0` | Type-safe schema, migrations, and queries |
| **Authentication** | Passport.js & JWT | `^0.7.0` | Stateless token-based authentication |
| **API Documentation** | Swagger / OpenAPI | `12.0.1` | Automated documentation & interactive UI |
| **Containerization** | Docker & Docker Compose | `3.8` | Multi-service local & production deployment |
| **Testing** | Vitest | `^4.1.2` | Fast ESM-native unit and integration tests |

---

## 📂 Project Structure

```
mini-kanban-board/
├── backend/                        # NestJS REST API Server
│   ├── prisma/
│   │   └── schema.prisma           # Prisma data models & relations
│   ├── src/
│   │   ├── auth/                   # JWT Auth module, strategies & guards
│   │   ├── boards/                 # Board CRUD & member management
│   │   ├── columns/                # Column CRUD & column reordering
│   │   ├── tasks/                  # Task CRUD & fractional move logic
│   │   ├── users/                  # User profile module
│   │   ├── common/
│   │   │   ├── decorators/         # Custom parameter & metadata decorators
│   │   │   └── guards/             # Unified BoardAccessGuard
│   │   ├── prisma/                 # Prisma client service injection
│   │   ├── app.module.ts           # Root application module
│   │   └── main.ts                 # Bootstrap, CORS, Swagger & ValidationPipe
│   ├── test/                       # E2E test suites
│   ├── Dockerfile                  # Production container recipe
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                       # Next.js 16 App Router Client
│   ├── src/
│   │   ├── app/
│   │   │   ├── boards/             # Board list page
│   │   │   │   └── [id]/           # Individual Kanban board view (DnD Canvas)
│   │   │   ├── login/              # Authentication login screen
│   │   │   ├── register/           # User registration screen
│   │   │   ├── layout.tsx          # Root HTML layout with StoreProvider
│   │   │   └── page.tsx            # Landing & redirection
│   │   ├── components/
│   │   │   ├── ColumnContainer.tsx # Droppable column with sortable task list
│   │   │   └── TaskCard.tsx        # Draggable card item
│   │   ├── lib/
│   │   │   ├── api.ts              # Axios interceptor with token injection
│   │   │   └── types.ts            # Frontend domain TypeScript definitions
│   │   └── store/
│   │       ├── slices/             # Redux slices (authSlice, boardSlice)
│   │       ├── index.ts            # Root store config & typed hooks
│   │       └── provider.tsx        # Client Redux provider wrapper
│   ├── Dockerfile                  # Frontend container recipe
│   ├── package.json
│   └── tailwind.config.js
│
├── docker-compose.yml              # Orchestrates Postgres, Backend, and Frontend
└── README.md                       # Main documentation
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v18.0.0` or higher (Node 20+ recommended)
- **Package Manager**: `pnpm` (recommended) or `npm`
- **Docker & Docker Compose**: (Optional, if using containerized setup)
- **PostgreSQL**: `v14+` (if running locally without Docker)

---

### Option 1: Run with Docker Compose (Recommended)

The fastest way to spin up the entire application (PostgreSQL + Backend + Frontend) with zero manual database configuration:

```bash
# 1. Clone the repository
git clone https://github.com/mjunayed2003/mini-kanban-board.git
cd mini-kanban-board

# 2. Launch all services
docker compose up --build
```

Once built, services will be accessible at:
- 🌐 **Frontend Application**: [http://localhost:3000](http://localhost:3000)
- 🔌 **Backend REST API**: [http://localhost:4000/api](http://localhost:4000/api)
- 📖 **Interactive Swagger UI**: [http://localhost:4000/api/docs](http://localhost:4000/api/docs)
- 🗄 **PostgreSQL Database**: `localhost:5432`

To stop the containers:
```bash
docker compose down
```

---

### Option 2: Manual Local Setup

If you prefer to run services individually for development:

#### 1. Configure Backend

```bash
cd backend

# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env
```

Ensure your `backend/.env` points to a running PostgreSQL instance:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/kanban?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="1d"
PORT=4000
```

Run database migrations and generate the Prisma Client:
```bash
pnpm prisma db push
pnpm prisma generate
```

Start the backend in development mode:
```bash
pnpm run start:dev
# or
npm run dev
```

#### 2. Configure Frontend

In a separate terminal:
```bash
cd frontend

# Install dependencies
pnpm install

# Setup environment variables
cp .env.local.example .env.local
```

Ensure your `frontend/.env.local` points to your backend:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

Start the Next.js development server:
```bash
pnpm run dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

| Variable | Type | Default / Example | Description |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | String | `postgresql://postgres:postgres@localhost:5432/kanban?schema=public` | PostgreSQL connection string |
| `JWT_SECRET` | String | `your-super-secret-jwt-key` | Secret key used for signing JWT tokens |
| `JWT_EXPIRES_IN` | String | `1d` | Expiration window for access tokens |
| `PORT` | Number | `4000` | Port on which the NestJS server listens |

### Frontend (`frontend/.env.local`)

| Variable | Type | Default / Example | Description |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | String | `http://localhost:4000/api` | Base URL for backend REST endpoints |

---

## 📖 API Reference & Documentation

Interactive OpenAPI documentation is generated automatically by NestJS Swagger. Visit `http://localhost:4000/api/docs` to test endpoints directly.

### 🔑 Authentication Module (`/api/auth`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | None | Register a new user (`email`, `password`, `name`) |
| `POST` | `/auth/login` | None | Authenticate user & receive Bearer JWT token |
| `GET` | `/users/me` | Bearer | Fetch authenticated user profile |

### 📋 Boards Module (`/api/boards`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/boards` | Bearer | Create a new board (`title`) |
| `GET` | `/boards` | Bearer | List all boards owned by or shared with current user |
| `GET` | `/boards/:boardId` | Bearer | Fetch full board details including columns, tasks & members |
| `PATCH` | `/boards/:boardId` | Bearer | Update board details (`title`) |
| `DELETE` | `/boards/:boardId` | Bearer | Delete a board (cascades to columns & tasks) |
| `POST` | `/boards/:boardId/members` | Bearer | Add member to board by email (`email`, `role`) |
| `DELETE` | `/boards/:boardId/members/:userId` | Bearer | Remove member from board |

### 📑 Columns Module (`/api/columns`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/columns` | Bearer | Create a new column in board (`boardId`, `title`) |
| `GET` | `/columns/board/:boardId` | Bearer | Get all columns for a specific board |
| `PATCH` | `/columns/reorder` | Bearer | Reorder multiple columns by updating positions |
| `PATCH` | `/columns/:columnId` | Bearer | Update column title |
| `DELETE` | `/columns/:columnId` | Bearer | Delete column (cascades to child tasks) |

### 📌 Tasks Module (`/api/tasks`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/tasks` | Bearer | Create task (`columnId`, `title`, `description`) |
| `GET` | `/tasks/column/:columnId` | Bearer | Retrieve all tasks in a column ordered by `position ASC` |
| `PATCH` | `/tasks/:taskId` | Bearer | Update task title and/or description |
| `DELETE` | `/tasks/:taskId` | Bearer | Delete a task |
| `POST` | `/tasks/:taskId/move` | Bearer | Move task across columns or reorder with fractional indexing |

---

## 💡 Core Engineering Highlights

### 1. O(1) Fractional Positioning Algorithm

Traditional position management updates every sibling index (`position = position + 1`), triggering expensive $O(N)$ writes across database tables.

This project implements **Fractional Indexing** (`Float` positions):
- New items are assigned with an initial gap: `last.position + 1000`.
- Inserting a task between two items calculates the midpoint:
  $$\text{newPosition} = \frac{\text{position}_{\text{before}} + \text{position}_{\text{after}}}{2}$$
- **Precision Safeguard (Auto-Reindexing)**: When repeated moves cause the gap between neighbors to drop below `MIN_GAP = 1`, the backend automatically runs `reindexColumn()` inside the transaction, resetting siblings back to clean multiples of `1000` (`1000, 2000, 3000...`) and recomputing.

```typescript
// backend/src/tasks/tasks.service.ts
private calculatePosition(
  before: { position: number } | null,
  after: { position: number } | null,
): number {
  if (before && after) return (before.position + after.position) / 2;
  if (before && !after) return before.position + POSITION_GAP;
  if (!before && after) return after.position / 2;
  return POSITION_GAP; // Empty column fallback
}
```

### 2. Hierarchical BoardAccessGuard

Rather than duplicating permission checks in every controller, a custom `@ResourceType('board' | 'column' | 'task')` decorator paired with `BoardAccessGuard` performs hierarchical security checks:
1. Automatically discovers the target resource ID from route params (`:boardId`, `:columnId`, `:taskId`) or request body.
2. Traverses upward through database relations to resolve the parent `Board`.
3. Verifies that the authenticated `req.user.id` is either the board owner or an authorized member.
4. Forbids unauthorized reads, mutations, and cross-tenant leakage.

### 3. Concurrent Move Transaction Safety

When moving tasks between columns:
- The entire operation runs inside `prisma.$transaction`.
- Validates that target column and source task belong to the **exact same board** to prevent cross-board tampering:
  ```typescript
  if (targetColumn.boardId !== task.column.boardId) {
    throw new ForbiddenException('Cannot move task to a different board');
  }
  ```
- Prevents dirty reads and index collision under concurrent drag events.

### 4. Optimistic UI Updates via Redux Toolkit

The frontend doesn't wait for network roundtrips to reflect card movements:
1. When `@dnd-kit` fires `onDragEnd`, `page.tsx` computes the target index and slices the local Redux state immediately.
2. The user sees an instantaneous 60fps drag completion.
3. The background thunk `moveTask` dispatches the HTTP `POST /api/tasks/:id/move`.
4. If the server request fails, the board state is seamlessly resynchronized with the backend.

---

## 🧪 Testing & Quality Assurance

The backend includes comprehensive test suites powered by [Vitest](https://vitest.dev/):

```bash
cd backend

# Run unit test suites
pnpm run test

# Run tests in watch mode
pnpm run test:watch

# Generate code coverage report
pnpm run test:cov

# Run E2E tests
pnpm run test:e2e

# Run linter (Oxlint)
pnpm run lint
```

---

## 📋 Available Scripts

### Root Directory
| Command | Description |
| :--- | :--- |
| `docker compose up --build` | Builds and starts Postgres, Backend, and Frontend containers |
| `docker compose down` | Stops and removes all running containers and networks |

### Backend (`/backend`)
| Command | Description |
| :--- | :--- |
| `pnpm run dev` / `pnpm run start:dev` | Start NestJS in watch mode |
| `pnpm run build` | Compile TypeScript into production JavaScript |
| `pnpm run start:prod` | Run the compiled production server |
| `pnpm prisma db push` | Push schema changes directly to PostgreSQL |
| `pnpm prisma generate` | Regenerate Prisma Client types |
| `pnpm run test` | Run test suites via Vitest |
| `pnpm run lint` | Run Oxlint fast linter |

### Frontend (`/frontend`)
| Command | Description |
| :--- | :--- |
| `pnpm run dev` | Start Next.js development server |
| `pnpm run build` | Build optimized production bundle |
| `pnpm run start` | Run Next.js production server |
| `pnpm run lint` | Run ESLint validation |

---

## 🗺 Roadmap & Limitations

- [x] Full Drag-and-Drop Kanban interface
- [x] O(1) Fractional Indexing with auto-reindexing safeguard
- [x] JWT Auth & Role-Based Access Guards
- [x] Redux Toolkit state hydration & optimistic updates
- [x] Docker & Docker Compose setup
- [ ] **Real-time Collaboration**: WebSocket / Server-Sent Events (SSE) integration for live multi-cursor & multi-user updates.
- [ ] **Role Permissions Restriction**: Restrict member invitation/removal exclusively to board `OWNER`.
- [ ] **Rich Task Attributes**: Due dates, color-coded priority labels, checklists, and file attachments.
- [ ] **Audit Activity Stream**: Visual change log detailing who moved, edited, or archived cards.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE). Feel free to use and modify for personal and commercial projects.
