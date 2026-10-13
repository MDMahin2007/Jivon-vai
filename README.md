# Arcforma Studio

An architecture and interior design portfolio for a Dhaka-based studio. The site presents projects, visual galleries, services, and a home-page contact form backed by a Node.js API and MongoDB.

**Live website:** [https://jivon-vai-five.vercel.app](https://jivon-vai-five.vercel.app)  
**Backend API:** [https://arcforma-studio.onrender.com](https://arcforma-studio.onrender.com) · [API health](https://arcforma-studio.onrender.com/)

## Highlights

- Responsive portfolio pages for projects, project details, services, and a visual gallery
- Animated interactions using Framer Motion
- Project-specific image galleries and video walkthroughs
- Contact enquiries validated by the API and saved in MongoDB
- A MongoDB-backed email outbox with automatic retries for temporary delivery failures
- CORS allow-list, Helmet security headers, request-size limits, and contact rate limiting

## Project layout

```text
.
├── frontend/   # React + Vite application; deployed on Vercel
├── backend/    # Express API, MongoDB persistence, and email worker; deployed on Render
└── README.md   # Full-stack project overview
```

Each application folder has its own setup guide: [frontend/README.md](./frontend/README.md) and [backend/README.md](./backend/README.md).

## Stack

| Area | Technology |
| --- | --- |
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion, React Router, React Icons |
| Backend | Node.js 20.19+, Express 5, MongoDB Node.js driver |
| Email | Resend HTTPS API in production; Nodemailer with Gmail for local development |
| Hosting | Vercel (frontend), Render (backend), MongoDB Atlas (database) |

## Contact delivery

1. The frontend sends `POST /api/contact/send-email` to the backend.
2. The API validates the enquiry and writes it, including its email status, to the `contactMessages` collection in the `ArcformaStudio` database.
3. Once MongoDB confirms the write, the API responds without waiting for the email provider.
4. A backend worker claims queued messages and sends them using the configured email provider.
5. Temporary send failures are recorded and retried after approximately 30 seconds, 2 minutes, 10 minutes, and 1 hour. After five failed attempts, the record is marked `failed`; the enquiry remains in MongoDB.

The `emailNotification` field records `pending`, `processing`, `sent`, `failed`, or `not_configured`. `sent` means the email provider accepted the request; it does not confirm delivery to the recipient's inbox. As with any email integration, check provider logs and spam folders if an email is missing.

The outbox worker runs inside the backend process and is backed by MongoDB, so pending enquiries survive a backend restart. The production backend must have a valid email provider configuration for notifications to be sent.

## Requirements

- Node.js 20.19 or newer
- npm
- A MongoDB database (MongoDB Atlas is suitable)
- A Resend account and verified sender domain for production email
- A Gmail App Password if using Gmail for local email testing

## Local development

Install dependencies separately for each application:

```bash
npm --prefix backend install
npm --prefix frontend install
```

Create `backend/.env` using [backend/.env.example](./backend/.env.example). Set the MongoDB connection string, database name, allowed frontend origin, and email provider credentials. Use placeholders in shared documentation; keep real values only in your local environment or hosting provider's encrypted settings.

For local email delivery with Gmail, configure `EMAIL_PROVIDER=gmail`, `EMAIL_USER`, and `EMAIL_PASS` in `backend/.env`. For production, use Resend; see [backend/README.md](./backend/README.md#email-configuration).

Start the backend and frontend in separate terminals:

```bash
npm --prefix backend run dev
npm --prefix frontend run dev
```

The local frontend is normally available at `http://localhost:5173`; the API is normally available at `http://localhost:5000`. The frontend API URL can be set in `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Verification

Run the backend tests, frontend lint, and frontend production build from the repository root:

```bash
npm --prefix backend test
npm --prefix frontend run lint
npm --prefix frontend run build
```

## Deployment

### Backend — Render

Set the following in the Render service environment. Never put actual secrets in this README or commit them to Git.

| Variable | Purpose |
| --- | --- |
| `PORT` | HTTP port supplied by Render |
| `FRONTEND_URL` | Production frontend origin: `https://jivon-vai-five.vercel.app` |
| `MONGODB_URI` | MongoDB connection string |
| `MONGODB_DB_NAME` | Database name; defaults to `ArcformaStudio` |
| `RESEND_API_KEY` | Resend API key |
| `EMAIL_FROM` | Sender address on a domain verified with Resend |
| `CONTACT_RECIPIENT` | Inbox that should receive contact enquiries |

Render's free web services cannot send email over Gmail SMTP ports. On Render the API selects Resend, so configure the Resend key and sender address. Resend may restrict recipients when using an unverified/test sender; verify a domain and use an address on that domain to send to your chosen inbox. Allow the Render service to connect to the MongoDB Atlas cluster in Atlas Network Access.

### Frontend — Vercel

Set `VITE_API_BASE_URL` to the deployed backend API base:

```env
VITE_API_BASE_URL=https://arcforma-studio.onrender.com/api
```

Vite embeds this value at build time, so redeploy the frontend after changing it. The Vercel configuration rewrites client-side routes to the application entry point.

Render's free service can spin down after inactivity. The first request after a quiet period may be slower while the service starts; this cold start is separate from email delivery.

## Security and privacy

### Keep out of GitHub

- Real `.env` files and local environment overrides. Commit only sanitized `.env.example` templates with placeholders.
- `frontend/media-originals/`, which can contain large, unpublished source images and videos.
- `node_modules/`, build output (`dist/`, `build/`), local logs, and generated error reports.
- Private keys, certificates, local credential stores, database backups, and contact-data exports.

The repository `.gitignore` files exclude these common local/private files. Ignore rules do not remove files that were already committed, so check GitHub's file list before publishing.

- Keep database credentials and provider API keys private. `.env.example` files must contain placeholders only.
- Only frontend-exposed Vite variables (`VITE_*`) belong in the browser bundle. Do not put secrets in frontend environment variables.
- Configure CORS with the deployed frontend origin and only the local development origins you need.
- Contact request bodies are limited in size, validated on the server, and rate limited.
- Store only contact information needed to respond to enquiries, and restrict access to the MongoDB project and provider dashboard.
- Protect, back up, and retain contact data in accordance with your privacy requirements.
- If a credential was ever committed, deleting the file is not sufficient: revoke/rotate it and remove it from Git history before making the repository public.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Enquiry saved but email missing | Inspect the document's `emailNotification` and `emailLastError` fields, Render logs, Resend API logs, recipient address, sender-domain verification, and spam folder. |
| `not_configured` status | Confirm `RESEND_API_KEY`, `EMAIL_FROM`, and `CONTACT_RECIPIENT` are set on Render, then redeploy the backend. |
| Resend returns HTTP 401 | Replace the invalid or revoked API key in Render and redeploy. |
| Resend rejects the sender or recipient | Verify the sending domain and check Resend's account-level recipient restrictions. |
| Frontend cannot reach the API | Check Vercel's `VITE_API_BASE_URL`, Render's `FRONTEND_URL`, and both deployment logs. |
| First request is unusually slow | The Render free service may be waking from a spin-down. Subsequent requests should avoid that particular cold start. |

For application-specific instructions, see [frontend/README.md](./frontend/README.md) and [backend/README.md](./backend/README.md).
