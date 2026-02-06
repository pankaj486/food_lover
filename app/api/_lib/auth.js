import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const ACCESS_TOKEN_TTL = process.env.ACCESS_TOKEN_TTL || "20m";
const REFRESH_TOKEN_TTL = process.env.REFRESH_TOKEN_TTL || "7d";

const parseAccessTtl = (ttl) => {
  const match = String(ttl).match(/^(\d+)([smhd])$/);
  if (!match) return 1200; 
  const [, value, unit] = match;
  const multipliers = { s: 1, m: 60, h: 3600, d: 86400 };
  return parseInt(value) * (multipliers[unit] || 60);
};

const basePayload = {
  iss: "my-next-app",
  aud: "mermaid-demo",
};

export function signAccessToken(user) {
  return jwt.sign(
    {
      ...basePayload,
      sub: user.id,
      email: user.email,
      scope: ["read:protected"],
    },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_TTL }
  );
}

export function signRefreshToken(user) {
  return jwt.sign(
    {
      ...basePayload,
      sub: user.id,
      tokenType: "refresh",
    },
    JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_TTL }
  );
}

export function verifyAccessToken(token) {
  return jwt.verify(token, JWT_SECRET, {
    issuer: basePayload.iss,
    audience: basePayload.aud,
  });
}

export function verifyRefreshToken(token) {
  const payload = jwt.verify(token, JWT_SECRET, {
    issuer: basePayload.iss,
    audience: basePayload.aud,
  });

  if (payload.tokenType !== "refresh") {
    const error = new Error("Invalid refresh token.");
    error.code = "INVALID_REFRESH";
    throw error;
  }

  return payload;
}

export const tokenConfig = {
  accessTtlSeconds: parseAccessTtl(ACCESS_TOKEN_TTL),
  refreshTtlDays: 7,
};

const rawOtpTtl = Number(process.env.OTP_TTL_MINUTES || 10);
const rawOtpGrace = Number(process.env.OTP_GRACE_SECONDS || 120);

export const otpConfig = {
  ttlMinutes: Number.isFinite(rawOtpTtl) && rawOtpTtl > 0 ? rawOtpTtl : 10,
  devMode: process.env.OTP_DEV_MODE === "true",
  graceSeconds: Number.isFinite(rawOtpGrace) && rawOtpGrace >= 0 ? rawOtpGrace : 120,
};
