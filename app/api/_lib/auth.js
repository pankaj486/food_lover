import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const ACCESS_TOKEN_TTL = "30s";
const REFRESH_TOKEN_TTL = "7d";

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
  accessTtlSeconds: 30,
  refreshTtlDays: 7,
};
