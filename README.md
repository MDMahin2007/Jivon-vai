# ArcformaStudio

This project is a full-stack architecture and interior design portfolio website with a React frontend and Express backend.

## Project structure

- `frontend/` — React + Vite + Tailwind frontend
- `backend/` — Express + MongoDB API and admin management

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
   `cd backend`
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
   `cd frontend`
2. Install dependencies:
   `npm install`
3. Start the app:
   `npm run dev`
4. If the frontend needs to talk to the backend, set:
   `VITE_API_BASE_URL=http://localhost:5000/api`

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

- The frontend includes demo fallback content when the backend returns empty data.
- The admin dashboard is protected with JWT-based authentication.
- The project is designed to work in both local development and demo-ready environments.

## Architecture

The backend owns authentication, MongoDB persistence, contact submissions, project and service CRUD, and Cloudinary uploads. The frontend consumes the API through `VITE_API_BASE_URL` and uses local demo content when development data is unavailable.

Protected write operations require a JWT in the `Authorization: Bearer <token>` header. Public reads are available for projects and services; contact inbox reads and all content mutations require admin authentication.

## API overview

- `GET /api/projects` — list projects
- `GET /api/projects/:id` — read one project
- `POST|PUT|DELETE /api/projects` — authenticated project management
- `GET /api/services` — list services
- `POST|PUT|DELETE /api/services` — authenticated service management
- `POST /api/contact/send-email` — validate and save a contact enquiry
- `GET|DELETE /api/contact/contacts/:id` — authenticated message management
- `POST /api/auth/login` — authenticate an administrator
- `GET /api/auth/me` — read the current administrator

## Security notes

- `.env` files and dependency folders are ignored by Git; only `.env.example` files are intended for version control.
- CORS is controlled by `FRONTEND_URL`.
- Helmet security headers and rate limits protect authentication and contact endpoints.
- Passwords are hashed with bcrypt and JWTs expire according to `JWT_EXPIRES_IN`.
- Project and contact input is validated on the server.

## Testing and verification

Run the project checks from the repository root:

```bash
npm --prefix backend test
npm --prefix frontend run lint
npm --prefix frontend run build
```

Backend tests cover contact input validation. Frontend linting uses ESLint's recommended rules. Configure the backend `.env` from `.env.example` and verify database, mail, and Cloudinary integrations before deployment. Review `npm audit` advisories separately before upgrading major dependencies.

## Deployment notes

Before deployment, configure production values for `MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL`, Cloudinary, and email settings. Verify Cloudinary uploads, SMTP delivery, MongoDB Atlas access, and the production frontend origin manually. Do not deploy the local `.env` file.
