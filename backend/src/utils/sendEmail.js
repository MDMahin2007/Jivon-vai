import nodemailer from "nodemailer";

let transporter;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      pool: true,
      maxConnections: 1,
      maxMessages: 100,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  return transporter;
};

const sendEmail = async (contactData) => {
  await getTransporter().sendMail({
    from: process.env.EMAIL_USER,
    replyTo: contactData.email,
    to: process.env.CONTACT_RECIPIENT || "arcjibon750@gmail.com",
    subject: "New Contact Form Message",
    text: `
Name: ${contactData.name}
Email: ${contactData.email}
Phone: ${contactData.phone}
Interest: ${contactData.interest}

Message:
${contactData.message}
`,
  });
};

export default sendEmail;