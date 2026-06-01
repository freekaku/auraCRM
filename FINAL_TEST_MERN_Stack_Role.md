# FINAL TEST: Lead Management CRM Module

## Overview

As part of our hiring process, we would like you to build a modern **Lead Management module** for a CRM platform. This assignment is designed to evaluate your practical skills in React, Node.js, Express.js, MongoDB, API development, authentication, database design, UI development, and overall software engineering practices.

The goal is not only to build a working application but also to demonstrate your approach to architecture, code organization, scalability, performance optimization, and problem-solving.

---

## Business Scenario

A sales team uses a CRM system to manage potential customers (Leads). The system should allow users to create, track, update, search, filter, and manage leads throughout the sales process.

Your task is to develop a Lead Management module that provides a seamless user experience and follows modern development standards.

---

## Functional Requirements

### 1. User Authentication

Develop a secure authentication system that includes:

- User Registration
- User Login
- Password Hashing
- JWT-Based Authentication
- Protected Routes
- Logout Functionality

---

### 2. Lead Management

Users should be able to:

- Create Leads
- View Leads
- Edit Leads
- Delete Leads

Each Lead should contain the following information:

| Field | Description |
|---|---|
| Lead Name | Full name of the lead |
| Company Name | Associated company |
| Email Address | Contact email |
| Phone Number | Contact phone |
| Industry | Business industry |
| Country | Lead's country |
| Lead Source | Origin of the lead |
| Lead Status | Current status in the pipeline |
| Owner | Assigned sales rep |
| Expected Revenue | Projected deal value |
| Created Date | Date the lead was added |

---

### 3. Lead Listing

Display all leads in a professional data table. The table should support:

- Pagination
- Sorting
- Search
- Column Visibility Controls

Search functionality should work across:

- Lead Name
- Company Name
- Email Address

---

### 4. Advanced Filtering

Allow users to filter leads using one or more of the following criteria:

- Lead Status
- Industry
- Lead Source
- Owner
- Country
- Date Range

> Multiple filters should work simultaneously.

---

### 5. Activity Timeline

Every lead should maintain an activity history. Examples:

- Lead Created
- Lead Updated
- Status Changed
- Owner Changed
- Note Added

Display all activities in **chronological order**.

---

### 6. Notes Management

Users should be able to:

- Add Notes
- Edit Notes
- Delete Notes

Each note should display:

- Author
- Date
- Time

---

### 7. Dashboard

Create a dashboard that provides key insights.

**Summary Cards:**

- Total Leads
- Qualified Leads
- Won Leads
- Lost Leads

**Charts:**

- Leads by Industry
- Leads by Status

> You may use any charting library of your choice.

---

### 8. File Uploads

Allow users to upload files related to a lead.

**Supported file types:**

- PDF
- DOCX
- PNG
- JPG

**Store and display:**

- File Name
- Upload Date
- Uploaded By

---

### 9. AI-Powered Feature

Implement one AI-powered feature relevant to sales or lead management. Examples include:

- AI-generated Lead Summary
- AI-generated Follow-Up Email
- Lead Qualification Suggestions
- Meeting Preparation Notes

> You may use OpenAI, Claude, Gemini, or any other LLM provider.

---

## Technical Requirements

### Frontend

**Mandatory Technologies:**

- React.js
- TypeScript
- Material UI

**State Management** — Choose one and explain your decision:

- React Query
- Redux Toolkit
- Zustand

---

### Backend

**Mandatory Technologies:**

- Node.js
- Express.js

---

### Database

**Mandatory Technologies:**

- MongoDB
- Mongoose

Design your database structure appropriately for:

- Users
- Leads
- Activities
- Notes
- Files

---

### API Requirements

Design and implement REST APIs for all application functionality. Your APIs should demonstrate:

- Proper HTTP Methods
- Request Validation
- Error Handling
- Pagination Support
- Filtering Support
- Clean API Design

---

### Performance Requirements

Implement and explain any performance optimizations you use. Examples:

- `React.memo`
- `useMemo`
- `useCallback`
- Lazy Loading
- Code Splitting

---

## Submission Requirements

### Source Code

Provide a GitHub repository containing:

- Frontend Application
- Backend Application
- Documentation

### README Documentation

Include:

- Project Setup Instructions
- Architecture Overview
- Folder Structure
- Database Design
- Assumptions Made
- Third-Party Libraries Used

---

## Optional (Bonus Points)

Record a short **5–10 minute walkthrough video** explaining:

- Project Architecture
- Key Technical Decisions
- Challenges Faced
- Performance Considerations
- AI Integration Approach

---

## Evaluation Criteria

Your submission will be evaluated based on:

- Code Quality and Maintainability
- React Development Practices
- API Design and Backend Development
- MongoDB Schema Design
- Authentication and Security
- UI/UX Quality
- Performance Optimization
- Problem-Solving Approach
- Documentation Quality
- Overall Engineering Thinking

---