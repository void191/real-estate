# Real Estate Viewing Coordinator

A high-performance, full-stack real estate viewing coordination platform built with **Next.js 14 (App Router)**, **PostgreSQL (Prisma ORM)**, **Socket.io real-time streaming**, and **Tailwind CSS**.

---

## Features

### 1. Customer & Buyer Experience
- **Architectural Property Feed**: Image-first, single-column luxury property feed with Fraunces headlines, brass accents, and responsive layout.
- **Advanced Filtering**: Filter residences by price range, minimum bedrooms, and minimum sqm area.
- **Property Particulars & Details**: High-resolution gallery with thumbnail picker, specifications, assigned agent profile, and instant viewing booking.
- **Saved Residences**: Persistent buyer favorites collection.
- **My Viewings**: Segregated upcoming and past viewing itineraries with real-time status updates.
- **Live Geolocation Streaming**:
  - Activated upon departure via the **"I'm on my way"** trigger.
  - Continuous GPS updates via `navigator.geolocation.watchPosition()` over viewing-specific WebSocket channels.
  - Interactive Leaflet live map showing the moving buyer pin with live radar pulse, destination residence pin, dashed transit route, remaining distance, and ETA in **JetBrains Mono**.
  - Immediate stream teardown and status transition upon **"I've arrived"**.
  - Built-in movement simulation control for testing on desktop environments without GPS hardware.

### 2. Agent Portal
- **Role-Gated Staff Queue**: 4-column structured workflow (`Requested | Accepted | En Route | Completed`).
- **Live En Route Radar**: En Route card expands into an interactive Leaflet live map displaying real-time buyer movement and ETA.
- **Fast Action Controls**:
  - Accept appointment
  - Decline appointment
  - Propose alternative time slot with custom notes
  - Fallback arrival confirmation
  - Conclude viewing with detailed notes and feedback
- **Data Isolation**: Strict server-side RBAC ensures agents only access and modify their assigned appointments.

### 3. Executive Admin Dashboard
- **Agency-Wide Operations Overview**: Real-time KPI cards for active listings, total viewings, agent roster, and completion conversion rate.
- **Central Viewing Queue**: Agency-wide viewing table with filtering by agent, status, and date.
- **Portfolio Management**: Complete CRUD operations for luxury residences with architectural photo URLs and agent assignment.
- **Agent Roster**: Agent appointment, credential management, and immediate activation/deactivation controls.
- **Performance Reports**: Real database analytics for viewing conversion %, agent turnaround time, listing saves, and consultant activity.

---

## Tech Stack

- **Framework**: Next.js 14 (App Router, Server Actions, TypeScript)
- **Database**: PostgreSQL 18 with Prisma ORM
- **Real-Time Communication**: Socket.io on custom Node.js HTTP server
- **Authentication**: JWT stored in `httpOnly` secure cookies with server-side RBAC
- **Mapping**: Leaflet + OpenStreetMap
- **Design System**: Custom luxury tokens (`ink: #1E2A32`, `stone: #E9E4D8`, `brass: #B08D45`, `live: #3E7C59`, `white: #FCFAF8`)
- **Typography**: Fraunces, Inter, JetBrains Mono

---

## Getting Started

### Prerequisites
- Node.js 18+ (Node 20+ recommended)
- PostgreSQL database

### Installation

1. Clone repository:
   ```bash
   git clone <REPO_URL>
   cd jolly-bardeen
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Set your `DATABASE_URL` and `JWT_SECRET` in `.env`.

4. Push schema and seed database:
   ```bash
   npx prisma db push
   npx tsx prisma/seed.ts
   ```

5. Start the development server with real-time Socket.io support:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Seed Accounts (Password: `password123`)

| Role | Email | Name | Context |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@agency.com` | Eleanor Kensington | Full agency governance & reports |
| **Agent (Erbil)** | `alan.barzan@agency.com` | Alan Barzani | Empire World & English Village |
| **Agent (Erbil)** | `layla.erbil@agency.com` | Layla Hawrami | Dream City & Italian Village |
| **Agent (London)** | `sarah.jenkins@agency.com` | Sarah Jenkins | Eaton Square & Cadogan Gardens |
| **Agent (London)** | `marcus.vance@agency.com` | Marcus Vance | Mount Street & Glasshouse |
| **Buyer 1** | `buyer1@example.com` | Oliver Sterling | En Route to Empire World Penthouse |
| **Buyer 2** | `buyer2@example.com` | Sophia Montgomery | En Route to Dream City Palace |

---

## Verification & Testing

Run the automated end-to-end verification test suite checking 51 acceptance checkpoints:

```bash
npx tsx scripts/verify-system.ts
```
