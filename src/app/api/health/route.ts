import { NextResponse } from "next/server";

/**
 * Health Check API Endpoint
 *
 * 이 엔드포인트는 다음 용도로 사용됩니다:
 * 1. Docker Health Check
 * 2. Load Balancer Health Check
 * 3. CI/CD Health Check
 * 4. 모니터링 시스템 연동
 */
export async function GET() {
  // 메모리 사용량 정보 (디버깅용)
  const memUsage = process.memoryUsage();
  const memory = {
    rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
    heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
  };

  return NextResponse.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "devnogi-react",
      environment: process.env.NODE_ENV || "development",
      uptime: Math.round(process.uptime()),
      memory,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    }
  );
}
