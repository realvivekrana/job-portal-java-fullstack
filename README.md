# Job Portal (Java Full Stack)

A full stack job portal where recruiters post jobs and candidates search and apply.

## Tech Stack
- **Backend:** Java 21, Spring Boot 3, Spring Security + JWT, Spring Data JPA (Hibernate), MySQL
- **Frontend:** React (Vite), Axios, React Router
- **Tools:** Maven, Swagger/OpenAPI, Git

## Features (in progress)
- Role-based login (Admin / Recruiter / Candidate)
- Job posting with search, filters and pagination
- Resume upload and application status tracking
- Email notifications

## Run Locally

### Backend
1. Copy `Backend/src/main/resources/application-dev.properties.example` to `application-dev.properties` and fill in your values
2. Run `JobPortalApplication` (VS Code / IntelliJ) or `mvn spring-boot:run`
3. Runs on `http://localhost:8080`

### Frontend
```bash
cd Frontend
npm install
npm run dev
```
Runs on `http://localhost:5173`

## Author
Vivek Kumar Rana