# Worksphere - Internal HRMS & Employee Portal

**Status:** Work in Progress

Worksphere is a full-stack internal HR management and employee self-service platform designed to streamline various company processes. This monorepo contains the backend API built with Node.js, Express, and MongoDB, and the frontend client application built with React.

## Table of Contents

- [Key Features](#key-features)
  - [Backend (Implemented/Designed)](#backend-implementeddesigned)
  - [Frontend (Implemented/Designed)](#frontend-implementeddesigned)
- [Upcoming Features / Roadmap](#upcoming-features--roadmap)
  - [Backend Next Steps](#backend-next-steps)
  - [Frontend Next Steps](#frontend-next-steps)
  - [Deferred Features](#deferred-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)

## Key Features

### Backend (Implemented/Designed)

* **Authentication & Authorization:**
    * Secure user registration (Signup)
    * Login with JWT (stored in HttpOnly cookies)
    * OTP-based Email Verification flow
    * Forgot Password & Reset Password functionality (token-based email flow)
    * Change Password for logged-in users
    * Logout
    * Authentication middleware (`authN`)
    * Centralized Role-Based Access Control (RBAC) using Permissions defined in `config/permissions.js` and `authorization` middleware (`checkPermission`, `checkRole`).
* **Employee Management:**
    * Detailed `Employee` model (Mongoose schema) storing profile info, contact details, address, role, manager, department, projects, clients etc.
    * Basic backend setup for Employee CRUD (implied by `auth` and other modules).
* **Department Management:**
    * `Department` model (Mongoose schema).
    * Full CRUD API for managing departments (Admin/HR).
    * Logic to update Employee records when assigned/removed from departments.
* **Client Management:**
    * `Client` model (Mongoose schema) with contact info, location, status, links to projects/teams/departments.
    * Full CRUD API for managing clients.
    * Geocoding integration (OpenCage API) to find Lat/Lng for client locations *(Note: Trigger needs refinement)*.
* **Calendar / Holiday Management:**
    * `CountryCalendar` model storing holidays and weekend definitions per country.
    * API to fetch holidays from external source (Calendarific API) and create/update country calendars.
    * API for manual holiday addition/deletion.
    * API to fetch calendar data for frontend display.
* **Leave Management:**
    * `LeaveRequest` and `LeaveBalance` models.
    * API for employees to apply for leave (validating against non-working days, overlaps, and balances).
    * API for managers/HR to approve/reject leave requests (updating status and balances).
    * API for employees to cancel pending/approved requests (refunding balance).
    * API to fetch leave history and balances (role-based visibility).
* **Performance Management (Backend Foundation):**
    * `ReviewCycle` model (using Q1-Q4 naming, year, dates, status).
    * API for HR/Admin to manage (CRUD) review cycles.
    * API endpoint (`/activate`) to start a cycle and automatically create initial `PerformanceReview` documents for eligible employees.
    * `PerformanceReview` model (simplified V3) storing self-assessment, manager input, optional head/client ratings & comments. Includes soft delete (`isDeleted`).
    * API endpoints for retrieving reviews (own, team, all, by ID) with authorization.
    * API endpoint for updating specific parts of a review based on user role/permissions.
    * API endpoint for reopening completed reviews (Admin/HR/Manager).
* **Task Management:**
    * `Task` model (with title, assignee, deadline, completion status, priority, reopened status, etc.).
    * Full CRUD API for managing tasks.
    * API for fetching tasks for the user dashboard (categorized by upcoming/overdue).
    * API for reopening completed tasks.
    * Authorization checks based on roles and permissions.
* **Email Integration:**
    * Nodemailer setup using Mailtrap for testing/development.
    * `sendMail` utility.
    * HTML email templates (`OTP`, `Password Reset`, `Welcome`). CID embedding configured for logo (using Mailtrap Assets URL).

### Frontend (Implemented/Designed)

* Company Holiday Calendar Admin page (`CompanyHolidayCalendar.jsx`).
* User Leave Dashboard page (`UserLeavePage.jsx`) showing balances, history, and an interactive calendar for applying.

## Upcoming Features / Roadmap

### Backend Next Steps

* **Bonus System:** Design & Implement Model, Controllers, Routes, Permissions.
* **Performance Notifications/Jobs:** Integrate email sending for cycle activation/reminders; setup scheduler (`node-cron`?) for deadline checks.
* **Dashboard Data Endpoints:** Create aggregated API endpoints for role-based dashboards.
* **Announcement Module:** Backend API for managing and fetching announcements.
* **Attendance/Time Tracking:** Backend Models/API.
* **Onboarding/Offboarding:** Backend Models/API.
* **Reporting:** Backend endpoints for specific reports.
* **Refinements:** Fix Geocoding trigger, review deletion cleanup logic.

### Frontend Next Steps

* Role-based Dashboards (Employee, Manager, Admin, HR).
* Performance Management UI (Cycle Admin, Review Forms, View History).
* Task Management UI (View tasks, Mark complete).
* Authentication Pages (Login, Signup, Verify OTP, Forgot/Reset Pass, Change Pass).
* Employee Profile View/Edit Pages.
* Company Directory / Org Chart UI.
* Bonus System UI.
* (And UIs for other backend modules as they are built).

### Deferred Features

* Goals Module
* AI Chatbot / HR Assistant
* Google OAuth Login

## Tech Stack

* **Backend:** Node.js, Express.js, MongoDB, Mongoose
* **Frontend:** React (Vite or Create React App?)
* **Authentication:** JWT (JSON Web Tokens), bcrypt
* **Email:** Nodemailer, Mailtrap (for testing)
* **API Testing:** Postman (presumably)
* **External APIs:** OpenCage Geocoding API, Calendarific API

## Project Structure

worksphere/
├── client/              # React Frontend Application
│   ├── public/
│   ├── src/
│   ├── .env.local       # Frontend Environment Variables (optional)
│   ├── .gitignore       # Frontend Specific Ignores
│   └── package.json
├── server/              # Node.js Backend Application
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── mailTemplates/
│   ├── public/          # Static assets (like logo) served by backend
│   ├── .env             # Backend Environment Variables
│   ├── .env.sample      # Example Backend Env Variables
│   ├── .gitignore       # Backend Specific Ignores
│   └── package.json
├── .gitignore           # Root Ignores (IDE files, OS files)
└── README.md            # This file


## Getting Started

### Prerequisites

* Node.js (specify version, e.g., v18.x or later)
* npm or yarn
* MongoDB instance (local or cloud like MongoDB Atlas)
* Git

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <YOUR_NEW_GITHUB_REPO_URL> worksphere
    cd worksphere
    ```
2.  **Install Backend Dependencies:**
    ```bash
    cd server
    npm install
    # or yarn install
    cd ..
    ```
3.  **Install Frontend Dependencies:**
    ```bash
    cd client
    npm install
    # or yarn install
    cd ..
    ```

## Environment Variables

This project requires environment variables for configuration.

1.  **Backend:**
    * Navigate to the `server` directory.
    * Create a `.env` file by copying `.env.sample`: `cp .env.sample .env`
    * Fill in the necessary values in the `.env` file:
        * `MONGODB_URL`: Your MongoDB connection string.
        * `PORT`: The port number for the backend server (e.g., 4000).
        * `JWT_SECRET`: A strong, random secret key for signing JWTs.
        * `JWT_EXPIRE`: JWT expiry time (e.g., `1d`, `2h`).
        * `FRONTEND_URL`: The base URL of your running frontend application (e.g., `http://localhost:5173`) - used in email links.
        * `BASE_URL`: The base URL where the backend server is accessible (e.g., `http://localhost:4000`) - used for logo URL in emails if self-hosted.
        * `OPENCAGE_API_KEY`: Your API key from OpenCage Geocoding.
        * `CALENDARIFIC_API_KEY`: Your API key from Calendarific.
        * `MAILTRAP_HOST`: Mailtrap SMTP host.
        * `MAILTRAP_PORT`: Mailtrap SMTP port (e.g., 2525).
        * `MAILTRAP_USERNAME`: Mailtrap username.
        * `MAILTRAP_PASSWORD`: Mailtrap password.
        * `MAILTRAP_SENDEREMAIL`: The 'From' email address to use via Mailtrap.
        * `MAILTRAP_LOGO_URL`: The public URL for the logo hosted on Mailtrap Assets (if using that method).

2.  **Frontend:**
    * Navigate to the `client` directory.
    * Create a `.env` or `.env.local` file if needed (depending on your React setup - Vite uses `.env`, CRA uses `.env.local`).
    * Add any frontend-specific environment variables, typically prefixed (e.g., `VITE_API_BASE_URL=http://localhost:4000/api` or `REACT_APP_API_BASE_URL=http://localhost:4000/api`). Consult your frontend framework's documentation.

**IMPORTANT:** Never commit your actual `.env` files containing secrets to Git. Ensure they are listed in the relevant `.gitignore` files.

## Running the Application

1.  **Run the Backend Server:**
    ```bash
    cd server
    npm run dev # Or your script for starting in development mode (e.g., using nodemon)
    # Or npm start for production builds
    ```
    The backend should typically run on the port specified in `server/.env` (e.g., 4000).

2.  **Run the Frontend Application:**
    * Open a *new* terminal window.
    ```bash
    cd client
    npm run dev # Or your script for starting the React dev server
    # Or npm start
    ```
    The frontend should typically run on a different port (e.g., 5173 or as specified by Vite/CRA). Access it via your browser at `http://localhost:5173` (or the relevant port).



