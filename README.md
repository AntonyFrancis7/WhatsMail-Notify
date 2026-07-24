# WhatsMail-Notify

A production-ready full-stack application that monitors a user's Gmail inbox using the Gmail API, checks incoming messages against a whitelist of senders, and sends immediate WhatsApp notifications via the official WhatsApp Cloud API.

## Features

- **Real-Time Gmail Monitoring**: Monitors incoming mail using Gmail API watch subscriptions.
- **Whitelist Sender Alerts**: Custom configuration rules filter notifications for specific corporate or private email addresses.
- **Official WhatsApp Messaging**: Dispatches templated WhatsApp alerts using the official Meta WhatsApp Cloud API.
- **Google OAuth 2.0 Auth**: Easy authentication flow for users granting access to their Gmail inbox.
- **Modern User Experience**: Reactive dashboard with configurations, statistics, and whitelist interfaces.

## Technology Stack

### Frontend
- **React 19**
- **Vite**
- **Tailwind CSS v4** (using `@tailwindcss/vite` plugin integrations)
- **React Router**
- **Axios**

### Backend
- **Node.js**
- **Express.js**
- **PostgreSQL / Prisma ORM** (data architecture logs & user preferences)

### OAuth & Communication Integrations
- **Gmail API** (`googleapis` developer integrations)
- **WhatsApp Cloud API** (`axios` integration framework)

---

## Google OAuth 2.0 & PostgreSQL Setup

### 1. PostgreSQL & Prisma Setup
Ensure you have a running PostgreSQL database instance (local server or hosting provider).
Update `DATABASE_URL` in `backend/.env` with your connection string.

After installing dependencies, run the migrations to create the database tables:
```bash
npx prisma migrate dev --name init
```
Generate Prisma Client binaries:
```bash
npx prisma generate
```

### 2. Google Cloud Setup
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project.
3. Search for **APIs & Services** > **OAuth consent screen**.
4. Set User Type to **External**, fill in required App Name & support email fields.
5. In **Scopes**, add `openid`, `../auth/userinfo.email`, `../auth/userinfo.profile`, and `https://www.googleapis.com/auth/gmail.readonly`.
6. Go to **Credentials**, click **Create Credentials** > **OAuth client ID**.
7. Set Application Type to **Web application**.
8. Under **Authorized JavaScript origins**, add:
   - `http://localhost:3000` (Frontend)
   - `http://localhost:5000` (Backend)
9. Under **Authorized redirect URIs**, add:
   - `http://localhost:5000/api/auth/google/callback` (Backend Callback Link)
10. Copy your **Client ID** and **Client Secret** and add them to `backend/.env`.

---

## Authentication Flow

Below is the authentication sequence diagram illustrating the OAuth 2.0 flow:

```mermaid
sequenceDiagram
    actor User as User Browser
    participant FE as React Frontend (:3000)
    participant BE as Express Backend (:5000)
    participant Google as Google Auth Server

    User->>FE: Click "Sign in with Google"
    FE->>User: Redirect to BE GET /api/auth/google
    User->>BE: Request login redirect URL
    BE->>User: Redirect to Google Consent Portal (with client ID & scopes)
    User->>Google: Grant permissions & authenticate
    Google->>BE: Redirect to BE GET /api/auth/google/callback?code=CODE
    BE->>Google: Exchange authorization CODE for Access & Refresh Tokens
    Google-->>BE: Returns tokens
    BE->>BE: Requests user account details
    Google-->>BE: Returns profile payload (ID, email, name, picture)
    BE->>BE: Upsert User Profile inside PostgreSQL (via Prisma)
    BE->>User: Issue JWT in HTTP-Only Lax Cookie (token) & redirect to FE /dashboard
    User->>FE: Renders /dashboard
    FE->>BE: GET /api/auth/profile (with credentials cookies)
    BE->>BE: Verify JWT Cookie
    BE-->>FE: Return Profile JSON Data
    FE-->>User: Display Authenticated Page UI
```

---

## Folder Structure

```text
WhatsMail-Notify/
├── README.md
├── .gitignore
├── .env.example
├── backend/
│   ├── package.json
│   ├── server.js
│   ├── .env.example
│   ├── config/             # DB and system connection helpers
│   ├── controllers/        # Business controllers logic
│   ├── middleware/         # Auth, 404, handles, global errors
│   ├── prisma/             # Prisma database schema definition
│   │   └── schema.prisma
│   ├── routes/             # Authentication & Webhook endpoints
│   ├── services/           # External API interfaces (Gmail, WhatsApp Helper)
│   └── utils/              # Formatter and helpers stub modules
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    ├── .env.example
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── assets/
        ├── components/
        ├── hooks/          # React authorization hooks
        ├── layouts/        # Web layouts framework
        ├── pages/          # View panels (Dashboard, Settings, Home)
        ├── services/       # Axio API endpoints instance mapping
        ├── styles/         # Global stylesheets (using Tailwind CSS v4)
        └── utils/          # Formatting/Truncate helpers
```

---

## Environment Variables

### Root
Create `.env` at the project root folder.
```ini
PORT=5000
```

### Backend
Create `backend/.env` containing:
```ini
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/whatsmail_notify?schema=public
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
JWT_SECRET=your_security_token_secret
WHATSAPP_ACCESS_TOKEN=your_whatsapp_client_token
WHATSAPP_PHONE_NUMBER_ID=your_whatsapp_phone_number_id
VERIFY_TOKEN=your_webhook_verification_token
```

### Frontend
Create `frontend/.env` targeting the local API port connection:
```ini
VITE_API_URL=http://localhost:5000
```

---

## Running Locally

### Prerequisites
- Node.js (version `>= 18`)
- PostgreSQL (database runner)

### 1. Installation
In the project root, download all dependencies for the backend and frontend separately:
```bash
# Install backend packages
cd backend
npm install

# Run database migrations and client generation
npx prisma migrate dev --name init
npx prisma generate

# Install frontend packages
cd ../frontend
npm install
```

### 2. Configure Environments
Create a copies of `.env.example` as `.env` inside their respective directories (`/`, `/backend`, `/frontend`) and supply credentials.

### 3. Execution
Start the services in development mode:

**Backend Dev Mode:**
```bash
cd backend
npm run dev
```

**Frontend Dev Mode:**
```bash
cd frontend
npm run dev
```
Open a browser pointing to `http://localhost:3000` to interact with the frontend client.

---

## Sprint 3.1: Gmail API Integration

### Overview
Sprint 3.1 implements Gmail connection profiles, list syncing with search parameterization, full email MIME structure formatters, and attachments extraction with download bridges. 

### Folder Structure Changes
```text
WhatsMail-Notify/
├── backend/
│   ├── controllers/
│   │   └── gmailController.js
│   ├── routes/
│   │   └── gmailRoutes.js
│   ├── services/
│   │   └── gmailService.js
│   └── utils/
│       └── gmailFormatter.js
└── frontend/
    └── src/
        ├── components/
        │   └── EmailCard.jsx
        ├── pages/
        │   ├── Inbox.jsx
        │   └── EmailDetail.jsx
        └── services/
            └── gmailService.js
```

### API Endpoints

All endpoints below require a valid session JWT cookie.

| Method | Endpoint | Description | Query Parameters |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/gmail/profile` | Fetches the connected Gmail account profile data | None |
| **GET** | `/api/gmail/messages` | Lists the latest 25 emails with pagination and search | `q` (search query), `pageToken` (token string) |
| **GET** | `/api/gmail/message/:id` | Returns the full email content (decodes base64url content) | None |
| **GET** | `/api/gmail/messages/:messageId/attachments/:attachmentId` | Downloads attachment binary payload | `filename`, `mimeType` (metadata) |

### Hardening & Security Features
- **XSS Sanitization & Sandbox Isolation**: Email HTML body payloads render inside an `<iframe>` with `sandbox="allow-popups allow-popups-to-escape-sandbox"` and `srcDoc` inputs. Inline script execution is blocked browser-side.
- **Concurrent Token Refreshes**: A promise cache map guarantees that simultaneous incoming API requests triggering 401 token refreshes resolve sequentially rather than spawning duplicate calls to Google servers.
- **RFC base64url Decoding**: Handles email mime payload blocks securely by resolving special character buffers with native Node `base64url` formats.

### Testing Instructions
1. Run backend development: `cd backend && npm run dev`.
2. Run frontend development: `cd frontend && npm run dev`.
3. Open browser on `http://localhost:3000`. Authenticate using Google OAuth 2.0.
4. Access the **Inbox** link inside the Navbar navigation.
5. Verify list rendering, pagination, unread indicator circles, profile stats, and attachment download links.

### Known Limitations
- The system currently polls messages client-side; Webhooks/Google Cloud Pub/Sub subscriptions are not enabled (Sprint 3.2 scopes).
- Whitelist rules are not yet configured in the database, showing in settings as state placeholders.

---

## Deployment Instructions

### Backend (Railway)
1. Add a MongoDB Core plugin or spin up a MongoDB cluster.
2. Link your Github repository and configure deployment from your `/backend` directory.
3. Hook up required Environment variables in the Railway Variables console.

### Frontend (Vercel)
1. Deploy from the `/frontend` directory.
2. In Vercel Project Settings, set `VITE_API_URL` to point to your deployed Railway backend URL.

---

## Future Improvements
- Multi-user authentication support mapping individual notification settings rules.
- Gmail Push Notifications (optimizing away periodic polling queries using Google Cloud Pub/Sub subscriptions).
- SMS backups for network failures.

## License
MIT
