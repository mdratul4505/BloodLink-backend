# BloodLink - Automated Blood Donation & Emergency Coordination Backend

BloodLink is an enterprise-grade backend system built with Express, TypeScript, Prisma ORM 7, PostgreSQL, Redis, and bKash payment gateway. It connects blood donors with emergency requesters, facilitates organization verification, and powers donation camps with real-time in-app notifications and scheduled workflows.

---

## 🌟 Core Highlights

- **Role-Based Architecture**:
  - `USER` (Donor & Requester): Profile, blood group, district/upazila, availability switch, emergency request lifecycle.
  - `ORGANIZATION` (Hospital / Blood Bank / Volunteer Group): Verified coordination, donation camp management.
  - `ADMIN`: User suspension, organization verification, dashboard metrics, audit logs, and transaction monitoring.
- **Security Rule**: Users register exclusively with `USER` role. `ADMIN` is seeded securely; `ORGANIZATION` is granted exclusively via administrative application approval.
- **Emergency Workflow & Atomic `$transaction` (Technical Challenge)**:
  - Atomic Prisma transaction: Creates `Donation` record + updates `DonorResponse` to `DONATED` + recalculates units & updates `BloodRequest` status (`PARTIALLY_FULFILLED` / `FULFILLED`) + updates donor `lastDonationDate` & stats.
  - Automatic expiration cron job for overdue blood requests.
  - In-app notification dispatch to nearby matching donors.
- **bKash Tokenized Checkout (v1.2.0-beta)**:
  - Voluntary contribution & fundraising system.
  - Token caching in Redis with TTL.
  - Idempotent callback handler verifying amounts via `execute` and `query` APIs before marking status `PAID`.
- **Redis Multi-tier Caching & Rate Limiting**:
  - Distributed rate limiting on authentication and payment creation endpoints.
  - Donor search query caching (`donors:{bloodGroup}:{district}:{page}`) with automated cache invalidation.
  - Admin dashboard metrics caching (`admin:stats`) with 5-minute TTL.
  - JWT blacklist on logout.
  - Graceful in-memory fallback if Redis is temporarily unreachable.

---

## 🗄️ Database Architecture & Prisma Models

```
User ───────────────┬─< DonorProfile (1:1)
                    ├─< Organization (Owner 1:M)
                    ├─< OrganizationMember (M:N)
                    ├─< BloodRequest (Requester 1:M)
                    ├─< DonorResponse (1:M)
                    ├─< Donation (1:M)
                    ├─< CampRegistration (M:N)
                    ├─< Notification (1:M)
                    ├─< Payment (1:M)
                    └─< AuditLog (1:M)

BloodRequest ───────┬─< DonorResponse (@@unique([requestId, donorId]))
                    ├─< Donation (1:M)
                    └─< Notification (1:M)

Organization ───────┬─< DonationCamp (1:M)
                    └─< OrganizationMember (1:M)

DonationCamp ───────┬─< CampRegistration (@@unique([campId, userId]))
                    └─< Donation (1:M)

Payment ────────────┴─< PaymentEvent (1:M audit trail)
```

---

## 🚀 API Endpoint Reference (35+ Endpoints)

| Module | Method | Endpoint | Description | Auth Required |
|---|---|---|---|---|
| **Auth** | POST | `/api/v1/auth/register` | Register new user (Default role: USER) | No |
| | POST | `/api/v1/auth/login` | Email/password login with JWT & Refresh token | No (Rate limited) |
| | POST | `/api/v1/auth/google` | Google OAuth login/registration | No |
| | POST | `/api/v1/auth/refresh-token` | Generate new access token | No |
| | POST | `/api/v1/auth/logout` | Invalidate tokens and blacklist | Yes |
| **User** | GET | `/api/v1/users/me` | Fetch logged-in user profile & donor statistics | Yes |
| | PATCH | `/api/v1/users/me` | Update name, phone, avatar, donor details | Yes |
| | PATCH | `/api/v1/donors/me/availability` | Toggle donor availability & last donation date | Yes |
| **Donor** | GET | `/api/v1/donors` | Filter donors by blood group, district, availability | No (Redis Cached) |
| | GET | `/api/v1/donors/:id` | Fetch specific donor profile and reviews | No |
| **Blood Request** | POST | `/api/v1/blood-requests` | Create emergency/normal request + notify donors | Yes (Rate limited) |
| | GET | `/api/v1/blood-requests` | List all requests with filters & pagination | No |
| | GET | `/api/v1/blood-requests/my-requests` | List user's created requests | Yes |
| | GET | `/api/v1/blood-requests/:id` | Get blood request detail with responses | No |
| | PATCH | `/api/v1/blood-requests/:id` | Update request details | Yes (Creator/Admin) |
| | DELETE | `/api/v1/blood-requests/:id` | Soft-delete / cancel request | Yes (Creator/Admin) |
| | POST | `/api/v1/blood-requests/:id/respond` | Submit donor response (`AVAILABLE` / `UNABLE`) | Yes (Donor) |
| | GET | `/api/v1/blood-requests/:id/responses` | View responses submitted by donors | Yes (Creator/Admin) |
| | PATCH | `/api/v1/blood-requests/:id/status` | Update request status | Yes (Creator/Admin) |
| | POST | `/api/v1/blood-requests/:id/complete-donation` | Complete donation atomic transaction | Yes (Creator/Admin) |
| **Organization** | POST | `/api/v1/organizations` | Submit organization verification application | Yes |
| | GET | `/api/v1/organizations` | List organizations with verification filters | No |
| | GET | `/api/v1/organizations/:id` | View organization profile, camps, requests | No |
| | PATCH | `/api/v1/organizations/:id` | Update organization details | Yes (Owner/Org Admin) |
| **Camp** | POST | `/api/v1/camps` | Create donation camp | Yes (Verified Org/Admin) |
| | GET | `/api/v1/camps` | List upcoming and ongoing camps | No |
| | GET | `/api/v1/camps/:id` | View donation camp details & registrations | No |
| | POST | `/api/v1/camps/:id/register` | Register as donor for a camp | Yes |
| | PATCH | `/api/v1/camps/:id/status` | Update camp status (`UPCOMING`, `ONGOING`, `COMPLETED`) | Yes (Org/Admin) |
| **Notifications** | GET | `/api/v1/notifications` | Fetch user's in-app notifications | Yes |
| | PATCH | `/api/v1/notifications/:id/read` | Mark single notification as read | Yes |
| | PATCH | `/api/v1/notifications/read-all` | Mark all notifications as read | Yes |
| **Payments** | POST | `/api/v1/payments/bkash/create` | Initiate voluntary support payment session | Yes (Rate limited) |
| | GET | `/api/v1/payments/bkash/callback` | bKash callback webhook (Execute + Verify) | No (Gateway) |
| | GET | `/api/v1/payments/my` | View user voluntary support payment history | Yes |
| | GET | `/api/v1/payments/:id` | View payment transaction details & event logs | Yes |
| **Admin** | GET | `/api/v1/admin/users` | List and search all users | Yes (ADMIN) |
| | PATCH | `/api/v1/admin/users/:id/status` | Suspend or restore user account | Yes (ADMIN) |
| | PATCH | `/api/v1/admin/organizations/:id/verify` | Approve or reject organization application | Yes (ADMIN) |
| | GET | `/api/v1/admin/dashboard-stats` | Aggregated platform statistics | Yes (ADMIN, Cached) |
| | GET | `/api/v1/admin/audit-logs` | Platform audit log records | Yes (ADMIN) |
| | GET | `/api/v1/admin/payments` | All transaction logs and audit trail | Yes (ADMIN) |

---

## 🛠️ Environment Configuration (.env)

```env
NODE_ENV=development
PORT=5000

DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bloodlink?schema=public"

JWT_ACCESS_SECRET=your_jwt_access_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
JWT_ACCESS_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=7d

BCRYPT_SALT_ROUNDS=10

BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000

ADMIN_NAME="BloodLink Super Admin"
ADMIN_EMAIL=admin@bloodlink.org
ADMIN_PASSWORD=Admin@123456

REDIS_HOST=localhost
REDIS_PORT=6379

BKASH_APP_KEY=sandbox_app_key
BKASH_APP_SECRET=sandbox_app_secret
BKASH_USERNAME=sandbox_username
BKASH_PASSWORD=sandbox_password
BKASH_BASE_URL=https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout
BKASH_CALLBACK_URL=http://localhost:5000/api/v1/payments/bkash/callback
```

---

## 💻 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Generate Prisma Client & Sync Database
```bash
npx prisma generate
npx prisma db push
```

### 3. Start Development Server
```bash
npm run dev
```

The server automatically initializes database connection, connects Redis, seeds the super administrator, and launches the blood request expiration cron scheduler!
