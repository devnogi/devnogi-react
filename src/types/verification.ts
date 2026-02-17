export type TokenStatus = "ACTIVE" | "VERIFIED" | "REVOKED" | "EXPIRED";
export type VerificationState = "VERIFIED" | "UNVERIFIED";

export interface UserVerificationTokenIssueResponse {
  verificationCode: string;
  expiresAt: string;
}

export interface UserVerificationTokenResponse {
  tokenId: number;
  verificationCode: string;
  tokenStatus: TokenStatus;
  issuedAt: string;
  expiresAt: string;
  expiresInSeconds: number;
  revoked: boolean;
  verified: boolean;
}

export interface UserVerificationInfoResponse {
  userId: number;
  verified: boolean;
  verificationState: VerificationState;
  serverName: string | null;
  characterName: string | null;
  verificationIdentity: string | null;
  lastVerifiedAt: string | null;
  verificationCount: number;
  latestTokenId: number | null;
}

export interface UserVerificationHistoryItem {
  historyId: number;
  serverName: string | null;
  characterName: string | null;
  verifiedAt: string;
  verificationSuccess: boolean;
  resultCode: string;
  resultMessage: string;
  failureReason: string | null;
  tokenId: number | null;
}

export interface UserVerificationHistoryListResponse {
  sort: string;
  limit: number;
  count: number;
  items: UserVerificationHistoryItem[];
}

export interface UserVerificationPublicSummaryResponse {
  userId: number;
  verified: boolean;
  serverName: string | null;
  characterName: string | null;
  lastVerifiedAt: string | null;
  verificationCount: number;
  histories: UserVerificationHistoryItem[];
}
