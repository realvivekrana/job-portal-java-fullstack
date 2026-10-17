# Job Portal (Java Full Stack)

A full stack job portal where recruiters post jobs and candidates search and apply.

## Tech Stack
- **Backend:** Java 21, Spring Boot 3, Spring Security + JWT, Spring Data JPA (Hibernate), MySQL
- **Frontend:** React (Vite), Axios, React Router
- **Tools:** Maven, Swagger/OpenAPI, Docker, Git

## Features
- Role-based login (Admin / Recruiter / Candidate) with JWT
- Recruiter: company profile + logo, post / edit / close jobs, view applicants, shortlist / reject / hire
- Candidate: profile, resume upload, apply with cover letter, track status, withdraw
- Job search with keyword, location, type, salary and experience filters, sorting and pagination
- Admin: platform stats, user list with enable / disable, job moderation (close, reopen, delete)
- Email notifications (application received, new applicant, status changes)
- Private resume downloads (only the candidate, the job's recruiter or an admin)

## Run Locally

### Backend
1. Copy `Backend/src/main/resources/application-dev.properties.example` to `application-dev.properties` and fill in your values
   (MySQL, `app.jwt.secret`, first admin email and password, optional Gmail SMTP for emails).
   This file is gitignored. **Never put secrets in `application.properties`.**
2. Generate a JWT secret: `openssl rand -base64 48`
3. Run `JobPortalApplication` (VS Code / IntelliJ) or `mvn spring-boot:run`
4. Runs on `http://localhost:8080`, Swagger UI at `http://localhost:8080/swagger-ui.html`
5. Tests: `mvn test`

In production (or Docker) use environment variables instead:
`JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`,
`SPRING_DATASOURCE_PASSWORD`, `CORS_ALLOWED_ORIGINS`, `MAIL_FROM`.

### Frontend
```bash
cd Frontend
cp .env.example .env     # set VITE_API_URL if the backend is not on http://localhost:8080
npm install
npm run dev
```
Runs on `http://localhost:5173`. Production build: `npm run build` (output in `Frontend/dist`).
For a deployed frontend, add its URL to `CORS_ALLOWED_ORIGINS` on the backend.

**Pages**
- Public: Home, job search with filters / sorting / pagination, job details, login, register
- Candidate: dashboard, profile + resume upload, apply with cover letter, my applications (withdraw)
- Recruiter: dashboard, company profile + logo, post / edit / close jobs, applicants (filter, shortlist, hire, reject, view resume)
- Admin: dashboard stats, users (enable / disable), jobs (close, reopen, delete)

## API Overview
All responses use `{ "success": true|false, "message": "...", "data": ... }`.
Send `Authorization: Bearer <token>` for protected endpoints.

| Area | Endpoints |
|------|-----------|
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/users/me` |
| Jobs (public) | `GET /api/jobs` (filters: keyword, location, jobType, minSalary, maxExperience, page, size, sortBy, sortDir), `GET /api/jobs/{id}` |
| Jobs (recruiter) | `POST /api/jobs`, `PUT /api/jobs/{id}`, `PATCH /api/jobs/{id}/status?active=`, `GET /api/jobs/my` |
| Company | `POST /api/companies`, `GET/PUT /api/companies/me`, `POST /api/companies/me/logo`, `GET /api/companies/{id}` |
| Candidate profile | `GET/PUT /api/profile/me`, `POST/DELETE /api/profile/me/resume` |
| Applications (candidate) | `POST /api/applications/job/{jobId}` (multipart: `coverLetter`, `resume`), `GET /api/applications/my`, `GET /api/applications/my/stats`, `DELETE /api/applications/{id}` |
| Applications (recruiter) | `GET /api/applications/job/{jobId}?status=`, `PATCH /api/applications/{id}/status`, `GET /api/applications/recruiter/stats` |
| Applications (shared) | `GET /api/applications/{id}` |
| Files | `GET /api/files/logos/{name}` (public), `GET /api/files/resumes/{name}` (login + access check) |
| Admin | `GET /api/admin/stats`, `GET /api/admin/users`, `PATCH /api/admin/users/{id}/status?active=`, `GET /api/admin/jobs`, `PATCH /api/admin/jobs/{id}/status?active=`, `DELETE /api/admin/jobs/{id}` |

Application status flow: `APPLIED` → `SHORTLISTED` or `REJECTED`; `SHORTLISTED` → `HIRED` or `REJECTED`.

## Author
Vivek Kumar Rana