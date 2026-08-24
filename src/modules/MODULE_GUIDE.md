# Module Practice Guide

Follow the modular monolith architecture pattern established in `auth/` and `users/`:

Each module should contain:
1. `[module].types.ts` - TypeScript interfaces and domain types
2. `[module].schema.ts` - Zod validation schemas for request body, query, and params
3. `[module].repository.ts` - Data access layer using Prisma client
4. `[module].service.ts` - Business logic layer, domain error handling, and transaction management
5. `[module].controller.ts` - HTTP request handler translating DTOs and calling services
6. `[module].routes.ts` - Express router registering middlewares (auth, rbac, validate) and controller actions
7. Register the router in `src/modules/routes.ts`
