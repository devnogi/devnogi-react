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
  return NextResponse.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "devnogi-react",
      environment: process.env.NODE_ENV || "development",
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    }
  );
}
