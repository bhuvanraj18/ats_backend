# ATS Backend – Job Application Tracking System

This repository contains a complete backend implementation of a Job Application Tracking System (ATS).  
The system supports role-based access control, application workflow management, and full audit logging.

---

## Features

Authentication and Authorization:
- JWT-based authentication
- Role-Based Access Control (RBAC)
- Roles supported: CANDIDATE, RECRUITER

Multi-Tenant Design:
- Companies own jobs
- Recruiters are associated with companies
- Jobs belong to a single company

Job Management:
- Recruiters can create, update, and delete jobs
- Jobs have statuses such as OPEN and CLOSED

Application Workflow:
- Candidates can apply for jobs
- Application stages follow a strict workflow:
  APPLIED → SCREENING → INTERVIEW → OFFER → HIRED
  Rejection is allowed from any stage
- Invalid stage transitions are blocked

Audit Trail:
- Every application stage change is recorded
- ApplicationHistory stores:
  - fromStage
  - toStage
  - changedBy
  - timestamp
- Database transactions ensure consistency

Architecture:
- Layered architecture (routes, controllers, middleware)
- Prisma ORM with PostgreSQL
- Clean error handling and validation

---

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- JWT
- bcrypt

---

## Project Structure

ats_backend/
- prisma/
- src/
  - controllers/
  - routes/
  - middlewares/
  - config/
  - index.js
- package.json
- README.md

---

## Setup Instructions

1. Clone repository  
git clone https://github.com/bhuvanraj18/ats_backend.git  
cd ats_backend  

2. Install dependencies  
npm install  

3. Create .env file  
DATABASE_URL=postgresql://username:password@localhost:5432/ats_db  
JWT_SECRET=your_secret_key  
PORT=3000  

4. Run database migrations  
npx prisma migrate dev  

5. Start server  
npm run dev  

Server runs on http://localhost:3000

---

## API Verification Steps

Register Candidate  
POST /auth/register  
{
  "name": "Candidate One",
  "email": "candidate@test.com",
  "password": "password123",
  "role": "CANDIDATE"
}

Register Recruiter  
POST /auth/register  
{
  "name": "Recruiter One",
  "email": "recruiter@test.com",
  "password": "password123",
  "role": "RECRUITER",
  "companyId": 1
}

Login  
POST /auth/login  

Create Job (Recruiter)  
POST /jobs  
Authorization: Bearer <recruiter_token>  
{
  "title": "Backend Developer",
  "description": "Node + Prisma ATS",
  "status": "OPEN"
}

Apply for Job (Candidate)  
POST /applications  
Authorization: Bearer <candidate_token>  
{
  "jobId": 1
}

Update Application Stage (Recruiter)  
PATCH /applications/1/stage  
Authorization: Bearer <recruiter_token>  
{
  "stage": "SCREENING"
}

---

## Database Verification

Check application history  
SELECT * FROM "ApplicationHistory";

Expected entries:
- NULL → APPLIED
- APPLIED → SCREENING

---

## Submission Status

- Authentication implemented
- RBAC enforced
- Workflow state machine implemented
- Audit trail verified
- Backend tested and stable

This project is complete and submission-ready.

---

Author  
Bhuvan Raj Patnaik  
GitHub: https://github.com/bhuvanraj18
