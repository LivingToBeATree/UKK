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
  <img src="https://img.shields.io/badge/Tests-105%20Passed%20(443%20Assertions)-02F5A8?style=for-the-badge&logo=githubactions&logoColor=black" alt="Tests Passed">
</p>

---

## Overview

**Comme** is a digital creator platform and art commission marketplace engine built on Laravel 12, PHP 8.2+, and PostgreSQL. It delivers a secure REST API backend featuring email OTP verification, artist vetting and studio profile management, a strict commission order state machine, automated escrow payments with Midtrans Snap, automated escrow refunds upon mutual cancellation, creator bank disbursements via Midtrans Iris, official printable digital purchase receipts, SEO-friendly slug routing, direct order messaging, and a built-in interactive developer documentation portal.

---

## Key Features

### 1. Authentication & Account Security
- **Email OTP Verification**: Registration sends a 6-digit numeric OTP with rate limiting; verified users are created atomically upon confirmation.
- **Sanctum Multi-Platform Auth**: Supports SPA Cookie-based authentication and mobile/third-party Bearer API Tokens.
- **Two-Factor Authentication (2FA)**: Time-based One-Time Password (TOTP) setup with QR codes and encrypted emergency recovery codes.
- **Device Sign-In Tracking**: Detects new browser and IP logins, sending immediate security alerts with geolocation context.
- **Password Lifecycle**: Forgot password OTP flow, password reset token validation, and authenticated password changes.

### 2. Artist Vetting & Application Queue
- **Portfolio Submissions**: Regular users can submit applications with external portfolio links (ArtStation, Behance, Carrd) and social profiles.
- **Staff Review Queue**: Admin queue with atomic approval (auto-promotes user and creates `artist_profiles`) or structured rejection with explanatory feedback.

### 3. Artist Studio & Profile Settings
- **Master Availability Status**: Real-time commission availability indicator (`open`, `busy`, `closed`) that cascades across public profiles and marketplace service listings.
- **Studio Profile Customization**: Dedicated studio bio and terms separate from personal user bio, custom studio website URL, portfolio link, and social handles (Twitter/X, ArtStation, Instagram).
- **Public Profile Envelopes**: Includes aggregate rating stats, completed commission counts, and active services.

### 4. Commission Lifecycle & Order State Machine
- **Service Catalog**: Artists publish customizable commission listings with pricing, turnaround times, and revision limits.
- **Strict State Machine**: Tracks explicit transitions (`pending`, `accepted`, `in_progress`, `review`, `completed`, `cancelled`, `declined`).
- **Deadline Management**: Proposed deadline updates with client acceptance/decline workflows.
- **Revision Workflows**: Structured client revision requests tracked against allowed revision quotas.
- **Reviews & Ratings**: 1–5 star buyer feedback with verified purchase badges.

### 5. Mutual Cancellation & Automated Escrow Refunds
- **Mutual Agreement Protocol**: When an order is active (`accepted`, `in_progress`, `review`), either party can initiate a cancellation request with a mandatory reason. The counterparty can accept or decline.
- **Automated Escrow Refund**: Upon accepted cancellation (or direct cancellation of paid orders), funds held in escrow are **automatically refunded to the buyer** via the Midtrans direct refund API (with local ledger fallback).
- **Audit Records & Notifications**: Emits structured activity events, timestamps, and notification alerts to both parties.

### 6. Official Digital Purchase Receipts
- **Unique Receipt Identification**: Formatted as `REC-COM-{commission_id}-{hash}` (e.g., `REC-COM-14-8F3E2B1A`).
- **Settlement & Payment History**: Records exact payment channel, transaction ID, gross amount, platform service fee, net payout, and settlement timestamps.
- **Refund Audit Trail**: If refunded, the receipt automatically reflects the refund date, reason, and reversed financial state.
- **Print & PDF Layout**: Clean, print-optimized document view with watermarked status badges.

### 7. Midtrans Snap & Iris Escrow Disbursements
- **Midtrans Snap Checkout**: Secure token generation for buyer escrow deposits.
- **Webhook Signature Verification**: SHA-512 hash verification for all Midtrans Snap callbacks (`settlement`, `pending`, `deny`, `expire`, `cancel`).
- **Creator Bank Accounts**: Encrypted at rest using AES-256 (`bank_name`, `account_holder`, `account_number`), masked on read endpoints (`••••••••1234`).
- **Automated Bank Payouts (Midtrans Iris)**: Programmatic fund disbursement upon order confirmation or completion.
- **Resilience & Reconciliation**: Idempotent payout keys, lost-response recovery, and background status reconciliation.

### 8. SEO-Friendly Slugs & Permalinks
- **Unified `HasSlug` Trait**: Automatically generates clean URL slugs for commission services (`/services/{slug}`), portfolios (`/portfolios/{slug}`), and posts (`/posts/{slug}`).
- **Graceful Fallback**: Transparently resolves entities by slug or legacy numeric ID without breaking backwards compatibility.

### 9. Real-Time Order Messaging
- Isolated, end-to-end secure message channels between commission buyer and assigned artist.
- Support for attached artwork WIPs, reference images, and delivery attachments.

### 10. Social Feed & Creator Engagement
- Artwork feed with multi-media uploads (images/videos up to 25MB).
- Interactive likes, bookmarks, threaded comments, and user follow/follower graphs.

### 11. Scheduled Artisan Automations
- `php artisan commissions:auto-release`: Auto-releases escrow funds to creators 7 days after artwork delivery if buyer does not confirm or dispute.
- `php artisan commissions:reconcile-payouts`: Polls Midtrans Iris payout status for pending disbursements to resolve network drops.
- `php artisan commissions:retry-payouts`: Automatically retries failed bank disbursements with exponential backoff (up to 3 attempts).
- `php artisan registration:prune-expired`: Daily maintenance purging expired pending registrations and OTP codes.

### 12. Interactive Documentation & Developer Portal
- Built-in portal at `/` featuring instant endpoint search, collapsible domain groups, and cURL generation.
- **Interactive Sandbox (`/explore`)**: In-page live request console with Bearer token persistence and latency measurement.
- **Error Reference Catalog (`/errors`)**: Complete catalog of standard RFC-7807 HTTP error envelopes (400, 401, 403, 404, 409, 422, 429, 500).
- **Theme Switcher**: Dark mode, Light mode, and OS System theme with automatic SVG icon adaptation.

---

## Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Laravel 12.x |
| **Runtime** | PHP 8.2+ |
| **Database** | PostgreSQL 16+ |
| **Authentication** | Laravel Sanctum (SPA Cookies & Bearer Tokens) + 2FA TOTP |
| **Payment Gateway** | Midtrans Snap (Escrow Deposits) & Midtrans Iris (Creator Payouts) |
| **Data Encryption** | AES-256 (Creator Bank Account Numbers at rest) |
| **Mailing** | Laravel Notifications with custom branded HTML templates |
| **Testing** | PHPUnit (105 automated test methods with 443 assertions) |
| **Deployment** | Docker / Google Cloud Run + Cloud SQL + VPC Connector |

---

## Getting Started

### Prerequisites
- **PHP** >= 8.2 with extensions: `pdo`, `pdo_pgsql`, `mbstring`, `openssl`, `bcmath`, `curl`
- **Composer** >= 2.x
- **PostgreSQL** >= 16.x
- **Node.js** >= 18.x

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

Edit `.env` to configure your PostgreSQL credentials and Midtrans sandbox keys:
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

SANCTUM_STATEFUL_DOMAINS=localhost,localhost:5173,127.0.0.1,127.0.0.1:5173

# Midtrans Payment Gateway
MIDTRANS_SERVER_KEY=SB-Mid-server-...
MIDTRANS_CLIENT_KEY=SB-Mid-client-...
MIDTRANS_IS_PRODUCTION=false
MIDTRANS_IRIS_API_KEY=IRIS-...
MIDTRANS_IRIS_MERCHANT_KEY=...

# Mail / Notifications
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_username
MAIL_PASSWORD=your_password
MAIL_FROM_ADDRESS="no-reply@comme.art"
MAIL_FROM_NAME="Comme Platform"
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

### 1. Auth & Account
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/register` | Public | Initiates email registration & dispatches 6-digit OTP |
| `POST` | `/api/register/confirm` | Public | Confirms OTP & issues Sanctum Bearer token |
| `POST` | `/api/login` | Public | Authenticates user & checks new device alerts |
| `GET` | `/api/me` | Auth | Returns authenticated user profile & artist status |
| `POST` | `/api/logout` | Auth | Revokes current Sanctum access token |
| `POST` | `/api/forgot-password` | Public | Sends password reset email link |
| `POST` | `/api/reset-password` | Public | Resets password with token |
| `PUT` | `/api/profile/password` | Auth | Changes password with current password verification |
| `POST` | `/api/2fa/setup` | Auth | Generates 2FA TOTP secret & QR code |
| `POST` | `/api/2fa/confirm` | Auth | Confirms 2FA setup & returns emergency recovery codes |
| `POST` | `/api/2fa/disable` | Auth | Disables 2FA with current password confirmation |

### 2. Artist Applications & Studio Profiles
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/artist-applications` | Auth | Submits portfolio application for seller privileges |
| `GET` | `/api/artist-applications/my-application` | Auth | Views current user's application status |
| `GET` | `/api/artist-applications` | Staff | Lists pending application queue |
| `POST` | `/api/artist-applications/{id}/approve` | Staff | Approves applicant & generates artist profile |
| `POST` | `/api/artist-applications/{id}/reject` | Staff | Rejects application with reason |
| `GET` | `/api/artist-profiles/{id}` | Public | Retrieves public artist studio profile & statistics |
| `PUT` | `/api/artist-profiles/{id}` | Artist | Updates studio settings (`commission_status`, `bio`, `website`, `social_links`) |

### 3. Commission Services & Orders
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/commission-services` | Public | Lists public commission services & pricing (filterable) |
| `GET` | `/api/commission-services/{id_or_slug}` | Public | Retrieves commission service by ID or SEO slug |
| `POST` | `/api/commission-services` | Artist | Creates new commission service listing |
| `GET` | `/api/commissions` | Auth | Lists user's buyer and artist orders |
| `GET` | `/api/commissions/{id}` | Participants | Retrieves commission order detail & receipt data |
| `POST` | `/api/commissions` | Auth | Places a new commission order from a service |
| `POST` | `/api/commissions/{id}/accept` | Artist | Artist accepts a pending commission order |
| `POST` | `/api/commissions/{id}/decline` | Artist | Artist declines a pending commission order |
| `POST` | `/api/commissions/{id}/deliver` | Artist | Delivers finished artwork deliverables |
| `POST` | `/api/commissions/{id}/confirm` | Buyer | Approves delivery & triggers escrow payout release |
| `POST` | `/api/commissions/{id}/request-revision` | Buyer | Requests artwork revision against allowed quota |
| `POST` | `/api/commissions/{id}/request-cancellation`| Participants | Submits mutual cancellation request with reason |
| `POST` | `/api/commissions/{id}/accept-cancellation` | Counterparty | Accepts cancellation & **triggers automated escrow refund** |
| `POST` | `/api/commissions/{id}/decline-cancellation`| Counterparty | Declines cancellation request and resumes order |
| `PATCH`| `/api/commissions/{id}/cancel` | Participants | Direct cancellation for pending orders (refunds if paid) |
| `POST` | `/api/commissions/{id}/reviews` | Buyer | Submits review and rating for completed order |

### 4. Payments, Escrow & Creator Payouts
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/commissions/{id}/payment-token` | Buyer | Generates Midtrans Snap checkout token |
| `GET` | `/api/me/payout-account` | Artist | Retrieves artist bank transfer account (masked) |
| `PUT` | `/api/me/payout-account` | Artist | Configures artist bank account (AES-256 encrypted) |
| `POST` | `/api/midtrans/webhook` | Webhook | Midtrans Snap payment callback (SHA-512 verified) |
| `POST` | `/api/midtrans/iris-webhook` | Webhook | Midtrans Iris payout status challenge callback |

### 5. Commission Messaging
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/commissions/{id}/messages` | Participants | Fetches isolated order chat history |
| `POST` | `/api/commissions/{id}/messages` | Participants | Sends chat message & notifies recipient |

### 6. Social Feed, Posts & Portfolios
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/posts` | Public | Paginated public artwork feed |
| `GET` | `/api/posts/{id_or_slug}` | Public | Retrieves artwork post by ID or SEO slug |
| `POST` | `/api/posts` | Artist | Creates new artwork post |
| `POST` | `/api/posts/{id}/like` | Auth | Toggles like on a post |
| `POST` | `/api/posts/{id}/bookmark` | Auth | Toggles bookmark on a post |
| `GET` | `/api/me/bookmarks` | Auth | Lists authenticated user's bookmarks |
| `POST` | `/api/posts/{post}/comments` | Auth | Adds comment to a post |
| `GET` | `/api/portfolios/{id_or_slug}` | Public | Retrieves portfolio item by ID or SEO slug |
| `POST` | `/api/portfolios` | Artist | Creates new portfolio showcase piece |
| `POST` | `/api/users/{id}/follow` | Auth | Toggles user follow |
| `GET` | `/api/users/{id}/followers` | Auth | Lists user followers |

### 7. Notifications
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/notifications` | Auth | Lists user notifications (`?unread=true`) |
| `GET` | `/api/notifications/unread-count` | Auth | Returns count of unread notifications |
| `PATCH` | `/api/notifications/read-all` | Auth | Marks all notifications as read |
| `PATCH` | `/api/notifications/{id}/read` | Auth | Marks single notification as read |

### 8. Media & Moderation
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/media` | Auth | Uploads multipart image/video asset (max 25MB) |
| `GET` | `/api/media/{id}` | Public | Retrieves asset metadata and public URL |
| `DELETE` | `/api/media/{id}` | Owner/Admin | Purges media file and record |
| `POST` | `/api/reports` | Auth | Submits content report for staff review |
| `GET` | `/api/tickets` | Auth | Lists user support tickets |
| `POST` | `/api/tickets/{id}/messages` | Participants | Sends message on ticket thread |

---

## Scheduled Artisan Automation Commands

| Command | Frequency | Description |
|---|---|---|
| `commissions:auto-release` | Daily (`00:00`) | Automatically releases escrow funds to creators 7 days after review delivery |
| `commissions:reconcile-payouts`| Hourly | Polls Midtrans Iris for pending disbursements to resolve network disconnects |
| `commissions:retry-payouts` | Every 30m | Retries failed bank disbursements with exponential backoff (up to 3 attempts) |
| `registration:prune-expired` | Daily | Cleans up pending unverified registrations and expired OTP codes |

---

## Testing & Quality Assurance

The backend includes a comprehensive automated test suite of **105 tests with 443 assertions** (100% passing) covering authentication, state machines, escrow payments, automated refunds, and security policies:

```bash
# Run all automated tests
php artisan test

# Run tests with coverage summary
php artisan test --coverage
```

### Test Coverage Highlights
- **`CommissionCancellationRefundTest`**: Validates mutual cancellation agreement, direct cancellation of pending orders, automated Midtrans escrow refund triggers, refund status mutation, and receipt generation.
- **`ArtistProfileSettingsTest`**: Validates master commission availability toggles (`open`, `busy`, `closed`), bio differentiation, social links formatting, and authorization guards.
- **`CommissionLifecyclePayoutTest`**: End-to-end commission flow with escrow payment, Iris automated payouts, reconciliation, idempotent retries, and AES-256 bank encryption at rest.
- **`SlugRoutingTest`**: Validates unique SEO slug generation and dual slug/ID route resolution across services, portfolios, and posts.
- **`CommissionReceiptFlowTest`**: Validates cryptographic receipt hash generation (`REC-COM-{id}-{hash}`), financial breakdown calculations, and order access isolation.
- **`RegistrationFlowTest`**: Validates OTP dispatch, code confirmation, rate limiting, and expired registration pruning.
- **`MediaUploadTest`**: Multipart upload validation, mime type checking, and MediaPolicy authorization guards.
- **`TwoFactorAuthTest`**: TOTP setup, code verification, login challenge, and emergency recovery code redemption.

---

## Architecture & Code Organization

```
comme-backend/
├── app/
│   ├── Console/Commands/      # Artisan commands (auto-release, reconcile, retry)
│   ├── Exceptions/API/        # RFC-7807 unified exception handling
│   ├── Http/
│   │   ├── Controllers/API/   # Clean resource controllers
│   │   ├── Helpers/           # Standardized ApiResponseHelper
│   │   ├── Middleware/        # ForceJsonResponse, RateLimit, Sanctum
│   │   ├── Requests/          # Custom form request validators
│   │   └── Resources/         # JSON API transformers
│   ├── Models/                # Eloquent models & relations
│   ├── Notifications/         # Email & database notification classes
│   ├── Services/API/V1/       # Domain services (Midtrans, Escrow, Receipts)
│   └── Traits/                # HasSlug, ApiResponse, etc.
├── bootstrap/app.php          # Application bootstrap & middleware pipeline
├── public/
│   ├── css/docs.css           # Tokenized Design System
│   ├── js/docs.js             # Theme manager, drawer navigation, scroll spy
│   └── icons/SVGs/            # Day/Night themed SVGs
├── resources/
│   ├── views/
│   │   ├── layouts/app.blade.php
│   │   ├── partials/docs/     # Modular documentation domain components
│   │   ├── explore.blade.php  # Interactive API sandbox
│   │   └── errors.blade.php   # Standard error catalog
├── routes/
│   ├── api.php                # API routes & middleware groups
│   ├── web.php                # Docs, Explore, and Error routes
│   └── API/V1/                # Modular domain route files
└── tests/
    └── Feature/               # Automated end-to-end integration test suites
```

---

## License

This project is open-source software licensed under the [MIT License](LICENSE).
