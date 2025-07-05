import NavBar from "@/components/nav-bar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-screen flex flex-col">
      <header className="border-b">
        <div className="max-w-6xl w-full mx-auto flex-shrink-0">
          <NavBar />
        </div>
      </header>
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl w-full mx-auto h-full">{children}</div>
      </main>
    </div>
  );
}
