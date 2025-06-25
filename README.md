Worksphere - Internal HRMS & Employee Portal
Status: Active Development

Worksphere is a full-stack internal HR management and employee self-service platform designed to streamline various company processes. This monorepo contains the backend API built with Node.js, Express, and MongoDB, and the frontend client application built with React.

Table of Contents
Key Features

Backend (Implemented)

Frontend (Implemented)

Upcoming Features / Roadmap

Backend Next Steps

Frontend Next Steps

Deferred Features

Tech Stack

Project Structure

Getting Started

Prerequisites

Installation

Environment Variables

Running the Application

API Endpoints

Key Features
Backend (Implemented)
Authentication & Authorization:

Multiple authentication methods: Email/Password with JWT, Google OAuth 2.0, and OTP-based Email Verification.

Role-based and permission-based authorization.

Secure session management with token refresh.

Employee & Department Management:

Full CRUD APIs for managing detailed employee profiles and departments.

Manager-subordinate relationship and department head assignments.

Client & Project Management:

Full CRUD APIs for managing clients and projects.

Geocoding integration for client locations.

Tracking of project status, budget, and team assignments.

Task Management:

Comprehensive Task model with full CRUD API.

Features include task assignment, status updates, dependencies, and comments.

Leave Management:

LeaveRequest and LeaveBalance models with a full approval workflow.

Integration with a country-specific holiday calendar.

Financial Transaction Management:

Refactored, scalable controllers for Expenses, Revenues, and Reporting.

Full CRUD operations for expense and revenue records.

Intelligent logic to allocate project-based costs to either internal projects or clients.

Automatic-tagging for easy filtering.

Soft-delete functionality for financial records to maintain audit trails.

Attendance System:

Attendance model to track daily records.

Controllers for employee check-in and check-out with robust business logic (e.g., late check-in, early checkout, half-days).

A complete approval workflow for attendance shortfalls and correction requests.

Role-based permissions for all attendance-related actions.

Timesheet Management:

TimeLog model tightly integrated with Attendance, Projects, and Tasks.

Weekly timesheet submission workflow.

Backend validation to ensure logged hours match required work hours (accounting for holidays, leaves, and half-days).

Manager approval workflow for submitted timesheets.

Bonus System:

Flexible two-model system (BonusType and BonusAward) to define and grant various types of bonuses (monetary, non-monetary, leave credits).

Complete bonus lifecycle management: awarding, manager approval/rejection, and payment tracking.

Seamless integration with the transaction module to automatically create an Expense record when a bonus is paid out.

Performance Management:

Complete performance review system with review cycles and employee performance tracking.

Review cycle management with start/end dates and status tracking.

Employee performance review workflow: initiation, self-assessment, manager review, and completion.

Role-based access control for different review stages (admin, manager, employee).

Comprehensive API endpoints for creating, updating, and retrieving performance reviews.

Goal Management:

Goal setting and tracking system with progress monitoring.

Goal categories, priorities, and status management.

Comment system for goal discussions and updates.

Circular progress indicators and visual goal tracking.

Team Management:

Team creation and member management with role assignments.

Project-team integration for resource allocation.

Team performance tracking and member management.

Review Cycle Management:

Administrative control over performance review cycles.

Cycle creation, status management, and employee assignment.

Integration with performance review workflow.

Email Integration:

Nodemailer setup with HTML templates for various notifications, including welcome emails and password resets.

Frontend (Implemented)
Authentication Pages:

Full suite of authentication pages including Login, Signup, OTP Verification, and Password Reset.

Dashboard:

Role-based dashboards with quick action cards and summaries.

Financial Management Pages:

Annual Financial Report: A dynamic page to view yearly summaries, with detailed, filterable lists of all expenses and revenues.

Transaction Creation Form: A comprehensive form to create new expense and revenue records.

Recurring Transaction Form: A dedicated UI to define recurring expense rules.

Approvals Page: A centralized page for managers to approve/reject pending financial transactions.

Time Management Page (AddTimeLogPage):

A unified, tabbed interface for all time-related tasks.

Attendance Tab: Features a check-in/check-out component, a half-day request workflow, and a history of recent attendance records with the ability to request corrections or dispute rejections.

Timesheet Tab: A complete weekly timesheet UI with a week navigator, a grid to display logged hours against projects, and a form to add new time entries.

Bonus Management Page:

A complete UI for awarding bonuses.

A view for managers to see and approve pending bonus awards.

A history view for employees to track their own bonuses.

Performance Management Pages:

Comprehensive performance review interface with multiple tabs.

Initiate Review Tab: Admin interface to create new performance reviews for employees.

My Reviews Tab: Employee view of their own performance reviews and self-assessment forms.

Pending Reviews Tab: Manager view of employees with initiated reviews requiring action.

Team Reviews Tab: Manager view of team member reviews and manager assessment forms.

Review Details Modal: Detailed view of performance reviews with self-assessment and manager review forms.

Goal Management Page:

Interactive goal setting and tracking interface.

Goal creation form with categories, priorities, and target dates.

Visual progress tracking with circular progress indicators.

Goal list view with filtering and status management.

Comment system for goal discussions and updates.

Team Management Page:

Team creation and management interface.

Member assignment and role management.

Team details modal with comprehensive team information.

Project integration for team assignments.

Review Cycle Management Page:

Administrative interface for managing performance review cycles.

Cycle creation form with date ranges and employee assignments.

Cycle status management and monitoring.

Core HR Pages:

Leave Management (application, history, balance).

Task Management (list view, creation, editing).

Employee Profile and Company Directory.

Upcoming Features / Roadmap
Backend Next Steps
Onboarding/Offboarding:

Employee onboarding workflow

Document management

Checklist system

Exit interview process

Automation:

Implement node-cron scheduler to automatically generate recurring transactions and perform other scheduled tasks.

Frontend Next Steps
Onboarding/Offboarding UI:

Onboarding checklist

Document upload

Progress tracking

Reporting Enhancements:

Add "Export to CSV/PDF" functionality for financial reports.

Deferred Features
AI Chatbot / HR Assistant

Native Mobile Application

Advanced Analytics & Custom Reporting

Tech Stack
Backend: Node.js, Express.js, MongoDB, Mongoose, JWT, Google OAuth 2.0, Nodemailer, Multer, Socket.IO

Frontend: React, Redux, Material-UI, React Router, Axios, Chart.js

Development Tools: Git, ESLint, Prettier, Jest, Postman, Docker, GitHub Actions

Project Structure
worksphere/
├── client/
└── server/

Getting Started
Prerequisites
Node.js (v18.x or later)

MongoDB (v6.x or later)

npm or yarn

Git

Installation
Clone the repository:

git clone <repository-url>
cd worksphere

Install Backend Dependencies:

cd server
npm install

Install Frontend Dependencies:

cd ../client
npm install

Environment Variables
Backend (/server/.env)
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
# ... (and other required variables)

Frontend (/client/.env.local)
REACT_APP_API_URL=http://localhost:4000/api
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id

Running the Application
Start Backend Server:

cd server
npm run dev

Start Frontend Development Server:

cd client
npm start

API Endpoints
Detailed API documentation is available in the /server/docs directory.