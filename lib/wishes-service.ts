import crypto from "crypto";
import { z } from "zod";
import { getDb } from "./mongodb";
import { ObjectId, Filter } from "mongodb";
import { RELATIONSHIP_OPTIONS, WishResponse } from "@/types/wishes";
export { RELATIONSHIP_OPTIONS };

export const wishInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(60, "Name must be 60 characters or fewer"),
  message: z
    .string()
    .trim()
    .min(1, "Message is required")
    .max(280, "Message must be 280 characters or fewer"),
  relationship: z
    .string()
    .trim()
    .max(50, "Relationship must be 50 characters or fewer")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  honeypot: z.string().max(0, "Bot detected").optional(),
});

export type WishInput = z.infer<typeof wishInputSchema>;

export interface WishDocument {
  _id?: ObjectId | string;
  name: string;
  message: string;
  relationship?: string;
  status: "approved" | "pending" | "hidden";
  createdAt: Date;
  ipHash: string;
}
export type { WishResponse };

// In-memory fallback if MONGODB_URI is not set during initial testing
const memoryWishes: WishDocument[] = [
  {
    _id: "seed-1",
    name: "A friend",
    message: "Happy 20th birthday samkiel. Keep building with intention. Watching your journey from the button phone days to now is inspiring.",
    relationship: "Friend",
    status: "approved",
    createdAt: new Date("2026-10-10T08:00:00Z"),
    ipHash: "seed",
  },
  {
    _id: "seed-2",
    name: "Fellow Dev",
    message: "Happy birthday bro. Excited for what chapter 20 brings for you and your startup. Keep raising the bar.",
    relationship: "Fellow developer",
    status: "approved",
    createdAt: new Date("2026-10-10T10:30:00Z"),
    ipHash: "seed",
  },
];

// In-memory rate limiting map
const ipRateLimits = new Map<string, number[]>();

export function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT || "samkiel_default_salt";
  return crypto.createHash("sha256").update(ip + salt).digest("hex");
}

export function checkRateLimit(ipHash: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const timestamps = ipRateLimits.get(ipHash) || [];
  const validTimestamps = timestamps.filter((t) => now - t < windowMs);

  if (validTimestamps.length >= 3) {
    return false;
  }

  validTimestamps.push(now);
  ipRateLimits.set(ipHash, validTimestamps);
  return true;
}

const PROFANITY_WORDS = [
  "fuck",
  "bitch",
  "asshole",
  "bastard",
  "shit",
  "cunt",
  "dick",
  "nigger",
  "faggot",
];

export function containsProfanity(text: string): boolean {
  const lower = text.toLowerCase();
  return PROFANITY_WORDS.some((word) =>
    new RegExp(`\\b${word}\\b`, "i").test(lower)
  );
}

export async function getApprovedWishes(
  page = 1,
  limit = 20
): Promise<{ wishes: WishResponse[]; total: number }> {
  const db = await getDb();

  if (db) {
    try {
      const collection = db.collection<WishDocument>("wishes");
      const total = await collection.countDocuments({ status: "approved" });
      const docs = await collection
        .find({ status: "approved" })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray();

      const wishes: WishResponse[] = docs.map((doc) => ({
        id: doc._id?.toString() || "",
        name: doc.name,
        message: doc.message,
        relationship: doc.relationship,
        status: doc.status,
        createdAt: doc.createdAt.toISOString(),
      }));

      return { wishes, total };
    } catch (err) {
      console.error("MongoDB query error:", err);
    }
  }

  // Fallback to memory
  const approved = memoryWishes
    .filter((w) => w.status === "approved")
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const total = approved.length;
  const slice = approved.slice((page - 1) * limit, page * limit);
  const wishes: WishResponse[] = slice.map((w) => ({
    id: typeof w._id === "string" ? w._id : w._id?.toString() || "",
    name: w.name,
    message: w.message,
    relationship: w.relationship,
    status: w.status,
    createdAt: w.createdAt.toISOString(),
  }));

  return { wishes, total };
}

export async function createWish(
  data: WishInput,
  ip: string
): Promise<{ success: boolean; wish?: WishResponse; error?: string }> {
  // 1. Honeypot check
  if (data.honeypot && data.honeypot.trim().length > 0) {
    return { success: false, error: "Submission rejected" };
  }

  // 2. Rate limit check
  const ipHash = hashIp(ip);
  if (!checkRateLimit(ipHash)) {
    return {
      success: false,
      error: "Rate limit reached. Maximum 3 letters per hour.",
    };
  }

  // 3. Profanity filter
  if (containsProfanity(data.name) || containsProfanity(data.message)) {
    return {
      success: false,
      error: "Your note contains flagged language. Please rephrase politely.",
    };
  }

  // 4. Default approval status
  const requireApproval = process.env.WISHES_REQUIRE_APPROVAL === "true";
  const status: "approved" | "pending" = requireApproval
    ? "pending"
    : "approved";

  const newDoc: WishDocument = {
    name: data.name,
    message: data.message,
    relationship: data.relationship || undefined,
    status,
    createdAt: new Date(),
    ipHash,
  };

  const db = await getDb();
  if (db) {
    try {
      const collection = db.collection<WishDocument>("wishes");
      const res = await collection.insertOne(newDoc);
      newDoc._id = res.insertedId;
    } catch (err) {
      console.error("MongoDB insert error:", err);
      // fallback push to memory if DB error
      newDoc._id = new ObjectId().toString();
      memoryWishes.unshift(newDoc);
    }
  } else {
    newDoc._id = `mem-${Date.now()}`;
    memoryWishes.unshift(newDoc);
  }

  return {
    success: true,
    wish: {
      id: newDoc._id ? newDoc._id.toString() : "",
      name: newDoc.name,
      message: newDoc.message,
      relationship: newDoc.relationship,
      status: newDoc.status,
      createdAt: newDoc.createdAt.toISOString(),
    },
  };
}

export async function getAllAdminWishes(statusFilter?: string): Promise<WishResponse[]> {
  const db = await getDb();
  if (db) {
    try {
      const collection = db.collection<WishDocument>("wishes");
      const query: Filter<WishDocument> =
        statusFilter === "approved" ||
        statusFilter === "pending" ||
        statusFilter === "hidden"
          ? { status: statusFilter }
          : {};
      const docs = await collection.find(query).sort({ createdAt: -1 }).toArray();
      return docs.map((doc) => ({
        id: doc._id?.toString() || "",
        name: doc.name,
        message: doc.message,
        relationship: doc.relationship,
        status: doc.status,
        createdAt: doc.createdAt.toISOString(),
      }));
    } catch (err) {
      console.error("MongoDB admin query error:", err);
    }
  }

  return memoryWishes
    .filter((w) => !statusFilter || statusFilter === "all" || w.status === statusFilter)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .map((w) => ({
      id: typeof w._id === "string" ? w._id : w._id?.toString() || "",
      name: w.name,
      message: w.message,
      relationship: w.relationship,
      status: w.status,
      createdAt: w.createdAt.toISOString(),
    }));
}

export async function updateWishStatus(
  id: string,
  status: "approved" | "pending" | "hidden"
): Promise<boolean> {
  const db = await getDb();
  if (db) {
    try {
      const collection = db.collection<WishDocument>("wishes");
      const res = await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status } }
      );
      return res.matchedCount > 0;
    } catch {
      // id might not be ObjectId in memory fallback
    }
  }

  const found = memoryWishes.find((w) => w._id?.toString() === id);
  if (found) {
    found.status = status;
    return true;
  }
  return false;
}

export async function deleteWish(id: string): Promise<boolean> {
  const db = await getDb();
  if (db) {
    try {
      const collection = db.collection<WishDocument>("wishes");
      const res = await collection.deleteOne({ _id: new ObjectId(id) });
      return res.deletedCount > 0;
    } catch {
      // fallback
    }
  }

  const idx = memoryWishes.findIndex((w) => w._id?.toString() === id);
  if (idx !== -1) {
    memoryWishes.splice(idx, 1);
    return true;
  }
  return false;
}
