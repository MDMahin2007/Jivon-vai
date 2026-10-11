import assert from "node:assert/strict";
import test from "node:test";
import { createEmailOutboxWorker } from "../src/utils/emailOutbox.js";

test("sends queued messages and records successful delivery", async () => {
  const message = { _id: "message-id", email: "client@example.com" };
  const sent = [];
  const markedSent = [];
  let resolveDelivery;
  const delivery = new Promise((resolve) => {
    resolveDelivery = resolve;
  });
  let claimed = false;
  const worker = createEmailOutboxWorker({
    claimNext: async () => {
      if (claimed) {
        return null;
      }
      claimed = true;
      return message;
    },
    sendEmail: async (contact) => sent.push(contact),
    markSent: async (id) => {
      markedSent.push(id);
      resolveDelivery();
    },
    markFailed: assert.fail,
    retryIntervalMs: 60000,
  });

  worker.start();
  await delivery;
  worker.stop();

  assert.deepEqual(sent, [message]);
  assert.deepEqual(markedSent, ["message-id"]);
});

test("records delivery failures for retry without stopping the worker", async () => {
  const message = { _id: "message-id", emailAttempts: 1 };
  const failures = [];
  let resolveFailure;
  const failureRecorded = new Promise((resolve) => {
    resolveFailure = resolve;
  });
  let claimed = false;
  const worker = createEmailOutboxWorker({
    claimNext: async () => {
      if (claimed) {
        return null;
      }
      claimed = true;
      return message;
    },
    sendEmail: async () => {
      throw new Error("Email provider unavailable");
    },
    markSent: assert.fail,
    markFailed: async (failedMessage, error) => {
      failures.push({ failedMessage, error });
      resolveFailure();
    },
    logger: { error() {} },
    retryIntervalMs: 60000,
  });

  worker.start();
  await failureRecorded;
  worker.stop();

  assert.equal(failures.length, 1);
  assert.equal(failures[0].failedMessage, message);
  assert.match(failures[0].error.message, /provider unavailable/i);
});
