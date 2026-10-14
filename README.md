# 🩸 BloodLink - Automated Blood Donation & Emergency Coordination Backend

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-20+-68a063?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178c6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Express-5.x-black?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/Prisma-7.10-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-16+-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Redis-6.x-dc382d?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/Nodemailer-Gmail%20SMTP-ea4335?style=for-the-badge&logo=gmail&logoColor=white" alt="Gmail SMTP" />
</p>

BloodLink is an enterprise-grade backend system designed to bridge the gap between voluntary blood donors and emergency requesters. Built with **Express 5**, **TypeScript**, **Prisma ORM 7**, **PostgreSQL**, **Redis**, **Nodemailer (Gmail SMTP)**, and **bKash Tokenized Checkout**, BloodLink streamlines real-time blood request coordination, automated notification dispatch, secure OTP-based password resets, profile management with HD picture upload, and transparent donation camp tracking.

---

## 🌟 Key Highlights & System Features

### 1. 🔐 Security & Email Notification System
- **Registration Welcome Email**: Automatically delivers an attractive, responsive HTML onboarding email when a new user registers.
- **Forgot Password & OTP Verification**:
  - Secure **6-digit numeric OTP** generation with **10-minute expiration**.
  - OTP stored in **Redis** (or ultra-fast memory fallback) with automatic TTL cleanup.
  - Verification check endpoint before password submission.
- **Password Changed Confirmation**: Instant security confirmation email sent to the user when their password is changed, alerting them of the activity.
- **Strict Role-Based Access Control (RBAC)**:
  - `USER`: Normal donor and recipient privileges.
  - `ORGANIZATION`: Hospitals, blood banks, and verified voluntary clubs.
  - `ADMIN` & `SUPER_ADMIN`: Administrative controls, suspension, and verification workflows.

### 2. 👤 Universal Profile & HD Picture Upload
- **Profile for Everyone**: Any authenticated user can view (`GET /api/v1/users/me` or `/users/profile`) and update their profile details.
- **Optional HD Avatar Upload**:
  - Uploading a profile picture is **100% optional**; users can update basic information with or without uploading images.
  - Supports high-definition / HD images up to **15MB** (`.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`) without compression loss.
  - Static file delivery with cross-origin resource policy enabled at `/uploads/avatars/...`.

### 3. ⚡ Resilient Redis Caching & In-Memory Fallback
- Dual-mode caching: Connects via `REDIS_URL` or `REDIS_HOST` + `REDIS_PORT` + `REDIS_PASSWORD`.
- **Zero-downtime Fallback**: If Redis is offline or credentials need updating, the backend automatically falls back to an internal in-memory store so OTPs, rate-limiting, and query caches continue working seamlessly without crashing.

### 4. 🩸 Emergency Coordination & Atomic `$transaction`
- **Atomic Donation Execution**: Simultaneously marks `Donation` records, updates `DonorResponse` to `DONATED`, recalculates required blood units, updates `BloodRequest` status (`PARTIALLY_FULFILLED` / `FULFILLED`), and logs donor statistics.
- **Automated Expiration Cron**: Background scheduler automatically expires overdue emergency requests.

### 5. 💳 bKash Tokenized Checkout (v1.2.0-beta)
- Voluntary platform contributions and emergency fundraising.
- Token caching in Redis with TTL.
- Idempotent callback webhook verifying transaction amounts via `execute` and `query` APIs before marking status `PAID`.

---

## 🗄️ Database Architecture (Prisma Multi-File Schema)

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
```

---

## 🚀 API Endpoint Reference (40+ Endpoints)

### 1. Authentication & Password Security
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Register new user (Sends Welcome Email) | No |
| `POST` | `/api/v1/auth/login` | Login with email/password (JWT + Refresh Token) | No (Rate-limited) |
| `POST` | `/api/v1/auth/google` | Google OAuth registration / login | No |
| `POST` | `/api/v1/auth/refresh-token` | Generate fresh access token from refresh token | No |
| `POST` | `/api/v1/auth/logout` | Invalidate session & blacklist JWT | Yes |
| `POST` | `/api/v1/auth/forgot-password` | Request 6-digit OTP sent to registered email | No (Rate-limited) |
| `POST` | `/api/v1/auth/verify-otp` | Verify 6-digit OTP code validity | No |
| `POST` | `/api/v1/auth/reset-password` | Reset password with verified OTP (Sends Confirmation Email) | No (Rate-limited) |
| `POST` | `/api/v1/auth/change-password` | Change password for logged-in user (Sends Confirmation Email) | Yes |

### 2. User & Profile Management
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/v1/users/me` | Fetch logged-in user profile, donor details & stats | Yes |
| `GET` | `/api/v1/users/profile` | Alias for user profile retrieval | Yes |
| `PATCH` | `/api/v1/users/me` | Update profile info (optional image/multipart supported) | Yes |
| `PATCH` | `/api/v1/users/profile` | Alias for profile update | Yes |
| `POST` | `/api/v1/users/avatar` | Upload HD profile picture / avatar file (up to 15MB) | Yes |
| `POST` | `/api/v1/users/me/avatar` | Alias for avatar upload | Yes |
| `PATCH` | `/api/v1/users/availability`| Toggle donor availability switch | Yes |

### 3. Donors & Search
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/v1/donors` | Filter donors by blood group, district, availability | No (Redis Cached) |
| `GET` | `/api/v1/donors/:id` | Fetch specific donor profile and reviews | No |

### 4. Emergency Blood Requests
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/v1/blood-requests` | Create emergency blood request & alert nearby donors | Yes |
| `GET` | `/api/v1/blood-requests` | List requests with blood group & location filters | No |
| `GET` | `/api/v1/blood-requests/my-requests` | List all requests submitted by logged-in user | Yes |
| `GET` | `/api/v1/blood-requests/:id` | View blood request detail and responses | No |
| `PATCH` | `/api/v1/blood-requests/:id` | Update blood request details | Yes (Creator/Admin) |
| `DELETE`| `/api/v1/blood-requests/:id` | Cancel / soft-delete request | Yes (Creator/Admin) |
| `POST` | `/api/v1/blood-requests/:id/respond` | Submit donor response (`AVAILABLE` / `UNABLE`) | Yes (Donor) |
| `GET` | `/api/v1/blood-requests/:id/responses`| View list of donor responses | Yes (Creator/Admin) |
| `PATCH` | `/api/v1/blood-requests/:id/status` | Update request status | Yes (Creator/Admin) |
| `POST` | `/api/v1/blood-requests/:id/complete-donation` | Complete atomic donation transaction | Yes (Creator/Admin) |

### 5. Organizations & Verification
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/v1/organizations` | Submit organization verification application | Yes |
| `GET` | `/api/v1/organizations` | List verified/all organizations | No |
| `GET` | `/api/v1/organizations/:id` | View organization profile, camps, and history | No |
| `PATCH` | `/api/v1/organizations/:id` | Update organization details | Yes (Org Owner) |

### 6. Donation Camps
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/v1/camps` | Create donation camp | Yes (Verified Org/Admin) |
| `GET` | `/api/v1/camps` | List upcoming and ongoing donation camps | No |
| `GET` | `/api/v1/camps/:id` | View camp details and registrations | No |
| `POST` | `/api/v1/camps/:id/register` | Register as voluntary donor for camp | Yes |
| `PATCH` | `/api/v1/camps/:id/status` | Update camp status (`UPCOMING`, `ONGOING`, `COMPLETED`)| Yes (Org/Admin) |

### 7. Notifications
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/v1/notifications` | Fetch user's in-app notifications | Yes |
| `PATCH` | `/api/v1/notifications/:id/read` | Mark individual notification as read | Yes |
| `PATCH` | `/api/v1/notifications/read-all` | Mark all notifications as read | Yes |

### 8. bKash Payments (Voluntary Support)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/v1/payments/bkash/create` | Initiate bKash payment checkout session | Yes |
| `GET` | `/api/v1/payments/bkash/callback` | bKash webhook callback (Verify & Execute) | No (Gateway) |
| `GET` | `/api/v1/payments/my` | View user payment contribution history | Yes |
| `GET` | `/api/v1/payments/:id` | View payment transaction details & event log | Yes |

### 9. Administration Module
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/v1/admin/users` | List and search all users with filters | Yes (ADMIN) |
| `PATCH` | `/api/v1/admin/users/:id/status` | Suspend or reactivate user account | Yes (ADMIN) |
| `PATCH` | `/api/v1/admin/organizations/:id/verify` | Approve or reject organization application | Yes (ADMIN) |
| `GET` | `/api/v1/admin/dashboard-stats` | Aggregated platform metrics | Yes (ADMIN, Cached) |
| `GET` | `/api/v1/admin/audit-logs` | Platform audit log records | Yes (ADMIN) |
| `GET` | `/api/v1/admin/payments` | All transaction logs and audit trail | Yes (ADMIN) |

---

## 🛠️ Environment Configuration (.env)

```env
NODE_ENV=development
PORT=5000

# PostgreSQL Connection String
DATABASE_URL="postgresql://username:password@localhost:5432/bloodlink?schema=public"

# JWT Authentication
JWT_ACCESS_SECRET=your_super_secret_access_key
JWT_REFRESH_SECRET=your_super_secret_refresh_key
JWT_ACCESS_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10

# URLs
BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000

# Seed Super Admin Credentials
ADMIN_NAME="BloodLink Super Admin"
ADMIN_EMAIL=admin@bloodlink.org
ADMIN_PASSWORD=Admin@123456

# Redis (Supports direct REDIS_URL or Host/Port/Password)
REDIS_URL=redis://default:your_redis_password@your_redis_host:16770
REDIS_HOST=your_redis_host
REDIS_PORT=16770
REDIS_USER=default
REDIS_PASSWORD=your_redis_password

# Gmail SMTP Email Service
SMTP_USER=dev.ratul.coder@gmail.com
SMTP_PASSWORD=your_gmail_app_password

# bKash Sandbox Credentials
BKASH_APP_KEY=sandbox_app_key
BKASH_APP_SECRET=sandbox_app_secret
BKASH_USERNAME=sandbox_username
BKASH_PASSWORD=sandbox_password
BKASH_BASE_URL=https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout
BKASH_CALLBACK_URL=http://localhost:5000/api/v1/payments/bkash/callback
```

---

## 💻 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/programming-hero-web-course-4/b12a7-customer-support-zone-mdratul4505.git
cd BloodLink-backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Generate Prisma Client
```bash
npx prisma generate
```

### 4. Push Database Schema
```bash
npx prisma db push
```

### 5. Start Development Server
```bash
npm run dev
```

### 6. Build & Production Run
```bash
npm run build
npm start
```

---

## 🧪 Testing with Postman

1. Open Postman and click **Import**.
2. Select the [`postman_collection.json`](postman_collection.json) file included in the root directory.
3. The collection is pre-configured with environment variables (`{{baseUrl}}`, `{{accessToken}}`, `{{adminAccessToken}}`).
4. **Step-by-Step Flow**:
   1. **Register**: `POST /api/v1/auth/register` (receives welcome email).
   2. **Login**: `POST /api/v1/auth/login` (stores token in collection variable).
   3. **Forgot Password**: `POST /api/v1/auth/forgot-password` (sends 6-digit OTP).
   4. **Reset Password**: `POST /api/v1/auth/reset-password` (updates password + sends confirmation email).
   5. **Get Profile**: `GET /api/v1/users/me`.
   6. **Upload HD Avatar**: `POST /api/v1/users/avatar` (select image in `form-data` with key `avatar`).

---

## 📄 License
This project is open-source and available under the [ISC License](LICENSE).
