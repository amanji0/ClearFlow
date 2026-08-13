# ClearFlow — Enterprise ERP & CRM Portal

> 🔗 **Live Frontend Application:** [https://clear-flow-omega.vercel.app](https://clear-flow-omega.vercel.app)  
> 📁 **GitHub Repository:** [https://github.com/amanji0/ClearFlow](https://github.com/amanji0/ClearFlow)

ClearFlow is a modern, industry-grade Enterprise Resource Planning (ERP) and Customer Relationship Management (CRM) portal designed specifically for wholesale and distribution operations.

It features a premium, Huggingface-inspired light theme with a functional minimalist design, custom micro-animations, and a responsive layout that works across devices.

## ⚡ Features

### Authentication & Access
- **Role-Based Access Control:** 4 distinct user roles (Admin, Sales, Warehouse, Accounts) with unique permissions and views.
- **Quick Login:** Fast account switching for demo purposes.
- **Create Account:** Full signup flow with validation.

### Dashboard & Analytics
- **Live Metrics:** Real-time animated counters for revenue, customers, and challans.
- **Intelligent Alerts:** Warnings for low stock or pending actions.
- **Reporting:** Revenue breakdowns, customer status distribution, top products ranking, and inventory valuation tables.

### Customer CRM
- **Full CRUD Operations:** Create, read, update, and delete customer profiles.
- **Advanced Filtering:** Filter by status (Active, Lead, Inactive) using quick-access pills.
- **Follow-up Management:** Integrated notes and timestamp tracking for customer interactions.

### Inventory & Products
- **Stock Management:** Add, edit, and track product inventory.
- **Movements Log:** Complete audit trail of IN/OUT stock movements.
- **Low Stock Alerts:** Automatic visual indicators when products dip below their minimum threshold.
- **Dynamic Categories:** Auto-generated category filters based on current product data.

### Sales Challans (Order Management)
- **Draft & Confirm Workflow:** Create draft orders, review, and confirm.
- **Automatic Deduction:** Stock is automatically deducted from inventory upon challan confirmation.
- **Status Tracking:** Filter orders by Draft, Confirmed, or Cancelled.

## 🛠️ Tech Stack

- **Framework:** React + Vite
- **Styling:** Custom CSS (1,600+ lines) with CSS Custom Properties and animations
- **Icons:** `lucide-react` (sketch-like, stroke-based SVGs)
- **Data Persistence:** LocalStorage (falls back to default demo data)

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/amanji0/ClearFlow.git
   cd ClearFlow
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Navigate to `http://localhost:3000` (or the port provided by Vite).

## 🌐 Live URLs & Deployment

- **Live Frontend App:** [https://clear-flow-omega.vercel.app](https://clear-flow-omega.vercel.app)
- **GitHub Repository:** [https://github.com/amanji0/ClearFlow](https://github.com/amanji0/ClearFlow)

## 🔑 Demo Credentials

You can use the Quick Access buttons on the login page, or sign in manually with these accounts:

| Username | Password | Role | Access Level |
|----------|----------|------|--------------|
| `admin` | `admin123` | Admin | Full Access |
| `sales` | `sales123` | Sales | Customers, Products, Challans |
| `warehouse` | `wh123` | Warehouse | Products (Read-Only), Inventory Management |
| `accounts` | `acc123` | Accounts | Reports, Read-Only CRM |

## 🏗️ Architecture Summary

ClearFlow is built using a modern 3-tier architecture:
1. **Frontend:** React SPA built with Vite, styled with custom Huggingface-inspired light CSS design tokens, responsive layouts, and stroke SVG icons (`lucide-react`). Features dual-mode persistence (REST API sync with LocalStorage offline fallback).
2. **Backend API:** Node.js & Express RESTful API (`backend/server.js`) with input validation via Zod middleware, structured HTTP error codes, pagination, and search filtering.
3. **Database:** PostgreSQL managed via Prisma ORM for relational data storage (Users, Customers, Products, Challans, StockLogs).

## 🔌 API Endpoints Reference

- `POST /api/auth/login` — Authenticate user credentials
- `GET /api/customers` — List customers (supports `?search=`, `?status=`, `?page=`, `?limit=`)
- `POST /api/customers` — Create customer profile
- `PUT /api/customers/:id` — Update customer details
- `DELETE /api/customers/:id` — Delete customer profile
- `GET /api/products` — List inventory products (supports `?search=`, `?category=`)
- `POST /api/products` — Add new product SKU
- `GET /api/challans` — List sales challans
- `POST /api/challans` — Create sales order & deduct stock
- `GET /api/stocklogs` — Audit log of inventory movements

## 🎨 Design Philosophy
The UI was built to stand out from typical, overly-complex ERP systems. It utilizes a soft, airy color palette (accented with warm orange and yellow), smooth transitions, glassmorphic elements, and extensive micro-interactions to create an engaging user experience.