# 🏢 ONSSA Stock Management — Enterprise Inventory Platform

<div align="center">

[![Angular](https://img.shields.io/badge/Frontend-Angular%2017%2B-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.io/)
[![Spring Boot](https://img.shields.io/badge/Backend-Spring%20Boot%203-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![MySQL](https://img.shields.io/badge/Database-MySQL%208-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

<p align="center">
  <b>Full-stack inventory and asset tracking platform developed for ONSSA (National Food Safety Office).</b><br>
  Engineered as a clean monorepo featuring a high-performance Spring Boot REST API and a responsive Angular frontend.
</p>

</div>

---

## ✨ System Modules

- **📦 Inventory & Stock Control**: Track incoming shipments, warehouse allocations, lot numbers, and expiration dates.
- **🏷️ Product & Category Management**: Comprehensive taxonomy for sanitary products, lab supplies, and consumables.
- **📊 Real-time Stock Alerts**: Automated threshold notifications for low inventory and expiring items.
- **🛡️ Role-Based Access Control (RBAC)**: Secure access tailored for warehouse operators, inspectors, and department administrators.
- **📑 Audit Trails**: Full transaction history logging every entry, transfer, and consumption event.

---

## 📂 Monorepo Structure

```text
onssa-stock-management/
├── backend/            # Spring Boot 3 Java REST API
│   ├── src/main/java   # Controllers, Services, Repositories, Entities
│   └── pom.xml
└── frontend/           # Angular 17+ Single Page Application
    ├── src/app         # Components, Services, Guards, Models
    └── package.json
```

---

## 🚀 Setup Guide

### 1. Backend
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

### 2. Frontend
```bash
cd frontend
npm install
ng serve --open
```

---

## 👨‍💻 Author

**Omar Torbi** — Full-Stack Engineer & Software Architect
- 🌐 **Portfolio**: [omartorbi.engineer](https://www.omartorbi.engineer)
- 💼 **LinkedIn**: [linkedin.com/in/omar-torbi](https://www.linkedin.com/in/omar-torbi-b8340933a/)
- 🐙 **GitHub**: [@TORBIomar](https://github.com/TORBIomar)
- ✉️ **Email**: [torbi.dev@outlook.com](mailto:torbi.dev@outlook.com)
