# E-Commerce Backend — Node.js + TypeScript

## 1. Project Overview

Build a production-grade e-commerce backend using:

- Node.js
- TypeScript
- Express.js
- PostgreSQL
- Prisma ORM
- Redis
- BullMQ
- Zod
- JWT
- Argon2
- Pino
- Vitest
- Docker
- GitHub Actions
- OpenAPI / Swagger

The project will begin as a **modular monolith** with clean boundaries so that modules can later be extracted into microservices.

---

# 2. Architecture

```text
                    ┌─────────────────────┐
                    │   React / Next.js   │
                    │      Frontend       │
                    └──────────┬──────────┘
                               │ HTTPS
                               ▼
                    ┌─────────────────────┐
                    │    API Layer        │
                    │   Express + TS      │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
        ┌──────────┐      ┌──────────┐    ┌──────────┐
        │  Auth    │      │ Products │    │  Orders  │
        │  Module  │      │  Module  │    │  Module  │
        └──────────┘      └──────────┘    └──────────┘
              │                │                │
              └────────────────┼────────────────┘
                               ▼
                       ┌───────────────┐
                       │  PostgreSQL   │
                       │    Prisma     │
                       └───────────────┘
                               │
             ┌─────────────────┼────────────────┐
             ▼                 ▼                ▼
          Redis            S3/Cloudinary     Payment
          Cache            Product Images     Gateway

                         ┌───────────┐
                         │   Queue   │
                         │ BullMQ    │
                         └─────┬─────┘
                               │
                ┌──────────────┼─────────────┐
                ▼              ▼             ▼
             Email         Inventory      Notifications
```

## Architecture Principles

1. Start with a modular monolith.
2. Keep business logic out of controllers.
3. Keep modules independently organized.
4. Validate all external input.
5. Use database transactions for atomic business operations.
6. Use idempotency for payment/order operations.
7. Use background jobs for slow asynchronous work.
8. Design for observability from the beginning.
9. Secure every API endpoint.
10. Keep the architecture ready for future microservice extraction.

---

# 3. Technology Stack

| Layer | Technology |
|---|---|
| Language | TypeScript |
| Runtime | Node.js |
| Framework | Express.js |
| Database | PostgreSQL |
| ORM | Prisma |
| Cache | Redis |
| Validation | Zod |
| Authentication | JWT + Refresh Tokens |
| Password Hashing | Argon2 |
| Logging | Pino |
| API Documentation | OpenAPI / Swagger |
| Testing | Vitest |
| HTTP Testing | Supertest |
| Queue | BullMQ |
| Images | S3 / Cloudinary |
| Payments | Razorpay / Stripe |
| Containers | Docker |
| Reverse Proxy | Nginx |
| CI/CD | GitHub Actions |
| Observability | OpenTelemetry + Metrics/Logs |

---

# 4. Core Modules

## Customer Modules

- Authentication
- Users
- Addresses
- Products
- Categories
- Brands
- Cart
- Wishlist
- Orders
- Payments
- Inventory
- Coupons
- Reviews
- Notifications

## Admin Modules

- Admin authentication/authorization
- Product management
- Category management
- User management
- Order management
- Inventory management
- Coupon management
- Reports
- Audit logs

---

# 5. Authentication

## APIs

```text
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
GET    /api/v1/auth/me
```

## Authentication Strategy

Use:

```text
Access Token
+
Refresh Token
```

Recommended initial lifetime:

```text
Access Token  → ~15 minutes
Refresh Token → 7–30 days
```

Implement:

- Password hashing with Argon2
- JWT access tokens
- Refresh-token rotation
- Refresh-token revocation
- Password reset
- Logout
- Account validation
- Role-based authorization

Roles:

```text
CUSTOMER
ADMIN
MANAGER
SUPER_ADMIN
```

---

# 6. User APIs

```text
GET    /api/v1/users/me
PATCH  /api/v1/users/me
DELETE /api/v1/users/me
```

Address APIs:

```text
GET    /api/v1/addresses
POST   /api/v1/addresses
GET    /api/v1/addresses/:id
PATCH  /api/v1/addresses/:id
DELETE /api/v1/addresses/:id
```

---

# 7. Product System

Products should support variants instead of putting all product data directly on the product.

```text
Product
 ├── Category
 ├── Brand
 ├── Images
 └── Variants
       ├── SKU
       ├── Price
       ├── Stock
       ├── Color
       ├── Size
       └── Weight
```

Example:

```text
Nike Air Max

AIRMAX-BLK-8
    Color: Black
    Size: 8
    Price: ₹9,999
    Stock: 20

AIRMAX-BLK-9
    Color: Black
    Size: 9
    Price: ₹9,999
    Stock: 15

AIRMAX-WHT-8
    Color: White
    Size: 8
    Price: ₹10,499
    Stock: 8
```

## Product APIs

```text
GET    /api/v1/products
POST   /api/v1/products
GET    /api/v1/products/:id
PATCH  /api/v1/products/:id
DELETE /api/v1/products/:id
```

## Product Filtering

Example:

```text
GET /api/v1/products?
category=shoes
&brand=nike
&minPrice=5000
&maxPrice=15000
&color=black
&size=9
&sort=price_asc
&page=1
&limit=20
```

Support:

- Pagination
- Filtering
- Sorting
- Search
- Category filtering
- Brand filtering
- Price range
- Variant attributes
- Availability

---

# 8. Categories

Support nested categories.

```text
Electronics
 ├── Mobiles
 │    ├── Android
 │    └── iPhone
 ├── Laptops
 └── Accessories
```

APIs:

```text
GET    /api/v1/categories
POST   /api/v1/categories
GET    /api/v1/categories/:id
PATCH  /api/v1/categories/:id
DELETE /api/v1/categories/:id
```

---

# 9. Cart

## APIs

```text
GET    /api/v1/cart
POST   /api/v1/cart/items
PATCH  /api/v1/cart/items/:itemId
DELETE /api/v1/cart/items/:itemId
DELETE /api/v1/cart
```

Cart item:

```json
{
  "variantId": "variant_123",
  "quantity": 2
}
```

Important:

> Cart stock is not the same as reserved stock.

Inventory should normally be reserved during checkout rather than merely when an item is added to a cart.

---

# 10. Wishlist

```text
GET    /api/v1/wishlist
POST   /api/v1/wishlist/:productId
DELETE /api/v1/wishlist/:productId
```

---

# 11. Inventory

Maintain at least:

```text
availableStock
reservedStock
soldStock
```

Example:

```text
Initial:
available = 100
reserved  = 0
sold      = 0

Checkout reservation:
available = 95
reserved  = 5
sold      = 0

Payment succeeds:
available = 95
reserved  = 0
sold      = 5

Payment expires:
available = 100
reserved  = 0
sold      = 0
```

## Inventory Concepts

- Stock reservation
- Reservation expiration
- Inventory movement history
- Concurrency control
- Transactions
- Idempotent inventory operations
- Low-stock alerts

---

# 12. Orders

## APIs

```text
POST   /api/v1/orders
GET    /api/v1/orders
GET    /api/v1/orders/:id
POST   /api/v1/orders/:id/cancel
```

## Order Lifecycle

```text
PENDING
   ↓
CONFIRMED
   ↓
PROCESSING
   ↓
SHIPPED
   ↓
DELIVERED
```

Cancellation:

```text
PENDING → CANCELLED
```

Returns/refunds:

```text
DELIVERED
   ↓
RETURN_REQUESTED
   ↓
RETURNED
   ↓
REFUNDED
```

---

# 13. Order Data Snapshots

Never depend on the current product price or current address for historical orders.

Example:

```text
Today:
iPhone = ₹80,000

Customer purchases it.

Tomorrow:
iPhone = ₹75,000
```

The old order must still show:

```text
Purchased price = ₹80,000
```

Therefore `OrderItem` should contain a snapshot:

```text
productName
sku
unitPrice
quantity
discount
tax
total
```

The order should also store an address snapshot.

This preserves historical correctness.

---

# 14. Payment Architecture

Payment processing must account for:

- Gateway failures
- Network retries
- Duplicate webhooks
- Payment expiration
- Refunds
- Signature verification
- Idempotency

Flow:

```text
Customer
   ↓
Create Order
   ↓
Create Payment
   ↓
Payment Gateway
   ↓
Webhook
   ↓
Verify Signature
   ↓
Update Payment
   ↓
Confirm Order
```

## APIs

```text
POST /api/v1/payments/create
GET  /api/v1/payments/:id
POST /api/v1/payments/webhook
```

## Idempotency

Client sends:

```http
Idempotency-Key: unique-request-id
```

Server stores the result associated with that key.

Repeated requests with the same key should not create duplicate orders or payments.

---

# 15. Coupon System

APIs:

```text
POST   /api/v1/coupons
GET    /api/v1/coupons
PATCH  /api/v1/coupons/:id
DELETE /api/v1/coupons/:id

POST   /api/v1/cart/apply-coupon
DELETE /api/v1/cart/coupon
```

Support:

- Percentage discount
- Fixed discount
- Minimum order value
- Maximum discount
- Expiration
- Usage limit
- Per-user limit
- Product-specific coupons
- Category-specific coupons

Example:

```text
SAVE20

20% OFF
Maximum discount: ₹1,000
Minimum order: ₹2,000
Valid until: 30 Aug 2026
```

---

# 16. Reviews

APIs:

```text
GET    /api/v1/products/:id/reviews
POST   /api/v1/products/:id/reviews
PATCH  /api/v1/reviews/:id
DELETE /api/v1/reviews/:id
```

Rules:

- Only authenticated users can review.
- Only users who purchased the product can create verified reviews.
- A user should not be able to review arbitrary products.
- Validate rating and content.
- Support moderation if needed.

---

# 17. Admin APIs

```text
/api/v1/admin/products
/api/v1/admin/orders
/api/v1/admin/users
/api/v1/admin/categories
/api/v1/admin/inventory
/api/v1/admin/coupons
/api/v1/admin/reports
```

Admin authorization must include both:

```text
Authentication
+
Authorization
```

Do not assume that knowing an object's ID grants access to it.

---

# 18. Database Design

Core tables:

```text
users
roles
permissions

addresses

products
product_variants
product_images

categories
brands

carts
cart_items

wishlists
wishlist_items

orders
order_items

payments
payment_transactions

inventory
inventory_movements

coupons
coupon_usages

reviews

notifications

refresh_tokens

audit_logs
```

Future tables:

```text
shipments
returns
refunds
search_index
recommendations
```

---

# 19. Important Relationships

```text
User
 │
 ├── Addresses
 ├── Cart
 │    └── CartItems
 │          └── ProductVariant
 ├── Orders
 │    └── OrderItems
 │          └── ProductVariant
 ├── Wishlist
 └── Reviews
```

Product:

```text
Product
 │
 ├── Category
 ├── Brand
 ├── Images
 └── Variants
       └── Inventory
```

Order:

```text
Order
 │
 ├── User
 ├── Address Snapshot
 ├── OrderItems
 ├── Payment
 └── Shipment
```

---

# 20. Project Structure

```text
src/
│
├── app.ts
├── server.ts
│
├── config/
│   ├── env.ts
│   ├── database.ts
│   ├── redis.ts
│   └── logger.ts
│
├── common/
│   ├── errors/
│   ├── middleware/
│   ├── types/
│   ├── utils/
│   ├── constants/
│   └── validators/
│
├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.repository.ts
│   │   ├── auth.routes.ts
│   │   ├── auth.schema.ts
│   │   └── auth.types.ts
│   │
│   ├── users/
│   ├── products/
│   ├── categories/
│   ├── cart/
│   ├── wishlist/
│   ├── orders/
│   ├── payments/
│   ├── inventory/
│   ├── coupons/
│   ├── reviews/
│   └── admin/
│
├── jobs/
│   ├── email.job.ts
│   ├── inventory.job.ts
│   └── notification.job.ts
│
├── db/
│   ├── prisma.ts
│   └── seed.ts
│
└── docs/
    └── openapi.yaml
```

---

# 21. Request Flow

Every API request should follow:

```text
HTTP Request
     ↓
Router
     ↓
Middleware
     ↓
Authentication
     ↓
Authorization
     ↓
Validation
     ↓
Controller
     ↓
Service
     ↓
Repository / Prisma
     ↓
PostgreSQL
     ↓
Service
     ↓
Controller
     ↓
HTTP Response
```

## Responsibilities

### Router

Defines endpoints.

### Middleware

Handles cross-cutting concerns.

### Controller

Handles HTTP input/output.

### Service

Contains business logic.

### Repository

Handles data-access concerns.

### Database

Stores persistent data.

---

# 22. Error Handling

Create application errors:

```text
AppError
 ├── BadRequestError
 ├── UnauthorizedError
 ├── ForbiddenError
 ├── NotFoundError
 ├── ConflictError
 └── ValidationError
```

Use centralized error middleware.

Example response:

```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Product not found"
  },
  "requestId": "req_123"
}
```

Avoid duplicating `try/catch` error responses across every controller.

---

# 23. API Response Standard

Success:

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request"
  }
}
```

Pagination:

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 120,
    "totalPages": 6
  }
}
```

Use consistent error codes and request IDs.

---

# 24. Validation

Use Zod at the API boundary.

Validate:

```text
body
params
query
headers
```

Flow:

```text
HTTP input
   ↓
Zod validation
   ↓
Type-safe input
   ↓
Service
```

Never depend on frontend validation for security.

---

# 25. Redis

Potential Redis use cases:

```text
Product caching
Rate limiting
Temporary checkout state
OTP / short-lived tokens
Distributed locks
BullMQ
Frequently accessed read models
```

Typical cache flow:

```text
GET /products/123
        ↓
      Redis
     /     \
   HIT     MISS
    ↓        ↓
 response  PostgreSQL
              ↓
            Redis
              ↓
           response
```

Do not cache everything.

Cache data that is frequently read, relatively stable, or expensive to calculate.

---

# 26. Background Jobs

Use BullMQ + Redis.

Example:

```text
Order placed
     ↓
HTTP response
     ↓
Queue
 ├── Send confirmation email
 ├── Send notification
 ├── Generate invoice
 └── Update analytics
```

Jobs:

```text
send-order-confirmation
send-shipping-update
send-password-reset
release-expired-reservation
generate-invoice
update-product-search
```

Background jobs should support:

- Retry
- Backoff
- Dead-letter/failure handling
- Idempotency
- Monitoring

---

# 27. Transactions

Example order workflow:

```text
BEGIN TRANSACTION

1. Validate cart
2. Validate product variants
3. Check inventory
4. Reserve inventory
5. Create order
6. Create order items
7. Create payment record
8. Clear cart

COMMIT
```

If a critical operation fails:

```text
ROLLBACK
```

Transactions should be used carefully and kept short.

---

# 28. Security

Follow OWASP API security principles.

Implement:

```text
Helmet
CORS
Rate limiting
Request validation
JWT validation
RBAC
Object-level authorization
Password hashing
Refresh-token rotation
Input sanitization
HTTP security headers
Request size limits
File upload validation
Audit logging
Environment-based secrets
```

Never blindly trust:

```text
req.body
req.params
req.query
req.headers
```

Security must be enforced on the backend.

---

# 29. Authorization

Use:

```text
Authentication
      ↓
Who are you?
      ↓
Authorization
      ↓
What are you allowed to do?
```

Consider:

- Role-based access control
- Resource ownership
- Object-level authorization
- Admin permissions
- Sensitive operation checks

Example:

A user should not be able to access:

```text
GET /api/v1/orders/another-user-order-id
```

just because they know the ID.

---

# 30. Observability

Implement:

```text
Logs
Metrics
Tracing
Health checks
```

Log useful metadata:

```text
requestId
userId
method
route
status
duration
errorCode
```

Example:

```text
INFO
requestId=req_8291
userId=user_123
method=POST
route=/api/v1/orders
status=201
duration=182ms
```

Health endpoints:

```text
GET /health
GET /health/live
GET /health/ready
```

---

# 31. Testing Strategy

## Unit Tests

Test business logic independently:

```text
AuthService
OrderService
InventoryService
CouponService
PricingService
```

## Integration Tests

Test:

```text
API + PostgreSQL
API + Redis
```

## E2E Tests

Critical flow:

```text
Register
 ↓
Login
 ↓
Browse product
 ↓
Add product to cart
 ↓
Checkout
 ↓
Payment
 ↓
Order confirmation
```

Critical business flows should have automated E2E coverage.

---

# 32. Docker

Development stack:

```text
Docker Compose

┌─────────────┐
│ API         │
├─────────────┤
│ PostgreSQL  │
├─────────────┤
│ Redis       │
└─────────────┘
```

Production:

```text
Load Balancer
      ↓
Nginx
      ↓
Node.js Containers
      ↓
PostgreSQL
      ↓
Redis
```

---

# 33. CI/CD

GitHub Actions pipeline:

```text
git push
   ↓
Lint
   ↓
Type check
   ↓
Unit tests
   ↓
Integration tests
   ↓
Build
   ↓
Docker build
   ↓
Security scan
   ↓
Deploy
```

Recommended quality gates:

- TypeScript compilation
- ESLint
- Formatting
- Unit tests
- Integration tests
- Dependency/security checks
- Build verification

---

# 34. API Versioning

Use:

```text
/api/v1
```

Example:

```text
/api/v1/products
/api/v1/orders
/api/v1/users
```

Future breaking API:

```text
/api/v2/products
```

Avoid breaking existing consumers unnecessarily.

---

# 35. API Documentation

Expose OpenAPI/Swagger documentation.

Example:

```text
/api/docs
```

Document:

```text
Authentication
Products
Categories
Cart
Wishlist
Orders
Payments
Inventory
Coupons
Reviews
Admin
```

Documentation should be updated alongside API changes.

---

# 36. Development Phases

## Phase 1 — Foundation

- [x] Initialize Node.js project
- [x] Configure TypeScript
- [x] Configure Express
- [x] Configure ESLint
- [x] Configure Prettier
- [x] Configure environment variables
- [x] Configure Pino
- [x] Create error architecture
- [x] Create project structure

## Phase 2 — Database

- [x] Install PostgreSQL
- [x] Configure Prisma
- [x] Design schema
- [x] Create migrations
- [x] Add indexes
- [x] Create seed data
- [x] Test relationships

## Phase 3 — Authentication

- [x] Register
- [x] Login
- [x] Logout
- [x] Access tokens
- [x] Refresh tokens
- [x] Refresh-token rotation
- [x] Password reset
- [x] RBAC

## Phase 4 — Products

- [x] Products
- [x] Product variants
- [x] Categories
- [x] Brands
- [x] Images
- [x] Pagination
- [x] Filtering
- [x] Sorting
- [x] Search

## Phase 5 — Cart

- [x] Create cart
- [x] Add item
- [x] Update quantity
- [x] Remove item
- [x] Clear cart
- [x] Calculate totals
- [x] Apply coupon

## Phase 6 — Inventory

- [x] Stock model
- [x] Inventory movements
- [x] Stock reservation
- [x] Reservation expiration
- [x] Concurrency control
- [x] Transactions
- [x] Low-stock alerts

## Phase 7 — Orders

- [x] Checkout
- [x] Order creation
- [x] Order items
- [x] Product snapshots
- [x] Address snapshots
- [x] Order status
- [x] Cancellation

## Phase 8 — Payments

- [x] Payment gateway integration
- [x] Payment intent/order
- [x] Payment verification
- [x] Webhook
- [x] Signature verification
- [x] Idempotency
- [x] Refunds

## Phase 9 — Async Architecture

- [x] Redis
- [x] BullMQ
- [x] Email jobs
- [x] Notification jobs
- [x] Invoice jobs
- [x] Inventory expiration jobs

## Phase 10 — Admin

- [x] Admin authentication
- [x] Product management
- [x] Order management
- [x] User management
- [x] Inventory management
- [x] Coupon management
- [x] Reports
- [x] Audit logs

## Phase 11 — Testing

- [x] Unit tests
- [x] Integration tests
- [x] E2E tests
- [x] Load testing
- [x] Security testing
- [x] Failure testing

## Phase 12 — Production

- [x] Docker
- [x] Docker Compose
- [x] Nginx
- [x] CI/CD
- [x] Logging
- [x] Metrics
- [x] Tracing
- [x] Health checks
- [x] Database backups
- [x] Deployment
- [x] Production configuration

---

# 37. Advanced Features

After the MVP:

```text
Full-text product search
OpenSearch / Elasticsearch

Recommendation engine
Recently viewed products

Product analytics

Abandoned cart recovery

Flash sales

Inventory reservation

Distributed locking

Kafka

Event-driven architecture

Microservices

API Gateway

Search service

Payment service

Notification service
```

Possible future architecture:

```text
                    API Gateway
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
   Auth Service    Product Service   Order Service
        │                │                │
        ▼                ▼                ▼
    PostgreSQL       PostgreSQL       PostgreSQL

                         │
                         ▼
                       Kafka
                    /    |     \
                   /     |      \
                  ▼      ▼       ▼
             Payment  Inventory Notification
```

Do not start with microservices. First make the modular monolith reliable.

---

# 38. Recommended Git Strategy

```text
main
 │
 └── develop
       │
       ├── feature/auth
       ├── feature/products
       ├── feature/cart
       ├── feature/orders
       ├── feature/payments
       └── feature/inventory
```

Commit examples:

```text
feat(auth): add user registration
feat(auth): add refresh token rotation
feat(products): add product variants
feat(cart): add cart item management
feat(orders): add checkout workflow
fix(inventory): prevent negative stock
test(orders): add checkout integration tests
refactor(auth): extract token service
```

---

# 39. Definition of Done

A feature is not finished just because its API works.

For each module:

```text
[ ] Database model
[ ] Migration
[ ] Validation
[ ] Controller
[ ] Service
[ ] Repository/data access
[ ] Routes
[ ] Authentication/authorization
[ ] Error handling
[ ] Logging
[ ] Unit tests
[ ] Integration tests
[ ] API documentation
[ ] Security review
```

---

# 40. Final Learning Path

This project should progressively teach:

```text
Node.js
   ↓
TypeScript
   ↓
Express
   ↓
REST API
   ↓
PostgreSQL
   ↓
Prisma
   ↓
Database Design
   ↓
Authentication
   ↓
Authorization
   ↓
Transactions
   ↓
Concurrency
   ↓
Redis
   ↓
Queues
   ↓
Payments
   ↓
Testing
   ↓
Docker
   ↓
CI/CD
   ↓
Observability
   ↓
Distributed Systems
   ↓
Microservices
```

---

# 41. Implementation Order

Build the project incrementally in this exact order:

```text
01. Project setup
02. TypeScript configuration
03. Express application
04. Environment configuration
05. PostgreSQL + Prisma
06. Database schema
07. Migration + seed
08. Global error architecture
09. Validation architecture
10. Logger + request IDs
11. Authentication
12. Products
13. Categories
14. Cart
15. Inventory
16. Orders
17. Payments
18. Redis
19. BullMQ
20. Wishlist
21. Coupons
22. Reviews
23. Admin
24. Testing
25. Docker
26. CI/CD
27. Production deployment
28. Performance optimization
29. Security hardening
30. Microservice extraction plan
```

---

# 42. Initial MVP

The first working MVP should contain:

```text
Authentication
Products
Categories
Product variants
Cart
Inventory
Orders
Payments
Admin
```

Then add:

```text
Redis
Queues
Coupons
Wishlist
Reviews
Notifications
Analytics
```

---

# 43. Target Outcome

At the end, the project should behave like a real production backend:

```text
                    E-COMMERCE API
                           │
          ┌────────────────┼────────────────┐
          │                │                │
        Users           Products          Orders
          │                │                │
          │                │                │
       Auth/RBAC        Inventory        Payments
          │                │                │
          └────────────────┼────────────────┘
                           │
                       PostgreSQL
                           │
                    ┌──────┴──────┐
                    │             │
                  Redis        BullMQ
                    │             │
                    │       Background Jobs
                    │
                 Caching
                    │
                    ▼
                 Production
```

The goal is not simply to create CRUD APIs. The goal is to understand **how a production backend handles data consistency, security, concurrency, payments, asynchronous work, failures, observability, testing, and deployment**.
