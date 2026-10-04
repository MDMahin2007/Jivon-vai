import { validateContactInput } from "../utils/contactValidation.js";
import sendEmail from "../utils/sendEmail.js";

export const createContact = async (req, res) => {
  const input =
    req.body && typeof req.body === "object" && !Array.isArray(req.body)
      ? req.body
      : {};
  const validationError = validateContactInput(input);

  if (validationError) {
    return res.status(400).json({ success: false, message: validationError });
  }

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return res.status(503).json({
      success: false,
      message: "Contact email is not configured on the server.",
    });
  }

  try {
    await sendEmail({
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone.trim(),
      interest: typeof input.interest === "string" ? input.interest.trim() : "",
      message: input.message.trim(),
    });

    return res.status(200).json({
      success: true,
      message: "Your message has been sent successfully.",
    });
  } catch (error) {
    console.error("Unable to send contact email:", error.message);
    return res.status(502).json({
      success: false,
      message: "Unable to send your message right now. Please try again later.",
    });
  }
};