# Get It Together - Task Management System

## Overview
Get It Together is a university-oriented task management system designed to facilitate group assignments. It provides structured task delegation, deadline tracking, and collaboration features tailored to academic workflows.

## Features
- **User Authentication:** Secure login via email/password or Google SSO.
- **Dashboard:** Overview of assignments, deadlines, and meetings.
- **Task Management:** Assign tasks, track progress, and update statuses.
- **Assignment Management:** Organize group assignments with detailed tracking.
- **Calendar & Scheduling:** Sync schedules and suggest optimal meeting times.
- **Notifications:** Alerts for deadlines, incomplete tasks, and meeting updates.
- **Settings & User Roles:** Manage group memberships and access levels.

## Tech Stack
- **Frontend:** Next.js (React, TypeScript, Tailwind CSS)
- **Backend:** Node.js (Express.js)
- **Database:** Oracle Cloud SQL
- **Authentication:** NextAuth.js (Google SSO)
- **Real-Time Updates:** WebSockets
- **Version Control:** Git (GitLab)
- **Hosting:** Oracle Cloud, Vercel (for frontend)

## Installation
### Prerequisites
- Node.js 18+
- npm or yarn
- Oracle Cloud SQL database setup

### Setup Instructions
1. **Clone the repository:**
   ```sh
   git clone https://gitlab.com/your-repo-url.git
   cd get-it-together
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```

4. **Run the development server:**
   ```sh
   npm run dev
   ```
5. **Open in browser:**
   Visit `http://localhost:3000`

## Project Structure
```
/src
  ├── app
  │   ├── login
  │   │   ├── page.tsx
  │   │   ├── login.css
  │   ├── dashboard
  │   │   ├── page.tsx
  │   ├── tasks
  │   │   ├── page.tsx
  │   ├── assignments
  │   │   ├── page.tsx
  │   ├── calendar
  │   │   ├── page.tsx
  ├── components
  │   ├── auth
  │   │   ├── GoogleSignIn.tsx
  │   ├── ui
  │   │   ├── Button.tsx
  │   ├── layout
  ├── middleware.ts
  ├── routes.ts
  ├── types.ts
```



## Deployment
- **Frontend:** Vercel
- **Backend:** Oracle Cloud Compute
- **Database:** Oracle Cloud SQL

## Contributors
- **Qiao Er** - Frotend Developer
- **Ethan Watts** - Product Owner & Test Lead
- **Amy Tjea** - Frontend Developer
- **Mitchell Whitten** - Development Lead