export const liveQueryOptions = {
  staleTime: 60_000,
  refetchInterval: 60_000,
  refetchIntervalInBackground: false,
  refetchOnMount: true,
  refetchOnReconnect: true,
  refetchOnWindowFocus: true,
} as const;
