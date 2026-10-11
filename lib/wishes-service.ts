import crypto from "crypto";
import { z } from "zod";
import { getDb } from "./mongodb";
import { ObjectId, Filter } from "mongodb";
import { RELATIONSHIP_OPTIONS, WishResponse } from "@/types/wishes";
export { RELATIONSHIP_OPTIONS };

export const MIN_NAME_LENGTH = 2;
export const MAX_NAME_LENGTH = 60;
export const MIN_MESSAGE_LENGTH = 10;
export const MAX_MESSAGE_LENGTH = 280;

export const wishInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(MIN_NAME_LENGTH, `name must be at least ${MIN_NAME_LENGTH} characters`)
    .max(MAX_NAME_LENGTH, `keep it under ${MAX_NAME_LENGTH} characters`),
  message: z
    .string()
    .trim()
    .min(MIN_MESSAGE_LENGTH, `wish must be at least ${MIN_MESSAGE_LENGTH} characters`)
    .max(MAX_MESSAGE_LENGTH, `keep it under ${MAX_MESSAGE_LENGTH} characters`),
  relationship: z
    .string()
    .trim()
    .max(50, "relationship must be 50 characters or fewer")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  honeypot: z.string().max(0, "bot detected").optional(),
});

export type WishInput = z.infer<typeof wishInputSchema>;

const SHORT_CODE_CHARS = "abcdefghijklmnopqrstuvwxyz";

export function generateShortCode(): string {
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += SHORT_CODE_CHARS.charAt(
      Math.floor(Math.random() * SHORT_CODE_CHARS.length)
    );
  }
  return code;
}

export function getWishCode(doc: {
  _id?: ObjectId | string;
  id?: string;
  code?: string;
}): string {
  if (doc.code && doc.code.trim().length === 4) {
    return doc.code.toLowerCase();
  }
  const idStr =
    doc.id ||
    (typeof doc._id === "string" ? doc._id : doc._id?.toString()) ||
    "seed";
  if (idStr === "seed-1") return "ghry";
  if (idStr === "seed-2") return "kiel";

  const hash = crypto.createHash("md5").update(idStr).digest("hex");
  let code = "";
  for (let i = 0; i < 4; i++) {
    const val = parseInt(hash.slice(i * 2, i * 2 + 2), 16);
    code += SHORT_CODE_CHARS[val % SHORT_CODE_CHARS.length];
  }
  return code;
}

export interface WishDocument {
  _id?: ObjectId | string;
  code?: string;
  name: string;
  message: string;
  relationship?: string;
  status: "approved" | "pending" | "hidden";
  createdAt: Date;
  ipHash: string;
}
export type { WishResponse };

// In-memory fallback (empty - only real wishes submitted by users are stored and shown)
const memoryWishes: WishDocument[] = [];

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

/**
 * Spam detector: validates minimum character thresholds and flags repetitive / low-entropy spam.
 */
export function detectSpam(
  name: string,
  message: string
): { isSpam: boolean; reason?: string } {
  const trimmedName = name.trim();
  const trimmedMessage = message.trim();

  // 1. Minimum character length validation
  if (trimmedName.length < MIN_NAME_LENGTH) {
    return {
      isSpam: true,
      reason: `name must be at least ${MIN_NAME_LENGTH} characters`,
    };
  }
  if (trimmedMessage.length < MIN_MESSAGE_LENGTH) {
    return {
      isSpam: true,
      reason: `wish must be at least ${MIN_MESSAGE_LENGTH} characters`,
    };
  }

  // 2. Repetitive character spam (e.g., "aaaaaaaaa", "hahahahahaha" repeating characters 7+ times)
  if (/(.)\1{6,}/i.test(trimmedMessage)) {
    return {
      isSpam: true,
      reason: "message flagged as spam: repetitive characters",
    };
  }

  // 3. Low character diversity spam for messages >= minimum length (e.g., "asdasdasdasd")
  const alphaChars = trimmedMessage.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (alphaChars.length >= MIN_MESSAGE_LENGTH) {
    const uniqueChars = new Set(alphaChars).size;
    if (uniqueChars < 3) {
      return {
        isSpam: true,
        reason: "message flagged as spam: low character variation",
      };
    }
  }

  return { isSpam: false };
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
        code: getWishCode(doc),
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
    code: getWishCode(w),
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
    return { success: false, error: "submission rejected" };
  }

  // 2. Spam detection (character length thresholds & repetitive patterns)
  const spamCheck = detectSpam(data.name, data.message);
  if (spamCheck.isSpam) {
    return { success: false, error: spamCheck.reason || "submission flagged as spam" };
  }

  // 3. Rate limit check
  const ipHash = hashIp(ip);
  if (!checkRateLimit(ipHash)) {
    return {
      success: false,
      error: "easy, max 3 letters an hour",
    };
  }

  // 3. Profanity filter
  if (containsProfanity(data.name) || containsProfanity(data.message)) {
    return {
      success: false,
      error: "that has some flagged words in it, try rephrasing",
    };
  }

  // 4. Default approval status
  const requireApproval = process.env.WISHES_REQUIRE_APPROVAL === "true";
  const status: "approved" | "pending" = requireApproval
    ? "pending"
    : "approved";

  let code = generateShortCode();

  const newDoc: WishDocument = {
    code,
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
      let attempts = 0;
      while (attempts < 5 && (await collection.countDocuments({ code })) > 0) {
        code = generateShortCode();
        attempts++;
      }
      newDoc.code = code;
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
      code: getWishCode(newDoc),
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
        code: getWishCode(doc),
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
      code: getWishCode(w),
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

export async function getWishByCode(
  rawCode: string
): Promise<WishResponse | null> {
  const code = rawCode.trim().toLowerCase();
  if (!code) return null;

  const db = await getDb();
  if (db) {
    try {
      const collection = db.collection<WishDocument>("wishes");

      // 1. Direct code search
      const doc = await collection.findOne({
        code,
        status: "approved",
      });
      if (doc) {
        return {
          id: doc._id?.toString() || "",
          code: getWishCode(doc),
          name: doc.name,
          message: doc.message,
          relationship: doc.relationship,
          status: doc.status,
          createdAt: doc.createdAt.toISOString(),
        };
      }

      // 2. Direct ID search if valid ObjectId
      if (ObjectId.isValid(rawCode)) {
        const idDoc = await collection.findOne({
          _id: new ObjectId(rawCode),
          status: "approved",
        });
        if (idDoc) {
          return {
            id: idDoc._id?.toString() || "",
            code: getWishCode(idDoc),
            name: idDoc.name,
            message: idDoc.message,
            relationship: idDoc.relationship,
            status: idDoc.status,
            createdAt: idDoc.createdAt.toISOString(),
          };
        }
      }

      // 3. Scan approved docs for deterministic code fallback
      const allApproved = await collection
        .find({ status: "approved" })
        .limit(500)
        .toArray();
      const matched = allApproved.find((d) => getWishCode(d) === code);
      if (matched) {
        return {
          id: matched._id?.toString() || "",
          code: getWishCode(matched),
          name: matched.name,
          message: matched.message,
          relationship: matched.relationship,
          status: matched.status,
          createdAt: matched.createdAt.toISOString(),
        };
      }
    } catch (err) {
      console.error("MongoDB getWishByCode error:", err);
    }
  }

  // Fallback to memory
  const memDoc = memoryWishes.find(
    (w) =>
      w.status === "approved" &&
      (getWishCode(w) === code ||
        w._id?.toString() === rawCode ||
        w.code === code)
  );
  if (memDoc) {
    return {
      id:
        typeof memDoc._id === "string"
          ? memDoc._id
          : memDoc._id?.toString() || "",
      code: getWishCode(memDoc),
      name: memDoc.name,
      message: memDoc.message,
      relationship: memDoc.relationship,
      status: memDoc.status,
      createdAt: memDoc.createdAt.toISOString(),
    };
  }

  return null;
}
