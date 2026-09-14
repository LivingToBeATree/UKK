<p align="center">
  <img src="public/images/Comme_Wordmark.svg" alt="Comme API" width="340">
</p>

<p align="center">
  <strong>Creator & Art Commission Marketplace — REST API Platform</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Laravel-12.x-FF2D20?style=for-the-badge&logo=laravel&logoColor=white" alt="Laravel 12">
  <img src="https://img.shields.io/badge/PHP-8.2+-777BB4?style=for-the-badge&logo=php&logoColor=white" alt="PHP 8.2+">
  <img src="https://img.shields.io/badge/PostgreSQL-16+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Sanctum-Auth-A802F5?style=for-the-badge&logo=auth0&logoColor=white" alt="Sanctum Auth">
  <img src="https://img.shields.io/badge/Midtrans-Snap%20%26%20Iris-02F5A8?style=for-the-badge&logo=cashapp&logoColor=black" alt="Midtrans Payments">
  <img src="https://img.shields.io/badge/Watermarking-PHP%20GD%20Engine-A802F5?style=for-the-badge&logo=adobephotoshop&logoColor=white" alt="Watermarking">
  <img src="https://img.shields.io/badge/PPP-Anti--Arbitrage%20Engine-00C3FF?style=for-the-badge&logo=shield&logoColor=white" alt="Anti-Arbitrage">
</p>

---

## Overview

**Comme** is a robust digital creator platform and art commission marketplace engine built on **Laravel 12**, **PHP 8.2+**, and **PostgreSQL 16+**. It delivers an enterprise-grade REST API backend featuring:
- Bank-grade escrow payments and direct creator disbursements via **Midtrans Snap** and **Midtrans Iris**.
- Automated mutual cancellation escrow refunds.
- **Purchasing Power Parity (PPP)** regional pricing with automated GeoIP lookup and **Anti-Arbitrage fraud protection**.
- Automated **Diagonal Watermark Security Engine** protecting client WIP previews from art theft.
- Real-time **Studio Commission Queue Engine** with capacity limits and anonymous order tracking.
- Direct creator tipping with multi-currency conversion.
- Complete content reporting and moderation lifecycle.
- Cryptographically validated printable purchase receipts (`REC-COM-...`).
- Dual-lookup SEO permalinks, 2FA TOTP authentication, and an interactive developer portal.

---

## Key Features & Subsystems

### 1. Live Studio Commission Queue Engine
- **Queue Endpoint (`/api/artists/{id}/queue`)**: Computes real-time studio capacity, active orders, and pending request backlogs.
- **Capacity Enforcement**: Tracks active orders against creator studio limits (e.g. `0/5`, `5/5` or custom limit), providing clear slot availability.
- **Privacy Masking**: Protects buyer identities while displaying order codes (`COM-#5`), service titles, and stages (`accepted`, `in_progress`, `review`, `completed`).
- **Client Queue Spotlight**: Automatically identifies if the authenticated user has an active slot in the queue and returns their exact slot position and order permalink.

### 2. Regional Pricing, PPP & Anti-Arbitrage Engine
- **Purchasing Power Parity (PPP)**: Supports localized regional pricing for emerging creator economies.
- **Automatic GeoIP Resolution (`GeoIpService`)**: Detects country codes and regional multipliers via Cloudflare IP headers (`CF-Connecting-IP`), forward proxies (`X-Forwarded-For`), and MaxMind database lookups.
- **Dynamic Currency Exchange (`ExchangeRateController`)**: Fetches live exchange rates cached in Redis/PostgreSQL with automatic hourly refresh.
- **Anti-Arbitrage Security (`AntiArbitrageService`)**: Validates transaction currency, user IP geo-location, billing address, and regional tier compliance to prevent VPN-based price evasion.

### 3. Automated Diagonal Watermark Security (`WatermarkService`)
- **GD-Powered Tiling Engine**: Applies diagonal repetitive watermarks containing the artist's handle, commission order code, and platform signature across preview deliverables.
- **Configurable Geometry**: Watermarks are rendered with 35-degree rotation, alpha blending, dynamic font sizing, and uniform grid spacing.
- **WIP & Theft Protection**: Client review deliverables and unconfirmed milestones are strictly served with watermarks. Original un-watermarked high-resolution assets and ZIP packages are unlocked exclusively upon client approval and escrow release.

### 4. Direct Creator Tipping Subsystem (`ArtistTipController`)
- **Direct Support Mechanism (`POST /api/artists/{id}/tips`)**: Enables clients to tip artists directly with custom or quick-pick amounts.
- **Multi-Currency Normalization**: Accepts tip values in foreign currencies (USD, JPY, EUR, etc.), computes exchange rates, records original amounts, and executes escrow checkout via Midtrans Snap.

### 5. Commission Lifecycle & Order State Machine
- **Service Catalog**: Artists publish customizable commission listings with pricing, turnaround times, regional rates, add-ons, and revision limits.
- **Strict State Machine**: Tracks explicit transitions: `pending` &rarr; `accepted` &rarr; `in_progress` &rarr; `review` &rarr; `completed` (or `cancelled`/`declined`).
- **Deadline Negotiation**: Structured deadline proposal and counter-acceptance workflow (`propose-deadline`, `accept-deadline`, `decline-deadline`, `update-deadline`).
- **Delivery Validation**: Dedicated `DeliverCommissionRequest` enforcing accepted file formats (images, videos, archives, design files) up to 50MB.
- **Revision Workflows**: Structured client revision requests tracked against allowed revision quotas.
- **Reviews & Ratings**: 1–5 star buyer feedback with verified purchase badges, review updates, deletion, and artist replies.

### 6. Mutual Cancellation & Automated Escrow Refunds
- **Mutual Agreement Protocol**: When an order is active (`accepted`, `in_progress`, `review`), either party can initiate a cancellation request with a mandatory reason. The counterparty can accept or decline.
- **Automated Escrow Refund**: Upon accepted cancellation (or direct cancellation of paid orders), funds held in escrow are **automatically refunded to the buyer** via the Midtrans direct refund API (with local ledger fallback).
- **Audit Records & Notifications**: Emits structured activity events, timestamps, and notification alerts to both parties.

### 7. Official Digital Purchase Receipts
- **Unique Receipt Identification**: Formatted as `REC-COM-{commission_id}-{hash}` (e.g., `REC-COM-14-8F3E2B1A`).
- **Settlement & Payment History**: Records exact payment channel, transaction ID, gross amount, platform service fee, net payout, and settlement timestamps.
- **Refund Audit Trail**: If refunded, the receipt automatically reflects the refund date, reason, and reversed financial state.
- **Print & PDF Layout**: Clean, print-optimized document view with watermarked status badges.

### 8. Midtrans Snap & Iris Escrow Disbursements
- **Midtrans Snap Checkout**: Secure token generation for buyer escrow deposits via `/api/commissions/{id}/payment`.
- **Intelligent Channel Routing (`MidtransService`)**: Evaluates the order's billing currency. Non-IDR international checkouts (e.g. `USD`, `EUR`, `JPY`, `SGD`, `GBP`) dynamically restrict `enabled_payments` to `['credit_card']` for a streamlined, frictionless global experience. Domestic `IDR` checkouts activate the full Indonesian payment rail (QRIS, GoPay, ShopeePay, and Virtual Accounts).
- **Live Settlement Verification**: Immediate payment status checks (`/payment/check-status`) to verify transactions in real time.
- **Environment Route Guards**: Test payment simulation (`/payment/simulate`) strictly isolated to local and testing environments.
- **Webhook Signature Verification**: SHA-512 hash verification for all Midtrans Snap callbacks (`settlement`, `pending`, `deny`, `expire`, `cancel`).
- **Creator Bank Accounts**: Encrypted at rest using AES-256 (`bank_name`, `account_holder`, `account_number`), masked on read endpoints (`••••••••1234`), with secure deletion support.
- **Automated Bank Payouts (Midtrans Iris)**: Programmatic fund disbursement upon order confirmation or completion.

### 9. Content Reporting & Moderation Lifecycle (`ReportController`)
- **Universal Content Reporting (`POST /api/reports`)**: Users can report artwork posts, comments, commission services, and user profiles.
- **Standardized Violation Reasons**: Enforced via `ReportReason` enum (`spam`, `harassment`, `nsfw`, `copyright`, `fraud`, `other`).
- **Staff Moderation Workbench**: Administrative queue with action execution (`remove_content`, `warn_user`, `suspend_account`, `dismiss`).

---

## Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Laravel 12.x |
| **Runtime** | PHP 8.2+ with `pdo_pgsql`, `gd`, `bcmath`, `mbstring`, `curl` |
| **Database** | PostgreSQL 16+ |
| **Queue & Workers** | PostgreSQL Database Queue (`database`) with `after_commit` & `ProcessMediaJob` |
| **Storage & Disks** | Dual-Disk Architecture (Public, Private, Cloud Storage) |
| **Observability (APM)** | Laravel Pulse (`/pulse`) |
| **Log Diagnostics** | Interactive Log Viewer (`/log-viewer`) |
| **Authentication** | Laravel Sanctum (Bearer Tokens & SPA Cookies) + 2FA TOTP |
| **Payment Gateway** | Midtrans Snap (Escrow Deposits) & Midtrans Iris (Creator Payouts) |
| **Data Encryption** | AES-256 (Creator Bank Accounts at rest) |
| **Testing** | PHPUnit (Comprehensive automated test suite with full assertion coverage) |

---

## Getting Started

### Prerequisites
- **PHP** >= 8.2 with extensions: `pdo_pgsql`, `gd`, `mbstring`, `openssl`, `bcmath`, `curl`, `fileinfo`
- **Composer** >= 2.x
- **PostgreSQL** >= 16.x

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-org/comme-backend.git
cd comme-backend

# Install PHP dependencies
composer install
```

### 2. Configure Environment
```bash
cp .env.example .env
php artisan key:generate
```

Edit `.env` to configure your PostgreSQL credentials, CORS origin, and Midtrans sandbox keys:
```env
APP_NAME=Comme
APP_ENV=local
APP_KEY=base64:...
APP_DEBUG=true
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=comme_db
DB_USERNAME=postgres
DB_PASSWORD=your_postgres_password

CORS_ALLOWED_ORIGINS=http://localhost:5173

# Midtrans Payment Gateway
MIDTRANS_SERVER_KEY=SB-Mid-server-...
MIDTRANS_CLIENT_KEY=SB-Mid-client-...
MIDTRANS_IS_PRODUCTION=false
MIDTRANS_IRIS_API_KEY=IRIS-...
MIDTRANS_IRIS_MERCHANT_KEY=...
```

### 3. Run Database Migrations & Seeders
```bash
php artisan migrate --seed
```

### 4. Start Local Development Server
```bash
php artisan serve
```

The API and documentation portal will now be live at:
- **API Docs Portal**: [http://localhost:8000](http://localhost:8000)
- **Interactive Sandbox**: [http://localhost:8000/explore](http://localhost:8000/explore)
- **Error Codes Catalog**: [http://localhost:8000/errors](http://localhost:8000/errors)

---

## API Endpoints Reference

All API routes are prefixed with `/api` and expect headers:
```http
Accept: application/json
Content-Type: application/json
Authorization: Bearer <personal_access_token>
```

### 1. Auth & Account Security
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/register` | Public | Initiates email registration & dispatches 6-digit OTP |
| `POST` | `/api/register/confirm` | Public | Confirms OTP & issues Sanctum Bearer token |
| `POST` | `/api/register/resend` | Public | Resends registration OTP code (rate-limited) |
| `POST` | `/api/login` | Public | Authenticates user & checks new device alerts |
| `POST` | `/api/login/2fa` | Public | Completes 2FA login challenge with TOTP code |
| `GET` | `/api/me` | Auth | Returns authenticated user profile & artist status |
| `POST` | `/api/logout` | Auth | Revokes current Sanctum access token |
| `POST` | `/api/logout-other-devices` | Auth | Revokes tokens for all other active user sessions |
| `PATCH`| `/api/profile` | Auth | Updates display name, bio, avatar, and banner |
| `PUT` | `/api/profile/password` | Auth | Changes password with current password verification |
| `GET` | `/api/profile/sessions` | Auth | Lists active user sessions with IP and browser info |
| `DELETE`| `/api/profile/sessions/{id}` | Auth | Remotely terminates a specific active session |
| `POST` | `/api/profile/acknowledge-warning`| Auth | Acknowledges official moderator warning |
| `DELETE`| `/api/account` | Auth | Permanently deletes authenticated user account |
| `POST` | `/api/profile/2fa/setup` | Auth | Generates 2FA TOTP secret & QR code |
| `POST` | `/api/profile/2fa/confirm` | Auth | Confirms 2FA setup & returns recovery codes |
| `GET` | `/api/profile/2fa/recovery-codes`| Auth | Retrieves current emergency 2FA recovery codes |
| `POST` | `/api/profile/2fa/recovery-codes`| Auth | Regenerates emergency 2FA recovery codes |
| `DELETE`| `/api/profile/2fa` | Auth | Disables 2FA with current password confirmation |

### 2. Live Commission Queue & Artist Profiles
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/artists/{id}/queue` | Public | Returns real-time studio queue capacity, slots, and active orders |
| `GET` | `/api/artist-profiles/{id}` | Public | Retrieves public artist studio profile & statistics |
| `PUT` | `/api/artist-profiles/{id}` | Artist | Updates studio settings (`commission_status`, `bio`, `website`, `social_links`) |
| `POST` | `/api/artists/{id}/tips` | Auth | Initiates direct tip with multi-currency conversion & Snap checkout |
| `POST` | `/api/artist-applications` | Auth | Submits portfolio application for seller privileges |
| `GET` | `/api/artist-applications/my-application` | Auth | Views current user's application status |
| `GET` | `/api/artist-applications` | Staff | Lists pending application review queue |
| `POST` | `/api/artist-applications/{id}/approve` | Staff | Approves applicant & generates artist profile |
| `POST` | `/api/artist-applications/{id}/reject` | Staff | Rejects application with structured feedback |

### 3. Currency Exchange, GeoIP & Anti-Arbitrage
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/exchange-rates` | Public | Returns cached exchange rates against IDR |
| `GET` | `/api/geoip/lookup` | Public | Resolves client IP country code and regional pricing tier |

### 4. Commission Services & Order Management
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/commission-services` | Public | Lists public commission services & pricing (filterable) |
| `GET` | `/api/commission-services/{id_or_slug}` | Public | Retrieves commission service by ID or SEO slug |
| `POST` | `/api/commission-services` | Artist | Creates new commission service listing |
| `PUT/PATCH`| `/api/commission-services/{id}` | Artist | Updates commission service listing |
| `DELETE`| `/api/commission-services/{id}` | Artist | Archives or deletes commission service |
| `GET` | `/api/commissions` | Auth | Lists user's buyer and artist orders |
| `GET` | `/api/commissions/{id_or_slug}` | Participants | Retrieves commission order detail, messages & receipt data |
| `POST` | `/api/commissions` | Auth | Places new commission order (Anti-arbitrage & MIME validated) |
| `POST` | `/api/commissions/{commission}/accept` | Artist | Artist accepts a pending commission order |
| `POST` | `/api/commissions/{commission}/decline` | Artist | Artist declines a pending commission order |
| `POST` | `/api/commissions/{commission}/deliver` | Artist | Submits finished deliverables (MIME & size validated) |
| `POST` | `/api/commissions/{commission}/confirm` | Buyer | Approves delivery & triggers escrow payout release |
| `POST` | `/api/commissions/{commission}/request-revision` | Buyer | Requests artwork revision against allowed quota |
| `POST` | `/api/commissions/{commission}/propose-deadline` | Artist | Proposes a new deadline extension with note |
| `POST` | `/api/commissions/{commission}/accept-deadline` | Buyer | Accepts proposed deadline extension |
| `POST` | `/api/commissions/{commission}/decline-deadline`| Buyer | Declines proposed deadline extension |
| `POST` | `/api/commissions/{commission}/request-cancellation`| Participants | Submits mutual cancellation request with reason |
| `POST` | `/api/commissions/{commission}/accept-cancellation` | Counterparty | Accepts cancellation & **triggers automated escrow refund** |
| `POST` | `/api/commissions/{commission}/decline-cancellation`| Counterparty | Declines cancellation request and resumes order |
| `PATCH`| `/api/commissions/{commission}/cancel` | Participants | Direct cancellation for pending orders (refunds if paid) |
| `POST` | `/api/commissions/{commission}/reviews` | Buyer | Submits review and rating for completed order |

### 5. Payments, Escrow & Creator Payouts
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/commissions/{commission}/payment` | Buyer | Generates Midtrans Snap checkout token for escrow |
| `GET/POST`| `/api/commissions/{commission}/payment/check-status`| Buyer/Artist | Queries live Midtrans API for transaction status |
| `POST` | `/api/commissions/{commission}/payment/simulate` | Dev/Test | Simulates instant settlement (`local`/`testing` only) |
| `GET` | `/api/me/payout-account` | Artist | Retrieves artist bank transfer account (masked) |
| `PUT` | `/api/me/payout-account` | Artist | Configures artist bank account (AES-256 encrypted) |
| `DELETE`| `/api/me/payout-account` | Artist | Removes configured bank payout account |
| `POST` | `/api/midtrans/webhook` | Webhook | Midtrans Snap payment callback (SHA-512 verified) |
| `POST` | `/api/midtrans/iris-webhook` | Webhook | Midtrans Iris payout status challenge callback |

### 6. Media & Private Deliverables
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/media` | Auth | Uploads multipart image/video asset (max 25MB) |
| `GET` | `/api/media/{id}` | Public | Retrieves asset metadata and public URL |
| `GET` | `/api/media/{id}/download` | Public | Initiates direct binary download of media asset |
| `GET` | `/api/media/private/{media}/download` | Authorized | Protected download for commission deliverables & proofs |
| `GET` | `/api/media/stream/{path}` | Public | HTTP 206 Byte-Range streaming for video seeking |
| `GET` | `/storage/{path}` | Public | Direct storage provider with CORS headers and disk fallback |

### 7. Content Reporting & Moderation
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/reports` | Auth | Submits content report for staff review with standard reason |
| `GET` | `/api/reports` | Staff | Lists reported content queue |
| `GET` | `/api/reports/{report}` | Staff | Retrieves single report detail |
| `PUT/PATCH`| `/api/reports/{report}` | Staff | Updates report status and notes |
| `POST` | `/api/reports/{report}/action` | Staff | Executes moderation action (`remove_content`, `warn`, `suspend`) |

---

## Scheduled Artisan Automation Commands

| Command | Frequency | Description |
|---|---|---|
| `commissions:release-due-payouts` | Every Minute (`everyMinute()`, background) | Automatically completes commissions and queues creator payouts when 7-day review deadline elapses |
| `commissions:reconcile-payouts` | Every 5 Minutes (`everyFiveMinutes()`, background) | Polls Midtrans Iris payout status for in-flight disbursements to resolve network disconnects |
| `commissions:retry-failed-payouts`| Every 30 Minutes (`everyThirtyMinutes()`, background) | Retries failed bank disbursements with exponential backoff (up to 3 attempts) |
| `model:prune --model=PendingRegistration` | Hourly (`hourly()`) | Prunes expired pending user registrations and dead OTP codes |
| `migrate:sync-existing` | Deployment On-Demand | Synchronizes existing database tables into migrations ledger to guarantee idempotent migrations |

---

## Testing & Quality Assurance

The backend features a comprehensive automated test suite covering security, anti-arbitrage, watermarking, payment lifecycles, and escrow state machines:

```bash
# Run all automated tests
php artisan test

# Run tests with coverage summary
php artisan test --coverage
```

### Key Test Suites
- **`AntiArbitrageSecurityTest`**: Validates regional currency enforcement, IP-to-country verification, and prevention of bypass attacks.
- **`SecurityVulnerabilityFixesTest`**: Verifies path traversal protection, MIME type validation, and private deliverable access control.
- **`CommissionCancellationRefundTest`**: Validates mutual cancellation agreement, direct cancellation of pending orders, automated Midtrans escrow refund triggers, and refund receipts.
- **`ArtistProfileSettingsTest`**: Validates master commission availability toggles (`open`, `busy`, `closed`), bio differentiation, and social links formatting.
- **`CommissionLifecyclePayoutTest`**: End-to-end commission flow with escrow payment, Iris automated payouts, reconciliation, and AES-256 bank encryption.
- **`SlugRoutingTest`**: Validates unique SEO slug generation and dual slug/ID route resolution across services, portfolios, and posts.
- **`ObservabilityAndRateLimitingTest`**: Request correlation ID (`X-Request-ID`), smart cache epoch invalidation, and role-tiered rate limiters.
- **`TwoFactorAuthTest`**: TOTP setup, code verification, login challenge, and emergency recovery code redemption.

---

## License

This project is open-source software licensed under the [MIT License](LICENSE).
