import { Suspense } from "react";
import ThreeTierNav from "@/components/navigation/ThreeTierNav";
import Footer from "@/components/Footer";
import { Toaster } from "sonner";
import ScrollToTopButton from "@/components/ScrollToTopButton";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col bg-background transition-colors duration-300">
      {/* 3-Tier Navigation */}
      <Suspense fallback={null}>
        <ThreeTierNav />
      </Suspense>

      {/* Main Content
          Mobile: pt-[142px] for full nav (48+49+44+1)
          Desktop/Tablet: pt-[102px] for compact nav (56+44+2) */}
      <main className="flex-1 pt-[142px] md:pt-[102px] bg-background">
        <div className="max-w-7xl w-full mx-auto h-full px-4 md:px-6 py-6 md:py-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Scroll to Top Button */}
      <ScrollToTopButton />

      {/* Toast notifications */}
      <Toaster
        position="top-center"
        richColors
        closeButton
        toastOptions={{
          classNames: {
            closeButton:
              "!left-auto !right-0 !top-0 !-translate-y-[-10%] !translate-x-[55%]",
          },
        }}
      />
    </div>
  );
}
