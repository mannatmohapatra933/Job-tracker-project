# 🚀 JobFlow AI — Intelligent Job Tracker

JobFlow AI is a high-performance, full-stack application designed to streamline and illuminate your career trajectory. Built with a premium glassmorphism interface and a robust Spring Boot backend, it provides data-driven precision for tracking job applications, managing interviews, and analyzing your career growth.

---

## 🔗 Live Deployment

| Service | URL |
| :--- | :--- |
| **🌐 Frontend (Live)** | [job-tracker-project-beryl.vercel.app](https://job-tracker-project-beryl.vercel.app/) |
| **⚙️ Backend API** | [job-tracker-project-2.onrender.com](https://job-tracker-project-2.onrender.com/) |
| **📊 Health Check** | [Verify Backend Status](https://job-tracker-project-2.onrender.com/) |

---

## ✨ Key Features

- **🔐 Secure Authentication**: JWT-based security with Email OTP verification for account activation.
- **📌 Precision Tracking**: Manage every stage of your job applications (Applied, Interview, Offer, Rejected).
- **📊 Advanced Analytics**: Real-time dashboards visualizing offer rates, status distributions, and company-wise metrics.
- **⭐ Smart Wishlist**: Keep track of high-priority roles with a single-click wishlist feature.
- **📝 Contextual Notes**: Add detailed notes for interviews, company research, and feedback.
- **🔍 Multi-Dimensional Filters**: Filter your career data by company, experience level, and location.
- **📱 Responsive & Premium UI**: A modern, glassmorphism-inspired interface optimized for all devices.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React.js (Hooks, Context API)
- **Styling**: Vanilla CSS (Modern Fluid Design, Glassmorphism)
- **Networking**: Axios & Native Fetch API
- **Icons**: Google Material Symbols

### Backend
- **Core**: Java 21 & Spring Boot 3.2.5
- **Security**: Spring Security + JSON Web Tokens (JWT)
- **Persistence**: Spring Data JPA & Hibernate
- **Communication**: Spring Mail (SMTP) for OTP Verification

### Infrastructure
- **Database**: PostgreSQL (Production) / H2 (Development)
- **Deployment**: Vercel (Frontend) / Render (Backend)
- **Containerization**: Docker

---

## ⚙️ Environment Configuration

### Backend (Render)
To deploy the backend successfully, set the following environment variables:
- `DATABASE_URL`: Your PostgreSQL connection string.
- `MAIL_USER`: SMTP Gmail address.
- `MAIL_PASSWORD`: Gmail App Password.
- `SPRING_PROFILES_ACTIVE`: Set to `prod` for production.
- `SERVER_PORT`: `8080`

### Frontend (Vercel)
- `REACT_APP_API_URL`: `https://job-tracker-project-2.onrender.com/api`

---

## 🚀 Local Development Setup

### 1. Backend
```bash
cd java-backend
mvn spring-boot:run
```
*Defaults to **H2 In-Memory Database** and **dev** profile for zero-config local setup.*

### 2. Frontend
```bash
cd react-app
npm install
npm start
```

---

## 👨‍💻 Author
**Mannat Mohapatra**

*Elevating career tracking with data-driven intelligence.*
