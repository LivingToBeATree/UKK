# Comme Frontend Web Application

<p align="center">
  <strong>Modern Digital Creator Marketplace & Art Commission Platform — Client SPA</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19">
  <img src="https://img.shields.io/badge/Vite-6.x-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/TypeScript-5.7+-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/TailwindCSS-v3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS">
  <img src="https://img.shields.io/badge/Midtrans-Snap%20Checkout-02F5A8?style=for-the-badge&logo=cashapp&logoColor=black" alt="Midtrans Snap">
</p>

---

## Overview

**Comme Frontend** is a Single-Page Application (SPA) designed for digital creators, illustrators, and art commissioners. Built with **React 19**, **TypeScript**, and **TailwindCSS**, it provides a responsive dark-themed interface with smooth glassmorphism, real-time messaging, Midtrans Snap checkout popup, an official digital receipt modal with PDF print styling, mutual cancellation escrow refund workflows, and artist studio controls.

---

## Key Feature Modules

### 1. Commission Order Lifecycle & Escrow
- **Customizable Service Ordering**: Interactive purchase flows with delivery tier selection, add-on requests, and reference image uploads.
- **Midtrans Snap Embedded Checkout**: Instant popup modal supporting Virtual Accounts (BCA, BNI, BRI, Mandiri), GoPay, QRIS, and Credit Cards.
- **Order State Machine Visualizer**: Real-time progress bar tracking order states (`pending` &rarr; `accepted` &rarr; `in_progress` &rarr; `review` &rarr; `completed` or `cancelled`).
- **Revision Management**: Client revision submission modal with allowed revision limits and status indicators.
- **Artwork Delivery & Confirmation**: High-resolution delivery previews with one-click approval triggering automated escrow payout.

### 2. Mutual Cancellation & Automated Escrow Refunds
- **Mutual Agreement Protocol**: When an order is active, either the buyer or artist can propose a cancellation with a mandatory reason.
- **Interactive Action Banners**: Prominently displays cancellation requests to the counterparty with instant **Accept** or **Decline** actions.
- **Automatic Refund Notification**: When cancellation is approved, the UI confirms the automated escrow refund via Midtrans with an audit badge.

### 3. Official Digital Purchase Receipt (`REC-COM-{id}-{hash}`)
- **One-Click Receipt Modal**: Available for any paid or completed commission via the "Show Receipt" button.
- **Detailed Financial Breakdown**: Itemizes gross order total, 5% platform service fee, net creator payout, and payment channel reference.
- **Print & PDF Layout**: Clean media query print layout optimized for saving or printing formal purchase invoices.
- **Refund Audit Trail**: Reflects refund status, refund timestamp, and cancellation reasons if the order was refunded.

### 4. Artist Studio Dashboard & Master Availability
- **Live Availability Pill**: Interactive master switcher on the artist dashboard:
  - **Open for Commissions**: Pulsing emerald dot & glowing badge (`● Open for Commissions`).
  - **Busy / Waitlist Only**: Amber badge with waitlist warning (`● Busy / Waitlist Only`).
  - **Commissions Closed**: Rose badge pausing new incoming requests (`● Commissions Closed`).
- **Studio Profile Settings Modal**: Configures dedicated studio bio & terms, studio website URL, external portfolio link, and verified social media handles (Twitter/X, ArtStation, Instagram).
- **Service Listings Manager**: Add, edit, archive, and price commission offerings.
- **Creator Bank Payouts**: Secure payout destination setup with masked account display (`••••••••1234`) and AES-256 backend storage.

### 5. SEO-Friendly Slug Routing
- Automatically routes services, portfolio items, and community posts using descriptive URL slugs:
  - `/services/:slug` (e.g., `/services/full-character-illustration`)
  - `/portfolios/:slug` (e.g., `/portfolios/cyberpunk-cityscape-concept`)
  - `/posts/:slug` (e.g., `/posts/summer-character-concept-art`)
- Graceful backward compatibility with legacy numeric IDs.

### 6. Public Marketplace & Social Community
- **Artwork Feed**: Infinite-scroll post feed with multi-media galleries, like and bookmark interactions, and threaded comments.
- **Artist Showcase**: Public artist profile showcasing studio availability, verified links, portfolio grid, active services, and buyer reviews.
- **User Following**: Follow favourite creators to receive activity updates.

### 7. Real-Time Order Messaging
- Isolated direct chat between buyer and artist for active commissions.
- Media upload preview, delivery WIP attachments, and instant timestamps.

### 8. Authentication, 2FA & Security
- 6-digit email OTP registration with automatic countdown resend.
- Two-Factor Authentication (TOTP) management with QR code modal and recovery codes.
- Device security notifications and session persistence.

### 9. Legal & Trust Center
- Built-in legal documentation portal covering Terms of Service, Escrow Agreements, Privacy Policy, Cookie Policy, Creator Licensing, and API Terms.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 19 (Hooks & Strict Mode) |
| **Language** | TypeScript 5.7+ |
| **Build Tool** | Vite 6.x |
| **Routing** | React Router v6 |
| **Styling** | TailwindCSS v3.4 + Custom Glassmorphic Dark Design System |
| **Icons** | Lucide React |
| **Payment Modal** | Midtrans Snap.js |
| **HTTP Client** | Axios with request/response interceptors & token refresh |

---

## Architecture & Code Organization

```
comme-frontend/
├── public/
│   ├── favicon.ico
│   └── images/                # Brand logos & static artwork assets
├── src/
│   ├── components/
│   │   ├── auth/              # 2FA modal, login/register dialogs
│   │   ├── commissions/       # CommissionDetailModal, ReceiptModal, OrderWizard
│   │   ├── common/            # Navbar, Footer, Badge, Button, Modal, Tabs
│   │   ├── legal/             # Terms, Privacy, Escrow agreement views
│   │   └── studio/            # StudioSettingsModal, PayoutModal, ServiceForm
│   ├── contexts/
│   │   ├── AuthContext.tsx    # User session, login/logout, 2FA status
│   │   └── ToastContext.tsx   # Global toast notifications
│   ├── pages/
│   │   ├── artist/            # ArtistPublicProfilePage, ArtistDashboardPage
│   │   ├── commissions/       # CommissionDetailPage, OrdersPage
│   │   ├── explore/           # ExplorePage, ServiceDetailPage, PortfolioDetailPage
│   │   ├── legal/             # LegalPortalPage
│   │   └── settings/          # UserSettingsPage, SecurityPage
│   ├── services/
│   │   ├── api.ts             # Axios client with bearer token interceptor
│   │   ├── commission.ts      # Commission CRUD, state transitions, receipts
│   │   ├── artist.ts          # Studio profile & service listings API
│   │   └── payment.ts         # Midtrans Snap token generation
│   ├── App.tsx                # Route registry & layout wrapper
│   └── main.tsx               # App entrypoint
├── index.html
├── package.json
├── tailwind.config.js
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
