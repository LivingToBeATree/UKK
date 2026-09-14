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
  <img src="https://img.shields.io/badge/Watermarking-PHP%20GD%20Engine-A802F5?style=for-the-badge&logo=adobephotoshop&logoColor=white" alt="Watermarking">
  <img src="https://img.shields.io/badge/PPP-Anti--Arbitrage%20Engine-00C3FF?style=for-the-badge&logo=shield&logoColor=white" alt="Anti-Arbitrage">
  <img src="https://img.shields.io/badge/Observability-Pulse%20%26%20Log%20Viewer-00C3FF?style=for-the-badge&logo=datadog&logoColor=white" alt="Observability">
</p>

---

## Overview

**Comme** is an enterprise-grade digital creator marketplace and art commission platform that connects digital artists, illustrators, and commissioners with bank-grade escrow security, transparent order lifecycles, and automated financial settlements.

Built with a **Laravel 12 REST API** backend and a **React 19 / TypeScript** single-page frontend, Comme provides a seamless experience for:
- Browsing creator services and requesting bespoke art commissions.
- Real-time studio capacity tracking via a **Live Studio Commission Queue Board**.
- Localized purchasing with **Purchasing Power Parity (PPP)** and **Anti-Arbitrage fraud protection**.
- Automated **Diagonal Watermark Protection** safeguarding artist WIP deliverables against theft.
- Bank-grade escrow deposits via **Midtrans Snap** and automated creator disbursements via **Midtrans Iris**.
- Instant automated escrow refunds upon mutual order cancellation.
- An **Interactive Color Studio** for custom brand accents alongside clean neutral slate surfaces.
- In-browser API documentation, live testing sandbox, email inspectors, and real-time APM telemetry.

---

## Monorepo Architecture

```
UKK/
├── backend/comme-backend/       # Laravel 12 REST API & Developer Portal
│   ├── app/                     # Domain models, controllers, services, policies
│   ├── database/                # Migrations & comprehensive seeders
│   ├── resources/views/         # Interactive API docs portal & email templates
│   ├── routes/                  # Modular route files (130+ endpoints across domain modules)
│   ├── tests/Feature/           # Automated PHPUnit integration test suite
│   └── README.md                # Backend architecture & API reference
│
├── frontend/comme-frontend/     # React 19 + TypeScript Client SPA
│   ├── src/                     # Components, pages, contexts, services, utilities
│   ├── public/                  # Assets, icons, static artwork
│   ├── tailwind.config.js       # Curated design token system
│   └── README.md                # Frontend architecture & UI documentation
│
├── Docs/                        # Platform documentation & assets
│   ├── ARCHITECTURE.md          # In-depth architectural & security specification
│   ├── README.md                # Documentation index
│   ├── Icons/                   # Multi-resolution brand icons
│   └── Images/                  # Brand SVGs and wordmarks
│
└── README.md                    # Root project documentation (this file)
```

```mermaid
graph TD
    Client["React 19 Client SPA<br/>(TailwindCSS, TypeScript, Framer Motion)"]
    API["Laravel 12 REST API<br/>(Sanctum Bearer, RFC-7807, CORS Allowlist)"]
    DB[("PostgreSQL 16+<br/>Database")]
    Storage["Dual-Disk Storage Provider<br/>(Public vs Private Deliverables)"]
    MidtransSnap["Midtrans Snap<br/>(Escrow Checkout)"]
    MidtransIris["Midtrans Iris<br/>(Creator Bank Payouts)"]
    Scheduler["Artisan Scheduler<br/>(Auto-Release & Reconciliation)"]

    Client -->|REST API / Bearer Token| API
    Client -->|Direct Asset Streaming| Storage
    Client -->|Snap Popup Checkout| MidtransSnap
    API -->|Eloquent ORM| DB
    API -->|Protected / Watermarked Delivery| Storage
    API -->|Create Snap Token| MidtransSnap
    MidtransSnap -->|Payment Webhook (SHA-512)| API
    API -->|Disburse Escrow| MidtransIris
    MidtransIris -->|Payout Status Callback| API
    Scheduler -->|Background Cron Jobs| API
```

---

## Key Platform Features

### 1. Live Studio Commission Queue Board
- **Skeb & VGen-Inspired Real-Time Workflow**: Embedded directly on public artist profiles to visualize active studio workload and capacity.
- **Dynamic Capacity Gauge**: Displays current filled slots (e.g. `2/5 Filled` or `Queue Full`) with status progress indicators.
- **Client Anonymity & Privacy**: Displays masked order codes (`COM-#5`) and delivery stages (`Accepted`, `In Production`, `Under Review`, `Completed`).
- **Client Active Spotlight**: Highlights the authenticated buyer's exact slot position (e.g., `Your Commission is Slot #1!`) with direct navigation into their order workspace.

### 2. Purchasing Power Parity (PPP) & Anti-Arbitrage Engine
- **Multi-Currency Converter**: Real-time switching across IDR, USD, JPY, EUR, GBP, SGD, AUD, and CAD with live exchange rate caching.
- **GeoIP Localization (`GeoIpService`)**: Detects country codes via edge IP headers (`CF-Connecting-IP`, `X-Forwarded-For`) to automatically present regional pricing.
- **Anti-Arbitrage Security (`AntiArbitrageService`)**: Validates transaction currency, payment methods, and user geographic tier to prevent regional discount exploitation via VPNs.

### 3. Automated Diagonal Watermark Protection (`WatermarkService`)
- **GD-Powered Tiling Engine**: Generates 35-degree diagonal watermarks featuring artist handle, commission code, and platform signature across preview images.
- **Theft & Scraping Prevention**: Client review deliverables and unconfirmed WIP milestones are strictly served with semi-transparent watermarking.
- **Gated Original Assets**: Clean, high-resolution original artwork and compressed ZIP archives are unlocked exclusively upon final client approval.

### 4. Commission Order Lifecycle & Escrow Protection
- **Order State Machine**: Enforces valid state transitions: `pending` &rarr; `accepted` &rarr; `in_progress` &rarr; `review` &rarr; `completed` (or `cancelled`/`declined`).
- **Escrow Vaulting**: Buyer deposits are safely held in escrow via Midtrans Snap until artwork delivery is approved.
- **Deadline Negotiation Protocol**: Formal proposal-and-acceptance protocol (`/propose-deadline`, `/accept-deadline`, `/decline-deadline`) allowing creators to request completion date adjustments with buyer agreement.
- **Structured Revisions**: Client revision cycles tracked against service limits.
- **Automated Payouts**: Completed orders trigger creator bank disbursements via Midtrans Iris.

### 5. Mutual Cancellation & Automated Escrow Refunds
- **Mutual Agreement Protocol**: Active commissions can be cancelled through a structured proposal-and-acceptance flow with mandatory reasons.
- **Automated Direct Refund**: When a paid commission is cancelled, funds held in escrow are **immediately refunded to the buyer** through the Midtrans direct refund API (with local ledger fallback).
- **Audit Logging**: Structured events and notifications record the cancellation reason and refund transaction ID.

### 6. Official Digital Purchase Receipts
- **Cryptographic Identifier**: Unique identifier formatted as `REC-COM-{commission_id}-{hash}` (e.g. `REC-COM-14-8F3E2B1A`).
- **Complete Financial Breakdown**: Itemizes gross order total, 5% platform fee, net artist earnings, payment channel, and settlement timestamps.
- **Print & PDF Format**: Responsive modal with a printer-optimized media layout for generating formal purchase records.
- **Refund Invalidation**: Displays transparent refund notices if the transaction was cancelled.

### 7. Artist Studio Dashboard & Master Availability
- **Master Availability Status**: Artists can toggle their status across the entire marketplace:
  - <span style="color: #10B981; font-weight: bold;">● Open for Commissions</span>: Active availability.
  - <span style="color: #F59E0B; font-weight: bold;">● Busy / Waitlist Only</span>: Accepting waitlist orders.
  - <span style="color: #EF4444; font-weight: bold;">● Commissions Closed</span>: Pausing incoming requests.
- **Studio Profile Settings**: Dedicated studio bio and terms, external portfolio website, and verified social links (Twitter/X, ArtStation, Instagram).
- **Bank Payout Configuration**: Artist bank accounts are encrypted with AES-256 at rest, displayed masked (`••••••••1234`), and can be safely managed.

### 8. Direct Creator Tipping Subsystem
- Public artist profile tipping modal supporting custom and quick-pick tip amounts.
- Automatic multi-currency conversion to IDR with direct Midtrans Snap escrow checkout.

### 9. Content Reporting & Moderation Lifecycle
- Universal content reporting across artwork posts, comments, commission services, and user profiles.
- Standardized violation categories (`spam`, `harassment`, `nsfw`, `copyright`, `fraud`, `other`).
- Dedicated staff moderation queue supporting action execution (`remove_content`, `warn_user`, `suspend_account`, `dismiss`).

### 10. Brand Identity & Interactive Color Studio
- Clean neutral slate grey surfaces (`--secondary`, `--muted`, `--accent`, `--border`) preventing clashing color mixtures.
- Interactive Color Studio in **Settings > Appearance** featuring a 2D HSV canvas, hue slider, RGB channels, custom hex inputs, and contrast text calculations.

### 11. Security, Observability & Rate Limiting
- **Cross-Origin Bearer Auth**: Sanctum Bearer token authorization decoupled from stateful session cookies.
- **Two-Factor Authentication (2FA)**: TOTP authentication with QR code setup and encrypted recovery codes.
- **Laravel Pulse APM (`/pulse`)**: Real-time performance monitoring tracking slow queries (>500ms) and request latency.
- **Interactive Log Viewer (`/log-viewer`)**: In-browser diagnostic logging dashboard with live streaming and stack traces.
- **Role-Tiered Rate Limiting**: Request throttling tiered by user role (Admin: 300, Moderator: 240, Artist: 180, Buyer: 120, Guest: 60 req/min).

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
- **PHP** >= 8.2 with `pdo_pgsql`, `gd`, `mbstring`, `openssl`, `bcmath`, `curl`, `fileinfo`
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
The backend includes a comprehensive automated test suite covering security, anti-arbitrage, watermarking, payment lifecycles, and escrow state machines:

```bash
cd backend/comme-backend
php artisan test
```

Key test suites include:
- `AntiArbitrageSecurityTest`: Regional currency enforcement and VPN/geo-spoofing prevention.
- `SecurityVulnerabilityFixesTest`: Path traversal guards, MIME verification, and private storage isolation.
- `CommissionCancellationRefundTest`: Mutual cancellation agreement and automated Midtrans escrow refunds.
- `ArtistProfileSettingsTest`: Master commission status switching, bio separation, and social links validation.
- `CommissionLifecyclePayoutTest`: Full order lifecycle, Midtrans Snap webhook simulation, Iris payouts, and reconciliation.
- `CommissionReceiptFlowTest`: Cryptographic receipt hashing, access security, and settlement calculations.
- `SlugRoutingTest`: Slug generation and route resolution for services, portfolios, and posts.
- `TwoFactorAuthTest`: TOTP setup, code verification, login challenge, and recovery codes.
- `ObservabilityAndRateLimitingTest`: Request ID correlation tracing, cache invalidation, and role-tiered rate limiters.

### Frontend Production Build
Verify TypeScript type-checking and asset bundling:

```bash
cd frontend/comme-frontend
npm run build
```

---

## Documentation Links

For in-depth guides and API specifications:
- **[Documentation Index & Overview](Docs/README.md)**
- **[System Architecture & Security Specification](Docs/ARCHITECTURE.md)**
- **[Backend Architecture & API Reference](backend/comme-backend/README.md)**
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
