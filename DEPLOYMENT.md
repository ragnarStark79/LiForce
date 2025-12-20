# Deployment Guide (Render + Vercel)

This document describes how to deploy:

- **Backend**: `server/` to **Render** (Node/Express)
- **Frontend**: `client/` to **Vercel** (Vite/React)

It also covers the required environment variables and the correct order of operations.

---

## 0) Prerequisites

- A Git repository (GitHub/GitLab/Bitbucket) with this project pushed.
- Accounts:
  - Render: https://render.com
  - Vercel: https://vercel.com
- A production database (MongoDB Atlas or another MongoDB provider) reachable from Render.
- Your backend must allow CORS from the Vercel domain(s) you’ll use.

---

## 1) Understand the project layout

- Backend: `server/`
  - entrypoints commonly: `server/server.js` and/or `server/src/app.js`
- Frontend: `client/`
  - Vite build output: `client/dist`

---

## 2) Deploy Backend (server) on Render

### 2.0) Connect your local backend to MongoDB Atlas (recommended)

This resolves the common deployment failure where the server tries to connect to `localhost:27017` in production (Render has no local MongoDB).

#### A) Create Atlas DB + user

1. Create a cluster in MongoDB Atlas.
2. Create a **Database User** (username + password).
3. In **Network Access**:
   - For local development you can temporarily add `0.0.0.0/0` (allow from anywhere), or add only your current IP.
   - For production on Render you will typically need `0.0.0.0/0` unless you use a more restrictive setup (Render egress IPs can change).

#### B) Get the connection string

In Atlas: **Connect** → **Drivers** → copy the URI. It looks like:

- `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbName>?retryWrites=true&w=majority&appName=<app>`

Replace `<user>`, `<password>`, and `<dbName>`.

#### C) Set your local `server/.env`

Update your existing local env file:

- `MONGODB_URI=<your Atlas connection string>`

Example:

- `MONGODB_URI=mongodb+srv://lifeforce_user:YOUR_PASSWORD@cluster0.xxxx.mongodb.net/lifeforce?retryWrites=true&w=majority`

#### D) Run locally

Start the backend normally. If `MONGODB_URI` is set correctly, you should see a log like:

- `✓ MongoDB Connected: ...`

### 2.1 Create a Web Service

1. Log in to Render.
2. Click **New +** → **Web Service**.
3. Connect your Git provider and select the repo.
4. Configure:
   - **Name**: `lifeforce-server` (or any name)
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Region**: choose closest

### 2.2 Build & Start Commands

Render will run commands from the **Root Directory**.

Use these defaults (adjust if your `server/package.json` differs):

- **Build Command**:
  - `npm ci`
- **Start Command**:
  - `npm start`

If your backend uses a different start script, ensure `server/package.json` has something like:

- `"start": "node server.js"` (or the correct entry file)

### 2.3 Health Check Path (recommended)

In Render, set a health check endpoint if available:

- **Health Check Path**: `/health` (only if your API implements it)

If you don’t have `/health`, you can either:
- add one in the backend (recommended), or
- skip health checks.

### 2.4 Environment Variables (Render)

In Render → your service → **Environment** → add variables.

Common variables for this project (confirm exact names in `server/src/config/env.js`):

- `NODE_ENV` = `production`
- `PORT` = `10000` (Render injects `PORT` automatically for many setups; safe to omit if code uses `process.env.PORT`).
- `MONGODB_URI` = your production MongoDB connection string
- `JWT_SECRET` = strong random string
- `JWT_REFRESH_SECRET` = strong random string (if used)
- `CLIENT_URL` = your Vercel frontend URL (e.g. `https://lifeforce.vercel.app`)

Email/notification variables (only if used):

- `EMAIL_HOST`
- `EMAIL_PORT`
- `EMAIL_USER`
- `EMAIL_PASS`
- `EMAIL_FROM`

If you use Socket.IO:

- Keep `CLIENT_URL` accurate.
- If you allow multiple origins, support comma-separated values in your config.

> Important: Render values are **server-side secrets**. Do not store them in the repo.

### 2.5 Deploy

1. Click **Create Web Service**.
2. Wait for the build & deploy to finish.
3. Copy the service URL, e.g.:

- `https://lifeforce-server.onrender.com`

### 2.6 Post-deploy verification

Test basic endpoints:

- `GET https://<render-service>.onrender.com/` (or API base)
- `GET https://<render-service>.onrender.com/api/...`

If you have auth endpoints, verify:

- Register/Login
- Token refresh (if present)

### 2.7 Configure MongoDB Atlas on Render (required)

On Render → your service → **Environment** add:

- `MONGODB_URI` = same Atlas URI (recommended)

Also set:

- `NODE_ENV=production`
- `JWT_SECRET=...`
- `JWT_REFRESH_SECRET=...` (if used)
- `CLIENT_URL=https://<your-vercel-domain>`
- `SOCKET_CORS_ORIGIN=https://<your-vercel-domain>` (if you use it)

Then redeploy.

---

## 3) Deploy Frontend (client) on Vercel

### 3.1 Create a new Vercel Project

1. Log in to Vercel.
2. Click **Add New…** → **Project**.
3. Import your Git repo.

### 3.2 Configure the project

- **Framework Preset**: Vite
- **Root Directory**: `client`

Commands (defaults for Vite):

- **Install Command**: `npm ci` (or `npm install`)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 3.3 Environment Variables (Vercel)

Vite exposes only variables prefixed with `VITE_` to the client.

In Vercel → Project → **Settings** → **Environment Variables**, add:

- `VITE_API_BASE_URL` = `https://<render-service>.onrender.com`

If your app uses websockets:

- `VITE_SOCKET_URL` = `https://<render-service>.onrender.com`

If the UI needs to know the public site url:

- `VITE_PUBLIC_URL` = `https://<your-vercel-domain>`

> Note: the exact variable names must match what the frontend reads (commonly from `client/src/services/apiClient.js` and/or `client/src/utils/constants.js`).

### 3.4 Deploy

1. Click **Deploy**.
2. Once deployed, copy the Vercel URL, e.g.:

- `https://lifeforce.vercel.app`

---

## 4) Connect Frontend ↔ Backend (CORS + URLs)

After you have both URLs:

1. Set **Render** env var:
   - `CLIENT_URL=https://<your-vercel-domain>`
2. Ensure backend CORS allows the Vercel domain.
3. Set **Vercel** env var(s):
   - `VITE_API_BASE_URL=https://<your-render-domain>`
   - `VITE_SOCKET_URL=https://<your-render-domain>` (if used)
4. Redeploy both if you changed env vars.

---

## 5) SPA Routing on Vercel (important)

If your React app uses client-side routing (React Router) and you see 404s on refresh for routes like `/login` or `/dashboard`, add a **rewrite**.

Create `client/vercel.json`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Then redeploy.

---

## 6) Common Issues / Fixes

### 6.1 CORS errors

Symptoms:
- Browser console shows CORS blocked requests.

Fix:
- Ensure backend CORS allows the exact Vercel origin(s):
  - `https://<project>.vercel.app`
  - any custom domain
- If using credentials (cookies), ensure:
  - `Access-Control-Allow-Credentials: true`
  - frontend uses `withCredentials: true` (axios/fetch)
  - CORS origin is not `*`

### 6.2 Wrong API base URL in frontend

Symptoms:
- Frontend calls `localhost` in production.

Fix:
- Confirm `VITE_API_BASE_URL` is configured in Vercel.
- Confirm frontend code uses it.

### 6.3 WebSockets not connecting

Fix:
- Ensure `VITE_SOCKET_URL` points to Render.
- Ensure server Socket.IO CORS config includes Vercel origin.

### 6.4 Render sleeping (free tier)

Symptoms:
- First request after idle is slow.

Fix:
- Expected behavior on free tier.
- Consider paid plan or keep-alive pings.

---

## 7) Suggested deployment order

1. Deploy backend to Render.
2. Set backend env vars (especially DB + secrets).
3. Copy Render URL.
4. Deploy frontend to Vercel with `VITE_API_BASE_URL` pointing to Render.
5. Update backend `CLIENT_URL` to the Vercel URL.
6. Redeploy backend.

---

## 8) Where to look in this repo

If you need to confirm the exact environment variable names used by the code, check:

- Backend:
  - `server/src/config/env.js`
  - `server/src/config/db.js`
  - `server/src/app.js`
- Frontend:
  - `client/src/services/apiClient.js`
  - `client/src/utils/constants.js`

---

## 9) Production checklist

- [ ] DB is production-grade (Atlas) and IP access allows Render.
- [ ] Strong secrets for JWT.
- [ ] CORS configured for Vercel domain.
- [ ] Frontend uses `VITE_API_BASE_URL`.
- [ ] Auth flow works in production.
- [ ] Socket/notifications (if any) work.
