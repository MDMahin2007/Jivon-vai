let wakeWorker = () => {};

export function setEmailOutboxWakeHandler(handler) {
  wakeWorker = handler;
}

export function wakeEmailOutbox() {
  wakeWorker();
}
