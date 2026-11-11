import type { QueryClient } from "@tanstack/react-query";
import type { AxiosInstance } from "axios";

const authorQueryFamilies = new Set([
  "experience",
  "community-feed",
  "post",
  "comments",
  "comment-threads",
  "comment-replies",
  "user-comments",
  "outfits",
  "guild",
]);

/** Refresh after writes and allow bounded time for Auth's asynchronous projection. */
export function installExperienceRefresh(
  client: AxiosInstance,
  cache: QueryClient,
) {
  let timers: Array<ReturnType<typeof setTimeout>> = [];
  const clearTimers = () => {
    timers.forEach(clearTimeout);
    timers = [];
  };
  const refresh = () => {
    void cache.invalidateQueries({
      predicate: (query) => authorQueryFamilies.has(String(query.queryKey[0])),
    });
  };
  const interceptor = client.interceptors.response.use((response) => {
    const method = response.config.method?.toUpperCase();
    const path = response.config.url ?? "";
    if (
      method &&
      ["POST", "PUT", "PATCH", "DELETE"].includes(method) &&
      /^\/(?:posts|comments|outfits|guilds|admin\/guilds)(?:$|[/?])/.test(
        path,
      ) &&
      !/\/(?:views?|bookmarks?|share|photos|emblem|banner)(?:$|[/?])/.test(
        path,
      ) &&
      response.data?.success !== false
    ) {
      clearTimers();
      refresh();
      timers = [1000, 3000, 5000].map((delay) => setTimeout(refresh, delay));
    }
    return response;
  });
  return () => {
    clearTimers();
    client.interceptors.response.eject(interceptor);
  };
}
