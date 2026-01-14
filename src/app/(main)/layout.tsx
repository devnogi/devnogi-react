import TopNav from "@/components/top-nav";
import BottomNav from "@/components/bottom-nav";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Top Navigation - Hidden on mobile (md and below) */}
      <TopNav />

      {/* Main Content */}
      <main className="flex-1 md:pt-16 overflow-auto pb-14 md:pb-0">
        <div className="max-w-7xl w-full mx-auto h-full px-6 py-8">
          {children}
        </div>
      </main>

      {/* Bottom Navigation - Visible only on mobile (md and below) */}
      <div className="md:hidden">
        <BottomNav />
      </div>

      {/* Toast notifications */}
      <Toaster position="top-center" richColors />
    </div>
  );
}
