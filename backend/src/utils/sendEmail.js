import nodemailer from "nodemailer";

const sendEmail = async (contactData) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
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