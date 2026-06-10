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
- **📊 Advanced Analytics (Insights)**: Real-time dashboards with normalized experience-level grouping, offer rates, status distributions, and company-wise metrics. No duplicate entries.
- **⭐ Smart Wishlist**: Save high-priority roles and directly **Apply** from the wishlist using saved application links — no need to search again.
- **📝 Contextual Notes**: Add detailed notes for interviews, company research, and feedback.
- **🔍 Multi-Dimensional Filters**: Filter your career data by company, experience level, and location.
- **🤖 AI Resume Matcher (Live Search)**: Drop your resume → Gemini AI searches the internet for real, currently active job openings and returns **direct job posting URLs** (LinkedIn, Naukri, Internshala, Greenhouse, Lever, etc.) so you can apply instantly.
- **📱 Responsive Mobile UI**: Full mobile bottom navigation including Insights and Feedback sections, with horizontal scroll support for all nav items.

---

## 🆕 Recent Updates

### v1.3 — June 2026
- **Insights Fix**: Experience level entries from backend are now normalized and merged (e.g., "Fresher", "0-1 Year", "Fresher with 0-1 year of experience" all map to a single "Fresher (0-2 years)" entry — no more duplicates in the chart).
- **Wishlist Apply Button**: Each wishlist card now shows a purple **"Apply Now"** button alongside "Remove". Clicking it opens the direct job application link saved at the time of adding the job.
- **Mobile Nav — Insights & Feedback**: Added Insights and Feedback pages to the mobile bottom navigation bar. The bar now supports horizontal scrolling to accommodate all nav items.
- **AI Match — Direct URL Enforcement**: Improved Gemini prompt to strictly return direct job posting URLs (specific listing pages) instead of generic company homepages or career page roots.

---

## 📂 Directory Structure

```text
Job-tracker-project/
├── java-backend/         # Spring Boot API Backend
│   ├── src/main/java     # Java source files (Auth, Jobs, Notes, AI, Config)
│   ├── src/main/resources# App properties & templates
│   ├── pom.xml           # Maven Dependencies (PostgreSQL, H2, JWT, Mail)
│   └── Dockerfile        # Container configuration for backend
├── react-app/            # Modern React Frontend UI
│   ├── src/              # React views (Analytics, AI Match, Auth, Notes, Wishlist, Feedback)
│   ├── package.json      # Frontend package configuration (PDF.js, Axios, React 19)
│   └── vercel.json       # Vercel deployment configuration
└── html-css-js/          # Quick prototype/mockup files (legacy/reference)
```

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React.js (Hooks, Context API, React Router v7)
- **Styling**: Vanilla CSS (Modern Fluid Design, Glassmorphic Glassmorphism)
- **Networking**: Axios & Native Fetch API
- **Document Processing**: PDF.js (for extracting resume text dynamically in-browser)
- **Icons**: Google Material Symbols

### Backend
- **Core**: Java 21 & Spring Boot 3.2.5
- **Security**: Spring Security + JSON Web Tokens (JWT)
- **Persistence**: Spring Data JPA & Hibernate
- **Communication**: Spring Mail (SMTP) for OTP Verification
- **AI Engine**: Gemini 2.5 Flash via REST endpoints

### Infrastructure
- **Database**: PostgreSQL (Production) / H2 In-Memory (Development)
- **Deployment**: Vercel (Frontend) / Render or Supabase (Backend/Database)
- **Containerization**: Docker

---

## ⚙️ Environment Configuration

### Backend (Spring Boot)
To run or deploy the backend, set the following environment variables:

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `SPRING_DATASOURCE_URL` | PostgreSQL Connection string | `jdbc:postgresql://<host>:<port>/<db>` |
| `SPRING_DATASOURCE_USERNAME` | Database username | `postgres` |
| `SPRING_DATASOURCE_PASSWORD` | Database password | `yourpassword` |
| `MAIL_USER` | SMTP Gmail address | `example@gmail.com` |
| `MAIL_PASSWORD` | Gmail App Password | `xxxx xxxx xxxx xxxx` |
| `GEMINI_API_KEY` | Google Gemini API Key | `AIzaSy...` |
| `PORT` | Web server port | `8080` |

### Frontend (React)
Create a `.env` file inside the `react-app` directory:
```env
REACT_APP_API_URL=http://localhost:8080
```

---

## 🔄 Database Migration: Render to Supabase

Render database free-tier expires periodically. If you want to migrate existing data from Render Postgres to Supabase Postgres, follow these steps:

### 1. Export Data from Render DB
Run the `pg_dump` command to export both schema and data:
```bash
pg_dump -h <RENDER_HOST> -U <RENDER_USER> -d <RENDER_DB_NAME> -F p -f render_backup.sql
```
*(Find these credentials in your Render DB Dashboard under "External Connection String".)*

### 2. Import Data to Supabase DB
Run the `psql` tool to import the backup directly to Supabase:
```bash
psql -h <SUPABASE_HOST> -U postgres -d postgres -f render_backup.sql
```
*(Supabase's default database name is `postgres`, and the default user is `postgres`. Find the host credentials under **Settings > Database** in the Supabase Dashboard.)*

---

## 🚀 Local Development Setup

### 1. Run Backend
If no database credentials are provided, Spring Boot defaults to the **H2 In-Memory Database** for zero-config startup:
```bash
cd java-backend
mvn spring-boot:run
```

### 2. Run Frontend
Install dependencies and boot up the development server:
```bash
cd react-app
npm install
npm start
```
The application will launch on `http://localhost:3000`.

---

## 🐳 Docker Deployment

### Run Backend using Docker
1. Build the docker image:
   ```bash
   cd java-backend
   docker build -t jobflow-backend .
   ```
2. Run the container:
   ```bash
   docker run -d -p 8080:8080 \
     -e SPRING_DATASOURCE_URL=jdbc:postgresql://<host>:5432/<db> \
     -e SPRING_DATASOURCE_USERNAME=postgres \
     -e SPRING_DATASOURCE_PASSWORD=your_password \
     -e MAIL_USER=your_email@gmail.com \
     -e MAIL_PASSWORD=your_gmail_app_password \
     -e GEMINI_API_KEY=your_gemini_api_key \
     jobflow-backend
   ```

---

## 📋 API Endpoint Reference

### Authentication (`/auth`)
* `POST /auth/register` — Register a new account (sends verification OTP).
* `POST /auth/verify-otp` — Verify OTP (returns JWT Bearer token).
* `POST /auth/resend-otp` — Resend verification OTP to email.
* `POST /auth/login` — Login with credentials (returns JWT token).
* `POST /auth/forgot-password` — Request password reset OTP.
* `POST /auth/reset-password` — Reset password using OTP.
* `GET /auth/me` — Retrieve active user details (requires JWT).

### Job Applications (`/api/jobs`)
* `GET /api/jobs` — Get user job applications (supports query parameters `company`, `experienceLevel`, `location`).
* `POST /api/jobs` — Add a new job application.
* `PUT /api/jobs/{id}` — Update job status/metadata.
* `DELETE /api/jobs/{id}` — Delete a job application.
* `GET /api/jobs/wishlist` — View all wishlisted jobs.
* `PUT /api/jobs/{id}/wishlist` — Toggle wishlist status.

### Analytics (`/api/jobs/analytics`)
* `GET /api/jobs/analytics/summary` — Key performance indicator stats (offers, interviews, rates).
* `GET /api/jobs/analytics/by-status` — Count of applications grouped by stage.
* `GET /api/jobs/analytics/by-company` — Grouped application counts by company.
* `GET /api/jobs/analytics/by-experience` — Grouped counts by experience level (normalized).

### AI Integration (`/api/ai`)
* `POST /api/ai/match` — Match resume with jobs or search live internet for active job postings using Gemini 2.5 Flash. Returns direct job application URLs.

---

## 👨‍💻 Author
**Mannat Mohapatra**

*Elevating career tracking with data-driven intelligence.*
