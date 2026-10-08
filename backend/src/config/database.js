import { MongoClient } from "mongodb";

const DATABASE_NAME = process.env.MONGODB_DB_NAME || "ArcformaStudio";
const CONTACT_COLLECTION = "contactMessages";

let contacts;

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is required to save contact messages.");
  }

  const client = new MongoClient(uri);
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
  console.log(`Connected to MongoDB database "${DATABASE_NAME}".`);
}

export async function saveContactMessage(contactData) {
  if (!contacts) {
    throw new Error("MongoDB is not connected.");
  }

  return contacts.insertOne({
    ...contactData,
    createdAt: new Date(),
  });
}
