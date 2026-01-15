import ThreeTierNav from "@/components/navigation/ThreeTierNav";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* 3-Tier Navigation */}
      <ThreeTierNav />

      {/* Main Content - pt-[142px] for full nav (48+49+44+1), transitions to pt-[94px] on scroll */}
      <main className="flex-1 pt-[142px]">
        <div className="max-w-7xl w-full mx-auto h-full px-4 md:px-6 py-6 md:py-8">
          {children}
        </div>
      </main>

      {/* Toast notifications */}
      <Toaster position="top-center" richColors />
    </div>
  );
}
