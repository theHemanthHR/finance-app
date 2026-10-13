# Finora — Architecture

Finora is a modular monolith: React (JavaScript) SPA + Spring Boot API + PostgreSQL.

The backend is the single source of truth for every financial calculation.

```mermaid
flowchart LR
  U[User Browser] -->|HTTPS + session cookie| SPA[React SPA]
  SPA -->|Axios + X-XSRF-TOKEN| API[Spring Boot API]
  API --> SEC[Spring Security]
  API --> SVC[Domain Services]
  SVC --> REPO[Spring Data JPA]
  REPO --> DB[(PostgreSQL)]
  SVC --> FX[ExchangeRateService]
  FX --> PROV[External FX Provider]
  SCHED[Scheduler] --> SVC
