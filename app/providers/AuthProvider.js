"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { createApiClient } from "../lib/apiClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [accessToken, setAccessTokenState] = useState("");
  const [user, setUser] = useState(null);

  const accessTokenRef = useRef("");
  const apiRef = useRef(null);
  const cleanupRef = useRef(null);
  const setAccessToken = useCallback((token) => {
    const nextToken = token || "";
    accessTokenRef.current = nextToken;
    setAccessTokenState(nextToken);
    if (apiRef.current) {
      if (nextToken) {
        apiRef.current.defaults.headers.common.Authorization = `Bearer ${nextToken}`;
      } else {
        delete apiRef.current.defaults.headers.common.Authorization;
      }
    }
  }, []);

  const handleAuthFailure = useCallback(() => {
    setAccessToken("");
    setUser(null);
  }, [setAccessToken, setUser]);

  if (!apiRef.current) {
    const { api, cleanup } = createApiClient({
      getAccessToken: () => accessTokenRef.current,
      setAccessToken,
      onAuthFailure: handleAuthFailure,
    });
    apiRef.current = api;
    cleanupRef.current = cleanup;
  }

  useEffect(
    () => () => {
      if (cleanupRef.current) cleanupRef.current();
    },
    []
  );

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
          toast.success("Logged out");
        } catch (error) {
          // Ignore logout errors, clear local state anyway.
          toast.error("Logout failed");
        }
        setAccessToken("");
        setUser(null);
      },
    }),
    [accessToken, setAccessToken, user]
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
