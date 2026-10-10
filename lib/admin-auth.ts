import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "samkiel_admin_token";

function getSecretKey() {
  const secret = process.env.ADMIN_JWT_SECRET || "samkiel_default_development_secret_key_32chars";
  return new TextEncoder().encode(secret);
}

export async function createAdminToken(): Promise<string> {
  const secretKey = getSecretKey();
  return await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const secretKey = getSecretKey();
    const { payload } = await jwtVerify(token, secretKey);
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export async function isAuthenticatedAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return false;
  return await verifyAdminToken(token);
}
