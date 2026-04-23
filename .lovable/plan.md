
## Rewrite README.md to be GitHub-ready

The current `README.md` only contains a placeholder ("TODO: Document your project here"). I'll replace it with a polished, GitHub-friendly README for the HR Hub project.

### What the new README will include

1. **Title + tagline + badges** — project name, one-line description, and shields.io badges (React, Vite, TypeScript, Tailwind, License).
2. **Live demo link** — https://hr-mvp.lovable.app
3. **Screenshot placeholder** — a `docs/screenshot.png` reference users can swap in later.
4. **Features** — Authentication & roles, Profile, Reimbursements, Reviews, Team Directory, Team Settings (role changes + member enrollment), Responsive layout.
5. **Tech Stack** — Frontend (React 18, Vite 5, TypeScript, Tailwind, shadcn/ui, TanStack Query) and Backend (Lovable Cloud: Postgres, Auth, Edge Functions, RLS).
6. **Project Structure** — directory tree of `src/` and `supabase/`.
7. **Getting Started** — prerequisites (Node 18+), `npm install`, `npm run dev`, available scripts (`dev`, `build`, `preview`, `test`, `lint`).
8. **Environment Variables** — note that `.env` is auto-managed by Lovable Cloud; list the variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`).
9. **Security Model** — RLS on all tables, roles in `users` table, `enroll-member` Edge Function uses Service Role with caller role validation, Owner-only Owner promotion.
10. **Editing the code** — three ways: Lovable editor, local IDE with GitHub sync, GitHub web editor / Codespaces.
11. **Deployment** — publish via Lovable (Share → Publish), custom domain instructions, edge functions auto-deploy.
12. **Contributing** — short standard section (fork, branch, PR).
13. **License** — MIT placeholder.

### Files to change

- `README.md` — full rewrite (overwrite the current 2-line placeholder).

No other files, dependencies, or backend changes are needed.
