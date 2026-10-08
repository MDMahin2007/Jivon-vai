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
- MongoDB
- Nodemailer
- Resend HTTP API for production email

## Requirements

- Node.js 20.19+
- A backend `.env` file with email credentials

## Backend setup

1. Open the backend folder:
   `cd backend`
2. Install dependencies:
   `npm install`
3. Create a `.env` file based on the project template values, including:
   - `PORT=5000`
   - `FRONTEND_URL=https://jivon-vai-five.vercel.app`
   - `MONGODB_DB_NAME=ArcformaStudio`
   - `MONGODB_URI` with your MongoDB connection string
   - `CONTACT_RECIPIENT=your_email`
   - Local only: `EMAIL_PROVIDER=gmail`, `EMAIL_USER=your_email`, and `EMAIL_PASS=your_gmail_app_password`
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

5. Contact submissions are saved to the `contactMessages` collection in the `ArcformaStudio` database before email notification is attempted. The API responds as soon as MongoDB saves the message; email is attempted in the background and failures are logged. Render Free blocks outbound SMTP ports, so configure an HTTPS email provider for production: verify a sender domain in Resend, then set `EMAIL_PROVIDER=resend`, `RESEND_API_KEY`, `EMAIL_FROM` (an address on the verified domain), and `CONTACT_RECIPIENT` in the Render backend environment. Keep Gmail SMTP (`EMAIL_PROVIDER=gmail`, `EMAIL_USER`, and `EMAIL_PASS` as a Gmail App Password) for local development. Set `MONGODB_DB_NAME`, `MONGODB_URI`, and `FRONTEND_URL=https://jivon-vai-five.vercel.app` as well, then redeploy the backend. For local development, set `FRONTEND_URL=http://localhost:5173` in `backend/.env`.

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

- Projects, services, optimized WebP images, and 720p MP4 videos are served from the frontend's local data and `public/projects` assets.
- The backend validates and stores contact form submissions in MongoDB, then attempts email notification asynchronously when the provider is configured.

## Architecture

The frontend owns the portfolio content and optimized media. The backend exposes a contact endpoint that validates and stores each message in MongoDB before attempting an email notification in the background.

## API overview

- `POST /api/contact/send-email` — validate and store a contact enquiry, then attempt email notification asynchronously (`emailNotification: "pending"`); delivery failures are logged

## Security notes

- `.env` files and dependency folders are ignored by Git; only `.env.example` files are intended for version control.
- CORS is controlled by `FRONTEND_URL`.
- Helmet security headers and a rate limit protect the contact endpoint.
- Contact input is validated on the server and rate-limited.

## Testing and verification

Run the project checks from the repository root:

```bash
npm --prefix backend test
npm --prefix frontend run lint
npm --prefix frontend run build
```

Backend tests cover contact validation and both Resend API and local Gmail SMTP delivery paths. Frontend linting uses ESLint's recommended rules.

## Deployment notes

Before deployment, configure production values for `FRONTEND_URL`, `MONGODB_URI`, `MONGODB_DB_NAME`, `EMAIL_PROVIDER=resend`, `RESEND_API_KEY`, `EMAIL_FROM`, and `CONTACT_RECIPIENT`. Verify the Resend sender domain and production frontend origin. Do not deploy the local `.env` file.

The Vercel frontend configuration rewrites client-side routes to the app entrypoint so direct visits and refreshes on routes such as `/about` and `/contact` work.

Original project media is kept locally under the ignored `frontend/media-originals/projects/` directory. To regenerate the deployable WebP images and optimized MP4s, place source media there and run `npm run optimize:media` from `frontend/`.
