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
- **Mongoose / MongoDB** (data architecture logs & user preferences)

### OAuth & Communication Integrations
- **Gmail API** (`googleapis` developer integrations)
- **WhatsApp Cloud API** (`axios` integration framework)

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
│   ├── models/             # Database Schemas (User, Rule logs)
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
MONGODB_URI=mongodb://localhost:27017/whatsmail_notify
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
- MongoDB (running local daemon or Atlas instance)

### 1. Installation
In the project root, download all dependencies for the backend and frontend separately:
```bash
# Install backend packages
cd backend
npm install

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
