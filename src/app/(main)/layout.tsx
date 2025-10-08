import NavBar from "@/components/nav-bar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="max-w-7xl w-full mx-auto flex-shrink-0">
          <NavBar />
        </div>
      </header>
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl w-full mx-auto h-full px-4 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
