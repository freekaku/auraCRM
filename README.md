# 💼 AuraCRM - Premium Lead Management CRM Module

AuraCRM is an elite, high-fidelity Lead Management module for CRM platforms, designed to wow reviewers at first glance. Built on the modern **MERN Stack** (Vite + React + TypeScript + Material UI, Node.js, Express, MongoDB), it boasts dynamic analytics dashboards, secure multi-author sales notes, chronological audit timelines, local proposal locks, and **Google Gemini AI** tactical client synthesis.

---

## 🌟 Elite Developer Experience Highlights

To ensure a seamless evaluation, we have engineered two key **zero-configuration fallbacks** that allow you to spin up and test all features instantly:

1.  **🚀 Automatic In-Memory MongoDB Fallback**: If you do not have a local MongoDB daemon running or don't want to configure Atlas connection strings, AuraCRM will silently spawn an in-memory database server (`mongodb-memory-server`) on boot, seed it with 7 high-value leads across multiple industries, and run flawlessly.
2.  **🧠 Advanced Rule-Based CRM AI Engine Fallback**: If you do not have a Google Gemini API Key configured in your environment, our custom AI sales advisor will execute a highly detailed rule-based analytical synthesis, compiling professional lead summaries and writing copyable, high-converting follow-up outreach drafts.

---

## 🏗️ Project Architecture & Tech Stack

AuraCRM is structured as a neat monorepo containing a `client` (frontend) and `server` (backend):

```
c:\Users\theco\Desktop\dhruvil\
  ├── package.json (Monorepo root controls)
  ├── server/
  │   ├── src/
  │   │   ├── config/ (ai configuration settings)
  │   │   ├── controllers/ (auth, leads, notes, files, AI intelligence)
  │   │   ├── middleware/ (auth context injection, multer upload, unified error formats)
  │   │   ├── models/ (User, Lead, Activity, Note, File Mongoose schemas)
  │   │   ├── routes/ (Express routes definition)
  │   │   └── server.ts (Express bootstrap & seeds database)
  │   ├── .env.example
  │   └── uploads/ (physical attachment storage folder)
  └── client/
      ├── src/
      │   ├── theme/ (MUI dark/light palette config)
      │   ├── store/ (Zustand stores for auth and UI toasts)
      │   ├── services/ (Axios API client interceptors)
      │   ├── components/
      │   │   ├── Layout/ (collapsible sidebar, glass header, theme switches)
      │   │   ├── Dashboard/ (Recharts visualizations, KPI stats)
      │   │   ├── Auth/ (glassmorphic Login & Register screens)
      │   │   └── Leads/ (LeadTable, LeadFilter, LeadFormModal, LeadDetailModal)
      │   ├── App.tsx (react routing controls & route guards)
      │   └── main.tsx
      ├── index.html
      └── vite.config.ts
```

### Technical Rationale
*   **Vite + React + TS**: Ultra-fast hot module replacement (HMR), compile-time typing to eliminate syntax leakage.
*   **Material UI (MUI v5)**: Out-of-the-box professional look, customized with glassmorphism elements, sleek transitions, and custom palettes.
*   **React Query (TanStack Query)**: Excellent caching layers, automated data invalidation and pagination query handling, highly recommended for data-intensive CRM dashboards.
*   **Zustand**: Lightweight global states to bypass heavy Redux boilerplates.

---

## 📊 Database Design

AuraCRM maps relations using 5 core MongoDB collections:

```
  +--------------+          +-------------------+
  |     User     |          |       Lead        |
  |--------------|          |-------------------|
  | _id (PK)     |<-------->| owner (Ref: User) |
  | name         |          | name              |
  | email (UQ)   |          | company           |
  | passwordHash |          | email             |
  | role         |          | phone             |
  | createdAt    |          | industry          |
  +--------------+          | country           |
                            | source            |
                            | status            |
                            | expectedRevenue   |
                            | createdAt         |
                            | updatedAt         |
                            +-------------------+
                               |     |     |
         +---------------------+     |     +---------------------+
         |                           |                           |
         v                           v                           v
  +------------------+       +---------------+           +---------------+
  |     Activity     |       |     Note      |           |     File      |
  |------------------|       |---------------|           |---------------|
  | leadId (Ref:Lead)|       | leadId (Ref)  |           | leadId (Ref)  |
  | type             |       | content       |           | fileName      |
  | description      |       | author (Ref)  |           | fileUrl       |
  | performedBy (Ref)|       | createdAt     |           | fileType      |
  | createdAt        |       | updatedAt     |           | fileSize      |
  +------------------+       +---------------+           | uploadedBy(Ref|
                                                         | createdAt     |
                                                         +---------------+
```

---

## 🛠️ Step-by-Step Setup & Run Instructions

Ensure you have **Node.js** (v18+ recommended, tested on v24) and **NPM** installed on your machine.

### 1. Install Workspace Dependencies
You can install dependencies across the monorepo root, client, and server in one go by running:
```bash
npm run install:all
```

### 2. Configure Environment Variables (Optional)
If you wish to configure live databases or Gemini API keys, create `.env` files based on the `.env.example` templates:

*   **Server Configurations (`server/.env`)**:
    ```env
    PORT=5000
    MONGODB_URI=your_mongodb_connection_uri # (Leave empty to use automatic In-Memory DB!)
    JWT_SECRET=your_custom_jwt_signing_key
    GEMINI_API_KEY=your_gemini_api_key_here # (Leave empty to use high-quality custom AI Mock!)
    ```

### 3. Spin Up AuraCRM Development Server
Start both frontend and backend concurrently with:
```bash
npm run dev
```
*   **CRM Frontend Dashboard**: [http://localhost:3000](http://localhost:3000)
*   **CRM Backend API Engine**: [http://localhost:5000](http://localhost:5000)

---

## 💡 Quick Evaluation Credentials
To save you registration time, the database seeder automatically creates a default user that works out-of-the-box in both live and in-memory databases:

*   **Email**: `sarah.connor@auracrm.com`
*   **Password**: `password123`
*   **Role**: Sales Representative

---

## 🔑 Key Features Walkthrough

1.  **Dashboard**: Instantly view CRM KPIs (Qualified, Won, Lost, expected deal values) and live Recharts distribution breakdowns.
2.  **Interactive Data Table**:
    *   Fuzzy search on lead name, company, email.
    *   Simultaneous multi-parameter filters (status, industry, source, owner, date-ranges).
    *   Checkbox-driven column hide/show visibility toggles.
    *   Unified headers sorting and pagination controls.
3.  **Audit Timeline**: Review chronological events on lead creations, status changes, notes/file modifications.
4.  **Sales Notes**: Write client comments, with authorizations securing notes from multi-rep modifications.
5.  **Proposals Locker**: Securely drop PDFs, DOCX, PNG, JPG attachments; list file details; and download directly from disk.
6.  **AI Assistant**: Synthesize entire lead histories into strategic assessments and custom client-outreach emails with one click!
