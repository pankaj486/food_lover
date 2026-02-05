export function login(api, payload) {
  return api.post("/api/login", payload);
}

export function register(api, payload) {
  return api.post("/api/register", payload);
}

export function resendOtp(api, payload) {
  return api.post("/api/resend-otp", payload);
}

export function verifyOtp(api, payload) {
  return api.post("/api/verify-otp", payload);
}

export function adminLogin(api, payload) {
  return api.post("/api/admin/login", payload);
}

export function adminResendOtp(api, payload) {
  return api.post("/api/admin/resend-otp", payload);
}

export function adminVerifyOtp(api, payload) {
  return api.post("/api/admin/verify-otp", payload);
}
