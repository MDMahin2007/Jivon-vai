import { validateContactInput } from "../utils/contactValidation.js";
import sendEmail, { isEmailConfigured } from "../utils/sendEmail.js";
import { saveContactMessage } from "../config/database.js";

export function createContactHandler({
  saveMessage = saveContactMessage,
  notifyByEmail = sendEmail,
  hasEmailCredentials = isEmailConfigured,
  logger = console,
} = {}) {
  return async (req, res) => {
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
      await saveMessage(contactData);
    } catch (error) {
      logger.error("Unable to save contact message:", error.message);
      return res.status(503).json({
        success: false,
        message: "Unable to save your message right now. Please try again later.",
      });
    }

    const emailConfigured = hasEmailCredentials();
    let emailNotification = emailConfigured ? "failed" : "not_configured";

    if (!emailConfigured) {
      logger.error(
        "Contact message saved, but email provider configuration is missing or invalid.",
      );
    } else {
      try {
        await notifyByEmail(contactData);
        emailNotification = "sent";
      } catch (error) {
        logger.error("Unable to send contact email:", error.message);
      }
    }

    return res.status(201).json({
      success: true,
      emailNotification,
      message: "Your message has been saved successfully.",
    });
  };
}

export const createContact = createContactHandler();
