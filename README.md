# Kristallball - Military Asset Management System

An enterprise-grade, transaction-safe logistics and inventory tracking system built with Node.js/Express, React, and PostgreSQL.

## Features

- **ACID Transaction Transfers:** Atomically moves inventory between bases safely.
- **Dynamic Asset Balancing:** Computes stock levels dynamically on query.
- **Granular Security:** RBAC with base-scoping permissions.
- **Central Audit Logs:** Automatically logs modifications.

## Tech Stack

- **Backend:** Express, Node.js, PostgreSQL (`pg` pool)
- **Frontend:** React, Vite, Tailwind CSS, Recharts, Lucide, Axios

## Setup & Running

1. **Start PostgreSQL Container:**
   ```bash
   docker-compose up -d
   ```

2. **Setup and Seed Backend Database:**
   ```bash
   cd backend
   npm install
   npm run seed
   npm start
   ```

3. **Start React Frontend:**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

## Test Accounts

- **Admin:** `admin_user` / `AdminPass123!` (Global control)
- **Base Commander:** `commander_alpha` / `CommandPass123!` (Fort Alpha scoped)
- **Logistics Officer:** `logistics_officer` / `LogisticsPass123!` (Purchases/Transfers scoped)
