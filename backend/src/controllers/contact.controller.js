import { validateContactInput } from "../utils/contactValidation.js";
import { isEmailConfigured } from "../utils/sendEmail.js";
import { saveContactMessage } from "../config/database.js";
import { wakeEmailOutbox } from "../utils/emailOutboxRuntime.js";

export function createContactHandler({
  saveMessage = saveContactMessage,
  hasEmailCredentials = isEmailConfigured,
  wakeEmailOutbox: wakeOutbox = wakeEmailOutbox,
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
    const emailConfigured = hasEmailCredentials();

    try {
      await saveMessage(contactData, { emailConfigured });
    } catch (error) {
      logger.error("Unable to save contact message:", error.message);
      return res.status(503).json({
        success: false,
        message: "Unable to save your message right now. Please try again later.",
      });
    }

    if (!emailConfigured) {
      logger.error(
        "Contact message saved, but email provider configuration is missing or invalid.",
      );
    } else {
      wakeOutbox();
    }

    return res.status(201).json({
      success: true,
      emailNotification: emailConfigured ? "pending" : "not_configured",
      message: emailConfigured
        ? "Your message has been saved and its email notification is queued."
        : "Your message has been saved, but email notification is not configured.",
    });
  };
}

export const createContact = createContactHandler();
