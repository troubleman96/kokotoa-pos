# Pages Structure Guide

This folder contains all route-level pages for the app.

## Why this structure
- Each page lives in its own folder for easier scaling.
- Every page entry file is `index.tsx`.
- Feature groups are separated (`auth`, `management`, `reports`).

---

## Current Structure

```text
src/pages
├── About/
│   └── index.tsx
├── Contact/
│   └── index.tsx
├── CreditDebts/
│   └── index.tsx
├── Dashboard/
│   └── index.tsx
├── Demo/
│   └── index.tsx
├── Inventory/
│   └── index.tsx
├── Landing/
│   └── index.tsx
├── NotFound/
│   └── index.tsx
├── Notebook/
│   └── index.tsx
├── POS/
│   └── index.tsx
├── Privacy/
│   └── index.tsx
├── SalesHistory/
│   └── index.tsx
├── Settings/
│   └── index.tsx
├── StockHistory/
│   └── index.tsx
├── Subscription/
│   └── index.tsx
├── Terms/
│   └── index.tsx
├── auth/
│   ├── ForgotPassword/
│   │   └── index.tsx
│   ├── Login/
│   │   └── index.tsx
│   ├── PhoneVerification/
│   │   └── index.tsx
│   ├── Register/
│   │   └── index.tsx
│   └── VerifyOTP/
│       └── index.tsx
├── management/
│   ├── CreateStore/
│   │   └── index.tsx
│   └── Users/
│       └── index.tsx
└── reports/
    └── index.tsx
```

---

## Route Map (`src/App.tsx`)

Public routes:
- `/` -> `Landing`
- `/demo` -> `Demo`
- `/about` -> `About`
- `/contact` -> `Contact`
- `/terms` -> `Terms`
- `/privacy` -> `Privacy`

Auth routes:
- `/login` -> `auth/Login`
- `/register` -> `auth/Register`
- `/verify-otp` -> `auth/VerifyOTP`
- `/verify-phone` -> `auth/PhoneVerification`
- `/forgot-password` -> `auth/ForgotPassword`

Protected app routes:
- `/dashboard` -> `Dashboard`
- `/pos` -> `POS`
- `/inventory` -> `Inventory`
- `/stock-history` -> `StockHistory`
- `/sales-history` -> `SalesHistory`
- `/credit-debts` -> `CreditDebts`
- `/notebook` -> `Notebook`
- `/reports` -> `reports`
- `/subscription` -> `Subscription`
- `/settings` -> `Settings`
- `/users` -> `management/Users`
- `/create-store` -> `management/CreateStore`

Fallback:
- `*` -> `NotFound`

---

## How to add a new page

1. Create a folder:
- `src/pages/MyNewPage/`

2. Add `index.tsx`:
- `src/pages/MyNewPage/index.tsx`

3. Import it in `src/App.tsx`:
- `import MyNewPage from "./pages/MyNewPage";`

4. Add a route in `<Routes>`:
- `<Route path="/my-new-page" element={<ProtectedRoute><MyNewPage /></ProtectedRoute>} />`

5. If needed, add to sidebar navigation:
- `src/components/AppSidebar.tsx`

---

## Conventions

- Keep page-level logic in page folders.
- Shared UI belongs in `src/components`.
- API calls belong in `src/services/api.ts`.
- Use absolute alias imports (`@/...`) for shared modules where practical.

