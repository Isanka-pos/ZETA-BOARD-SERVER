# Zeta Board Server

Small Express + MongoDB Atlas server for two things the Android app needs:

1. **Updates** — `GET /api/update` tells the app the newest version (replaces checking
   GitHub directly). `POST /api/update` (admin key required) publishes a new one.
2. **Messages** — `GET /api/messages` returns announcements to show inside the app
   (e.g. "new sticker pack added", "server maintenance tonight"). `POST /api/messages`
   (admin key required) sends a new one.

There's also a one-page admin panel at `/` so you can publish updates and send messages
from a browser instead of curl/Postman.

## 1. MongoDB Atlas

Use your existing Atlas cluster, or create a free one. Grab the connection string from
**Database → Connect → Drivers** — it looks like:

```
mongodb+srv://user:pass@cluster0.mongodb.net/zetaboard?retryWrites=true&w=majority
```

## 2. Deploy to Heroku

```bash
cd zeta-board-server
heroku create your-app-name
heroku config:set MONGODB_URI="mongodb+srv://..." ADMIN_KEY="pick-a-long-random-secret"
git init
git add .
git commit -m "init"
heroku git:remote -a your-app-name
git push heroku main
```

Your server will be live at `https://your-app-name.herokuapp.com`.

Open that URL in a browser, paste your `ADMIN_KEY` into the admin panel and press Save —
from then on the panel remembers it in that browser.

## 3. Point the app at it

In the Android project, open `app/src/main/java/com/zeta/board/Updater.kt` and set:

```kotlin
private const val SERVER_BASE = "https://your-app-name.herokuapp.com"
```

That's the only change needed — the app already tries this server first, and falls back
to the GitHub release (`update.json` / GitHub API) if the server is unreachable, so
nothing breaks if Heroku's free dyno is asleep or down.

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

## Local testing

```bash
npm install
cp .env.example .env   # fill in MONGODB_URI and ADMIN_KEY
npm start
```
Then open `http://localhost:3000`.
