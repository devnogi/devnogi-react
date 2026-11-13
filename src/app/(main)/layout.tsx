import { Suspense } from "react";
import { Toaster } from "sonner";

import Footer from "@/components/Footer";
import { HomeSearchProvider } from "@/components/navigation/HomeSearch";
import ThreeTierNav from "@/components/navigation/ThreeTierNav";
import ScrollToTopButton from "@/components/ScrollToTopButton";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <HomeSearchProvider>
      <div className="min-h-screen flex flex-col bg-background transition-colors duration-300">
        {/* Responsive navigation */}
        <Suspense fallback={null}>
          <ThreeTierNav />
        </Suspense>

        {/* Main Content: 112px mobile / 64px desktop fixed navigation. */}
        <main data-page-shell className="flex-1 pt-28 md:pt-16 bg-background">
          <div
            data-page-frame
            className="max-w-7xl w-full mx-auto h-full px-4 md:px-6 py-6 md:py-8"
          >
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
    </HomeSearchProvider>
  );
}
