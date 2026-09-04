# Mini Kanban Board

Full-stack Kanban board with board sharing, drag-and-drop task management, position-based ordering, and Redux Toolkit state management.

## Tech Stack
- **Backend**: NestJS, PostgreSQL, Prisma, Swagger
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, Redux Toolkit, @dnd-kit
- **Auth**: JWT (Bearer token)

## Local Setup

### Prerequisites
- Node.js 18+
- Docker & Docker Compose

### 1. Clone & environment variables

Backend `.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/kanban?schema=public"
JWT_SECRET="your-super-secret-key-change-this-in-production"
PORT=4000
```

Frontend `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### 2. Run with Docker (recommended)
```bash
docker compose up --build
```
This starts PostgreSQL, the backend (port 4000), and the frontend (port 3000).

### 3. Manual setup (without Docker)
```bash
# Backend
cd backend
pnpm install
pnpm prisma db push
pnpm prisma generate
pnpm run start:dev

# Frontend
cd frontend
pnpm install
pnpm run dev
```

### 4. API Docs
Swagger UI available at: `http://localhost:4000/api/docs`

## Key Design Decisions
- **Fractional positioning**: Column/Task `position` is a `Float`. Moving a task between two siblings computes `(prev + next) / 2`, avoiding a full re-index on every move. When the gap becomes too small, the affected column is automatically re-indexed.
- **BoardAccessGuard**: a single reusable guard resolves board/column/task IDs (from route params or request body) up to the parent board, and checks owner/member access — reused across Boards, Columns, and Tasks modules.
- **Move API transaction**: `POST /tasks/:id/move` runs inside `prisma.$transaction` to avoid race conditions when multiple users drag tasks concurrently.
- **Redux Toolkit State Management**: The frontend handles session hydration, board caching, and optimistic drag-and-drop updates cleanly through centralized slices (`authSlice` and `boardSlice`).

## Known Limitations / Future Improvements
- Member management (add/remove) is currently allowed for any board member, not restricted to OWNER only.
- No WebSocket real-time sync yet — board state refreshes via REST polling/refetch.
