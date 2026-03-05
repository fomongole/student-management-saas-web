<div align="center">
  <img src="https://via.placeholder.com/150x150/4f46e5/ffffff?text=E" alt="Elimu Logo" width="100" height="100" />

  <br />
  <br />

  # 🎓 Elimu Management System (Frontend)
  
  **A highly scalable, multi-tenant School Management SaaS built specifically for the Ugandan Education System.**

  <p align="center">
    <a href="https://reactjs.org/"><img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" /></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
    <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" /></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" /></a>
    <a href="https://tanstack.com/query/latest"><img src="https://img.shields.io/badge/React_Query-FF4154?style=for-the-badge&logo=react-query&logoColor=white" alt="React Query" /></a>
  </p>

  <p align="center">
    <a href="#about-the-project">About</a> •
    <a href="#key-features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#getting-started">Getting Started</a>
  </p>
</div>

---

## 📖 About the Project

**Elimu** is a cloud-based, multi-tenant SaaS application designed to digitize and streamline school operations. Built with a deep understanding of the **Ugandan Education System** (Nursery, P1-P7, O-Level, A-Level Sciences/Arts), it natively supports complex class streaming, UNEB grading structures, automated report card generation, and secure financial ledgers.

This repository contains the **Frontend Client Application**, which connects to a high-performance Python/FastAPI backend.

---

## ✨ Key Features

The UI dynamically adapts based on strict **Role-Based Access Control (RBAC)**:

### 👑 Super Admin (Platform Owner)
* **SaaS Dashboard:** Global metrics tracking active schools, total users, and platform health.
* **Tenant Onboarding:** Register new schools and explicitly lock their licensed academic levels.
* **Access Management:** Assign and revoke Headteacher (School Admin) accounts.

### 🏫 School Admin (Headteacher/Bursar)
* **Executive Dashboard:** Real-time financial KPIs (Expected Revenue, Collected, Outstanding) and attendance trends.
* **Ugandan Academic Setup:** Create classes with distinct base names (e.g., P1) and unlimited streams (e.g., P1 East, P1 West). Native support for A-Level Sciences vs. Arts.
* **Financial Ledger:** Record payments, guard against double-receipt entries, and automatically prevent overpayments.
* **Data Export:** One-click PDF receipt generation and CSV exports for fee defaulters.

### 👨‍🏫 Teacher
* **Daily Roll Call:** Intuitive, date-filtered attendance marking.
* **Mark Sheets:** Fast, spreadsheet-style data entry for exam scores and comments.

### 👨‍👩‍👧‍👦 Parent & Student Portals
* **Unified Parent Portal:** Parents log in once to view academic and financial data for *all* their linked children.
* **Student Dashboard:** Students can view their term-by-term UNEB-formatted report cards (grouped by exam session) and download official PDF copies.

---

## 🛠 Tech Stack

This project is built using modern frontend engineering standards:

| Tool / Library | Purpose |
| :--- | :--- |
| **[React 18](https://react.dev/)** | Core UI library |
| **[TypeScript](https://www.typescriptlang.org/)** | Static typing for bulletproof code |
| **[Vite](https://vitejs.dev/)** | Lightning-fast build tool and development server |
| **[Tailwind CSS](https://tailwindcss.com/)** | Utility-first CSS framework for beautiful, responsive design |
| **[React Query](https://tanstack.com/query)** | Server state management, caching, and background data synchronization |
| **[React Hook Form](https://react-hook-form.com/)** | Performant, flexible, and extensible forms |
| **[Zod](https://zod.dev/)** | TypeScript-first schema validation |
| **[jsPDF](https://github.com/parallax/jsPDF) & [AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable)** | Client-side PDF generation for report cards and receipts |
| **[Recharts](https://recharts.org/)** | Composable charting library for financial and attendance dashboards |

---

## 📁 Project Structure

A quick glance at the scalable folder structure:

```text
src/
├── assets/         # Static images, fonts, etc.
├── components/     # Reusable UI components (Modals, Tables, Skeletons, Dropdowns)
├── hooks/          # React Query hooks (useSchools, useStudents, useFees, etc.)
├── layouts/        # Page layouts (DashboardLayout with Sidebar/Header)
├── pages/          # Route-based views grouped by User Role
│   ├── auth/
│   ├── parent/
│   ├── school-admin/
│   ├── student/
│   ├── super-admin/
│   └── teacher/
├── schemas/        # Zod validation schemas
├── services/       # Axios API configurations and PDF generators
├── store/          # Zustand global state (Auth state)
└── types/          # TypeScript interfaces for API payloads
```