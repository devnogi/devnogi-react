/* eslint-disable no-console */
/**
 * Next.js Instrumentation
 *
 * 서버 시작 시 실행되는 초기화 코드입니다.
 * 프로세스 종료 원인을 추적하고 graceful shutdown을 처리합니다.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // 서버 사이드에서만 실행
  if (process.env.NEXT_RUNTIME === "nodejs") {
    console.log("[Instrumentation] Server starting...");
    console.log(
      `[Instrumentation] NODE_ENV: ${process.env.NODE_ENV}, PORT: ${process.env.PORT}`
    );

    // 메모리 사용량 로깅 (5분마다)
    const memoryLogInterval = setInterval(() => {
      const memUsage = process.memoryUsage();
      console.log("[Memory Monitor]", {
        rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
        external: `${Math.round(memUsage.external / 1024 / 1024)}MB`,
        uptime: `${Math.round(process.uptime())}s`,
      });
    }, 5 * 60 * 1000); // 5분

    // 메모리 로그 interval은 프로세스 종료를 막지 않도록 설정
    memoryLogInterval.unref();

    // Uncaught Exception 핸들러
    process.on("uncaughtException", (error: Error) => {
      console.error("[CRITICAL] Uncaught Exception:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      });
      // 메모리 상태도 함께 로깅
      const memUsage = process.memoryUsage();
      console.error("[CRITICAL] Memory at crash:", {
        rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      });
      // 프로세스가 종료되지 않도록 에러를 삼킴 (선택적)
      // 심각한 에러의 경우 종료하는 것이 나을 수 있음
    });

    // Unhandled Promise Rejection 핸들러
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    process.on("unhandledRejection", (reason: unknown, _promise: Promise<unknown>) => {
      console.error("[CRITICAL] Unhandled Promise Rejection:", {
        reason: reason instanceof Error ? {
          name: reason.name,
          message: reason.message,
          stack: reason.stack,
        } : reason,
        timestamp: new Date().toISOString(),
      });
      // 메모리 상태도 함께 로깅
      const memUsage = process.memoryUsage();
      console.error("[CRITICAL] Memory at rejection:", {
        rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      });
    });

    // SIGTERM 핸들러 (Docker stop 등)
    process.on("SIGTERM", () => {
      console.log("[Shutdown] Received SIGTERM signal");
      console.log("[Shutdown] Graceful shutdown initiated...");
      clearInterval(memoryLogInterval);
      // 정리 작업 후 종료
      setTimeout(() => {
        console.log("[Shutdown] Exiting process");
        process.exit(0);
      }, 1000);
    });

    // SIGINT 핸들러 (Ctrl+C)
    process.on("SIGINT", () => {
      console.log("[Shutdown] Received SIGINT signal");
      clearInterval(memoryLogInterval);
      process.exit(0);
    });

    // 프로세스 종료 시 로깅
    process.on("exit", (code: number) => {
      console.log(`[Shutdown] Process exiting with code: ${code}`);
    });

    // 초기 메모리 상태 로깅
    const initialMemUsage = process.memoryUsage();
    console.log("[Instrumentation] Initial memory:", {
      rss: `${Math.round(initialMemUsage.rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(initialMemUsage.heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(initialMemUsage.heapUsed / 1024 / 1024)}MB`,
    });

    console.log("[Instrumentation] Error handlers registered successfully");
  }
}
