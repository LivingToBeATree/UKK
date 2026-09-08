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
  <img src="https://img.shields.io/badge/Backend%20Tests-105%20Passed%20(443%20Assertions)-02F5A8?style=for-the-badge&logo=githubactions&logoColor=black" alt="Tests Passed">
</p>

---

## Overview

**Comme** is an end-to-end digital creator marketplace and art commission platform that bridges illustrators and buyers with bank-grade escrow security, transparent order lifecycles, and automated financial disbursements. 

Built with a **Laravel 12 REST API** backend and a **React 19 / TypeScript** single-page frontend, Comme provides a seamless experience for browsing artwork, purchasing custom art commissions, tracking revisions, managing studio availability, and processing instant refunds and payouts via the **Midtrans Snap** and **Midtrans Iris** payment gateways.

---

## Monorepo Architecture

```
UKK/
├── backend/comme-backend/       # Laravel 12 REST API & Developer Portal
│   ├── app/                     # Domain models, controllers, services, policies
│   ├── database/                # Migrations & comprehensive seeders
│   ├── resources/views/         # Interactive API docs portal (Blade + Vanilla CSS)
│   ├── tests/Feature/           # PHPUnit test suite (105 tests, 443 assertions)
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
    Client["React 19 Client SPA<br/>(TailwindCSS, TypeScript)"]
    API["Laravel 12 REST API<br/>(Sanctum, RFC-7807)"]
    DB[("PostgreSQL 16+<br/>Database")]
    MidtransSnap["Midtrans Snap<br/>(Escrow Checkout)"]
    MidtransIris["Midtrans Iris<br/>(Creator Bank Payouts)"]
    Scheduler["Artisan Scheduler<br/>(Auto-Release, Reconciliation)"]

    Client -->|REST API / Bearer Token| API
    Client -->|Snap Popup Checkout| MidtransSnap
    API -->|Eloquent ORM| DB
    API -->|Create Snap Token| MidtransSnap
    MidtransSnap -->|Payment Webhook (SHA-512)| API
    API -->|Disburse Escrow| MidtransIris
    MidtransIris -->|Payout Status Callback| API
    Scheduler -->|Scheduled Payout Tasks| API
```

---

## Key Platform Features

### 1. Commission Lifecycle & Escrow Protection
- **Order State Machine**: Enforces valid state transitions: `pending` &rarr; `accepted` &rarr; `in_progress` &rarr; `review` &rarr; `completed` (or `cancelled`/`declined`).
- **Escrow Vaulting**: Buyer deposits are safely held in escrow via Midtrans Snap until artwork delivery is approved.
- **Revision Tracking**: Structured client revision cycles tracked against service limits.
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
- **Bank Payout Configuration**: Artist bank accounts are encrypted with AES-256 at rest and displayed masked (`••••••••1234`).

### 5. SEO-Friendly Slug Routing
- Clean, SEO-optimized permalinks for all marketplace resources:
  - `/services/{slug}` &mdash; Commission services
  - `/portfolios/{slug}` &mdash; Creator portfolio items
  - `/posts/{slug}` &mdash; Community artwork feed posts
- Dual-lookup support transparently resolving both human-readable slugs and legacy numeric IDs.

### 6. Security & Identity
- **Email OTP Confirmation**: 6-digit one-time code verification during registration with automatic rate limiting.
- **Two-Factor Authentication (2FA)**: TOTP authentication with QR code setup and encrypted recovery codes.
- **Device Anomaly Alerts**: Automatic email notifications when sign-in occurs from an unrecognized device or IP.
- **Media Authorization**: Strict policy enforcement for file deletion, chat isolation, and order access.

### 7. Interactive Developer Documentation Portal
- Hosted directly on the backend root (`/`):
  - **Live Documentation**: Categorized endpoint groups with cURL snippets and request schemas.
  - **API Explorer (`/explore`)**: In-browser request sandbox with token persistence and latency measurement.
  - **Error Reference (`/errors`)**: RFC-7807 compliant error catalog for all HTTP status codes.
  - **Theme System**: Dark, Light, and System OS themes with day/night SVG icons.

---

## Quickstart Guide

### Prerequisites
- **PHP** >= 8.2 with `pdo_pgsql`, `mbstring`, `openssl`, `bcmath`, `curl`
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

# 3. Configure database credentials in .env:
# DB_CONNECTION=pgsql
# DB_HOST=127.0.0.1
# DB_PORT=5432
# DB_DATABASE=comme_db
# DB_USERNAME=postgres
# DB_PASSWORD=your_password

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
The backend is verified by **105 automated test methods** containing **443 assertions** with 100% passing status:

```bash
cd backend/comme-backend
php artisan test
```

Key test suites include:
- `CommissionCancellationRefundTest`: Mutual cancellation, direct cancellation, Midtrans automated escrow refund triggers, and refund receipts.
- `ArtistProfileSettingsTest`: Master commission status switching, bio separation, social links validation, and authorization guards.
- `CommissionLifecyclePayoutTest`: Full order lifecycle, Midtrans Snap webhook simulation, Iris payouts, reconciliation, and retry logic.
- `CommissionReceiptFlowTest`: Cryptographic receipt hashing, access security, and settlement calculations.
- `SlugRoutingTest`: Slug generation and route resolution for services, portfolios, and posts.
- `TwoFactorAuthTest`: TOTP setup, code verification, login challenge, and recovery codes.

### Frontend Production Build
Verify TypeScript type-checking and asset bundling:

```bash
cd frontend/comme-frontend
npm run build
```

---

## Detailed Documentation Links

For in-depth guides and API specifications, refer to the individual component documentation:
- **[Backend README & API Reference](file:///c:/Users/LENOVO/UKK/backend/comme-backend/README.md)**
- **[Frontend Architecture & Component Guide](file:///c:/Users/LENOVO/UKK/frontend/comme-frontend/README.md)**
- **[Interactive API Documentation Portal](http://localhost:8000)** (when backend is running)
- **[Interactive API Sandbox](http://localhost:8000/explore)**
- **[HTTP Error Envelope Catalog](http://localhost:8000/errors)**

---

## License

This project is open-source software licensed under the [MIT License](backend/comme-backend/LICENSE).
