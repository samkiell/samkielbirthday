import { MongoClient, Db } from "mongodb";
import dns from "node:dns";

// Fix for Windows / ISP DNS refusing SRV queries (ECONNREFUSED) for mongodb+srv
try {
  dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
} catch {
  // Ignore in environments where setting DNS servers is restricted
}

const uri = process.env.MONGODB_URI;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function createClientPromise(connectionUri: string): Promise<MongoClient> {
  const client = new MongoClient(connectionUri, {
    connectTimeoutMS: 10000,
    serverSelectionTimeoutMS: 10000,
  });
  return client.connect();
}

function getClientPromise(): Promise<MongoClient> | null {
  if (!uri) {
    return null;
  }
  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      global._mongoClientPromise = createClientPromise(uri);
    }
    return global._mongoClientPromise;
  }
  return createClientPromise(uri);
}

let clientPromise: Promise<MongoClient> | null = getClientPromise();

export async function getDb(): Promise<Db | null> {
  if (!uri) {
    return null;
  }

  try {
    if (!clientPromise) {
      clientPromise = getClientPromise();
    }
    if (!clientPromise) {
      return null;
    }
    const client = await clientPromise;
    return client.db("samkielbirthday");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    // Reset cached promise so subsequent requests can re-attempt connecting cleanly
    clientPromise = null;
    if (typeof global !== "undefined") {
      global._mongoClientPromise = undefined;
    }
    return null;
  }
}

export default clientPromise;
