export type UnifiedSearchType = "ITEM" | "MENU" | "USER";

export interface UnifiedSearchItem {
  type: UnifiedSearchType;
  label: string;
  targetKey: string;
  userId?: number;
  serverName?: string | null;
}

export type UnifiedSearchSource = "BATCH" | "AUTH";

export interface UnifiedSearchResponse {
  success: boolean;
  data: UnifiedSearchItem[];
  partialFailures: UnifiedSearchSource[];
  message?: string;
  timestamp: string;
}
