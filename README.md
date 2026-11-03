# CivicSense

Campus issue and grievance management. Students report problems anonymously, get a complaint ID and a private tracking token, and follow progress. Administrators triage and resolve complaints from a dashboard.

- **Client:** React 18, Vite, Tailwind CSS 4, React Router, i18next
- **Server:** Node.js (ES modules), Express 4, Mongoose 8, Zod validation
- **Database:** MongoDB
- **Auth:** JWT, administrators only (no student accounts)
- **Images:** Cloudinary (optional; uploads are disabled until configured)

## What is implemented

| Area | Status |
| --- | --- |
| Anonymous complaint submission (title, description, location, optional image, preferred language) | Implemented |
| Complaint ID + separate tracking token; token stored only as an HMAC hash | Implemented |
| Public tracking by ID + token, with status history timeline | Implemented |
| Admin login, dashboard stats, search/filter/pagination, detail view | Implemented |
| Status updates with history, internal notes, department assignment, manual category/priority | Implemented |
| Rate limiting on submission, tracking and admin login | Implemented |
| Image type/size restriction (JPEG/PNG/WebP, size from env) plus file-signature check | Implemented |
| English UI | Implemented |
| Assamese UI | **Structure only.** `as.json` is empty on purpose; text falls back to English (see [Translations](#translations)) |
| AI summaries / classification | Implemented when `GROQ_API_KEY` is configured (Qwen 3.8 27B by default) |
| Image inspection and duplicate suggestions | Implemented: exact image hash matching plus Qwen vision comparison against recent reports at the same location |

The admin interface is English-only. Only public workflows are bilingual.

## Project structure

```
civicsense/
├── client/
│   ├── scripts/check-translations.js     # lists missing translation keys
│   └── src/
│       ├── components/                   # layouts, badges, timeline, ui/ primitives
│       ├── constants/                    # statuses, categories, translation-key maps
│       ├── context/AuthContext.jsx       # admin session
│       ├── i18n/                         # i18next setup and locales/{en,as}.json
│       ├── pages/public/                 # home, report, track
│       ├── pages/admin/                  # login, dashboard, complaint detail
│       ├── services/api.js               # all HTTP calls
│       └── utils/
└── server/
    └── src/
        ├── config/                       # env parsing, database
        ├── constants/                    # statuses, categories, departments
        ├── controllers/                  # request handlers
        ├── middleware/                   # auth, validation, upload, rate limits, errors
        ├── models/                       # Complaint, Admin
        ├── routes/                       # public and admin routers
        ├── scripts/createAdmin.js
        ├── services/                     # complaints, credentials, Cloudinary
        └── validators/schemas.js         # Zod schemas
```

## Setup

### Prerequisites

- Node.js 20 or newer
- A MongoDB instance: local (`mongodb://127.0.0.1:27017/civicsense`) or a free MongoDB Atlas cluster

### 1. Install

```bash
npm run install:all     # installs server/ and client/
npm install             # root only: installs `concurrently` for `npm run dev`
```

### 2. Configure the server

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:

- `MONGODB_URI`: your connection string.
- `JWT_SECRET` and `TRACKING_TOKEN_SECRET`: two **different** random strings of 32+ characters. Generate each with:
  ```bash
  node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
  ```
- Cloudinary values are optional. Leave them blank and the report form hides photo upload and tells the user it is unavailable.

The server refuses to start if a required value is missing or a secret is too short.

> Changing `TRACKING_TOKEN_SECRET` later makes every existing tracking token stop working, because stored hashes are keyed with it.

The client needs no configuration in development. `client/.env.example` documents the optional overrides.

### 3. Create an administrator

There is no public admin sign-up. Create accounts from the command line:

```bash
npm run create-admin
```

You will be prompted for name, email and password (minimum 10 characters). For scripted use, set `ADMIN_NAME`, `ADMIN_EMAIL` and `ADMIN_PASSWORD` in the environment instead.

### 4. Run

```bash
npm run dev
```

- Client: http://localhost:5173
- API: http://localhost:5000 (the Vite dev server proxies `/api` to it)
- Admin: http://localhost:5173/admin/login

Or run each side separately with `npm run dev:server` and `npm run dev:client`.

### Production build

```bash
npm run build           # outputs client/dist
NODE_ENV=production npm run start
```

The server serves the API only. Host `client/dist` on any static host or reverse proxy. When the API and client are on different origins, build the client with `VITE_API_BASE_URL=https://your-api.example/api` and set `CLIENT_ORIGIN` on the server. Set `TRUST_PROXY=1` when running behind a reverse proxy so rate limiting sees real client IPs.

### Check your setup

1. Open `/report`, submit a complaint, and note the ID and token.
2. Open `/track` and look it up with both values. A wrong token should give the same "no match" message as a wrong ID.
3. Sign in at `/admin/login`, open the complaint, change its status, and look it up again on `/track` to see the new history entry.
4. Confirm the internal note you add in the admin view never appears on `/track`.

## API

Public (no authentication):

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/api/config` | Which optional features are on (image upload, size limit) |
| POST | `/api/complaints` | `multipart/form-data`: `title`, `description`, `location`, `language` (`en`/`as`), optional `image`. Rate limited. Returns `complaintId` and `trackingToken` once |
| POST | `/api/complaints/track` | JSON `{ complaintId, token }`. Rate limited. POST so the token never lands in URLs or logs |

Admin (`Authorization: Bearer <jwt>` required, except login):

| Method | Path | Notes |
| --- | --- | --- |
| POST | `/api/admin/auth/login` | `{ email, password }`, rate limited |
| GET | `/api/admin/auth/me` | Current admin |
| GET | `/api/admin/stats` | Dashboard counts |
| GET | `/api/admin/complaints` | Query: `search`, `status`, `category`, `priority`, `from`, `to` (YYYY-MM-DD), `sort`, `page`, `limit` |
| GET | `/api/admin/complaints/:complaintId` | Full detail including notes |
| PATCH | `/api/admin/complaints/:complaintId/status` | `{ status }`; appends to history |
| POST | `/api/admin/complaints/:complaintId/notes` | `{ text }` |
| PATCH | `/api/admin/complaints/:complaintId` | `{ category?, priority?, assignedDepartment? }`; `null` clears a value |

Errors always have the shape `{ "error": { "message": "...", "details": [...] } }`.

### Dashboard definitions

- **Pending:** Submitted + Under Review
- **High priority:** priority High or Urgent and status not Resolved or Rejected

Category and priority are `null` on new complaints until an administrator sets them; the public page shows "not categorised yet" / "not assigned yet" rather than a guessed value.

## Security notes

- Tracking tokens are 100 bits of randomness, shown once, and stored only as HMAC-SHA256 hashes. Lookups compare in constant time and return an identical response for an unknown ID and a wrong token.
- Admin passwords are hashed with bcrypt (cost 12). Login is rate limited and does not reveal whether an email exists. Admin accounts are re-checked in the database on every request, so disabling one (`isActive: false`) takes effect immediately.
- All input is validated with Zod and normalised to Unicode NFC. Query filters are restricted to known enum values, and search text is regex-escaped.
- Uploads: memory storage, one file, JPEG/PNG/WebP only, size capped by `MAX_IMAGE_SIZE_MB`, with the real file signature checked. The upload asks Cloudinary to strip embedded metadata; confirm this on a test upload if anonymity of photos matters to you.
- `helmet`, a restricted CORS origin list, and `Cache-Control: no-store` on all API responses.
- Secrets live only in `server/.env`. Anything in client env files is public by design.
- **Admin token storage:** the JWT is kept in `sessionStorage` (cleared when the tab closes). This is simple but readable by any script running on the page, so an XSS bug would expose it. If your threat model needs more, move to an `httpOnly` cookie with CSRF protection.
- Shared networks: the default submission limit is 10 per hour per IP. If many students sit behind one campus NAT, raise `SUBMIT_RATE_LIMIT_MAX`.

## Translations

Public text lives in `client/src/i18n/locales/`. `en.json` is complete. `as.json` is intentionally an empty object so that no machine-made or guessed Assamese ships.

To add Assamese:

1. Copy the structure of `en.json` into `as.json` and translate the values. Keep the keys and any `{{placeholders}}`.
2. Run `npm run i18n:check --prefix client` to list keys still missing (`-- --strict` exits non-zero, useful in CI).
3. Any key missing from `as.json` falls back to English. While `as.json` is incomplete, Assamese users see a small notice saying so; it disappears automatically once every key is translated.

Category and status labels are translation keys too (`category.*`, `status.*`, `priority.*`). The stored database values stay in English.

The UI loads Inter and Noto Sans Bengali (which covers the Assamese script) from npm packages, so no external font service is contacted.

## AI analysis and image duplicate detection

Set `GROQ_API_KEY` in `server/.env` to enable AI classification and analysis. The default model is `qwen/qwen3.8-27b`; override it with `GROQ_MODEL` if needed. The API key is used only by the server and is never sent to the browser.

During submission, the server asks the model for a bilingual summary, category, priority, department, image description, and a possible duplicate complaint. The validated category, priority, and department are assigned automatically; administrators can change them later from the complaint detail page. For image reports, it first stores a SHA-256 image hash to catch exact re-uploads and then gives the model the new image plus up to five recent image reports from the same location. The model's duplicate result is a review signal, not an automatic merge or rejection. Administrators can inspect it in the complaint detail page and make the final decision.

AI failures do not fail complaint submission. Results are written to the `aiSummary` subdocument when analysis completes. Validate Assamese quality with real speaker-reviewed examples before relying on the automatic classification operationally; Groq usage is subject to the limits of your Groq account.
