import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { clientAxios } from "@/lib/api/clients";
import {
  UserVerificationHistoryListResponse,
  UserVerificationInfoResponse,
  UserVerificationPublicSummaryResponse,
  UserVerificationTokenIssueResponse,
  UserVerificationTokenResponse,
} from "@/types/verification";

interface CommonResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
  timestamp: string;
}

interface ErrorResponse {
  code?: string;
}

type VerificationHistorySort = "latest" | "oldest";

function isTokenNotFoundError(error: unknown) {
  if (!axios.isAxiosError(error)) {
    return false;
  }

  const payload = error.response?.data as ErrorResponse | undefined;
  return (
    error.response?.status === 400 &&
    payload?.code === "USER_VERIFICATION_TOKEN_NOT_FOUND"
  );
}

export function useVerificationToken(enabled: boolean = true) {
  return useQuery<UserVerificationTokenResponse | null>({
    queryKey: ["verification", "token"],
    queryFn: async () => {
      try {
        const res = await clientAxios.get<
          CommonResponse<UserVerificationTokenResponse>
        >("/user/verification/token");
        return res.data.data ?? null;
      } catch (error) {
        if (isTokenNotFoundError(error)) {
          return null;
        }

        throw error;
      }
    },
    enabled,
    refetchInterval: (query) =>
      query.state.data?.tokenStatus === "ACTIVE" ? 30000 : false,
    staleTime: 10000,
  });
}

export function useVerificationInfo(enabled: boolean = true) {
  return useQuery<UserVerificationInfoResponse | null>({
    queryKey: ["verification", "info"],
    queryFn: async () => {
      const res = await clientAxios.get<
        CommonResponse<UserVerificationInfoResponse>
      >("/user/verification/info");
      return res.data.data ?? null;
    },
    enabled,
    staleTime: 30000,
  });
}

export function useVerificationHistory(
  sort: VerificationHistorySort = "latest",
  limit: number = 10,
  enabled: boolean = true,
) {
  return useQuery<UserVerificationHistoryListResponse | null>({
    queryKey: ["verification", "history", sort, limit],
    queryFn: async () => {
      const res = await clientAxios.get<
        CommonResponse<UserVerificationHistoryListResponse>
      >("/user/verification/history", { params: { sort, limit } });
      return res.data.data ?? null;
    },
    enabled,
    staleTime: 30000,
  });
}

export function useIssueVerificationToken() {
  const queryClient = useQueryClient();

  return useMutation<UserVerificationTokenIssueResponse>({
    mutationFn: async () => {
      const res = await clientAxios.post<
        CommonResponse<UserVerificationTokenIssueResponse>
      >("/user/verification/token");
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["verification", "token"] });
      queryClient.invalidateQueries({ queryKey: ["verification", "info"] });
    },
  });
}

export function useReissueVerificationToken() {
  const queryClient = useQueryClient();

  return useMutation<UserVerificationTokenIssueResponse>({
    mutationFn: async () => {
      const res = await clientAxios.post<
        CommonResponse<UserVerificationTokenIssueResponse>
      >("/user/verification/token/reissue");
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["verification", "token"] });
      queryClient.invalidateQueries({ queryKey: ["verification", "info"] });
    },
  });
}

export function usePublicVerificationInfo(userId: number | undefined) {
  return useQuery<UserVerificationInfoResponse | null>({
    queryKey: ["verification", "public", "info", userId],
    queryFn: async () => {
      const res = await clientAxios.get<
        CommonResponse<UserVerificationInfoResponse>
      >(`/user/verification/users/${userId}/info`);
      return res.data.data ?? null;
    },
    enabled: !!userId,
    staleTime: 60000,
  });
}

export function usePublicVerificationSummary(
  userId: number | undefined,
  limit: number = 5,
) {
  return useQuery<UserVerificationPublicSummaryResponse | null>({
    queryKey: ["verification", "public", "summary", userId, limit],
    queryFn: async () => {
      const res = await clientAxios.get<
        CommonResponse<UserVerificationPublicSummaryResponse>
      >(`/user/verification/public/users/${userId}/summary`, {
        params: { limit },
      });
      return res.data.data ?? null;
    },
    enabled: !!userId,
    staleTime: 60000,
  });
}
