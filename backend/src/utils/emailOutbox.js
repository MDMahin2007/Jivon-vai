export function createEmailOutboxWorker({
  claimNext,
  sendEmail,
  markSent,
  markFailed,
  logger = console,
  retryIntervalMs = 60000,
}) {
  let timer;
  let stopped = true;
  let processing = false;

  const schedule = (delay = retryIntervalMs) => {
    if (stopped || timer) {
      return;
    }

    timer = setTimeout(() => {
      timer = undefined;
      void processQueue();
    }, delay);
    timer.unref?.();
  };

  const processQueue = async () => {
    if (stopped || processing) {
      return;
    }

    processing = true;
    let processedMessage = false;

    try {
      while (!stopped) {
        const message = await claimNext();
        if (!message) {
          break;
        }

        processedMessage = true;
        try {
          await sendEmail(message);
          await markSent(message._id);
        } catch (error) {
          try {
            await markFailed(message, error);
          } catch (updateError) {
            logger.error(
              "Unable to update contact email delivery status:",
              updateError.message,
            );
          }
          logger.error("Unable to send contact email:", error.message);
        }
      }
    } catch (error) {
      logger.error("Unable to process contact email outbox:", error.message);
    } finally {
      processing = false;
      schedule(processedMessage ? 0 : retryIntervalMs);
    }
  };

  return {
    start() {
      stopped = false;
      schedule(0);
    },
    stop() {
      stopped = true;
      clearTimeout(timer);
      timer = undefined;
    },
    wake() {
      if (stopped) {
        return;
      }
      clearTimeout(timer);
      timer = undefined;
      schedule(0);
    },
  };
}
