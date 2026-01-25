# Charity Event Fundraising Tracker

## 📋 Project Description

A portal to create fundraising events with targets, collect donor pledges, and visualize progress toward goals. The project combines pledge-entry forms, aggregation logic, and progress-bar charts.

This repository contains the source code and documentation for the Charity Event Fundraising Tracker project, developed as part of the UE23CS341A course at PES University.

🚀 Getting Started
✅ Prerequisites

Make sure you have the following installed on your system:

Node.js (v16 or later)

npm or yarn

MongoDB (local or MongoDB Atlas)

Git

VS Code (recommended)

🛠 Installation
1️⃣ Clone the repository
git clone https://github.com/CharityPulse
cd CharityPulse

2️⃣ Install Backend Dependencies
cd src/backend
npm install

3️⃣ Install Frontend Dependencies
cd src/frontend
npm install

4️⃣ Setup Environment Variables

Create a .env file inside the backend folder:

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret


(If using MongoDB Atlas, paste the connection string here.)

▶️ Run the Application
Start Backend Server
cd src/backend
npm run dev


Server runs on:

http://localhost:5000

Start Frontend
cd src/frontend
npm run dev


Frontend runs on:

http://localhost:3000

✅ Features

User Authentication (JWT)

Event Creation & Management

Secure Donations (Pledges)

Event Progress Tracking

Admin / Organizer Controls

MFA Authentication

RESTful API

Modern UI

🧪 Testing

To run Cypress tests:

npx cypress open

📦 Tech Stack

Frontend: Next.js, React, CSS

Backend: Node.js, Express

Database: MongoDB

Auth: JWT + MFA (Speakeasy)

Testing: Cypress

Deployment: Vercel / Localhost

## 📁 Project Structure

```
PESU_EC_CSE_J_P49_Charity_Event_Fundraising_Tracker_CharityPulse/
├── src/                 # Source code
├── docs/               # Documentation
├── tests/              # Test files
├── .github/            # GitHub workflows and templates
├── README.md          # This file
└── ...
```

📄 License

This project is licensed under the MIT License and is intended strictly for educational and academic purposes.
You are free to use, modify, and distribute this project with proper attribution.
---

👨‍💻 Developed By

Sujoy Sen
B.Tech – Computer Science & Engineering
PES University
