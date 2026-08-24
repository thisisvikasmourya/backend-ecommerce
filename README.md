# Production E-Commerce Backend (Node.js + TypeScript)

A production-grade, modular monolith e-commerce backend built with Node.js, Express, TypeScript, PostgreSQL, Prisma, Redis, and BullMQ.

## Architecture

- **Pattern**: Modular Monolith with layered architecture (`Routes` -> `Middleware` -> `Controller` -> `Service` -> `Repository` -> `Database`).
- **Data Persistence**: PostgreSQL with Prisma ORM.
- **Caching & Queues**: Redis & BullMQ for asynchronous workloads.
- **Validation**: Zod schema validation at API boundaries.
- **Authentication**: JWT (Access Token + Refresh Token Rotation) with Argon2 password hashing.
- **Observability**: Pino structured JSON logger with request correlation IDs.

## Project Structure

```text
src/
├── app.ts                  # Express application setup
├── server.ts               # Server bootstrap & graceful shutdown
├── config/                 # Environment, database, redis, and logger config
├── common/                 # Shared utilities, errors, middlewares, and types
├── modules/                # Feature domain modules
│   ├── auth/
│   ├── users/
│   ├── addresses/
│   ├── products/
│   ├── categories/
│   ├── brands/
│   ├── cart/
│   ├── wishlist/
│   ├── orders/
│   ├── payments/
│   ├── inventory/
│   ├── coupons/
│   ├── reviews/
│   ├── admin/
│   └── health/
├── jobs/                   # BullMQ background workers and queues
├── db/                     # Prisma seed and DB helpers
└── docs/                   # OpenAPI / Swagger specification
```

## Getting Started

### 1. Prerequisites
- Node.js >= 20.0.0
- Docker and Docker Compose

### 2. Setup Environment
```bash
cp .env.example .env
```

### 3. Start Database & Redis
```bash
docker compose up -d
```

### 4. Install Dependencies & Generate Prisma Client
```bash
npm install
npm run prisma:generate
```

### 5. Run Database Migrations & Seeds
```bash
npm run prisma:migrate
npm run prisma:seed
```

### 6. Start Development Server
```bash
npm run dev
```
