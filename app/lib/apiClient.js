import axios from "axios";

const defaultAuthExemptRoutes = [
  "/api/login",
  "/api/register",
  "/api/verify-otp",
  "/api/resend-otp",
  "/api/forgot-password",
  "/api/reset-password",
  "/api/refresh",
  "/api/admin/login",
  "/api/admin/verify-otp",
  "/api/admin/resend-otp",
];

function isAuthExempt(url = "", authExemptRoutes) {
  return authExemptRoutes.some((route) => url.includes(route));
}

export function createApiClient({ getAccessToken, setAccessToken, onAuthFailure, authExemptRoutes }) {
  const api = axios.create({ baseURL: "", withCredentials: true });
  const exemptRoutes = authExemptRoutes || defaultAuthExemptRoutes;

  let isRefreshing = false;
  let queued = [];

  const processQueue = (error, token) => {
    queued.forEach(({ resolve, reject }) => {
      if (error) reject(error);
      else resolve(token);
    });
    queued = [];
  };

  const requestInterceptor = api.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  const responseInterceptor = api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      const status = error.response?.status;

      if (!originalRequest || status !== 401) {
        return Promise.reject(error);
      }

      if (isAuthExempt(originalRequest.url, exemptRoutes)) {
        return Promise.reject(error);
      }

      if (originalRequest._retry) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queued.push({ resolve, reject });
        }).then((token) => {
          if (token) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return api(originalRequest);
        });
      }

      isRefreshing = true;
      try {
        const refreshResponse = await axios.post("/api/refresh", {}, { withCredentials: true });
        const newToken = refreshResponse.data?.accessToken || "";
        setAccessToken(newToken);
        processQueue(null, newToken);

        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        if (onAuthFailure) {
          onAuthFailure(refreshError);
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
  );

  const cleanup = () => {
    api.interceptors.request.eject(requestInterceptor);
    api.interceptors.response.eject(responseInterceptor);
  };

  return { api, cleanup };
}
