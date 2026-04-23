# HR Hub

> A modern, role-based HR management web app for small teams — manage profiles, reimbursements, performance reviews, and team membership in one place.

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](#license)

🔗 **Live demo:** [hr-mvp.lovable.app](https://hr-mvp.lovable.app)

---

## ✨ Features

### 🔐 Authentication & Access Control
- Email/password sign in with forgot/reset password flow
- Three roles: **Owner**, **Admin**, **Member**
- Role-based route guards (`ProtectedRoute` + `RoleGuard`)
- Members can change their own password from the Profile page

### 👤 Profile
- Personal info, employment, compensation, benefits, documents, and latest review in a unified view
- Admins/Owners can view any team member's profile via the Team Directory
- Employment status sourced from the `users` table for consistency across pages

### 💸 Reimbursements
- Submit and track reimbursement requests
- Admins/Owners can review submissions across the team

### 📈 Reviews
- Performance reviews with full history
- Latest review surfaced on the Profile page

### 🗂️ Team Directory *(Admin/Owner)*
- Searchable list of all team members (name, email, department, location, role)
- Click any member to view their full profile
- Status indicator (Active / Not Active)

### ⚙️ Team Settings *(Admin/Owner)*
- **Change roles** for existing members — persisted via RLS-protected `users` table updates
- **Enroll new members** — create accounts with email + first-time password via the `enroll-member` Edge Function
- Owner-only: enroll other Owners

### 📱 Responsive Layout
- Desktop sidebar navigation
- Mobile/tablet sheet menu with full nav including admin pages

---

## 🧰 Tech Stack

**Frontend**
- React 18 · Vite 5 · TypeScript 5 · React Router
- Tailwind CSS v3 · shadcn/ui · Lucide icons
- TanStack Query · custom Auth & User contexts

**Backend** (Lovable Cloud)
- Postgres database with Row-Level Security
- Supabase Auth (email/password)
- Edge Functions (Deno)

---

## 📁 Project Structure

```
src/
├── components/
│   ├── auth/          # ProtectedRoute, RoleGuard
│   ├── layout/        # Sidebar, DashboardLayout, PageLayout
│   └── ui/            # shadcn components
├── contexts/          # AuthContext, UserContext
├── hooks/             # useProfileData, useRoles
├── pages/             # Login, Profile, Reimbursements, Reviews,
│                      # TeamDirectory, TeamSettings, ...
├── integrations/
│   └── supabase/      # auto-generated client + types
└── lib/               # utils

supabase/
├── functions/
│   └── enroll-member/ # Admin-only member creation
├── migrations/        # Schema + RLS policies
└── config.toml
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ and **npm** (or use [nvm](https://github.com/nvm-sh/nvm))

### Install & run

```bash
# 1. Clone the repo
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

The app will be available at `http://localhost:8080`.

### Available scripts

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start the Vite dev server            |
| `npm run build`   | Build the production bundle          |
| `npm run preview` | Preview the production build locally |
| `npm run lint`    | Run ESLint                           |
| `npm run test`    | Run the Vitest test suite            |

---

## 🔑 Environment Variables

The `.env` file is **auto-managed by Lovable Cloud** — no manual setup required when working in Lovable. For local development outside Lovable, the following variables must be set:

```env
VITE_SUPABASE_URL="https://<project>.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="<anon-key>"
VITE_SUPABASE_PROJECT_ID="<project-id>"
```

---

## 🔒 Security Model

- All tables use **Row-Level Security** (RLS)
- Roles are stored in the `users` table and validated server-side
- The `enroll-member` Edge Function uses the **Service Role** and verifies the caller's role before creating accounts
- Admins can update any user's role; **only Owners can promote to Owner**
- Never trust client-side role checks — RLS is the source of truth

---

## 🛠️ Editing the Code

You can work on this project in several ways:

1. **In Lovable** — open the [project](https://lovable.dev/projects/b065bbc9-5709-4da3-8b78-aa2f5cab1ffb) and prompt for changes. Edits are committed automatically.
2. **In your local IDE** — clone the repo, push to GitHub, and changes sync back to Lovable in real time.
3. **GitHub web editor / Codespaces** — edit files directly in the browser or spin up a Codespace from the repo's **Code** menu.

---

## 🌍 Deployment

- Open the project in [Lovable](https://lovable.dev/projects/b065bbc9-5709-4da3-8b78-aa2f5cab1ffb) and click **Share → Publish**.
- Edge functions deploy automatically when you save.
- To attach a custom domain, go to **Project → Settings → Domains** in Lovable. See [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain).

---

## 🤝 Contributing

1. Fork the repo and create a feature branch (`git checkout -b feat/my-feature`)
2. Commit your changes with clear messages
3. Push and open a Pull Request

---

## 📄 License

Released under the [MIT License](LICENSE).
