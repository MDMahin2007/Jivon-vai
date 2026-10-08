import nodemailer from "nodemailer";

const RESEND_API_URL = "https://api.resend.com/emails";

function getProvider(env) {
  return (env.EMAIL_PROVIDER || (env.RESEND_API_KEY ? "resend" : "gmail"))
    .trim()
    .toLowerCase();
}

export function isEmailConfigured(env = process.env) {
  const provider = getProvider(env);

  if (provider === "resend") {
    return Boolean(env.RESEND_API_KEY && env.EMAIL_FROM);
  }

  if (provider === "gmail") {
    return Boolean(env.EMAIL_USER && env.EMAIL_PASS);
  }

  return false;
}

export function createEmailSender({
  env = process.env,
  fetchImpl = globalThis.fetch,
  createTransport = nodemailer.createTransport,
} = {}) {
  let transporter;

  return async (contactData) => {
    if (!isEmailConfigured(env)) {
      throw new Error(`Email provider "${getProvider(env)}" is not configured.`);
    }

    const recipient = env.CONTACT_RECIPIENT || "arcjibon750@gmail.com";
    const text = `Name: ${contactData.name}
Email: ${contactData.email}
Phone: ${contactData.phone}
Interest: ${contactData.interest}

Message:
${contactData.message}`;

    if (getProvider(env) === "resend") {
      const response = await fetchImpl(RESEND_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: env.EMAIL_FROM,
          to: [recipient],
          reply_to: contactData.email,
          subject: "New Contact Form Message",
          text,
        }),
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new Error(`Resend API returned HTTP ${response.status}.`);
      }

      return;
    }

    if (!transporter) {
      transporter = createTransport({
        service: "gmail",
        pool: true,
        maxConnections: 1,
        maxMessages: 100,
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000,
        auth: {
          user: env.EMAIL_USER,
          pass: env.EMAIL_PASS,
        },
      });
    }

    await transporter.sendMail({
      from: env.EMAIL_USER,
      replyTo: contactData.email,
      to: recipient,
      subject: "New Contact Form Message",
      text,
    });
  };
}

const sendEmail = createEmailSender();

export default sendEmail;
