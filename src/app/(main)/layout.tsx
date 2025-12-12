import Sidebar from "@/components/sidebar";
import BottomNav from "@/components/bottom-nav";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-screen flex bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Left Sidebar - Hidden on mobile (md and below) */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-20 overflow-auto pb-16 md:pb-0">
        <div className="max-w-7xl w-full mx-auto h-full px-6 py-8">
          {children}
        </div>
      </main>

      {/* Bottom Navigation - Visible only on mobile (md and below) */}
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
