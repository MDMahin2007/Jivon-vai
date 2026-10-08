import { validateContactInput } from "../utils/contactValidation.js";
import sendEmail from "../utils/sendEmail.js";
import { saveContactMessage } from "../config/database.js";

export const createContact = async (req, res) => {
  const input =
    req.body && typeof req.body === "object" && !Array.isArray(req.body)
      ? req.body
      : {};
  const validationError = validateContactInput(input);

  if (validationError) {
    return res.status(400).json({ success: false, message: validationError });
  }

  const contactData = {
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    interest: typeof input.interest === "string" ? input.interest.trim() : "",
    message: input.message.trim(),
  };

  try {
    await saveContactMessage(contactData);
  } catch (error) {
    console.error("Unable to save contact message:", error.message);
    return res.status(503).json({
      success: false,
      message: "Unable to save your message right now. Please try again later.",
    });
  }

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return res.status(201).json({
      success: true,
      emailSent: false,
      message: "Your message has been saved successfully.",
    });
  }

  try {
    await sendEmail(contactData);

    return res.status(201).json({
      success: true,
      emailSent: true,
      message: "Your message has been saved successfully.",
    });
  } catch (error) {
    console.error("Unable to send contact email:", error.message);
    return res.status(201).json({
      success: true,
      emailSent: false,
      message: "Your message has been saved successfully.",
    });
  }
};