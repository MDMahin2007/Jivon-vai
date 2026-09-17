# Jivon Vai Studio

This project is a full-stack architecture and interior design portfolio website with a React frontend and Express backend.

## Project structure

- `Jivon-vai_frontend/` — React + Vite + Tailwind frontend
- `Jivon-vai_backend/` — Express + MongoDB API and admin management

## Tech stack

Frontend
- React 18
- Vite
- Tailwind CSS
- Framer Motion
- React Router
- React Icons

Backend
- Node.js
- Express 5
- MongoDB + Mongoose
- JWT auth
- Cloudinary
- Nodemailer

## Requirements

- Node.js 18+
- MongoDB running locally or a MongoDB connection string
- A `.env` file in the backend with the required variables

## Backend setup

1. Open the backend folder:
   `cd Jivon-vai_backend`
2. Install dependencies:
   `npm install`
3. Create a `.env` file based on the project template values, including:
   - `PORT=5000`
   - `MONGODB_URI=your_mongodb_uri`
   - `JWT_SECRET=your_jwt_secret`
   - `EMAIL_USER=your_email`
   - `EMAIL_PASS=your_email_password`
4. Start the server:
   `npm run dev` or `npm start`

## Frontend setup

1. Open the frontend folder:
   `cd Jivon-vai_frontend`
2. Install dependencies:
   `npm install`
3. Start the app:
   `npm run dev`
4. If the frontend needs to talk to the backend, set:
   `VITE_API_BASE_URL=http://localhost:5000/api`

## Production build

Frontend production build:

```bash
cd Jivon-vai_frontend
npm run build
```

## Default local app URLs

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api`

## Notes

- The frontend includes demo fallback content when the backend returns empty data.
- The admin dashboard is protected with JWT-based authentication.
- The project is designed to work in both local development and demo-ready environments.
