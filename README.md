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

```text
CharityPulse/
├── src/
│   ├── frontend/
│   └── backend/
├── docs/
├── tests/
├── .github/
├── README.md
└── ...
```

---

# Getting Started

## Prerequisites

Make sure the following are installed:

- Node.js (v16 or later)
- npm or yarn
- MongoDB (Local or MongoDB Atlas)
- Git
- Visual Studio Code (Recommended)

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Kingjoy7/CharityPulse.git
cd CharityPulse
```

### 2. Install Backend Dependencies

```bash
cd src/backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

---

## Environment Variables

Create a `.env` file inside `src/backend` and add:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

---

## Running the Application

### Start the Backend

```bash
cd src/backend
npm run dev
```

Backend runs on:

```
http://localhost:5000
```

### Start the Frontend

```bash
cd src/frontend
npm run dev
```

Frontend runs on:

```
http://localhost:3000
```

---

# Testing

Run Cypress:

```bash
npx cypress open
```

---

# Use Cases

- Create and manage charity fundraising campaigns.
- Set fundraising goals for events.
- Allow donors to securely pledge donations.
- Track fundraising progress through interactive dashboards.
- Enable organizers and administrators to manage campaigns efficiently.

---

# Highlights

- Full-stack architecture with separate frontend and backend.
- Secure JWT authentication with Multi-Factor Authentication (MFA).
- RESTful API architecture for scalable communication.
- Interactive dashboards for fundraising analytics.
- Automated testing using Cypress.
- Clean and responsive user interface.

---

# Developed By

**Sujoy Sen**

B.Tech – Computer Science and Engineering

PES University
