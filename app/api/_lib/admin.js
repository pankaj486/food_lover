import { verifyAccessToken } from "./auth";

function getAdminEmails() {
  const raw = process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || "";
  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email) {
  const adminEmails = getAdminEmails();
  if (adminEmails.length === 0) return false;
  const normalized = String(email || "").trim().toLowerCase();
  return Boolean(normalized && adminEmails.includes(normalized));
}

export function requireAdmin(request) {
  const authHeader = request.headers.get("authorization") || "";
  const [, token] = authHeader.split(" ");

  if (!token) {
    return { ok: false, status: 401, message: "Missing access token" };
  }

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch (error) {
    return { ok: false, status: 401, message: "Access token invalid or expired" };
  }

  const configCheck = requireAdminConfigured();
  if (!configCheck.ok) {
    return configCheck;
  }

  if (!isAdminEmail(payload.email)) {
    return { ok: false, status: 403, message: "Admin access required" };
  }

  return { ok: true, payload };
}

export function requireAdminConfigured() {
  const adminEmails = getAdminEmails();
  if (adminEmails.length === 0) {
    return { ok: false, status: 403, message: "Admin access is not configured" };
  }
  return { ok: true };
}
