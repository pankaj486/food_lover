"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Mermaid from "./components/Mermaid";
import { useAuth } from "./providers/AuthProvider";

const clientFlow = `flowchart TB
    User[User]
    App[React App]
    Browser[Browser Cookies]

    User -->|Open App / Login| App

    %% Login
    App -->|Submit credentials| App_Login[Call Login API]
    App_Login -->|Receive Access Token| App
    App_Login -->|Refresh Token stored| Browser
    App -->|Store Access Token in memory| App

    %% API Calls
    App -->|Call protected API| App_API[Attach Access Token]
    App_API -->|Send request| API_Response[Wait for response]

    %% Success
    API_Response -->|200 OK| App

    %% Token Expired
    API_Response -->|401 Unauthorized| App_401[Axios Interceptor]
    App_401 -->|Call Refresh API| Refresh_Call
    Browser -->|Send Refresh Token cookie| Refresh_Call
    Refresh_Call -->|Receive new Access Token| App
    App -->|Retry original request| App_API
`;

const apiFlow = `flowchart TB
    API[Backend API]

    %% Login Flow
    API --> Login[Login Endpoint]
    Login -->|Validate credentials| Auth_Check
    Auth_Check -->|Valid| Token_Issue
    Auth_Check -->|Invalid| Auth_Fail[401 Unauthorized]

    Token_Issue -->|Generate Access Token| Access_Token
    Token_Issue -->|Generate Refresh Token| Refresh_Token
    Refresh_Token -->|Set HttpOnly Cookie| Cookie_Set
    Access_Token -->|Return to client| Client_Response

    %% Protected API
    API --> Protected[Protected Endpoint]
    Protected -->|Verify Access Token| Token_Check
    Token_Check -->|Valid| Data_Response[Return data]
    Token_Check -->|Expired| Token_Expired[401 Unauthorized]

    %% Refresh Flow
    API --> Refresh[Refresh Token Endpoint]
    Refresh -->|Read Refresh Token cookie| Refresh_Check
    Refresh_Check -->|Valid| New_Tokens
    Refresh_Check -->|Invalid| Refresh_Fail[403 Forbidden]

    New_Tokens -->|Rotate Refresh Token| Cookie_Update
    New_Tokens -->|Issue new Access Token| New_Access
    New_Access -->|Return to client| Retry_Allowed
`;

export default function Home() {
  const { accessToken, user, setAccessToken, api, logout } = useAuth();
  const [status, setStatus] = useState("Idle");
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    setLogs((prev) => [
      { id: crypto.randomUUID(), message, time: new Date().toLocaleTimeString() },
      ...prev,
    ]);
  };

  const tokenPreview = useMemo(() => {
    if (!accessToken) return "No access token";
    return `${accessToken.slice(0, 16)}...${accessToken.slice(-12)}`;
  }, [accessToken]);

  const refreshToken = async () => {
    addLog("Calling /api/refresh with refresh token cookie");

    try {
      const response = await api.post("/api/refresh");
      setAccessToken(response.data.accessToken || "");
      addLog("Refresh successful. New access token stored in memory.");
      return response.data.accessToken;
    } catch (error) {
      addLog("Refresh token invalid. User must login again.");
      setAccessToken("");
      return null;
    }
  };

  const callProtected = async () => {
    if (!accessToken) {
      addLog("No access token in memory. Login first.");
      setStatus("Unauthorized");
      return;
    }

    setStatus("Calling protected API...");
    addLog("Calling /api/protected with Authorization header");

    try {
      const response = await api.get("/api/protected");
      addLog(`Protected data received: ${response.data.message}`);
      setStatus("Success");
    } catch (error) {
      if (error.response?.status === 401) {
        addLog("Access token expired. Axios interceptor triggered refresh.");
        setStatus("Refreshing");
        return;
      }
      addLog("Protected API call failed.");
      setStatus("Request failed");
    }
  };

  const clearAccessToken = () => {
    setAccessToken("");
    addLog("Access token cleared from memory.");
    setStatus("Idle");
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#d8f3dc_0%,#fefae0_35%,#edf6f9_70%,#ffffff_100%)] text-emerald-950">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12">
        <header className="flex flex-col gap-6">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-600">
            Auth Flow Visualizer
          </p>
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <h1 className="text-4xl font-semibold leading-tight text-emerald-950">
                Login + refresh token flow, wired end-to-end.
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-emerald-800">
                This demo renders your Mermaid diagrams, connects a working Next.js API
                for login/refresh/protected endpoints, and shows a client-side flow with
                access tokens stored in memory and refresh tokens in HttpOnly cookies.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/login"
                  className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700"
                >
                  Go to Login
                </Link>
                <button
                  onClick={logout}
                  className="rounded-full border border-emerald-300 px-4 py-2 text-sm font-semibold text-emerald-800 hover:border-emerald-500"
                >
                  Logout
                </button>
                <button
                  onClick={refreshToken}
                  className="rounded-full border border-emerald-300 px-4 py-2 text-sm font-semibold text-emerald-800 hover:border-emerald-500"
                >
                  Refresh Token
                </button>
              </div>
            </div>
            <div className="rounded-3xl border border-emerald-900/10 bg-white/80 p-6 shadow-[0_16px_45px_rgba(16,185,129,0.12)]">
              <p className="text-sm font-semibold text-emerald-700">Session status</p>
              <p className="mt-2 text-2xl font-semibold text-emerald-950">{status}</p>
              <div className="mt-6 space-y-3">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  <span className="font-semibold">Access token</span>
                  <p className="mt-1 break-all text-xs text-emerald-700">{tokenPreview}</p>
                </div>
                <div className="rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-xs text-emerald-700">
                  <p>Signed-in user</p>
                  <p className="mt-1 font-mono text-[11px]">{user?.email || "Not signed in"}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
          <div className="rounded-3xl border border-emerald-900/10 bg-white/80 p-6 shadow-[0_18px_40px_rgba(16,185,129,0.1)]">
            <h2 className="text-lg font-semibold text-emerald-950">Client controls</h2>
            <p className="mt-2 text-sm text-emerald-700">
              Trigger the API flow to watch refresh logic kick in when the access token
              expires (30 seconds).
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={callProtected}
                className="rounded-full border border-emerald-300 px-4 py-2 text-sm font-semibold text-emerald-800 hover:border-emerald-500"
              >
                Call Protected API
              </button>
              <button
                onClick={clearAccessToken}
                className="rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 hover:border-amber-500"
              >
                Clear Access Token
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-emerald-900/10 bg-white/80 p-6 shadow-[0_18px_40px_rgba(16,185,129,0.1)]">
            <h2 className="text-lg font-semibold text-emerald-950">Event log</h2>
            <p className="mt-2 text-sm text-emerald-700">
              Each action updates this feed so you can compare it with the diagram.
            </p>
            <div className="mt-5 max-h-[320px] space-y-3 overflow-y-auto pr-2">
              {logs.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50 px-4 py-6 text-sm text-emerald-700">
                  No events yet. Go to Login to begin.
                </p>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-sm text-emerald-900"
                  >
                    <p className="text-xs text-emerald-600">{log.time}</p>
                    <p className="mt-1">{log.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Mermaid title="Client-side Auth Flow" chart={clientFlow} />
          <Mermaid title="Backend Token Flow" chart={apiFlow} />
        </section>
      </main>
    </div>
  );
}
