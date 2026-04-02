# Finance Dashboard (Full-Stack)

This project includes:
- `backend`: Node.js + Express + TypeScript + Prisma + PostgreSQL + JWT + Zod
- `frontend`: React + TypeScript + Tailwind + React Query + Axios + Recharts

## 1) Folder Structure

```text
Fintech/
├─ backend/
│  ├─ prisma/
│  │  └─ schema.prisma
│  ├─ src/
│  │  ├─ config/
│  │  ├─ constants/
│  │  ├─ controllers/
│  │  ├─ middleware/
│  │  ├─ routes/
│  │  ├─ schemas/
│  │  ├─ services/
│  │  ├─ types/
│  │  └─ utils/
│  ├─ .env.example
│  ├─ package.json
│  └─ tsconfig.json
├─ frontend/
│  ├─ src/
│  │  ├─ api/
│  │  ├─ components/
│  │  │  ├─ common/
│  │  │  ├─ dashboard/
│  │  │  ├─ layout/
│  │  │  └─ transactions/
│  │  ├─ context/
│  │  ├─ hooks/
│  │  ├─ lib/
│  │  ├─ pages/
│  │  ├─ types/
│  │  ├─ App.tsx
│  │  ├─ index.css
│  │  └─ main.tsx
│  ├─ .env.example
│  ├─ package.json
│  ├─ tailwind.config.js
│  ├─ postcss.config.js
│  └─ tsconfig.json
└─ START_HERE.md
```

## 2) Backend Setup

1. Copy env file:
```bash
cd backend
cp .env.example .env
# Windows PowerShell alternative:
# Copy-Item .env.example .env
```

2. Update `DATABASE_URL` and `JWT_SECRET` in `.env`.

3. Install dependencies:
```bash
npm install
```

4. Generate Prisma client and run migrations:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

5. (Optional) Seed demo users and transactions:
```bash
npm run prisma:seed
```

Demo credentials:
- `ADMIN` -> email: `admin@finance.local` | password: `Admin@123`
- `ANALYST` -> email: `analyst@finance.local` | password: `Analyst@123`
- `VIEWER` -> email: `viewer@finance.local` | password: `Viewer@123`

6. Start backend:
```bash
npm run dev
```

Backend runs on `http://localhost:5000`.

## 3) Frontend Setup

1. Copy env file:
```bash
cd frontend
cp .env.example .env
# Windows PowerShell alternative:
# Copy-Item .env.example .env
```

2. Install dependencies and run:
```bash
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

## 4) API Routes (Examples)

Base URL: `http://localhost:5000/api`

### Auth
- `POST /auth/register`
- `POST /auth/login`

Example Register body:
```json
{
  "name": "Akshay",
  "email": "akshay@example.com",
  "password": "password123"
}
```

### Users (Admin only)
- `GET /users?page=1&limit=10&role=ANALYST&status=ACTIVE&search=akshay`
- `POST /users`
- `PATCH /users/:id/role`
- `PATCH /users/:id/status`

Example Create User body:
```json
{
  "name": "Finance Viewer",
  "email": "viewer@example.com",
  "password": "Viewer@123",
  "role": "VIEWER",
  "status": "ACTIVE"
}
```

### Transactions
- `GET /transactions?page=1&limit=10&type=INCOME&category=Salary&startDate=2026-01-01&endDate=2026-12-31`
- `GET /transactions?userId=<user-id>` (admin can filter by specific user)
- `GET /transactions/:id`
- `POST /transactions`
- `PUT /transactions/:id`
- `DELETE /transactions/:id`

Example Create Transaction body:
```json
{
  "amount": 50000,
  "type": "INCOME",
  "category": "Salary",
  "date": "2026-04-01",
  "note": "April Salary",
  "userId": "optional-target-user-id-for-admin"
}
```

### Dashboard
- `GET /dashboard/summary`
- `GET /dashboard/categories?type=EXPENSE`
- `GET /dashboard/monthly-trends?months=6`
- `GET /dashboard/recent-transactions?limit=5`

## 5) RBAC Behavior

- Roles: `ADMIN`, `ANALYST`, `VIEWER`
- `ADMIN`: full access including user management
- `ADMIN` can view all users' transactions and dashboard summaries
- `ANALYST`: create/update/delete own transactions, read dashboards
- `VIEWER`: read-only transaction access
- All authenticated roles can view dashboard data
- New user registration defaults to `ANALYST` for immediate app usability
- Safety rules: admin cannot deactivate self and cannot remove the last active admin

## 6) Key Frontend Screens

- Login: `frontend/src/pages/LoginPage.tsx`
- Register: `frontend/src/pages/RegisterPage.tsx`
- Dashboard: `frontend/src/pages/DashboardPage.tsx`
- Transactions: `frontend/src/pages/TransactionsPage.tsx`

## 7) Notes

- Password hashing uses `bcryptjs`
- JWT auth uses `Authorization: Bearer <token>`
- Validation uses Zod on body/query/params
- Error handling is centralized in global middleware
- `CORS_ORIGIN` supports multiple origins as comma-separated values

## 8) Deployment (Recommended)

Recommended stack:
- Backend + PostgreSQL on Render
- Frontend on Vercel
- Optional one-click Render blueprint included at repo root: `render.yaml`

### A) Deploy Backend on Render

1. Push repository to GitHub.
2. In Render, create a PostgreSQL database.
3. In Render, create a Web Service for `backend` directory.
4. Configure:
- Build Command: `npm install && npm run prisma:generate && npm run build`
- Start Command: `npm run prisma:migrate:deploy && npm run start`
5. Add backend env vars in Render:
- `NODE_ENV=production`
- `PORT=5000`
- `DATABASE_URL=<render-postgres-internal-url>`
- `JWT_SECRET=<strong-random-secret>`
- `JWT_EXPIRES_IN=1d`
- `CORS_ORIGIN=https://<your-vercel-domain>`
6. Deploy backend and copy the public URL, for example: `https://finance-api.onrender.com`

### B) Deploy Frontend on Vercel

1. In Vercel, import the same GitHub repository.
2. Set Root Directory to `frontend`.
3. Add frontend env var:
- `VITE_API_URL=https://<your-render-backend-url>/api`
4. Build settings (usually auto-detected):
- Build Command: `npm run build`
- Output Directory: `dist`
5. Deploy and copy the frontend URL.

### C) Final CORS Update

After Vercel URL is ready, update backend `CORS_ORIGIN` in Render:
- `CORS_ORIGIN=https://<your-vercel-domain>`

If you also want local frontend during testing, use:
- `CORS_ORIGIN=http://localhost:5173,https://<your-vercel-domain>`

### D) Optional: Seed Production Demo Data

If you want demo data in deployed DB, run once in backend service shell:
```bash
npm run prisma:seed
```
