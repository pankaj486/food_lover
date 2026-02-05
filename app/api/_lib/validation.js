export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export function isValidEmail(email) {
  return emailRegex.test(email);
}

export function normalizeOtp(code) {
  return String(code || "").trim();
}

export function isValidOtp(code) {
  return /^\d{6}$/.test(code);
}

export function isValidPassword(password) {
  return String(password || "").length >= 8;
}
