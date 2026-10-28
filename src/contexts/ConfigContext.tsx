"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface RuntimeConfig {
  gatewayUrl: string;
  socialAuthBaseUrl: string;
  environment: string;
}

interface ConfigContextType {
  config: RuntimeConfig | null;
  isLoading: boolean;
  error: string | null;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<RuntimeConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const response = await fetch("/api/config");
        if (!response.ok) {
          throw new Error("Failed to fetch config");
        }
        const data = await response.json();
        setConfig(data);
      } catch (err) {
        console.error("Failed to load runtime config:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    }

    fetchConfig();
  }, []);

  return (
    <ConfigContext.Provider value={{ config, isLoading, error }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error("useConfig must be used within a ConfigProvider");
  }
  return context;
}
