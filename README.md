<p align="center">
  <img src="backend/comme-backend/public/images/Comme_Wordmark.svg" alt="Comme Platform" width="380">
</p>

<p align="center">
  <strong>Digital Creator Marketplace & Art Commission Platform — Full-Stack Monorepo</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Laravel-12.x-FF2D20?style=for-the-badge&logo=laravel&logoColor=white" alt="Laravel 12">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19">
  <img src="https://img.shields.io/badge/TypeScript-5.7+-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/PostgreSQL-16+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Midtrans-Snap%20%26%20Iris-02F5A8?style=for-the-badge&logo=cashapp&logoColor=black" alt="Midtrans Payments">
  <img src="https://img.shields.io/badge/API%20Endpoints-127%20Routes-7928CA?style=for-the-badge&logo=fastapi&logoColor=white" alt="API Endpoints">
  <img src="https://img.shields.io/badge/Observability-Pulse%20%26%20Log%20Viewer-00C3FF?style=for-the-badge&logo=datadog&logoColor=white" alt="Observability">
  <img src="https://img.shields.io/badge/Backend%20Tests-125%20Passed%20(539%20Assertions)-02F5A8?style=for-the-badge&logo=githubactions&logoColor=black" alt="Tests Passed">
</p>

---

## Overview

**Comme** is an end-to-end digital creator marketplace and art commission platform that bridges illustrators and buyers with bank-grade escrow security, transparent order lifecycles, and automated financial disbursements.

Built with a **Laravel 12 REST API** backend and a **React 19 / TypeScript** single-page frontend, Comme provides a seamless experience for browsing artwork, purchasing custom art commissions, tracking revisions, negotiating deadlines, managing studio availability, and processing instant refunds and payouts via the **Midtrans Snap** and **Midtrans Iris** payment gateways.

---

## Monorepo Architecture

```
UKK/
├── backend/comme-backend/       # Laravel 12 REST API & Developer Portal
│   ├── app/                     # Domain models, controllers, services, policies
│   ├── database/                # Migrations & comprehensive seeders
│   ├── resources/views/         # Interactive API docs portal (Blade + Vanilla CSS)
│   ├── routes/                  # Modular route files (127 endpoints across 19 modules)
│   ├── tests/Feature/           # PHPUnit test suite (125 tests, 539 assertions)
│   └── README.md                # Backend architecture & API documentation
│
├── frontend/comme-frontend/     # React 19 + TypeScript Client SPA
│   ├── src/                     # Components, pages, contexts, services
│   ├── public/                  # Assets, icons, brand artwork
│   ├── tailwind.config.js       # Glassmorphism dark-mode design system
│   └── README.md                # Frontend architecture & UI documentation
│
└── README.md                    # Root project documentation (this file)
```

```mermaid
graph TD
    Client["React 19 Client SPA<br/>(TailwindCSS, TypeScript, Lucide)"]
    API["Laravel 12 REST API<br/>(Sanctum Bearer, RFC-7807, CORS Allowlist)"]
    DB[("PostgreSQL 16+<br/>Database")]
    Storage["Google Cloud Storage / Disk<br/>(/storage/{path} Provider)"]
    MidtransSnap["Midtrans Snap<br/>(Escrow Checkout)"]
    MidtransIris["Midtrans Iris<br/>(Creator Bank Payouts)"]
    Scheduler["Artisan Scheduler<br/>(Background Auto-Release & Reconciliation)"]

    Client -->|REST API / Bearer Token| API
    Client -->|Direct Asset Streaming| Storage
    Client -->|Snap Popup Checkout| MidtransSnap
    API -->|Eloquent ORM| DB
    API -->|Stream / Upload Assets| Storage
    API -->|Create Snap Token| MidtransSnap
    MidtransSnap -->|Payment Webhook (SHA-512)| API
    API -->|Disburse Escrow| MidtransIris
    MidtransIris -->|Payout Status Callback| API
    Scheduler -->|Cron Payout Routines| API
```

---

## Key Platform Features

### 1. Commission Lifecycle & Escrow Protection
- **Order State Machine**: Enforces valid state transitions: `pending` &rarr; `accepted` &rarr; `in_progress` &rarr; `review` &rarr; `completed` (or `cancelled`/`declined`).
- **Escrow Vaulting**: Buyer deposits are safely held in escrow via Midtrans Snap until artwork delivery is approved.
- **Deadline Negotiation Protocol**: Formal proposal-and-acceptance protocol (`/propose-deadline`, `/accept-deadline`, `/decline-deadline`) allowing creators to request completion date adjustments with buyer agreement.
- **Revision Tracking**: Structured client revision cycles tracked against service limits.
- **Delivery MIME Enforcement**: Strict server-side MIME type inspection for delivered artwork (`image/*`, `application/pdf`, `application/zip`, `application/x-rar-compressed`, `video/*`).
- **Automated Payouts**: Completed orders automatically trigger creator bank disbursements via Midtrans Iris.

### 2. Mutual Cancellation & Automated Escrow Refunds
- **Mutual Agreement Protocol**: Active commissions can be cancelled through a structured proposal-and-acceptance flow with mandatory reasons.
- **Automated Direct Refund**: When a paid commission is cancelled, funds held in escrow are **immediately refunded to the buyer** through the Midtrans direct refund API (with local ledger fallback).
- **Audit Logging**: Structured events and notifications record the cancellation reason and refund transaction ID.

### 3. Official Digital Purchase Receipts
- **Cryptographic Identifier**: Unique identifier formatted as `REC-COM-{commission_id}-{hash}` (e.g. `REC-COM-14-8F3E2B1A`).
- **Complete Financial Breakdown**: Itemizes gross order total, 5% platform fee, net artist earnings, payment channel, and settlement timestamps.
- **Print & PDF Format**: Responsive modal with a printer-optimized media layout for generating formal purchase records.
- **Refund Invalidation**: Displays transparent refund notices if the transaction was cancelled.

### 4. Artist Studio Dashboard & Master Availability
- **Master Availability Status**: Artists can toggle their status across the entire marketplace:
  - <span style="color: #10B981; font-weight: bold;">● Open for Commissions</span>: Glowing emerald badge indicating active availability.
  - <span style="color: #F59E0B; font-weight: bold;">● Busy / Waitlist Only</span>: Amber badge accepting waitlist orders.
  - <span style="color: #EF4444; font-weight: bold;">● Commissions Closed</span>: Rose badge pausing new incoming requests.
- **Studio Profile Settings**: Dedicated studio bio and terms, external portfolio website, and verified social links (Twitter/X, ArtStation, Instagram).
- **Bank Payout Configuration**: Artist bank accounts are encrypted with AES-256 at rest, displayed masked (`••••••••1234`), and can be safely managed or deleted.

### 5. SEO-Friendly Slug Routing
- Clean, SEO-optimized permalinks for marketplace resources:
  - `/services/{slug}` &mdash; Commission services
  - `/portfolios/{slug}` &mdash; Creator portfolio items
  - `/posts/{slug}` &mdash; Community artwork feed posts
  - `/commissions/{buyer_username}-{slug}-{nano_id}` &mdash; User-prefixed commission order permalinks
- Dual-lookup support transparently resolving both human-readable slugs and legacy numeric IDs.

### 6. Social Community & Feed
- **Artwork Feed**: Multi-image/video post creation with tag categorization and paginated exploration.
- **Engagement**: Like and bookmark posts and comments with dedicated `GET /api/me/bookmarks` and `GET /api/me/likes` queries.
- **Threaded Comments**: Post comments with parent-reply threading, in-place author editing (`PUT /api/comments/{comment}`), and author/post-owner deletion (`DELETE /api/comments/{comment}`).
- **User Following**: Follow favourite creators to populate personalized community streams.

### 7. Security, Storage & Architecture Hardening
- **Cross-Origin Bearer Auth**: Sanctum Bearer token authorization decoupled from stateful session cookies, supporting independent cross-domain deployments.
- **Explicit CORS Allowlist**: Strict origin matching via `CORS_ALLOWED_ORIGINS` environment variable (no open wildcards in production).
- **Session & Device Management**: Active token listing (`GET /api/auth/sessions`) and multi-session revocation (`DELETE /api/auth/sessions/{id}`).
- **Account Deletion**: Complete user data lifecycle with secure password confirmation (`DELETE /api/auth/account`).
- **Two-Factor Authentication (2FA)**: TOTP authentication with QR code setup and encrypted recovery codes.
- **Storage Streaming Provider**: Direct `/storage/{path}` file provider with CORS streaming headers, GCS persistent volume compatibility, and forced attachment download queries (`?download=1&name=...`).
- **Dependency Pinning & Sandboxing**: Midtrans PHP SDK pinned to `^2.6.4`; test payment simulation endpoint guarded from production execution.

### 8. Interactive Developer Documentation Portal
- Hosted directly on the backend root (`/`):
  - **Live Documentation**: Categorized endpoint groups covering all 127 routes with cURL snippets and schemas.
  - **API Explorer (`/explore`)**: In-browser request sandbox with token persistence and latency measurement.
  - **Error Reference (`/errors`)**: RFC-7807 compliant error catalog for all HTTP status codes.
  - **Transactional Email Inspector (`/emails`)**: Live in-browser previewer for transactional emails (Password Reset, Registration OTP, Security Alerts) with HTML/plaintext toggles and desktop/mobile viewport switching.
  - **Theme System**: Dark, Light, and System OS themes with day/night SVG icons.

### 9. Real-Time Observability, Smart Caching & Tiered Rate Limiting
- **Laravel Pulse APM (`/pulse`)**: Real-time application performance monitoring tracking slow database queries (>500ms), slow HTTP requests (>1,000ms), cache hit/miss ratio, and server usage.
- **Interactive Log Viewer (`/log-viewer`)**: In-browser diagnostic logging dashboard with live streaming, search by log level, formatted stack traces, and log file downloads.
- **PostgreSQL-Backed Smart Caching (`CacheService`)**: Fast caching for public artwork feeds, commission service listings, and artist profiles with epoch-based invalidation that guarantees atomic cache purging upon model lifecycle events via `CacheInvalidationObserver`.
- **Role-Tiered Rate Limiting**: Dynamic request throttling based on authenticated roles:
  - **Admin**: 300 req/min
  - **Moderator**: 240 req/min
  - **Verified Artist**: 180 req/min (high-frequency studio workflows)
  - **Authenticated Buyer**: 120 req/min
  - **Guest / Public**: 60 req/min
  - Dedicated limiters: Search (30 req/min), Media Uploads (20 req/min), Payment Checkout (10 req/min).
- **Request Correlation Tracing (`AssignRequestId`)**: Unique `X-Request-ID` UUID automatically assigned to every request, injected into structured logging context (`Log::withContext(...)`), and returned in response headers for end-to-end debugging.
- **Slow Query Detection**: Automatic database listener (`DB::whenQueryingForLongerThan(500)`) logging warnings for queries exceeding 500ms.

---

## Scheduled Artisan Automation Commands

The backend implements automated background cron tasks configured in `routes/console.php`:

| Command Signature | Schedule | Background | Purpose |
|---|---|---|---|
| `commissions:release-due-payouts` | Every minute (`* * * * *`) | Yes (`runInBackground()`) | Scans completed/confirmed commissions past the 7-day review grace period and automatically releases escrow payouts to creator bank accounts via Midtrans Iris. |
| `commissions:reconcile-payouts` | Every 5 minutes (`*/5 * * * *`) | No | Polls Midtrans Iris payout status for pending disbursements to resolve transient gateway drops. |
| `commissions:retry-failed-payouts` | Every 30 minutes (`*/30 * * * *`) | No | Retries transiently failed bank disbursements up to 3 attempts before flagging for staff audit. |
| `model:prune --model=PendingRegistration` | Hourly (`0 * * * *`) | No | Prunes unverified and expired user registration records from the database. |
| `migrate:sync-existing` | Deployment utility | No | Reconciles missing columns and indexes across schema versions without destructive table drops. |

---

## Quickstart Guide

### Prerequisites
- **PHP** >= 8.2 with `pdo_pgsql`, `mbstring`, `openssl`, `bcmath`, `curl`, `fileinfo`
- **Composer** >= 2.x
- **PostgreSQL** >= 16.x
- **Node.js** >= 18.x
- **npm** >= 9.x

---

### Step 1: Backend Setup (`comme-backend`)

```bash
cd backend/comme-backend

# 1. Install PHP dependencies
composer install

# 2. Configure environment
cp .env.example .env
php artisan key:generate

# 3. Configure database credentials and CORS allowlist in .env:
# DB_CONNECTION=pgsql
# DB_HOST=127.0.0.1
# DB_PORT=5432
# DB_DATABASE=comme_db
# DB_USERNAME=postgres
# DB_PASSWORD=your_password
# CORS_ALLOWED_ORIGINS=http://localhost:5173

# 4. Run database migrations and seeders
php artisan migrate --seed

# 5. Start the backend development server
php artisan serve
```
> The backend REST API and Developer Documentation Portal will be available at **http://localhost:8000**.

---

### Step 2: Frontend Setup (`comme-frontend`)

Open a new terminal window:

```bash
cd frontend/comme-frontend

# 1. Install JavaScript dependencies
npm install

# 2. Configure environment
# Ensure .env contains:
# VITE_API_BASE_URL=http://localhost:8000/api
# VITE_MIDTRANS_CLIENT_KEY=SB-Mid-client-...

# 3. Start the frontend development server
npm run dev
```
> The frontend client application will be available at **http://localhost:5173**.

---

## Testing & Quality Assurance

### Backend Automated Test Suite
The backend is verified by **125 automated test methods** containing **539 assertions** with 100% passing status:

```bash
cd backend/comme-backend
php artisan test
```

Key test suites include:
- `CommissionCancellationRefundTest`: Mutual cancellation, direct cancellation, Midtrans automated escrow refund triggers, and refund receipts.
- `ArtistProfileSettingsTest`: Master commission status switching, bio separation, social links validation, and authorization guards.
- `ArtistApplicationFlowTest`: Portfolio applications, staff review queue, atomic role promotion, and in-app notifications.
- `CommissionLifecyclePayoutTest`: Full order lifecycle, Midtrans Snap webhook simulation, Iris payouts, reconciliation, and retry logic.
- `CommissionReceiptFlowTest`: Cryptographic receipt hashing, access security, and settlement calculations.
- `AuthNotificationsTest`: Password reset links, OTP dispatch, new device detection, and transactional mailers.
- `SlugRoutingTest`: Slug generation and route resolution for services, portfolios, and posts.
- `TwoFactorAuthTest`: TOTP setup, code verification, login challenge, and recovery codes.
- `ObservabilityAndRateLimitingTest`: Request ID correlation tracing, cache invalidation, and role-tiered rate limiters.
- `QueueAndFilesystemTest`: Asynchronous background media jobs, public vs private disk isolation, and orphaned file pruning.

### Frontend Production Build
Verify TypeScript type-checking and asset bundling:

```bash
cd frontend/comme-frontend
npm run build
```

---

## Detailed Documentation Links

For in-depth guides and API specifications, refer to the individual component documentation:
- **[Backend README & API Reference](backend/comme-backend/README.md)**
- **[Frontend Architecture & Component Guide](frontend/comme-frontend/README.md)**
- **[Interactive API Documentation Portal](http://localhost:8000)** (when backend is running)
- **[Laravel Pulse APM Dashboard](http://localhost:8000/pulse)** (Real-time performance & cache telemetry)
- **[Interactive Log Viewer](http://localhost:8000/log-viewer)** (Diagnostic live logs & search)
- **[Transactional Email Previews & Inspector](http://localhost:8000/emails)**
- **[Interactive API Sandbox](http://localhost:8000/explore)**
- **[HTTP Error Envelope Catalog](http://localhost:8000/errors)**

---

## License

This project is open-source software licensed under the [MIT License](backend/comme-backend/LICENSE).
