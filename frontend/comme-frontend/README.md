# Comme Frontend Web Application

<p align="center">
  <strong>Modern Digital Creator Marketplace & Art Commission Platform — Client SPA</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19">
  <img src="https://img.shields.io/badge/Vite-6.x-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/TypeScript-5.7+-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/TailwindCSS-v4.0-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="TailwindCSS">
  <img src="https://img.shields.io/badge/Midtrans-Snap%20Checkout-02F5A8?style=for-the-badge&logo=cashapp&logoColor=black" alt="Midtrans Snap">
  <img src="https://img.shields.io/badge/Design-Glassmorphism%20%26%20Neutral%20Slate-A802F5?style=for-the-badge&logo=adobexd&logoColor=white" alt="Design">
</p>

---

## Overview

**Comme Frontend** is a modern, high-performance Single-Page Application (SPA) designed for digital creators, illustrators, and art commissioners. Built on **React 19**, **TypeScript**, and **TailwindCSS**, it features a refined dark-mode canvas with neutral slate tones, a live **Studio Commission Queue Board**, Purchasing Power Parity (PPP) multi-currency converter, an **Interactive Color Studio** for custom brand accents, bank-grade escrow checkout via **Midtrans Snap**, automated mutual cancellation refunds, deadline negotiation protocols, creator tipping, and comprehensive content moderation.

---

## Key Feature Modules

### 1. Live Studio Commission Queue Board (`CommissionQueueBoard`)
- **Skeb & VGen-Inspired Real-Time Tracker**: Transparent workflow visualization embedded directly in artist public profiles.
- **Dynamic Slot Capacity Gauge**: Displays current studio workload (e.g. `2/5 Filled` or `Queue Full`) with capacity percentage progress bars.
- **Client Privacy Protection**: Displays anonymized identifiers (e.g. `COM-#5`) and delivery stage labels (`Accepted`, `In Production`, `Under Review`, `Completed`).
- **User Commission Spotlight Banner**: When an authenticated client visits an artist's queue, a top spotlight card highlights their exact slot position (e.g. `Your Commission is Slot #1!`) with direct one-click navigation to their order workspace.

### 2. Multi-Currency & Purchasing Power Parity (PPP) Engine
- **Global Currency Switcher (`CurrencySelector`)**: Real-time switching across supported currencies (IDR, USD, JPY, EUR, GBP, SGD, AUD, CAD) with automatic exchange rate conversion.
- **Regional Purchasing Power Parity (`pppPricing.ts`)**: Automatically calculates localized rates and displays regional pricing discounts for emerging creator economies.
- **Artist Custom Tier & Addon Overrides**: Artists can set customized regional prices per service tier and optional add-on.

### 3. Brand Identity & Interactive Color Studio
- **Single Concrete Brand Accent**: Standardized signature Royal Violet (`#A802F5`) paired with clean neutral slate grey surfaces (`--secondary`, `--muted`, `--accent`, `--border`) to prevent clashing color mixtures.
- **Interactive Color Studio (`CustomColorPicker`)**: Available in **Settings > Appearance**:
  - Full 2D HSV saturation/value canvas and 1D hue slider bar.
  - Direct HEX input and individual R/G/B channel controls.
  - One-click palette inspiration swatches.
  - Dynamic contrast text calculation ensuring accessible foreground readability.
  - One-click "Reset to Default" button to restore signature `#A802F5`.

### 4. Commission Order Lifecycle & Escrow
- **Customizable Service Ordering**: Interactive purchase wizard supporting base options, optional add-ons, client brief details, and reference attachments.
- **Midtrans Snap Embedded Checkout**: Instant popup modal supporting Virtual Accounts (BCA, BNI, BRI, Mandiri, Permata), GoPay, QRIS, and Credit Cards.
- **Intelligent Channel Routing & Region Badging**: Dynamically detects the client's billing currency (`useCurrency()`). Automatically defaults to Credit/Debit Card for non-IDR currencies, displays visual "Global" vs "IDR only" availability badges on payment tabs, and sends currency context to the backend for streamlined gateway routing.
- **WCAG 2.1 & Autofill Compliant Form Controls**: Full keyboard accessibility, linked `<Label htmlFor="...">` elements, and standardized browser autofill attributes (`cc-number`, `cc-exp`, `cc-csc`, `cc-name`).
- **Order State Machine Visualizer**: Real-time progress bar tracking order states (`pending` &rarr; `accepted` &rarr; `in_progress` &rarr; `review` &rarr; `completed` or `cancelled`).
- **Deadline Negotiation**: Formal proposal-and-acceptance interface where creators can request delivery date extensions with justified notes, and buyers can accept or decline with one click.
- **Artwork Delivery & Confirmation**: High-resolution delivery previews, single-click asset/ZIP download utility (`download.ts`), and client approval triggering automated escrow payout.

### 5. Mutual Cancellation & Automated Escrow Refunds
- **Structured Agreement Protocol**: When an order is active, either the buyer or artist can propose a cancellation with a mandatory reason.
- **Interactive Action Banners**: Prominently displays cancellation requests to the counterparty with instant **Accept** or **Decline** actions.
- **Automatic Refund Notification**: When cancellation is approved, the UI confirms the automated escrow refund via Midtrans with an audit badge and transaction reference.

### 6. Official Digital Purchase Receipt (`REC-COM-{commission_id}-{hash}`)
- **One-Click Receipt Modal**: Available for any paid or completed commission via the "Show Receipt" button.
- **Detailed Financial Breakdown**: Itemizes gross order total, 5% platform service fee, net creator payout, and payment channel reference.
- **Print & PDF Layout**: Clean media query print layout optimized for saving or printing formal purchase invoices.
- **Refund Audit Trail**: Reflects refund status, refund timestamp, and cancellation reasons if the order was refunded.

### 7. Artist Studio Dashboard & Master Availability
- **Live Availability Pill**: Interactive master switcher on the artist dashboard:
  - **Open for Commissions**: Glowing emerald badge (`● Open for Commissions`).
  - **Busy / Waitlist Only**: Amber badge with waitlist warning (`● Busy / Waitlist Only`).
  - **Commissions Closed**: Rose badge pausing new incoming requests (`● Commissions Closed`).
- **Studio Profile Settings Modal**: Configures dedicated studio bio & terms, studio website URL, external portfolio link, and verified social media handles (Twitter/X, ArtStation, Instagram).
- **Service Listings Manager**: Add, edit, archive, and price commission offerings with custom tiers and add-ons.
- **Creator Bank Payouts**: Secure payout destination setup with masked account display (`••••••••1234`) and AES-256 backend storage.

### 8. Direct Creator Tipping (`TipArtistModal`)
- Seamless tipping modal on public artist profiles with custom tip amounts and pre-set quick buttons.
- Multi-currency conversion supporting foreign currency inputs with instant exchange calculation to IDR.
- Direct Midtrans Snap checkout popup for immediate tip escrow settlement.

### 9. Social Community, Feed & Moderation
- **Artwork Feed**: Infinite-scroll post feed with multi-media galleries, like and bookmark interactions, and category filtering.
- **Threaded Comment System**: Nested parent/reply threads with markdown and emoji support, in-place author editing (`PUT /api/comments/{comment}`), and author or post-owner deletion (`DELETE /api/comments/{comment}`).
- **Content Reporting & Moderation (`ReportsPage`)**: User-friendly report modals across posts, comments, services, and profiles with standardized violation reasons, coupled with a dedicated Admin Moderation Workbench.

### 10. Authentication, 2FA & Account Security
- 6-digit email OTP registration with automatic countdown resend.
- Two-Factor Authentication (TOTP) management with QR code modal and encrypted recovery codes.
- Active session inspector with remote multi-device logout (`DELETE /api/auth/sessions/{id}`).
- Account deletion dialog with password confirmation and full data purge.
- Cross-origin Bearer token authentication decoupled from session cookies.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 19 (Hooks & Strict Mode) |
| **Language** | TypeScript 5.7+ |
| **Build Tool** | Vite 6.x |
| **Routing** | React Router v6 |
| **Styling** | TailwindCSS + Curated Neutral Slate & Dynamic Brand Token System |
| **Animation** | Framer Motion |
| **Icons** | Lucide React |
| **Payment Modal** | Midtrans Snap.js |
| **HTTP Client** | Axios with request/response interceptors & token persistence |

---

## Architecture & Code Organization

```
comme-frontend/
├── public/
│   ├── favicon.ico
│   └── images/                # Brand logos & static artwork assets
├── src/
│   ├── components/
│   │   ├── artists/           # CommissionQueueBoard, ArtistCard, StudioSummary
│   │   ├── auth/              # 2FA modal, login/register dialogs, session manager
│   │   ├── comments/          # Threaded comment tree, comment form, author controls
│   │   ├── commissions/       # CommissionDetailModal, ReceiptModal, OrderWizard, DeadlineModal
│   │   ├── modals/            # TipArtistModal, EmbedBadgeModal, ReportContentModal
│   │   ├── ui/                # BaseCurrencySelect, CurrencySelector, CustomColorPicker, Badge, Button
│   │   └── color-theme-provider.tsx  # Dynamic brand color token & custom color provider
│   ├── contexts/
│   │   ├── AuthContext.tsx    # User session, login/logout, Bearer token, 2FA status
│   │   └── CurrencyContext.tsx # Currency rates, active currency, and price formatting
│   ├── pages/
│   │   ├── admin/             # ReportsPage (Moderation Workbench)
│   │   ├── artists/           # ArtistProfilePage, ArtistDashboardPage
│   │   ├── commissions/       # CommissionDetailPage, OrderCommissionPage
│   │   ├── dashboard/         # CreateServicePage, ManageServicesPage
│   │   ├── dev/               # PlaygroundPage, DevPanelPage
│   │   ├── profile/           # UserProfilePage (Showcase tabs: Services, Portfolio, Queue, Reviews)
│   │   ├── settings/          # SettingsPage (Account, Security, 2FA, Sessions, Appearance Studio)
│   │   └── store/             # StorePage, ServiceDetailPage
│   ├── services/
│   │   ├── api.ts             # Axios client with Bearer token & correlation ID interceptors
│   │   ├── commissionService.ts # Commission CRUD, state transitions, receipts, deadlines, queue
│   │   ├── userService.ts     # User profiles, avatar, bio, settings
│   │   └── paymentService.ts  # Midtrans Snap token generation & status check
│   ├── utils/
│   │   ├── format.ts          # Safe date/time & currency formatting
│   │   └── pppPricing.ts      # Purchasing Power Parity computation
│   ├── App.tsx                # Route registry & layout wrapper
│   └── main.tsx               # App entrypoint
├── index.html
├── package.json
└── vite.config.ts
```

---

## Getting Started

### Prerequisites
- **Node.js** >= 18.x
- **npm** >= 9.x

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create a `.env` file in the `comme-frontend` directory:
```env
# Backend API Base URL
VITE_API_BASE_URL=http://localhost:8000/api

# Midtrans Client Key (Sandbox)
VITE_MIDTRANS_CLIENT_KEY=SB-Mid-client-...
VITE_MIDTRANS_SNAP_URL=https://app.sandbox.midtrans.com/snap/snap.js
```

### 3. Run Development Server
```bash
npm run dev
```
The application will be available at [http://localhost:5173](http://localhost:5173).

### 4. Build for Production
```bash
npm run build
```
The compiled production bundle will be generated in `dist/`.

---

## License

This project is open-source software licensed under the [MIT License](LICENSE).
