import Sidebar from "@/components/sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-screen flex bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 ml-20 overflow-auto">
        <div className="max-w-7xl w-full mx-auto h-full px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
