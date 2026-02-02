import { useQuery } from "@tanstack/react-query";
import { clientAxios } from "@/lib/api/clients";
import { Notice } from "@/types/notice";

interface NoticesResponse {
  success: boolean;
  code: string;
  message: string;
  data: Notice[];
  timestamp: string;
}

export function useNotices(userId: number | undefined, day: number = 7) {
  return useQuery<Notice[]>({
    queryKey: ["notices", userId, day],
    queryFn: async () => {
      const res = await clientAxios.get<NoticesResponse>(
        `/notices?userId=${userId}&day=${day}`
      );
      return res.data.data ?? [];
    },
    enabled: !!userId,
    refetchInterval: 60000, // 1분마다 자동 갱신
    staleTime: 30000, // 30초간 fresh
  });
}

export function useUnreadNoticeCount(userId: number | undefined, day: number = 7) {
  const { data: notices = [] } = useNotices(userId, day);
  return notices.filter((n) => !n.isRead).length;
}
