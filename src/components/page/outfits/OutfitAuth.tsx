"use client";
import { createContext, type ReactNode, useContext, useState } from "react";

import LoginModal from "@/components/auth/LoginModal";
import { useAuth } from "@/contexts/AuthContext";
const GateContext = createContext<() => boolean>(() => false);
export function OutfitAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, refreshUser } = useAuth();
  const [open, setOpen] = useState(false);
  const requireLogin = () => {
    if (isLoading) return false;
    if (isAuthenticated) return true;
    setOpen(true);
    return false;
  };
  return (
    <GateContext.Provider value={requireLogin}>
      {children}
      <LoginModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onLoginSuccess={async () => {
          await refreshUser();
          setOpen(false);
        }}
      />
    </GateContext.Provider>
  );
}
export const useOutfitAuth = () => useContext(GateContext);
