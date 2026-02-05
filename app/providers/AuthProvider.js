"use client";

import axios from "axios";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState("");
  const [user, setUser] = useState(null);

  const accessTokenRef = useRef("");
  useEffect(() => {
    accessTokenRef.current = accessToken;
  }, [accessToken]);

  const apiRef = useRef(null);
  if (!apiRef.current) {
    apiRef.current = axios.create({ baseURL: "", withCredentials: true });
  }

  useEffect(() => {
    const api = apiRef.current;
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
      const token = accessTokenRef.current;
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

        if (originalRequest.url?.includes("/api/login") || originalRequest.url?.includes("/api/refresh")) {
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
          setAccessToken("");
          setUser(null);
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  const value = useMemo(
    () => ({
      accessToken,
      setAccessToken,
      user,
      setUser,
      api: apiRef.current,
      logout: async () => {
        try {
          await apiRef.current.post("/api/logout");
        } catch (error) {
          // Ignore logout errors, clear local state anyway.
        }
        setAccessToken("");
        setUser(null);
      },
    }),
    [accessToken, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
