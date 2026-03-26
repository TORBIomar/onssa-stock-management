# ONSSA Stock Management

Professional full-stack stock management platform for ONSSA, organized as a clean monorepo with:

- `backend`: Spring Boot API
- `frontend`: Angular application

## Project Structure

```text
ONSSA-Stock-Management/
├── backend/
└── frontend/
```

## Tech Stack

- Backend: Java 17, Spring Boot, Spring Security (JWT), JPA/Hibernate, MySQL
- Frontend: Angular, TypeScript, SCSS

## Prerequisites

- Java 17+
- Maven 3.8+
- Node.js 18+
- npm 9+
- MySQL 8+

## Quick Start

### 1) Clone the repository

```bash
git clone <your-repo-url>
cd ONSSA-Stock-Management
```

### 2) Backend setup

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

Backend runs on `http://localhost:8080`.

### 3) Frontend setup

```bash
cd frontend/gsrv-frontend
npm install
npm start
```

Frontend runs on `http://localhost:4200`.

## Environment Configuration

- Backend settings: `backend/src/main/resources/application.properties`
- Frontend settings: `frontend/gsrv-frontend/src/environments/environment.ts`

## GitHub-Ready Notes

- Repository is cleaned to keep only the application code and required configuration.
- Editor-specific and diagram-only files were removed from version control.

## License

MIT (or your preferred license).
