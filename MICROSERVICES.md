# Kerala Vedics — Microservice Architecture

## Overview

This project uses a **pnpm monorepo** structure where the Next.js website lives at the root and each backend domain is a separate **Cloudflare Worker** using **Hono**.

## Architecture Diagram

```
                    ┌─────────────────────────┐
                    │   keralavedics.com       │
                    │   Next.js (Root)         │
                    │   Cloudflare Worker      │
                    └──────────┬──────────────┘
                               │ calls API Gateway
                               ▼
                    ┌─────────────────────────┐
                    │   api.keralavedics.com  │
                    │   API Gateway           │
                    │   :8000 (dev)           │
                    └──┬────┬────┬────┬───┬──┘
                       │    │    │    │   │ (Service Bindings)
          ┌────────────┘    │    │    │   └────────────────┐
          ▼                 ▼    ▼    ▼                    ▼
  ┌──────────────┐  ┌──────────┐  ┌───────────┐  ┌────────────────┐
  │ auth-service │  │ product  │  │  order    │  │notification    │
  │    :8001     │  │ service  │  │  service  │  │ service        │
  │              │  │  :8002   │  │  :8004    │  │   :8006        │
  └──────────────┘  └──────────┘  └───────────┘  └────────────────┘
                         ┌──────────────────┐
                         │  customer-service│  doctor-service
                         │     :8003        │     :8005
                         └──────────────────┘
```

## Services

| Service | Worker Name | Dev Port | Prod Domain |
|---|---|---|---|
| **Website** (Next.js) | `kerala-vedics` | 3000 | `keralavedics.com` |
| **API Gateway** | `kerala-vedics-gateway` | 8000 | `api.keralavedics.com` |
| **Auth Service** | `kerala-vedics-auth` | 8001 | Internal |
| **Product Service** | `kerala-vedics-products` | 8002 | Internal |
| **Customer Service** | `kerala-vedics-customers` | 8003 | Internal |
| **Order Service** | `kerala-vedics-orders` | 8004 | Internal |
| **Doctor Service** | `kerala-vedics-doctors` | 8005 | Internal |
| **Notification Service** | `kerala-vedics-notifications` | 8006 | Internal |

## File Structure

```
kerala-vedics-website/
├── src/                          ← Next.js app (website)
│   └── app/api/                  ← Thin proxy routes → API Gateway
├── packages/
│   ├── shared/                   ← Shared types + utils
│   ├── api-gateway/              ← Hono router → routes to services
│   ├── auth-service/             ← Register, Login, OTP
│   ├── product-service/          ← Product catalog
│   ├── customer-service/         ← Profiles, Addresses, Wishlist
│   ├── order-service/            ← Orders, Coupons
│   ├── doctor-service/           ← Doctors, Appointments, Prescriptions
│   └── notification-service/     ← Emails (OTP, orders, appointments)
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

## Local Development

### Run a single service
```bash
# Auth service
npm run auth:dev

# Product service  
npm run products:dev

# Doctor service
npm run doctors:dev

# etc...
```

### Run all services at once
```bash
# Install pnpm globally first
npm install -g pnpm turbo

# Install all dependencies
pnpm install

# Run all services in parallel
npm run services:dev

# Run website (Next.js)
npm run dev
```

## API Routes

### Auth Service (`/auth/*`)
| Method | Path | Description |
|---|---|---|
| `POST` | `/auth/send-otp` | Send OTP to email |
| `POST` | `/auth/register` | Create new account |
| `POST` | `/auth/login` | Login with email+password |
| `GET` | `/auth/user/:id` | Get user by ID |
| `PATCH` | `/auth/user/:id/role` | Update user role |

### Product Service (`/products/*`)
| Method | Path | Description |
|---|---|---|
| `GET` | `/products` | List all products (filter: `?category=&dosha=`) |
| `GET` | `/products/:slug` | Get single product |
| `POST` | `/products` | Create product (admin) |
| `PUT` | `/products/:id` | Update product (admin) |
| `DELETE` | `/products/:id` | Delete product (admin) |

### Customer Service (`/customers/*`)
| Method | Path | Description |
|---|---|---|
| `GET` | `/customers/:id/profile` | Get customer profile |
| `GET` | `/customers/:id/addresses` | List addresses |
| `POST` | `/customers/:id/addresses` | Add address |
| `DELETE` | `/customers/:id/addresses/:addrId` | Delete address |
| `GET` | `/customers/:id/wishlist` | List wishlist |
| `POST` | `/customers/:id/wishlist` | Toggle wishlist item |

### Order Service (`/orders/*, /coupons/*`)
| Method | Path | Description |
|---|---|---|
| `GET` | `/orders?userId=` | List orders |
| `POST` | `/orders` | Place new order |
| `PATCH` | `/orders/:id/status` | Update order status |
| `POST` | `/coupons/validate` | Validate coupon |
| `GET` | `/coupons` | List coupons (admin) |
| `POST` | `/coupons` | Create coupon (admin) |

### Doctor Service (`/doctors/*, /appointments/*, /prescriptions/*`)
| Method | Path | Description |
|---|---|---|
| `GET` | `/doctors` | List approved doctors |
| `GET` | `/doctors/:id` | Get doctor profile |
| `POST` | `/doctors` | Register as doctor |
| `PATCH` | `/doctors/:id/verify` | Admin verify doctor |
| `GET` | `/doctors/:id/schedules` | Get availability |
| `POST` | `/doctors/:id/schedules` | Set availability |
| `GET` | `/doctors/:id/slots?date=` | Get available slots |
| `GET` | `/appointments` | List appointments |
| `POST` | `/appointments` | Book appointment |
| `PATCH` | `/appointments/:id/status` | Update status |
| `GET` | `/prescriptions` | List prescriptions |
| `POST` | `/prescriptions` | Issue prescription |
| `GET` | `/doctors/:id/reviews` | Get reviews |
| `POST` | `/doctors/:id/reviews` | Submit review |
| `GET` | `/doctors/:id/payouts` | List payouts (admin) |
| `POST` | `/doctors/:id/payouts` | Record payout (admin) |

### Notification Service (`/notify/*`)
| Method | Path | Description |
|---|---|---|
| `POST` | `/notify/otp` | Send OTP email |
| `POST` | `/notify/order-confirmation` | Send order email |
| `POST` | `/notify/appointment-confirmation` | Send appointment email |

## Deployment

### Deploy each service independently
```bash
# Deploy auth service
cd packages/auth-service && wrangler deploy

# Deploy all services at once
npm run services:deploy

# Deploy website
npm run deploy
```

### Create D1 Databases (one-time setup)
```bash
wrangler d1 create kerala-vedics-auth-db
wrangler d1 create kerala-vedics-products-db
wrangler d1 create kerala-vedics-customers-db
wrangler d1 create kerala-vedics-orders-db
wrangler d1 create kerala-vedics-doctors-db

# Run schemas
wrangler d1 execute kerala-vedics-auth-db --file=packages/auth-service/schema.sql
wrangler d1 execute kerala-vedics-products-db --file=packages/product-service/schema.sql
wrangler d1 execute kerala-vedics-customers-db --file=packages/customer-service/schema.sql
wrangler d1 execute kerala-vedics-orders-db --file=packages/order-service/schema.sql
wrangler d1 execute kerala-vedics-doctors-db --file=packages/doctor-service/schema.sql
```

### Set Secrets
```bash
# Auth service
wrangler secret put SMTP_PASS --name kerala-vedics-auth
wrangler secret put CLOUDFLARE_API_TOKEN --name kerala-vedics-auth

# Notification service
wrangler secret put SMTP_PASS --name kerala-vedics-notifications
```

## Technology Stack

- **Framework**: [Hono](https://hono.dev) — ultralight, edge-native TypeScript web framework
- **Runtime**: Cloudflare Workers (V8 isolates, ~0ms cold start)
- **Database**: Cloudflare D1 (SQLite at the edge) — one per service
- **Email**: Cloudflare MailChannels (free, zero-config on Workers)
- **Service Communication**: Cloudflare Service Bindings (zero-latency, internal)
- **Package Manager**: pnpm workspaces
- **Build Pipeline**: Turborepo (parallel builds)
