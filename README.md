# ArcformaStudio

This project is a full-stack architecture and interior design portfolio website with a React frontend and Express backend.

## Project structure

- `frontend/` — React + Vite + Tailwind frontend
- `backend/` — Express contact form email API

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
- CORS and request rate limiting
- Nodemailer

## Requirements

- Node.js 18+
- A backend `.env` file with email credentials

## Backend setup

1. Open the backend folder:
   `cd backend`
2. Install dependencies:
   `npm install`
3. Create a `.env` file based on the project template values, including:
   - `PORT=5000`
   - `FRONTEND_URL=https://jivon-vai-five.vercel.app`
   - `EMAIL_USER=your_email`
   - `EMAIL_PASS=your_email_password`
   - `CONTACT_RECIPIENT=your_email`
4. Start the server:
   `npm run dev` or `npm start`

## Frontend setup

1. Open the frontend folder:
   `cd frontend`
2. Install dependencies:
   `npm install`
3. Start the app:
   `npm run dev`
4. The frontend's `.env.example` points to the local backend:
   `VITE_API_BASE_URL=http://localhost:5000/api`

   For a production frontend build, set `VITE_API_BASE_URL=https://arcforma-studio.onrender.com/api` in the deployment environment. Vite embeds this value into the frontend build.

5. In the Render backend environment, set `FRONTEND_URL=https://jivon-vai-five.vercel.app` so the deployed frontend can access the API through CORS. For local development, set it to `http://localhost:5173` in `backend/.env`.

## Production build

Frontend production build:

```bash
cd frontend
npm run build
```

## Default local app URLs

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api`

## Notes

- Projects, services, and images are served from the frontend's local data and `public/img` assets.
- The backend only validates contact form submissions and emails them to `CONTACT_RECIPIENT`.
- Contact messages are not stored in a database.

## Architecture

The frontend owns the portfolio content and images. The backend exposes only the contact form endpoint; it sends submissions by email and does not persist them.

## API overview

- `POST /api/contact/send-email` — validate and email a contact enquiry

## Security notes

- `.env` files and dependency folders are ignored by Git; only `.env.example` files are intended for version control.
- CORS is controlled by `FRONTEND_URL`.
- Helmet security headers and rate limits protect authentication and contact endpoints.
- Contact input is validated on the server and rate-limited.

## Testing and verification

Run the project checks from the repository root:

```bash
npm --prefix backend test
npm --prefix frontend run lint
npm --prefix frontend run build
```

Backend tests cover contact input validation. Frontend linting uses ESLint's recommended rules. Configure the backend `.env` from `.env.example` and verify SMTP delivery before deployment.

## Deployment notes

Before deployment, configure production values for `FRONTEND_URL`, `EMAIL_USER`, `EMAIL_PASS`, and `CONTACT_RECIPIENT`. Verify SMTP delivery and the production frontend origin manually. Do not deploy the local `.env` file.
