"use client";

import { useEffect, useId, useRef, useState } from "react";
import mermaid from "mermaid";

const defaultConfig = {
  startOnLoad: false,
  securityLevel: "strict",
  theme: "base",
  themeVariables: {
    fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui",
    primaryColor: "#d8f3dc",
    primaryTextColor: "#0b2b16",
    primaryBorderColor: "#74c69d",
    lineColor: "#2d6a4f",
    secondaryColor: "#edf6f9",
    tertiaryColor: "#fefae0",
  },
  flowchart: {
    curve: "basis",
    padding: 12,
  },
};

export default function Mermaid({ chart, title }) {
  const uniqueId = useId();
  const containerRef = useRef(null);
  const [renderError, setRenderError] = useState("");

  useEffect(() => {
    let active = true;

    const render = async () => {
      try {
        mermaid.initialize(defaultConfig);
        const { svg } = await mermaid.render(`mermaid-${uniqueId}`, chart);

        if (!active || !containerRef.current) return;
        containerRef.current.innerHTML = svg;
        setRenderError("");
      } catch (error) {
        if (!active) return;
        setRenderError(error instanceof Error ? error.message : "Failed to render diagram.");
      }
    };

    render();
    return () => {
      active = false;
    };
  }, [chart, uniqueId]);

  return (
    <div className="rounded-3xl border border-emerald-900/15 bg-white/80 p-6 shadow-[0_20px_50px_rgba(16,185,129,0.15)] backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700">
            Mermaid Flow
          </p>
          <h3 className="text-lg font-semibold text-emerald-950">{title}</h3>
        </div>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
          Live Render
        </span>
      </div>

      <div className="mt-6">
        {renderError ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {renderError}
          </p>
        ) : (
          <div
            ref={containerRef}
            className="mermaid min-h-[220px] overflow-x-auto rounded-2xl bg-emerald-50/60 p-4"
          />
        )}
      </div>
    </div>
  );
}
