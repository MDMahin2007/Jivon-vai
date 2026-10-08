import assert from "node:assert/strict";
import test from "node:test";
import {
  createEmailSender,
  isEmailConfigured,
} from "../src/utils/sendEmail.js";

const contactData = {
  name: "Arman Hosen",
  email: "arman@example.com",
  phone: "+8801882111979",
  interest: "Architecture",
  message: "I would like to discuss a design project.",
};

test("sends production email through the Resend HTTPS API", async () => {
  let request;
  const sendEmail = createEmailSender({
    env: {
      EMAIL_PROVIDER: "resend",
      RESEND_API_KEY: "test-api-key",
      EMAIL_FROM: "Arcforma <contact@example.com>",
      CONTACT_RECIPIENT: "studio@example.com",
    },
    fetchImpl: async (url, options) => {
      request = { url, options };
      return { ok: true, status: 200 };
    },
  });

  await sendEmail(contactData);

  assert.equal(request.url, "https://api.resend.com/emails");
  assert.equal(request.options.method, "POST");
  assert.equal(request.options.headers.Authorization, "Bearer test-api-key");
  const payload = JSON.parse(request.options.body);
  assert.equal(payload.from, "Arcforma <contact@example.com>");
  assert.deepEqual(payload.to, ["studio@example.com"]);
  assert.equal(payload.reply_to, "arman@example.com");
  assert.equal(payload.subject, "New Contact Form Message");
  assert.match(payload.text, /I would like to discuss a design project\./);
});

test("throws when the Resend API rejects an email", async () => {
  const sendEmail = createEmailSender({
    env: {
      EMAIL_PROVIDER: "resend",
      RESEND_API_KEY: "test-api-key",
      EMAIL_FROM: "Arcforma <contact@example.com>",
    },
    fetchImpl: async () => ({ ok: false, status: 403 }),
  });

  await assert.rejects(sendEmail(contactData), /Resend API returned HTTP 403/);
});

test("keeps Gmail SMTP available for local development", async () => {
  let transportOptions;
  const sent = [];
  const sendEmail = createEmailSender({
    env: {
      EMAIL_PROVIDER: "gmail",
      EMAIL_USER: "studio@gmail.com",
      EMAIL_PASS: "local-app-password",
    },
    createTransport: (options) => {
      transportOptions = options;
      return { sendMail: async (message) => sent.push(message) };
    },
  });

  await sendEmail(contactData);
  await sendEmail(contactData);

  assert.equal(transportOptions.auth.user, "studio@gmail.com");
  assert.equal(transportOptions.connectionTimeout, 10000);
  assert.equal(transportOptions.greetingTimeout, 10000);
  assert.equal(transportOptions.socketTimeout, 10000);
  assert.equal(sent.length, 2);
  assert.equal(sent[0].to, "arcjibon750@gmail.com");
});

test("validates required credentials for the selected email provider", () => {
  assert.equal(
    isEmailConfigured({
      EMAIL_PROVIDER: "resend",
      RESEND_API_KEY: "test-api-key",
      EMAIL_FROM: "contact@example.com",
    }),
    true,
  );
  assert.equal(
    isEmailConfigured({
      EMAIL_PROVIDER: "resend",
      RESEND_API_KEY: "test-api-key",
    }),
    false,
  );
  assert.equal(
    isEmailConfigured({
      EMAIL_PROVIDER: "gmail",
      EMAIL_USER: "studio@gmail.com",
      EMAIL_PASS: "app-password",
    }),
    true,
  );
});
