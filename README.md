# Annadaan Connect

A full-stack Smart Food Redistribution and Social Impact Platform.

## Features
- **Donor Dashboard:** Create donations, track statuses.
- **Volunteer Dashboard:** Accept nearby pickup tasks, upload proof of delivery.
- **Recipient Dashboard:** View incoming matched donations, confirm receipt.
- **Admin Dashboard:** Monitor platform analytics, auto-match pending donations.
- **Auto-Matching:** Haversine distance-based matching algorithm to assign the nearest volunteer and recipient.

## Tech Stack
- **Frontend:** React.js, React Router v6, Tailwind CSS, Recharts, Axios
- **Backend:** Node.js, Express.js, MongoDB (Mongoose), JWT Auth, bcryptjs

## Folder Structure
This project is separated into exactly two independent folders:
- `backend/` — Express API
- `frontend/` — React App

## Setup Instructions

### Prerequisites
- Node.js installed
- MongoDB running locally on port 27017

### 1. Backend Setup
```bash
cd backend
npm install
# Seed the database with sample data (optional but recommended)
npm run seed
# Start the server
npm run dev
```
The API will run on `http://localhost:5000`.

### 2. Frontend Setup
In a new terminal:
```bash
cd frontend
npm install
# Start the Vite development server
npm run dev
```
The app will run on `http://localhost:3000`.

### 3. Demo Credentials
If you ran the seed script, you can log in with:
- **Admin:** `admin@annadaan.com`
- **Donor:** `rajesh@donor.com` or `priya@donor.com`
- **Volunteer:** `amit@volunteer.com` or `sneha@volunteer.com`
- **Recipient:** `hope@recipient.com` or `sunrise@recipient.com`

**All passwords are:** `password123`
