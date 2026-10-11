import "dotenv/config";
import app from "./app.js";
import {
    claimNextContactEmail,
    connectDatabase,
    markContactEmailFailed,
    markContactEmailSent,
} from "./src/config/database.js";
import { createEmailOutboxWorker } from "./src/utils/emailOutbox.js";
import { setEmailOutboxWakeHandler } from "./src/utils/emailOutboxRuntime.js";
import sendEmail, { isEmailConfigured } from "./src/utils/sendEmail.js";

const PORT = process.env.PORT || 5000;

await connectDatabase();

if (isEmailConfigured()) {
    const emailOutbox = createEmailOutboxWorker({
        claimNext: claimNextContactEmail,
        sendEmail,
        markSent: markContactEmailSent,
        markFailed: markContactEmailFailed,
    });
    setEmailOutboxWakeHandler(() => emailOutbox.wake());
    emailOutbox.start();
} else {
    console.error("Contact email delivery is disabled: provider configuration is missing or invalid.");
}

app.listen(PORT, () => {
    console.log(`Contact API running on port ${PORT}`);
});