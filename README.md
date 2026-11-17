# Zeta Board Server (Vercel)

Small Express + MongoDB Atlas backend for two things the Android app needs, built to run
as Vercel serverless functions.

1. **Updates** — `GET /api/update` tells the app the newest version (replaces checking
   GitHub directly). `POST /api/update` (admin key required) publishes a new one.
2. **Messages** — `GET /api/messages` returns announcements to show inside the app
   (e.g. "new sticker pack added", "server maintenance tonight"). `POST /api/messages`
   (admin key required) sends a new one.

There's also a one-page admin panel at `/` so you can publish updates and send messages
from a browser instead of curl/Postman.

## How it's structured for Vercel

- `api/index.js` — the one serverless function. It just exports the Express app from `app.js`.
- `vercel.json` — sends every request (`/`, `/api/update`, `/api/messages`, …) to that one function.
- `db.js` — caches the MongoDB connection across warm invocations (a fresh connection on every
  request would exhaust Atlas's connection limit).
- `server.js` — only for running it on your own machine (`npm start`); Vercel never touches this file.

## 1. MongoDB Atlas

Use your existing cluster, or create a free one. Grab the connection string from
**Database → Connect → Drivers**:

```
mongodb+srv://user:pass@cluster0.mongodb.net/zetaboard?retryWrites=true&w=majority
```

**Important for Vercel:** in Atlas → **Network Access**, add `0.0.0.0/0` as an allowed IP.
Vercel's serverless functions run on rotating IPs, so you can't whitelist a fixed one.

## 2. Deploy to Vercel

Easiest way — through the dashboard:

1. Push this folder to a new GitHub repo.
2. On vercel.com -> **Add New -> Project** -> import that repo.
3. Before deploying, add two **Environment Variables**:
   - `MONGODB_URI` = your Atlas connection string
   - `ADMIN_KEY` = a long random secret you make up
4. Deploy. Vercel gives you a URL like `https://zeta-board-server.vercel.app`.

Or with the CLI:

```bash
npm i -g vercel
cd zeta-board-server
vercel login
vercel --prod
vercel env add MONGODB_URI
vercel env add ADMIN_KEY
vercel --prod   # redeploy so the new env vars take effect
```

Open the deployed URL in a browser, paste your `ADMIN_KEY` into the admin panel and press
Save - that browser remembers it from then on.

## 3. Point the app at it

In the Android project, open `app/src/main/java/com/zeta/board/Updater.kt` and `Messages.kt`
and set the same value in both:

```kotlin
private const val SERVER_BASE = "https://zeta-board-server.vercel.app"
```

That's the only change needed - the app already tries this server first for updates, and
falls back to the GitHub release (`update.json` / GitHub API) if it's unreachable, so nothing
breaks if the function is cold or down.

## API reference

### `GET /api/update`
```json
{ "versionCode": 42, "versionName": "1.0.42", "notes": "fixed crash", "apkUrl": "https://...", "mandatory": false }
```

### `POST /api/update`  (header `x-admin-key: <ADMIN_KEY>`)
```json
{ "versionCode": 42, "versionName": "1.0.42", "notes": "fixed crash", "apkUrl": "https://...", "mandatory": false }
```

### `GET /api/messages`
Returns an array of active messages, newest first:
```json
[{ "_id": "...", "title": "New sticker pack", "body": "Check the sticker tab!", "type": "promo", "createdAt": "..." }]
```

### `POST /api/messages`  (header `x-admin-key: <ADMIN_KEY>`)
```json
{ "title": "New sticker pack", "body": "Check the sticker tab!", "type": "promo" }
```

### `DELETE /api/messages/:id`  (header `x-admin-key: <ADMIN_KEY>`)
Deactivates a message (kept in the database, just no longer returned to the app).

## Running it locally

```bash
npm install
cp .env.example .env   # fill in MONGODB_URI and ADMIN_KEY
npm start
```
Then open `http://localhost:3000`.
