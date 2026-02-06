"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { createApiClient } from "../lib/apiClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [accessToken, setAccessTokenState] = useState("");
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

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

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const response = await apiRef.current.post("/api/refresh");
        const newToken = response.data?.accessToken || "";
        
        if (newToken) {
          setAccessToken(newToken);
          
          try {
            const userResponse = await apiRef.current.get("/api/protected");
            if (userResponse.data?.user) {
              setUser(userResponse.data.user);
            }
          } catch (err) {
            console.error("Failed to fetch user profile:", err);
          }
        }
      } catch (error) {
        console.log("No valid session to restore");
      } finally {
        setIsInitializing(false);
      }
    };

    restoreSession();
  }, [setAccessToken]);

  const value = useMemo(
    () => ({
      accessToken,
      setAccessToken,
      user,
      setUser,
      api: apiRef.current,
      isInitializing,
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
    [accessToken, setAccessToken, user, isInitializing]
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
