import { MongoClient } from "mongodb";

const DATABASE_NAME = process.env.MONGODB_DB_NAME || "ArcformaStudio";
const CONTACT_COLLECTION = "contactMessages";

let contacts;

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is required to save contact messages.");
  }

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
  });
  await client.connect();

  const database = client.db(DATABASE_NAME);
  try {
    await database.createCollection(CONTACT_COLLECTION);
  } catch (error) {
    if (error.code !== 48) {
      await client.close();
      throw error;
    }
  }

  contacts = database.collection(CONTACT_COLLECTION);
  await contacts.createIndex(
    {
      emailNotification: 1,
      emailNextAttemptAt: 1,
      emailLeaseExpiresAt: 1,
    },
    { name: "contact_email_outbox" },
  );
  console.log(`Connected to MongoDB database "${DATABASE_NAME}".`);
}

export async function saveContactMessage(
  contactData,
  { emailConfigured } = {},
) {
  if (!contacts) {
    throw new Error("MongoDB is not connected.");
  }

  return contacts.insertOne({
    ...contactData,
    createdAt: new Date(),
    emailNotification: emailConfigured ? "pending" : "not_configured",
    emailAttempts: 0,
    emailNextAttemptAt: new Date(),
  });
}

export async function claimNextContactEmail() {
  if (!contacts) {
    throw new Error("MongoDB is not connected.");
  }

  const now = new Date();
  return contacts.findOneAndUpdate(
    {
      $or: [
        {
          emailNotification: "pending",
          emailNextAttemptAt: { $lte: now },
        },
        {
          emailNotification: "processing",
          emailLeaseExpiresAt: { $lte: now },
        },
      ],
    },
    {
      $set: {
        emailNotification: "processing",
        emailLeaseExpiresAt: new Date(now.getTime() + 30000),
      },
      $inc: { emailAttempts: 1 },
    },
    { returnDocument: "after" },
  );
}

export async function markContactEmailSent(messageId) {
  if (!contacts) {
    throw new Error("MongoDB is not connected.");
  }

  await contacts.updateOne(
    { _id: messageId },
    {
      $set: {
        emailNotification: "sent",
        emailSentAt: new Date(),
      },
      $unset: { emailLeaseExpiresAt: "", emailLastError: "" },
    },
  );
}

export async function markContactEmailFailed(message, error) {
  if (!contacts) {
    throw new Error("MongoDB is not connected.");
  }

  const terminal = message.emailAttempts >= 5;
  const retryDelays = [30000, 120000, 600000, 3600000];
  const retryDelay = retryDelays[message.emailAttempts - 1] || retryDelays.at(-1);

  await contacts.updateOne(
    { _id: message._id },
    {
      $set: {
        emailNotification: terminal ? "failed" : "pending",
        emailNextAttemptAt: new Date(Date.now() + retryDelay),
        emailLastError: error.message.slice(0, 500),
      },
      $unset: { emailLeaseExpiresAt: "" },
    },
  );
}
