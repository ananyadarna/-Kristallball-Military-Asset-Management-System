# Kristallball - Military Asset Management System

Kristallball is an enterprise-grade Military Asset Management System designed to track critical military assets (vehicles, weapons, ammunition) across multiple operational bases. The system guarantees transactional integrity (ACID) for cross-base asset transfers, provides real-time logistics analytics, and enforces granular Role-Based Access Control (RBAC).

---

## Core Operational Features

1. **End-to-End Asset Visibility:** Calculates dynamic opening balances, net movements, active deployments, expenditures, and final closing balances for all military inventory.
2. **Operational Accountability:** Manages base-to-base shipments using database transaction control to ensure assets are never duplicated or lost in transit.
3. **Role-Based Security:** Restricts access dynamically:
   - **Admins:** Global visibility and control.
   - **Base Commanders:** Automatically scoped to view and manage assets only within their assigned base ID.
   - **Logistics Officers:** Access restricted to logging procurement purchases and conducting transfers.
4. **Immutable Audit Trail:** Automatically captures operations (purchases, transfers, assignments, expenditures) into a centralized, queryable logs database.

---

## Core Mathematical Models

The application aggregates stats dynamically from transactional tables using the following models:

$$\text{Closing Balance} = \text{Opening Balance} + \text{Net Movement} - \text{Assigned} - \text{Expended}$$
$$\text{Net Movement} = \text{Purchases} + \text{Transfers In} - \text{Transfers Out}$$

---

## System Architecture & Folder Structure

The project is structured as a monorepo split into modular backend and frontend components:

```plaintext
military-asset-management/
├── backend/
│   ├── config/
│   │   ├── db.js                 # PostgreSQL connection pool wrapper
│   │   ├── schema.sql            # Database schema & indexing definitions
│   │   └── seed.js               # Database initialization & seeding script
│   ├── controllers/
│   │   ├── authController.js     # JWT generation & password comparison
│   │   ├── assetController.js    # Dashboard metrics, assignments & expenditures
│   │   ├── purchaseController.js # Procurement handlers
│   │   └── transferController.js # Atomic transfer logic using transactions
│   ├── middlewares/
│   │   ├── authMiddleware.js     # JWT token validation
│   │   ├── rbacMiddleware.js     # Roles authorization & Base scoping
│   │   └── loggerMiddleware.js   # Interceptor for audit logs
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── assetRoutes.js
│   │   ├── purchaseRoutes.js
│   │   └── transferRoutes.js
│   ├── server.js                 # App initialization & middlewares mounting
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # User navigation & info header
│   │   │   ├── Sidebar.jsx       # RBAC-scoped menus
│   │   │   ├── StatCard.jsx      # Dashboard metrics widget
│   │   │   └── NetMoveModal.jsx  # Net movement breakdown modal
│   │   ├── pages/
│   │   │   ├── Login.jsx         # Authentication form screen
│   │   │   ├── Dashboard.jsx     # Visual inventory charts & registries
│   │   │   ├── Purchases.jsx     # Purchases intake interface
│   │   │   ├── Transfers.jsx     # Base-to-base transfer form
│   │   │   ├── Assignments.jsx   # Deployments & expenditures logger
│   │   │   └── AuditLogs.jsx     # Immutable audit logs listing
│   │   ├── services/
│   │   │   └── api.js            # Axios client with auth interceptor
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Global user state provider
│   │   └── App.jsx               # Protected routing system
│   └── tailwind.config.js
└── docker-compose.yml
```

---

## Database Entity Relations

- **Bases:** System bases (e.g., Fort Alpha, Fort Bravo).
- **Users:** System accounts with specific security roles.
- **EquipmentTypes:** Registry of cataloged equipment categories (WEAPON, VEHICLE, AMMUNITION).
- **Purchases:** Direct procurement adding inventory to a specific base.
- **Transfers:** Atomic base-to-base shipments.
- **Assignments:** Allocation of inventory to specific battlefield personnel.
- **Expenditures:** Depletion logs for items consumed (e.g., ammunition spent).
- **AuditLogs:** Operational logs indicating operator details and changes.

---

## API Documentation

### Authentication API
- `POST /api/auth/login` - Authenticates user credentials and generates a signed JWT.

### Metrics & Registry API
- `GET /api/assets/metrics` - Aggregates summary balance cards and assets closing balances (scoped by base ID for Base Commanders).
- `GET /api/assets/bases` - Returns bases catalog.
- `GET /api/assets/equipment-types` - Returns list of registered equipment items.
- `GET /api/assets/audit-logs` - Returns immutable audit logs list (Admin role required).

### Assignments & Expenditures API
- `GET /api/assets/assignments` - Lists active deployments.
- `POST /api/assets/assignments` - Deploys assets to personnel (Checks stock levels first).
- `GET /api/assets/expenditures` - Lists active expenditure logs.
- `POST /api/assets/expenditures` - Logs depleted items.

### Procurement & Transfers API
- `GET /api/purchases` - Retrieves logged purchases.
- `POST /api/purchases` - Registers new incoming procurement.
- `GET /api/transfers` - Lists transfer shipments.
- `POST /api/transfers` - Executes ACID-safe base-to-base inventory movement.

---

## RBAC Security Matrix

| Role | Dashboard | Purchases | Transfers | Assignments / Exp. | Audit Logs |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Admin** | Global Access | Read & Write | Read & Write | Read & Write | Read & Write |
| **Base Commander** | Local Base Scope | Denied | Denied | Read & Write (Base) | Denied |
| **Logistics Officer** | Global Access | Read & Write | Read & Write | Denied | Denied |

---

## Local Development Setup

### Prerequites
- Node.js (v18+)
- Docker Desktop

### 1. Database Setup
Spin up the local PostgreSQL database using docker-compose:
```bash
docker-compose up -d
```

### 2. Backend Installation & Seeding
Install dependencies, run the schema generator, and seed default test credentials:
```bash
cd backend
npm install
npm run seed
npm start
```
*The server will run on `http://localhost:5000`.*

### 3. Frontend Installation
In a separate terminal, install packages and start the Vite dev server:
```bash
cd frontend
npm install
npm run dev
```
*The app will run on `http://localhost:5173`.*

---

## Sample Test Credentials

To test the RBAC filters, log in using the following seeded accounts:

| Role | Username | Password | Scope / Base Assigned |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin_user` | `AdminPass123!` | Global Operations (All Bases) |
| **Base Commander** | `commander_alpha` | `CommandPass123!` | Scoped to Fort Alpha (Base #1) |
| **Logistics Officer** | `logistics_officer` | `LogisticsPass123!` | Fort Alpha / Global (Procurements & Transfers) |
