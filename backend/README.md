# Arcforma Studio — Backend

The Express API for contact enquiries. It validates submissions, stores them in MongoDB, and uses a MongoDB-backed outbox worker to send and retry email notifications.

**Live website:** [https://jivon-vai-five.vercel.app](https://jivon-vai-five.vercel.app)  
**Backend API:** [https://arcforma-studio.onrender.com](https://arcforma-studio.onrender.com) · [API health](https://arcforma-studio.onrender.com/)

## Stack

- Node.js 20.19 or newer (ES modules)
- Express 5
- MongoDB Node.js driver
- Resend HTTPS API for production email
- Nodemailer with Gmail for local email development
- Helmet, CORS, and express-rate-limit

## Requirements

- Node.js 20.19 or newer
- npm
- A MongoDB database
- A Resend account and verified sender domain for production email, or a Gmail App Password for local testing

## Local setup

From the repository root:

```bash
npm --prefix backend install
```

Create `backend/.env` from [`.env.example`](./.env.example), and fill in private values locally:

```env
PORT=5000
FRONTEND_URL=http://localhost:5173
MONGODB_URI=your_private_mongodb_connection_string
MONGODB_DB_NAME=ArcformaStudio
CONTACT_RECIPIENT=your_contact_inbox@example.com

# Local development with a Gmail App Password
EMAIL_PROVIDER=gmail
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
```

Do not commit `.env` or paste real credentials into README files, issues, or source code.

Start the API:

```bash
npm --prefix backend run dev
```

The API normally listens at `http://localhost:5000`. `server.js` connects to MongoDB before starting the HTTP server, so a valid `MONGODB_URI` is required.

## Email configuration

| Environment | Provider selection | Required settings |
| --- | --- | --- |
| Render | Resend HTTPS API | `RESEND_API_KEY`, `EMAIL_FROM`, `CONTACT_RECIPIENT` |
| Local development | Gmail via Nodemailer | `EMAIL_PROVIDER=gmail`, `EMAIL_USER`, `EMAIL_PASS`, `CONTACT_RECIPIENT` |

Render is configured to use Resend because its free service cannot send outbound Gmail SMTP traffic. Set a Resend API key, a sender address on a domain verified in Resend, and the destination inbox in the Render environment. Resend's test sender may only deliver to the account owner's address; verify your own domain to send to other recipients.

After changing Render environment variables, redeploy the backend. Keep all provider credentials in the hosting provider's environment settings, not in Vercel or frontend `VITE_*` variables.

## Contact API

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/` | API health response |
| `GET` | `/api/contact/test` | Contact route health response |
| `POST` | `/api/contact/send-email` | Validate an enquiry, save it in MongoDB, and queue email notification |

Example JSON request:

```json
{
  "name": "Your name",
  "email": "you@example.com",
  "phone": "+8801XXXXXXXXX",
  "interest": "Interior design",
  "message": "Tell us about your project."
}
```

A successful response means the enquiry has been saved. When email is configured, the response includes `emailNotification: "pending"`; it does not wait for the email provider. If email is not configured, the enquiry is still stored and the response reports `not_configured`.

## MongoDB email outbox

Enquiries are stored in the `contactMessages` collection in the database configured by `MONGODB_DB_NAME` (default: `ArcformaStudio`). Each document contains the contact fields, creation time, and delivery fields such as:

- `emailNotification`: `pending`, `processing`, `sent`, `failed`, or `not_configured`
- `emailAttempts`: number of delivery attempts
- `emailNextAttemptAt`: time when a retry becomes eligible
- `emailLastError`: latest provider error, when a send fails
- `emailSentAt`: when the provider accepted the notification

The worker atomically claims an eligible database record, sends the email, and records the result. Temporary failures are retried after approximately 30 seconds, 2 minutes, 10 minutes, and 1 hour. After five failed attempts, the status becomes `failed`; the saved enquiry remains in MongoDB for follow-up. `sent` records provider acceptance and is not a guarantee that the message reached the recipient's inbox.

The worker is part of the backend process. MongoDB persists the queue across restarts; while the service is stopped, delivery pauses and resumes when the worker starts again.

## Security and limits

- CORS uses an explicit list of trusted frontend origins; set `FRONTEND_URL` to the deployed frontend origin.
- Helmet sets HTTP security headers.
- Contact requests are limited to 20 KB and 10 requests per 15 minutes per IP.
- Input is validated before it is stored or queued.
- Keep MongoDB access restricted and protect provider credentials. Never commit secrets.

## Tests

Run the backend tests from the repository root:

```bash
npm --prefix backend test
```

The suite covers contact validation and response behavior, email provider configuration and sending, and outbox delivery/retry behavior.

## Production deployment — Render

Set these variables in the Render service environment:

```text
PORT=<provided by Render>
FRONTEND_URL=https://jivon-vai-five.vercel.app
MONGODB_URI=<private MongoDB connection string>
MONGODB_DB_NAME=ArcformaStudio
CONTACT_RECIPIENT=<destination inbox>
RESEND_API_KEY=<private Resend API key>
EMAIL_FROM=<sender on a Resend-verified domain>
```

Allow the Render service to connect to the MongoDB Atlas cluster in Atlas Network Access. Do not copy real values into this example. Render's free service may spin down after inactivity; the first request after a quiet period can take longer while the service starts.

For frontend build configuration and Vercel deployment, see [frontend/README.md](../frontend/README.md). For the full-stack architecture and deployment overview, see the [root README](../README.md).
