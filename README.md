# CharityPulse – Charity Event Fundraising Tracker

A full-stack fundraising platform that enables organizers to create charity events, set donation targets, collect secure donor pledges, and track fundraising progress through interactive dashboards.

---

## Overview

CharityPulse is designed to simplify charity event management by providing a centralized portal for organizers and donors. The platform supports secure authentication, event creation, pledge tracking, admin controls, and real-time progress visualization.

This project demonstrates full-stack development using **Next.js**, **React**, **Node.js**, **Express**, and **MongoDB**, along with authentication, testing, and deployment practices.

---

## Features

- User authentication with **JWT**
- **Multi-Factor Authentication (MFA)** for enhanced security
- Charity event creation and management
- Secure donor pledge submission
- Fundraising target and progress tracking
- Admin / organizer controls
- RESTful API architecture
- Interactive and modern user interface
- End-to-end testing with **Cypress**

---

## Tech Stack

### Frontend
- Next.js
- React
- Tailwind CSS

### Backend
- Node.js
- Express.js

### Database
- MongoDB

### Authentication
- JWT
- Speakeasy (MFA)

### Testing
- Cypress

### Deployment
- Vercel / Localhost

---

## Project Structure

```bash
PESU_EC_CSE_J_P49_Charity_Event_Fundraising_Tracker_CharityPulse/
├── src/                 # Source code
├── docs/                # Documentation
├── tests/               # Test files
├── .github/             # GitHub workflows and templates
├── README.md            # Project documentation
└── ...
Getting Started
Prerequisites

Make sure the following are installed on your system:

Node.js (v16 or later)

npm or yarn

MongoDB (local instance or MongoDB Atlas)

Git

VS Code (recommended)

Installation
1. Clone the Repository
git clone https://github.com/CharityPulse
cd CharityPulse
2. Install Backend Dependencies
cd src/backend
npm install
3. Install Frontend Dependencies
cd ../frontend
npm install
Environment Variables

Create a .env file inside the src/backend folder and add the following:

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
Running the Application
Start the Backend Server
cd src/backend
npm run dev

Backend will run on:

http://localhost:5000
Start the Frontend
cd src/frontend
npm run dev

Frontend will run on:

http://localhost:3000
Testing

To run Cypress tests:

npx cypress open
Use Cases

Create and manage fundraising campaigns

Set donation goals for charity events

Allow users to securely pledge donations

Monitor event progress visually

Enable organizers to manage campaigns efficiently

Highlights

Full-stack architecture with separate frontend and backend

Secure authentication with support for MFA

Real-time progress monitoring for fundraising events

REST API design for scalable communication

Clean UI for both donors and organizers

Testing support for improved reliability


Developed By

Sujoy Sen
B.Tech – Computer Science and Engineering
PES University
