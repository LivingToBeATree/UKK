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
  <img src="https://img.shields.io/badge/Tests-125%20Passed%20(539%20Assertions)-02F5A8?style=for-the-badge&logo=githubactions&logoColor=black" alt="Tests Passed">
</p>

---

## Overview

**Comme** is a digital creator platform and art commission marketplace engine built on Laravel 12, PHP 8.2+, and PostgreSQL. It delivers a secure REST API backend featuring email OTP verification, artist vetting and studio profile management, a strict commission order state machine, automated escrow payments with Midtrans Snap, automated escrow refunds upon mutual cancellation, creator bank disbursements via Midtrans Iris, official printable digital purchase receipts, SEO-friendly slug routing, direct order messaging, and a built-in interactive developer documentation portal.

---

## Key Features

### 1. Authentication & Account Security
- **Email OTP Verification**: Registration sends a 6-digit numeric OTP with rate limiting; verified users are created atomically upon confirmation.
- **Sanctum Multi-Platform Auth**: Supports SPA Cookie-based authentication and cross-origin Bearer API Tokens for cloud deployments.
- **Two-Factor Authentication (2FA)**: Time-based One-Time Password (TOTP) setup with QR codes and encrypted emergency recovery codes (`/api/profile/2fa/*`).
- **Device & Session Management**: Tracks active user sessions with IP and user-agent context, remote session revoking (`/api/profile/sessions`), logout from other devices, and new device anomaly alerts.
- **Password & Account Lifecycle**: Forgot password OTP flow, password reset token validation, authenticated password changes, warning acknowledgment, and GDPR account deletion (`DELETE /api/account`).

### 2. Artist Vetting & Application Queue
- **Portfolio Submissions**: Regular users can submit applications with external portfolio links (ArtStation, Behance, Carrd) and social profiles.
- **Staff Review Queue**: Admin queue with atomic approval (auto-promotes user and creates `artist_profiles`) or structured rejection with explanatory feedback; status updates delivered in real-time via in-app bell notifications.

### 3. Artist Studio & Profile Settings
- **Master Availability Status**: Real-time commission availability indicator (`open`, `busy`, `closed`) that cascades across public profiles and marketplace service listings.
- **Studio Profile Customization**: Dedicated studio bio and terms separate from personal user bio, custom studio website URL, portfolio link, and social handles (Twitter/X, ArtStation, Instagram).
- **Public Profile Envelopes**: Includes aggregate rating stats, completed commission counts, active services, and verified reviews.

### 4. Commission Lifecycle & Order State Machine
- **Service Catalog**: Artists publish customizable commission listings with pricing, turnaround times, add-ons, and revision limits.
- **Strict State Machine**: Tracks explicit transitions (`pending`, `accepted`, `in_progress`, `review`, `completed`, `cancelled`, `declined`).
- **Deadline Negotiation**: Structured deadline proposal and counter-acceptance workflow (`propose-deadline`, `accept-deadline`, `decline-deadline`, `update-deadline`).
- **Delivery Validation**: Dedicated `DeliverCommissionRequest` enforcing accepted file formats (images, videos, archives, design files) up to 50MB.
- **Revision Workflows**: Structured client revision requests tracked against allowed revision quotas.
- **Reviews & Ratings**: 1–5 star buyer feedback with verified purchase badges, review updates, deletion, and artist replies.

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
- **Midtrans Snap Checkout**: Secure token generation for buyer escrow deposits via `/api/commissions/{id}/payment`.
- **Live Settlement Verification**: Immediate payment status checks (`/payment/check-status`) to verify transactions in real time.
- **Environment Route Guards**: Test payment simulation (`/payment/simulate`) strictly isolated to local and testing environments.
- **Webhook Signature Verification**: SHA-512 hash verification for all Midtrans Snap callbacks (`settlement`, `pending`, `deny`, `expire`, `cancel`).
- **Creator Bank Accounts**: Encrypted at rest using AES-256 (`bank_name`, `account_holder`, `account_number`), masked on read endpoints (`••••••••1234`), with secure deletion support.
- **Automated Bank Payouts (Midtrans Iris)**: Programmatic fund disbursement upon order confirmation or completion.
- **Resilience & Reconciliation**: Idempotent payout keys, lost-response recovery, and automated background reconciliation.

### 8. SEO-Friendly Slugs & Permalinks
- **Unified `HasSlug` Trait**: Automatically generates clean URL slugs for commission services (`/services/{slug}`), portfolios (`/portfolios/{slug}`), posts (`/posts/{slug}`), and commission orders (`/commissions/{slug}`).
- **Graceful Fallback**: Transparently resolves entities by slug or legacy numeric ID without breaking backwards compatibility.

### 9. Real-Time Order Messaging
- Isolated, end-to-end secure message channels between commission buyer and assigned artist.
- Support for attached artwork WIPs, reference images, and delivery attachments.

### 10. Social Feed & Creator Engagement
- Artwork feed with multi-media uploads (images/videos up to 25MB) and HTTP 206 Byte-Range streaming for video seeking (`/api/media/stream/{path}`).
- Interactive likes, bookmarks, threaded comments with author editing (`PUT`) and deletion (`DELETE`) controls, and user follow/follower graphs.

### 11. Scheduled Artisan Automations
- `php artisan commissions:release-due-payouts`: Runs every minute (`everyMinute()`, non-overlapping) to auto-release escrow funds to creators 7 days after artwork delivery if buyer does not confirm or dispute.
- `php artisan commissions:reconcile-payouts`: Runs every 5 minutes (`everyFiveMinutes()`, non-overlapping) to poll Midtrans Iris payout status for in-flight disbursements and resolve network disconnects.
- `php artisan commissions:retry-failed-payouts`: Runs every 30 minutes (`everyThirtyMinutes()`, non-overlapping) to retry failed bank disbursements with exponential backoff (up to 3 attempts).
- `php artisan model:prune --model=PendingRegistration`: Runs hourly to clean up unverified registrations and expired OTP codes.
- `php artisan migrate:sync-existing`: Synchronization utility for cloud deployments to register existing schema objects and guarantee idempotent migrations.

### 12. Security Hardening & Cloud Infrastructure
- **Strict CORS Allowlist**: Credentialed requests locked down exclusively to domains configured in `CORS_ALLOWED_ORIGINS` (wildcard subdomains removed).
- **Dependency Pinning**: Third-party payment libraries like `midtrans/midtrans-php` strictly pinned (`^2.5`) to eliminate supply chain vulnerabilities.
- **Cloud Run Media Persistence**: Integrated Google Cloud Storage (`comme_bucket`) persistent volume mount for containerized environments.
- **Direct Storage Provider**: Built-in `/storage/{path}` route with CORS headers and fallback resolution across public and cloud storage disks.
- **Codebase Cleanliness**: All models, enums, facades, services, and exceptions strictly imported via top-level `use` statements with zero inline FQCNs.

### 13. Interactive Documentation & Developer Portal
- Built-in portal at `/` featuring instant endpoint search, collapsible domain groups, and cURL generation.
- **Interactive Sandbox (`/explore`)**: In-page live request console with Bearer token persistence and latency measurement.
- **Error Reference Catalog (`/errors`)**: Complete catalog of standard RFC-7807 HTTP error envelopes (400, 401, 403, 404, 409, 422, 429, 500).
- **Transactional Email Inspector (`/emails`)**: In-browser live preview for transactional mailers (Registration OTP, Password Reset, Password Changed, New Device Login) with HTML and Plaintext fallback toggle, desktop/mobile viewports, and metadata header inspection.
- **Theme Switcher**: Dark mode, Light mode, and OS System theme with automatic SVG icon adaptation.

### 14. Real-Time Observability, Smart Caching & Tiered Rate Limiting
- **Laravel Pulse (`/pulse`)**: Real-time application performance monitoring (APM) dashboard tracking slow database queries (>500ms), slow HTTP requests (>1,000ms), cache hit/miss ratio, and server usage.
- **Interactive Log Viewer (`/log-viewer`)**: In-browser diagnostic logging portal with live streaming, search by log level, formatted stack traces, and log file downloads.
- **PostgreSQL-Backed Smart Caching (`CacheService`)**: Fast caching for public artwork feeds, commission service listings, and artist profiles using epoch-based invalidation that guarantees atomic cache purging upon model lifecycle events via `CacheInvalidationObserver`.
- **Role-Tiered Rate Limiting**: Dynamic request throttling based on authenticated roles:
  - **Admin**: 300 req/min
  - **Moderator**: 240 req/min
  - **Verified Artist**: 180 req/min (high-frequency studio workflows)
  - **Authenticated Buyer**: 120 req/min
  - **Guest / Public**: 60 req/min
  - Dedicated limiters: Search (30 req/min), Media Uploads (20 req/min), Payment Checkout (10 req/min).
- **Request Correlation Tracing (`AssignRequestId`)**: Unique `X-Request-ID` UUID automatically assigned to every request, injected into structured logging context (`Log::withContext(...)`), and returned in response headers for end-to-end debugging.
- **Slow Query Detection**: Automatic database listener (`DB::whenQueryingForLongerThan(500)`) logging warnings for queries exceeding 500ms.

### 15. Asynchronous Queue Processing & Multi-Disk Filesystem
- **Asynchronous Media Processing (`ProcessMediaJob`)**: Heavy media operations (MP4 video faststart relocation and responsive WebP thumbnail generation) offloaded from the HTTP request thread to the database queue worker (`QUEUE_CONNECTION=database`), dropping upload latency to sub-150ms.
- **Race-Condition Hardening**: Configured `'after_commit' => true` in `config/queue.php` for database queue transactions with automatic retry policies (`$tries = 3`, `$backoff = [10, 30]`).
- **Dual-Disk Architecture (`public` vs `private`)**:
  - **Public Disk (`storage/app/public`)**: Public social posts, avatars, and portfolio showcases.
  - **Private Disk (`storage/app/private`)**: Protected commission deliverables, reference briefs, and private ticket attachments served exclusively through `PrivateMediaController` (`/api/media/private/{media}/download`) with participant/role authorization.
- **Automated Thumbnail Pipeline**: Generates lightweight companion WebP/JPEG thumbnails (`thumbnail_url`) via `MediaProcessingService` to deliver responsive, bandwidth-efficient social feeds.
- **Storage Garbage Collection (`php artisan media:prune`)**: Scheduled daily Artisan command (`PruneOrphanedMediaJob`) that detects and permanently deletes abandoned, unattached media files older than 24 hours while safely preserving all active relations.

---

## Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Laravel 12.x |
| **Runtime** | PHP 8.2+ |
| **Database** | PostgreSQL 16+ |
| **Queue & Workers** | PostgreSQL Database Queue (`database`) with `after_commit` & `ProcessMediaJob` |
| **Storage & Disks** | Dual-Disk Architecture (Public, Private, Cloudflare R2 / S3) |
| **Observability (APM)** | Laravel Pulse (`/pulse`) |
| **Log Diagnostics** | Interactive Log Viewer (`/log-viewer`) |
| **Authentication** | Laravel Sanctum (SPA Cookies & Bearer Tokens) + 2FA TOTP |
| **Payment Gateway** | Midtrans Snap (Escrow Deposits) & Midtrans Iris (Creator Payouts) |
| **Data Encryption** | AES-256 (Creator Bank Account Numbers at rest) |
| **Mailing** | Laravel Notifications with custom branded HTML templates & in-browser live inspector (`/emails`) |
| **Testing** | PHPUnit (125 automated test methods with 539 assertions) |
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
| `POST` | `/api/forgot-password` | Public | Sends password reset email link |
| `POST` | `/api/reset-password` | Public | Resets password with signed token |
| `GET` | `/api/email/verify/{id}/{hash}` | Auth (Signed)| Verifies email address from verification link |
| `POST` | `/api/email/verification-notification` | Auth | Resends email verification link |
| `POST` | `/api/profile/2fa/setup` | Auth | Generates 2FA TOTP secret & QR code |
| `POST` | `/api/profile/2fa/confirm` | Auth | Confirms 2FA setup & returns recovery codes |
| `GET` | `/api/profile/2fa/recovery-codes`| Auth | Retrieves current emergency 2FA recovery codes |
| `POST` | `/api/profile/2fa/recovery-codes`| Auth | Regenerates emergency 2FA recovery codes |
| `DELETE`| `/api/profile/2fa` | Auth | Disables 2FA with current password confirmation |
| `GET` | `/api/users/{username}` | Public | Public user profile & artist portfolio preview |

### 2. Artist Applications & Studio Profiles
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/artist-applications` | Auth | Submits portfolio application for seller privileges |
| `GET` | `/api/artist-applications/my-application` | Auth | Views current user's application status |
| `GET` | `/api/artist-applications` | Staff | Lists pending application review queue |
| `POST` | `/api/artist-applications/{id}/approve` | Staff | Approves applicant & generates artist profile |
| `POST` | `/api/artist-applications/{id}/reject` | Staff | Rejects application with structured feedback |
| `GET` | `/api/artist-profiles/{id}` | Public | Retrieves public artist studio profile & statistics |
| `PUT` | `/api/artist-profiles/{id}` | Artist | Updates studio settings (`commission_status`, `bio`, `website`, `social_links`) |
| `GET` | `/api/artist-profiles/{id}/reviews` | Public | Lists verified reviews for an artist profile |

### 3. Commission Services & Order Management
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/commission-services` | Public | Lists public commission services & pricing (filterable) |
| `GET` | `/api/commission-services/{id_or_slug}` | Public | Retrieves commission service by ID or SEO slug |
| `POST` | `/api/commission-services` | Artist | Creates new commission service listing |
| `PUT/PATCH`| `/api/commission-services/{id}` | Artist | Updates commission service listing |
| `DELETE`| `/api/commission-services/{id}` | Artist | Archives or deletes commission service |
| `GET` | `/api/commissions` | Auth | Lists user's buyer and artist orders |
| `GET` | `/api/commissions/{id_or_slug}` | Participants | Retrieves commission order detail, messages & receipt data |
| `POST` | `/api/commissions` | Auth | Places new commission order (MIME & size validated) |
| `PUT/PATCH`| `/api/commissions/{commission}` | Participants | Updates commission parameters |
| `POST` | `/api/commissions/{commission}/accept` | Artist | Artist accepts a pending commission order |
| `POST` | `/api/commissions/{commission}/decline` | Artist | Artist declines a pending commission order |
| `POST` | `/api/commissions/{commission}/deliver` | Artist | Submits finished deliverables (MIME & size validated) |
| `POST` | `/api/commissions/{commission}/confirm` | Buyer | Approves delivery & triggers escrow payout release |
| `POST` | `/api/commissions/{commission}/request-revision` | Buyer | Requests artwork revision against allowed quota |
| `PATCH`| `/api/commissions/{commission}/deadline` | Participants | Directly adjusts agreed commission deadline |
| `POST` | `/api/commissions/{commission}/propose-deadline` | Artist | Proposes a new deadline extension with note |
| `POST` | `/api/commissions/{commission}/accept-deadline` | Buyer | Accepts proposed deadline extension |
| `POST` | `/api/commissions/{commission}/decline-deadline`| Buyer | Declines proposed deadline extension |
| `POST` | `/api/commissions/{commission}/request-cancellation`| Participants | Submits mutual cancellation request with reason |
| `POST` | `/api/commissions/{commission}/accept-cancellation` | Counterparty | Accepts cancellation & **triggers automated escrow refund** |
| `POST` | `/api/commissions/{commission}/decline-cancellation`| Counterparty | Declines cancellation request and resumes order |
| `PATCH`| `/api/commissions/{commission}/cancel` | Participants | Direct cancellation for pending orders (refunds if paid) |
| `POST` | `/api/commissions/{commission}/reviews` | Buyer | Submits review and rating for completed order |
| `GET` | `/api/reviews/{review}` | Public | Retrieves specific review details |
| `PUT/PATCH`| `/api/reviews/{review}` | Review Author | Updates review rating and comment |
| `DELETE`| `/api/reviews/{review}` | Review Author | Removes review |
| `PATCH`| `/api/reviews/{review}/reply` | Artist | Artist reply to buyer review |

### 4. Payments, Escrow & Creator Payouts
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

### 5. Commission Messaging
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/commissions/{commission}/messages` | Participants | Fetches isolated order chat history |
| `POST` | `/api/commissions/{commission}/messages` | Participants | Sends chat message with optional attachments |

### 6. Social Feed, Posts & Comments
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/posts` | Public | Paginated public artwork feed |
| `GET` | `/api/posts/{id_or_slug}` | Public | Retrieves artwork post by ID or SEO slug |
| `POST` | `/api/posts` | Artist | Creates new artwork post |
| `PUT/PATCH`| `/api/posts/{post}` | Post Author | Updates post content and visibility |
| `DELETE`| `/api/posts/{post}` | Author/Admin | Deletes artwork post and associated media |
| `POST` | `/api/posts/{post}/like` | Auth | Toggles like on a post |
| `POST` | `/api/posts/{post}/bookmark` | Auth | Toggles bookmark on a post |
| `GET` | `/api/me/bookmarks` | Auth | Lists authenticated user's bookmarks |
| `GET` | `/api/me/likes` | Auth | Lists authenticated user's liked posts |
| `GET` | `/api/posts/{post}/comments` | Public | Lists threaded comments on a post |
| `POST` | `/api/posts/{post}/comments` | Auth | Adds comment to a post |
| `GET` | `/api/comments/{comment}` | Public | Retrieves comment details |
| `PUT/PATCH`| `/api/comments/{comment}` | Comment Author | Edits existing comment body |
| `DELETE`| `/api/comments/{comment}` | Author/Admin | Deletes comment |
| `POST` | `/api/comments/{comment}/like` | Auth | Toggles like on comment |
| `POST` | `/api/comments/{comment}/bookmark` | Auth | Toggles bookmark on comment |
| `GET` | `/api/portfolios` | Public | Lists public portfolio items |
| `GET` | `/api/portfolios/{id_or_slug}` | Public | Retrieves portfolio item by ID or SEO slug |
| `POST` | `/api/portfolios` | Artist | Creates new portfolio showcase piece |
| `PUT/PATCH`| `/api/portfolios/{portfolio}` | Portfolio Author | Updates portfolio showcase piece |
| `DELETE`| `/api/portfolios/{portfolio}` | Author/Admin | Removes portfolio piece |
| `POST` | `/api/users/{user}/follow` | Auth | Toggles user follow |
| `GET` | `/api/users/{user}/followers` | Auth | Lists user followers |
| `GET` | `/api/users/{user}/following` | Auth | Lists user following |
| `GET` | `/api/tags` | Public | Lists trending discovery tags |
| `GET` | `/api/gifs` | Public | Proxied KLIPY GIF search & trending feed |

### 7. Notifications
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/notifications` | Auth | Lists user notifications (`?unread=true`) |
| `GET` | `/api/notifications/unread-count` | Auth | Returns count of unread notifications |
| `PATCH`| `/api/notifications/read-all` | Auth | Marks all notifications as read |
| `PATCH`| `/api/notifications/{id}/read` | Auth | Marks single notification as read |
| `DELETE`| `/api/notifications/{id}` | Auth | Removes notification record |

### 8. Media, Streaming & Moderation
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/media` | Auth | Uploads multipart image/video asset (max 25MB) |
| `GET` | `/api/media/{id}` | Public | Retrieves asset metadata and public URL |
| `GET` | `/api/media/{id}/download` | Public | Initiates direct binary download of media asset |
| `GET` | `/api/media/download-file` | Public | Downloads media by path parameter |
| `GET` | `/api/media/stream/{path}` | Public | HTTP 206 Byte-Range streaming for video seeking |
| `DELETE`| `/api/media/{id}` | Owner/Admin | Purges media file and record |
| `GET` | `/storage/{path}` | Public | Direct storage provider with CORS headers and disk fallback |
| `GET` | `/api/reports` | Staff | Lists reported content queue |
| `POST` | `/api/reports` | Auth | Submits content report for staff review |
| `GET` | `/api/reports/{report}` | Staff | Retrieves single report detail |
| `PUT/PATCH`| `/api/reports/{report}` | Staff | Updates report status and notes |
| `POST` | `/api/reports/{report}/action` | Staff | Executes moderation action (`remove_content`, `warn`, `suspend`) |
| `GET` | `/api/tickets` | Auth | Lists user support tickets |
| `GET` | `/api/tickets/{ticket}` | Participants | Retrieves ticket thread |
| `PATCH`| `/api/tickets/{ticket}` | Staff | Updates ticket status / priority |
| `PATCH`| `/api/tickets/{ticket}/close` | Participants | Closes resolved ticket thread |
| `POST` | `/api/tickets/{ticket}/messages`| Participants | Sends message on ticket thread |

### 9. Administration (Staff Only)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/admin/stats` | Staff | Returns platform analytics and volume figures |
| `GET` | `/api/admin/users` | Staff | Paginated user management list |
| `PATCH`| `/api/admin/users/{user}/role` | Admin | Promotes/demotes user role (`user`, `artist`, `admin`) |
| `GET` | `/api/admin/moderation-logs` | Staff | Audit log of all staff moderation actions |

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

The backend includes a comprehensive automated test suite of **125 automated test methods with 539 assertions** (100% passing) covering authentication, state machines, escrow payments, automated refunds, and security policies:

```bash
# Run all automated tests
php artisan test

# Run tests with coverage summary
php artisan test --coverage
```

### Test Coverage Highlights
- **`CommissionCancellationRefundTest`**: Validates mutual cancellation agreement, direct cancellation of pending orders, automated Midtrans escrow refund triggers, refund status mutation, and receipt generation.
- **`ArtistProfileSettingsTest`**: Validates master commission availability toggles (`open`, `busy`, `closed`), bio differentiation, social links formatting, and authorization guards.
- **`ArtistApplicationFlowTest`**: Portfolio application submissions, staff review queue, atomic role promotion, and in-app notifications.
- **`CommissionLifecyclePayoutTest`**: End-to-end commission flow with escrow payment, Iris automated payouts, reconciliation, idempotent retries, and AES-256 bank encryption at rest.
- **`SlugRoutingTest`**: Validates unique SEO slug generation and dual slug/ID route resolution across services, portfolios, and posts.
- **`CommissionReceiptFlowTest`**: Validates cryptographic receipt hash generation (`REC-COM-{id}-{hash}`), financial breakdown calculations, and order access isolation.
- **`RegistrationFlowTest`**: Validates OTP dispatch, code confirmation, rate limiting, and expired registration pruning.
- **`AuthNotificationsTest`**: Password reset token dispatch, email OTP delivery, password change security alerts, and new device detection notifications.
- **`ObservabilityAndRateLimitingTest`**: Request correlation ID (`X-Request-ID`), smart cache epoch invalidation, and role-tiered rate limiters.
- **`QueueAndFilesystemTest`**: Asynchronous media processing jobs (`ProcessMediaJob`), public vs private disk isolation, and orphaned media cleanup.
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
│   │   ├── errors.blade.php   # Standard error catalog
│   │   ├── emails-preview.blade.php # Transactional email live inspector
│   │   └── emails/            # Branded HTML/plaintext email templates
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
