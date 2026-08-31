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
  <img src="https://img.shields.io/badge/Midtrans-Payments-02F5A8?style=for-the-badge&logo=cashapp&logoColor=black" alt="Midtrans Payments">
  <img src="https://img.shields.io/badge/Tests-44%20Passed-02F5A8?style=for-the-badge&logo=githubactions&logoColor=black" alt="Tests Passed">
</p>

---

## Overview

**Comme** is a digital creator platform and art commission marketplace engine built on Laravel 12, PHP 8.2+, and PostgreSQL. It delivers a secure REST API backend supporting email OTP verification, artist vetting, custom commission order state machines, escrow payments with Midtrans Snap, direct order messaging, social feeds, and an interactive developer documentation portal.

---

## Key Features

### 1. Authentication & Security
- **Email OTP Verification**: Registration sends a 6-digit numeric OTP with rate limiting; verified users are created atomically upon code confirmation.
- **Sanctum Multi-Platform Auth**: Supports both SPA Cookie-based authentication and mobile/third-party Bearer API Tokens.
- **Device Sign-In Tracking**: Detects new browser / IP logins and dispatches security alert emails.
- **Password Lifecycle**: Forgot password OTP flow, password reset token validation, and authenticated password changes.

### 2. Artist Vetting & Application Queue
- **Portfolio Submissions**: Regular users can submit applications with external portfolio links and social profiles.
- **Staff Review Flow**: Admin/staff queue with atomic approval (auto-creates `artist_profiles`) or structured rejection with explanatory feedback.

### 3. Commission Lifecycle & Orders
- **Service Catalog**: Artists publish customizable commission listings with pricing, turnaround times, and revision limits.
- **Order State Machine**: Tracks transitions (`pending`, `accepted`, `in_progress`, `review`, `completed`, `cancelled`).
- **Revision Workflows**: Structured client revision requests tracked against allowed revision limits.
- **Reviews & Ratings**: 1-5 star feedback with buyer comments and artist reply capabilities.

### 4. Real-Time Order Messaging
- Dedicated, secure message threads strictly isolated to commission buyer and assigned artist.
- Support for attached artwork WIPs, reference media, and timestamps.

### 5. Artist Social Feed & Engagement
- Artwork posts with multi-media uploads.
- Interactive likes, bookmarks, threaded comments, and user follow/follower graphs.

### 6. Notifications & User Alerts
- Real-time in-app alerts for order updates, new messages, comments, and application approvals.
- Unread count badge endpoints and batch `read-all` actions.

### 7. Midtrans Snap & Escrow Payments
- Generates Midtrans Snap payment tokens for order deposits.
- Webhook signature verification (SHA-512) for automated status callbacks (`settlement`, `pending`, `deny`, `expire`, `cancel`).

### 8. Moderation & Support Helpdesk
- User and content reporting system with categorization.
- Support tickets with threaded messaging between clients and staff agents.

### 9. Interactive Documentation & Developer Portal
- Built-in portal at `/` featuring instant search, collapsible domain groups, and cURL generation.
- **Interactive Sandbox (`/explore`)**: In-page live request console with Bearer token persistence and latency measurement.
- **Error Reference Catalog (`/errors`)**: Complete catalog of all standard HTTP error envelopes (400, 401, 403, 404, 405, 409, 422, 429, 500).
- **Theme Switcher**: Dark mode, Light mode, and OS System theme with automatic SVG icon adaptation.

---

## Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Laravel 12.x |
| **Runtime** | PHP 8.2+ |
| **Database** | PostgreSQL 16+ |
| **Authentication** | Laravel Sanctum (Cookies & Bearer Tokens) |
| **Payments** | Midtrans Snap & Notification Webhooks |
| **Mailing** | Laravel Notifications with custom branded HTML templates |
| **Testing** | PHPUnit (75+ automated test methods with 310+ assertions) |
| **Deployment** | Docker / Google Cloud Run + Cloud SQL + VPC Connector |

---

## Getting Started

### Prerequisites
- **PHP** >= 8.2 with extensions: `pdo`, `pdo_pgsql`, `mbstring`, `openssl`, `bcmath`, `curl`
- **Composer** >= 2.x
- **PostgreSQL** >= 16.x
- **Node.js** >= 18.x (for frontend/asset builds)

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

Edit `.env` to configure your PostgreSQL credentials and services:
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

## API Endpoints Overview

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

### 2. Artist Applications
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/artist-applications` | Auth | Submits portfolio application |
| `GET` | `/api/artist-applications/my-application` | Auth | Views current user's application status |
| `GET` | `/api/artist-applications` | Staff | Lists application queue |
| `POST` | `/api/artist-applications/{id}/approve` | Staff | Approves applicant & generates artist profile |
| `POST` | `/api/artist-applications/{id}/reject` | Staff | Rejects application with reason |

### 3. Commission Services & Orders
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/commission-services` | Auth | Lists public commission services & pricing |
| `POST` | `/api/commission-services` | Artist | Creates new commission service listing |
| `GET` | `/api/commissions` | Auth | Lists user's buyer and artist orders |
| `POST` | `/api/commissions` | Auth | Orders a commission service |
| `PATCH` | `/api/commissions/{id}/cancel` | Participants | Cancels commission order |
| `POST` | `/api/commissions/{id}/revisions` | Participants | Submits revision item |
| `POST` | `/api/commissions/{id}/reviews` | Buyer | Submits review and rating |

### 4. Commission Chat
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/commissions/{id}/messages` | Participants | Fetches order chat history |
| `POST` | `/api/commissions/{id}/messages` | Participants | Sends chat message & notifies recipient |

### 5. Feed, Posts & Social
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/posts` | Auth | Paginated public artwork feed |
| `POST` | `/api/posts` | Artist | Creates new artwork post |
| `POST` | `/api/posts/{id}/like` | Auth | Toggles like on a post |
| `POST` | `/api/posts/{id}/bookmark` | Auth | Toggles bookmark on a post |
| `GET` | `/api/me/bookmarks` | Auth | Lists current user's bookmarked posts |
| `POST` | `/api/posts/{post}/comments` | Auth | Adds comment to a post |
| `POST` | `/api/users/{id}/follow` | Auth | Toggles user follow |
| `GET` | `/api/users/{id}/followers` | Auth | Lists user followers |

### 6. Notifications
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/notifications` | Auth | Lists user notifications (`?unread=true`) |
| `GET` | `/api/notifications/unread-count` | Auth | Returns count of unread notifications |
| `PATCH` | `/api/notifications/read-all` | Auth | Marks all notifications as read |
| `PATCH` | `/api/notifications/{id}/read` | Auth | Marks single notification as read |

### 7. Payments & Webhooks
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/commissions/{id}/payment-token` | Buyer | Generates Midtrans Snap checkout token |
| `POST` | `/api/midtrans/webhook` | Webhook | Midtrans server callback signature handler |

### 8. Moderation & Support
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/reports` | Auth | Submits content report for staff review |
| `GET` | `/api/tickets` | Auth | Lists user support tickets |
| `POST` | `/api/tickets/{id}/messages` | Participants | Sends message on ticket thread |

---

## Testing

The backend includes a comprehensive automated test suite covering all authentication flows, artist onboarding, order transitions, messaging security, notifications, and rate limits:

```bash
# Run all automated tests
php artisan test

# Run tests with coverage summary
php artisan test --coverage
```

### Test Coverage Highlights
- **`CommissionLifecyclePayoutTest`**: End-to-end lifecycle, Midtrans escrow payouts, reconciliation, idempotent retry, bank encryption at rest.
- **`MediaUploadTest`**: Multipart upload validation, MediaPolicy ownership authorization, public disk storage.
- **`RegistrationFlowTest`**: OTP dispatch, verification, rate limits, expired code purging.
- **`AuthNotificationsTest`**: Unrecognized device alerts, password change confirmations.
- **`ArtistApplicationFlowTest`**: Queue permissions, duplicate prevention, atomic profile activation.
- **`CommissionMessageFlowTest`**: Security checks preventing unauthorized third-party chat access.
- **`NotificationFlowTest`**: Authorization guards, unread counting, batch read updates.
- **`PostEngagementFlowTest`**: Like/bookmark state toggling.
- **`FollowFlowTest`**: Self-follow prevention, follower/following relations.

---

## Architecture & Code Organization

```
comme-backend/
├── app/
│   ├── Exceptions/API/        # Unified API exception handler (RFC-7807)
│   ├── Http/
│   │   ├── Controllers/API/   # Clean resource controllers
│   │   ├── Helpers/           # ApiResponseHelper standard envelopes
│   │   ├── Middleware/        # ForceJsonResponse, Rate limiting, Sanctum
│   │   ├── Requests/          # Form request validators with custom messages
│   │   └── Resources/         # JSON API transformers
│   ├── Models/                # Eloquent models & relations
│   └── Notifications/         # Email & database notification classes
├── bootstrap/app.php          # Application bootstrap & middleware pipeline
├── public/
│   ├── css/docs.css           # Complete tokenized Design System
│   ├── js/docs.js             # Theme manager, drawer navigation, scroll spy
│   └── icons/SVGs/            # Full collection of Day/Night themed SVGs
├── resources/
│   ├── views/
│   │   ├── layouts/app.blade.php
│   │   ├── partials/docs/     # Modular documentation domain components
│   │   ├── explore.blade.php  # Interactive API sandbox
│   │   ├── errors.blade.php   # Standard error catalog
│   │   └── errors/            # Fallback 404/500 web pages
├── routes/
│   ├── api.php                # Public routes & Sanctum middleware group
│   ├── web.php                # Docs, Explore, and Error routes
│   └── API/V1/                # Modular domain route definitions
└── tests/
    └── Feature/               # Automated end-to-end integration test suites
```

---

## License

This project is open-source software licensed under the [MIT License](LICENSE).
