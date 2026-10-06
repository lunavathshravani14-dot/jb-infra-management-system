# JB Infra Management System

An enterprise-grade Executive Onboarding, Cadre Hierarchy Tracking, and Identity Verification platform built for **JB Infra**.

---

## 🌟 Key Features

- **Executive Self-Enrollment & Onboarding:** Intuitive digital application flow with document upload for KYC verification (Aadhaar, PAN, Photo).
- **Multi-Tier Cadre Hierarchy:** Complete reporting tree management across all organizational cadres (ME, MM, SMM, AGM, DGM, GM, ED, CED) with historical tracking.
- **Automated Digital ID Card Generation:** Wallet-sized vertical identity cards rendered as vector PDFs with dynamic photo rendering and scannable verification QR codes.
- **Instant Public Verification:** Secure, tamper-proof QR code verification page (`/verify/[id]`) showing active credential status.
- **WhatsApp Cloud API Integration:** Automated real-time notifications with status updates and ID card dispatch.
- **Comprehensive Administration Portal:**
  - Executive review, approval, rejection, and correction workflows.
  - Confidential Executive Directorate (CED) access controls.
  - Search, filter, and bulk Excel report export.
  - Immutable audit logs tracking all administrative actions.

---

## 🛠️ Technology Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Database & ORM:** [Prisma](https://www.prisma.io/) with SQLite (local) / PostgreSQL (production)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Document & PDF Processing:** [PDFKit](https://pdfkit.org/), [QRCode](https://github.com/soldair/node-qrcode), [ExcelJS](https://github.com/exceljs/exceljs)
- **Authentication:** JWT with role-based permission gates & bcryptjs

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18.17+ or v20+)
- npm / yarn / pnpm

### 2. Installation
```bash
git clone https://github.com/lunavathshravani14-dot/jb-infra-management-system.git
cd jb-infra-management-system
npm install
```

### 3. Environment Setup
Copy the `.env.example` file to `.env` and fill in the required environment variables:
```bash
cp .env.example .env
```

### 4. Database Setup
```bash
npx prisma db push
npx prisma db seed
```

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Production Build

```bash
npm run build
npm start
```

---

## 🔒 Security & Privacy

- Sensitive KYC documents and generated credentials are kept in protected storage outside public web roots.
- Role-based authorization controls protect sensitive administrative and CED routes.
