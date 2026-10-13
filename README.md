# 💰 Finora - Personal Finance Manager

Finora is a comprehensive personal finance management application designed to help users track their spending, manage budgets, set savings goals, and handle recurring transactions across multiple currencies.

## 🚀 Features

- **Transaction Tracking**: Record and categorize income and expenses with multi-currency support.
- **Budget Management**: Set monthly budgets per category and track actual spending against limits.
- **Savings Goals**: Create specific savings targets and track contributions over time.
- **Recurring Transactions**: Automate the recording of regular payments or income (weekly, monthly, yearly).
- **Multi-Currency Support**: Real-time exchange rate integration to handle transactions in different currencies with a unified base currency view.
- **Financial Reports**: Gain insights through spending breakdowns, cash flow analysis, and budget vs. actual comparisons.
- **User Settings**: Personalized onboarding, timezone management, and base currency selection.

## 🛠️ Tech Stack

### Backend
- **Java 21 & Spring Boot 3**: Core application framework.
- **Spring Data JPA**: For database abstraction and ORM.
- **PostgreSQL**: Robust relational database for storing financial data.
- **Flyway**: Database migration tool for version-controlled schema changes.
- **Spring Security**: Authentication and authorization.
- **Maven**: Project build and dependency management.
- **Testcontainers**: Used for integration testing with real database instances.

### Frontend
- **React**: UI library for a dynamic user experience.
- **Vite**: Next-generation frontend tooling for fast development.
- **Tailwind CSS**: Utility-first CSS framework for modern, responsive styling.
- **Axios**: For handling API requests to the backend.
- **Zod**: Schema validation for forms and API responses.
- **React Context API**: For global state management (e.g., authentication).

### Infrastructure & Tools
- **Docker & Docker Compose**: Containerization for consistent deployment across environments.
- **Open Exchange Rates API**: Used for fetching real-time currency exchange rates.

## ⚙️ How It Works

### Architecture
Finora follows a classic **Client-Server Architecture**:
1. **Frontend**: A React-based Single Page Application (SPA) that interacts with the backend via a RESTful API.
2. **Backend**: A Spring Boot application that handles business logic, security, and data persistence.
3. **Database**: A PostgreSQL database that ensures data integrity and supports complex financial queries.

### Key Workflows
- **Currency Conversion**: When a transaction is entered in a non-base currency, the system fetches the exchange rate for that date and calculates the `amount_in_base` to ensure consistent reporting.
- **Recurring Engine**: A scheduler identifies recurring rules that are due and generates `recurring_occurrences`, which can then be converted into actual transactions.
- **Budgeting**: The system aggregates transactions for the current month by category and compares the sum against the user-defined budget limit.

## 🛠️ Getting Started

### Prerequisites
- Java 21
- Node.js (v18+)
- Docker

### Running the Project
1. **Start Infrastructure**:
   ```bash
   docker-compose up -d
   ```

2. **Run Backend**:
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```

3. **Run Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 📁 Project Structure
- `/backend`: Spring Boot source code, configurations, and database migrations.
- `/frontend`: React source code, components, and styling.
- `/docs`: Architecture documentation.
- `docker-compose.yml`: Infrastructure definition.
