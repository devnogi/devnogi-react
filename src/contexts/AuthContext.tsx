"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface User {
  userId: number;
  nickname: string;
  email: string;
  profileImageUrl: string | null;
  role?: "USER" | "ADMIN" | "SUPER_ADMIN";
  verified?: boolean;
  serverName?: string | null;
  characterName?: string | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 초기 로드 시 인증 상태 확인
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // JWT 토큰이 쿠키에 있으면 자동으로 전송됨
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.data);
      } else if (response.status === 401) {
        // access_token 만료 시 refresh 시도
        const refreshResponse = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include",
        });

        if (refreshResponse.ok) {
          // refresh 성공 → 새 토큰으로 다시 사용자 정보 조회
          const retryResponse = await fetch("/api/auth/me", {
            credentials: "include",
          });

          if (retryResponse.ok) {
            const data = await retryResponse.json();
            setUser(data.data);
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("인증 확인 실패:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string, rememberMe?: boolean) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password, rememberMe }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "로그인에 실패했습니다");
      }

      const data = await response.json();
      setUser(data.data);
    } catch (error) {
      console.error("로그인 실패:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("로그아웃 실패:", error);
    } finally {
      setUser(null);
    }
  };

  const refreshUser = async () => {
    await checkAuth();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
