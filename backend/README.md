# 🛠️ Mini Kanban Board — Backend Service

The core REST API and business logic engine for the Mini Kanban Board, built with **NestJS 12**, **Prisma 7**, and **PostgreSQL 16**.

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
pnpm install
# or
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```
Ensure your `DATABASE_URL` and `JWT_SECRET` are correctly set:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/kanban?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="1d"
PORT=5000
```

### 3. Database Push & Prisma Generation
```bash
pnpm prisma db push
pnpm prisma generate
```

### 4. Run Development Server
```bash
# Both 'dev' and 'start:dev' are supported
pnpm run dev
# or
npm run dev
# or
pnpm run start:dev
```

Server will be running at `http://localhost:5000` (or your configured `PORT`).

---

## 📚 API Documentation (Swagger)

Interactive Swagger / OpenAPI docs are available at:
👉 **`http://localhost:5000/api/docs`** (or `http://localhost:4000/api/docs` in Docker)

> [!TIP]
> **First Step**: Go to `POST /api/auth/register` in Swagger to create your first user account, copy the returned `accessToken`, and use Swagger's **Authorize** button to test authenticated routes!

---

## 🏗️ Modules Architecture

- **`src/auth/`**: User registration, login, JWT issuance, and Passport JWT strategy.
- **`src/users/`**: User profiles and authentication identity resolution.
- **`src/boards/`**: Board creation, listing, sharing, member invitation/revocation.
- **`src/columns/`**: Column management and reordering.
- **`src/tasks/`**: Task lifecycle and **Fractional Indexing** drag-and-drop movement.
- **`src/common/guards/`**: `BoardAccessGuard` verifying resource hierarchy (`Task -> Column -> Board`) and access rights.

---

## 🧪 Testing

```bash
# Unit tests
pnpm run test

# Watch mode
pnpm run test:watch

# Test coverage
pnpm run test:cov

# E2E tests
pnpm run test:e2e

# Linting
pnpm run lint
```

For full documentation and Docker setup, please refer to the [Root README.md](../README.md).
