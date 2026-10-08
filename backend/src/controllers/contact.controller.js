import { validateContactInput } from "../utils/contactValidation.js";
import sendEmail from "../utils/sendEmail.js";
import { saveContactMessage } from "../config/database.js";

export function createContactHandler({
  saveMessage = saveContactMessage,
  notifyByEmail = sendEmail,
  hasEmailCredentials = () =>
    Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS),
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

    if (!emailConfigured) {
      logger.error(
        "CRITICAL: EMAIL_USER or EMAIL_PASS environment variables are missing on Render Server!"
      );
    }

    // 2. Immediate Email Call with Await (Fail hole precise console log dibe)
    if (emailConfigured) {
      try {
        await notifyByEmail(contactData);
        logger.log("Email sent successfully to recipient.");
      } catch (error) {
        logger.error("Unable to send contact email:", error.message);
      }
    }

    return res.status(201).json({
      success: true,
      emailNotification: emailConfigured ? "sent" : "not_configured",
      message: "Your message has been saved successfully.",
    });
  };
}

export const createContact = createContactHandler();


// const emailConfigured = hasEmailCredentials();
//     if (!emailConfigured) {
//       logger.error(
//         "Contact message saved, but email notification is not configured.",
//       );
//     }
//     res.status(201).json({
//       success: true,
//       emailNotification: emailConfigured ? "sending" : "not_configured",
//       message: "Your message has been saved successfully.",
//     });

//     if (emailConfigured) {
//       void Promise.resolve()
//         .then(() => notifyByEmail(contactData))
//         .catch((error) => {
//           logger.error("Unable to send contact email:", error.message);
//         });
//     }
//   };
// }

// export const createContact = createContactHandler();