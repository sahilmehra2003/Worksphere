# Worksphere - Internal HRMS & Employee Portal

**Status:** Active Development

Worksphere is a full-stack internal HR management and employee self-service platform designed to streamline various company processes. This monorepo contains the backend API built with Node.js, Express, and MongoDB, and the frontend client application built with React.

## Table of Contents

- [Key Features](#key-features)
  - [Backend (Implemented)](#backend-implemented)
  - [Frontend (Implemented)](#frontend-implemented)
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

### Backend (Implemented)

* **Authentication & Authorization:**
    * Multiple authentication methods:
        * Email/Password with JWT
        * Google OAuth 2.0 integration
        * OTP-based Email Verification
    * Secure token storage in HttpOnly cookies
    * Automatic token refresh mechanism
    * Role-based access control (RBAC)
    * Permission-based authorization
    * Session management
    * Password reset flow with secure tokens
    * Account lockout after failed attempts
    * Remember me functionality
    * Logout with token invalidation

* **Employee Management:**
    * Detailed `Employee` model storing profile info, contact details, address, role, manager, department, projects, clients etc.
    * Full CRUD API for managing employees
    * Role-based access control for employee data
    * Manager-subordinate relationship management
    * Profile picture upload and management
    * Employee search and filtering
    * Department assignment
    * Project assignment
    * Skills and certifications tracking

* **Department Management:**
    * `Department` model with full CRUD operations
    * Employee-department assignment management
    * Department hierarchy support
    * Role-based access control for department operations
    * Department head assignment
    * Department budget tracking
    * Department performance metrics

* **Client Management:**
    * `Client` model with contact info, location, status
    * Full CRUD API for managing clients
    * Geocoding integration (OpenCage API) for location coordinates
    * Client-project relationship management
    * Client contact management
    * Client billing information
    * Client status tracking
    * Client document management

* **Project Management:**
    * `Project` model with full CRUD operations
    * Project-client relationship management
    * Project team assignment capabilities
    * Project status tracking
    * Project timeline management
    * Project budget tracking
    * Project document management
    * Project milestone tracking
    * Project risk management

* **Task Management:**
    * `Task` model with title, assignee, deadline, status, priority
    * Full CRUD API for tasks
    * Task assignment and tracking
    * Task status updates and notifications
    * Task reopening functionality
    * Task dependencies
    * Task comments and attachments
    * Task time tracking
    * Task priority levels
    * Task categories and tags

* **Timesheet Management:**
    * `Timesheet` and `TimesheetEntry` models
    * Weekly timesheet creation and management
    * Time entry tracking with project/client/task association
    * Timesheet submission workflow (Draft → Submitted → Approved/Rejected)
    * Manager approval/rejection with comments
    * Timesheet status tracking
    * Role-based access control for timesheet operations
    * Timesheet export functionality
    * Timesheet analytics and reporting
    * Overtime tracking
    * Billable hours tracking

* **Leave Management:**
    * `LeaveRequest` and `LeaveBalance` models
    * Leave application and approval workflow
    * Leave balance tracking
    * Leave type management
    * Manager approval/rejection with comments
    * Leave cancellation functionality
    * Leave calendar integration
    * Leave policy management
    * Leave balance reports
    * Leave history tracking

* **Calendar / Holiday Management:**
    * `CountryCalendar` model for holiday tracking
    * Holiday calendar integration (Calendarific API)
    * Weekend and holiday definitions per country
    * Manual holiday management
    * Calendar data API for frontend
    * Multiple calendar views
    * Calendar sharing
    * Event reminders
    * Recurring events

* **Email Integration:**
    * Nodemailer setup with Mailtrap for development
    * HTML email templates for various notifications
    * Email verification and password reset flows
    * Welcome emails for new employees
    * Automated notifications
    * Email scheduling
    * Email tracking
    * Template management

### Frontend (Implemented)

* **Authentication Pages:**
    * Login with email/password
    * Google OAuth login
    * Signup with email verification
    * OTP Verification
    * Forgot Password
    * Reset Password
    * Change Password
    * Remember me functionality
    * Session management
    * Token refresh handling

* **Dashboard:**
    * Role-based dashboards (Employee, Manager, Admin, HR)
    * Quick action cards
    * Recent activities
    * Pending approvals
    * Upcoming deadlines
    * Performance metrics
    * Team overview
    * Project status
    * Leave balance
    * Timesheet status

* **Timesheet Management:**
    * Weekly timesheet view
    * Time entry form
    * Project/client/task selection
    * Timesheet submission
    * Approval/rejection workflow
    * Timesheet history
    * Timesheet export
    * Time tracking
    * Overtime calculation
    * Billable hours tracking

* **Leave Management:**
    * Leave application form
    * Leave balance display
    * Leave history
    * Approval/rejection workflow
    * Calendar integration
    * Leave policy display
    * Leave type selection
    * Leave duration calculation
    * Leave cancellation
    * Leave balance reports

* **Task Management:**
    * Task list view
    * Task creation and editing
    * Task assignment
    * Status updates
    * Priority management
    * Task filtering
    * Task search
    * Task comments
    * Task attachments
    * Task dependencies

* **Employee Profile:**
    * Profile view and edit
    * Department information
    * Project assignments
    * Manager information
    * Contact details
    * Skills and certifications
    * Profile picture
    * Employment history
    * Education details
    * Emergency contacts

* **Company Directory:**
    * Employee search
    * Department view
    * Organization chart
    * Contact information
    * Employee filtering
    * Department filtering
    * Role-based access
    * Contact details
    * Team structure
    * Reporting hierarchy

## Upcoming Features / Roadmap

### Backend Next Steps

* **Performance Management:**
    * Review cycle management
    * Performance review forms
    * Rating system
    * Feedback collection

* **Bonus System:**
    * Bonus calculation
    * Approval workflow
    * Payment tracking

* **Attendance System:**
    * Check-in/check-out tracking
    * Location-based attendance
    * Attendance reports

* **Onboarding/Offboarding:**
    * Employee onboarding workflow
    * Document management
    * Checklist system
    * Exit interview process

### Frontend Next Steps

* **Performance Review UI:**
    * Review form interface
    * Rating system
    * Feedback collection
    * History view

* **Bonus Management UI:**
    * Bonus calculation interface
    * Approval workflow
    * Payment tracking

* **Attendance System UI:**
    * Check-in/check-out interface
    * Attendance calendar
    * Reports and analytics

* **Onboarding/Offboarding UI:**
    * Onboarding checklist
    * Document upload
    * Progress tracking

### Deferred Features

* **AI Chatbot / HR Assistant:**
    * Automated responses
    * FAQ handling
    * Basic HR queries

* **Mobile Application:**
    * Native mobile app
    * Push notifications
    * Offline support

* **Advanced Analytics:**
    * Custom reports
    * Data visualization
    * Predictive analytics

## Tech Stack

* **Backend:**
    * Node.js
    * Express.js
    * MongoDB
    * Mongoose
    * JWT for authentication
    * Google OAuth 2.0
    * Nodemailer for emails
    * OpenCage for geocoding
    * Calendarific for holidays
    * Multer for file uploads
    * Socket.IO for real-time features

* **Frontend:**
    * React
    * Redux for state management
    * Material-UI for components
    * React Router for navigation
    * Axios for API calls
    * React Query for data fetching
    * Chart.js for visualizations
    * Google OAuth client
    * React Hook Form
    * Yup for validation
    * Socket.IO client

* **Development Tools:**
    * Git for version control
    * ESLint for code linting
    * Prettier for code formatting
    * Jest for testing
    * Postman for API testing
    * Docker for containerization
    * GitHub Actions for CI/CD

## Project Structure

```
worksphere/
├── client/              # React Frontend Application
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── redux/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── hooks/
│   │   ├── context/
│   │   ├── assets/
│   │   └── App.js
│   ├── .env.local
│   └── package.json
├── server/              # Node.js Backend Application
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── mailTemplates/
│   ├── uploads/
│   ├── .env
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites

* Node.js (v18.x or later)
* MongoDB (v6.x or later)
* npm or yarn
* Git
* Google Cloud Platform account (for OAuth)

### Installation

1. **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd worksphere
    ```

2. **Install Backend Dependencies:**
    ```bash
    cd server
    npm install
    ```

3. **Install Frontend Dependencies:**
    ```bash
    cd ../client
    npm install
    ```

## Environment Variables

### Backend (.env)
```
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=1d
MAILTRAP_HOST=your_mailtrap_host
MAILTRAP_PORT=your_mailtrap_port
MAILTRAP_USER=your_mailtrap_user
MAILTRAP_PASS=your_mailtrap_pass
OPENCAGE_API_KEY=your_opencage_key
CALENDARIFIC_API_KEY=your_calendarific_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:4000/api/auth/google/callback
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```
REACT_APP_API_URL=http://localhost:4000/api
REACT_APP_WS_URL=ws://localhost:4000
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

## Running the Application

1. **Start Backend Server:**
    ```bash
    cd server
    npm run dev
    ```

2. **Start Frontend Development Server:**
    ```bash
    cd client
    npm start
    ```

The application will be available at:
* Frontend: http://localhost:3000
* Backend API: http://localhost:4000

## API Endpoints

Detailed API documentation is available in the `/server/docs` directory. Key endpoints include:

* `/api/auth/*` - Authentication endpoints (including Google OAuth)
* `/api/employees/*` - Employee management
* `/api/departments/*` - Department management
* `/api/clients/*` - Client management
* `/api/projects/*` - Project management
* `/api/tasks/*` - Task management
* `/api/timesheets/*` - Timesheet management
* `/api/leaves/*` - Leave management
* `/api/calendar/*` - Calendar and holiday management
* `/api/upload/*` - File upload endpoints



