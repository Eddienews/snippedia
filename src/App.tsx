// /home/snippedia/snip-pedia/src/App.tsx
import { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import Navigation from "./components/Navigation";
import Index from "./pages/Index";

import PWAInstallPrompt from "./components/PWAInstallPrompt";
import { Toaster } from "@/components/ui/toaster";
import { usePWA } from "./hooks/usePWA";

const Discover = lazy(() => import("./pages/Discover"));
const History = lazy(() => import("./pages/History"));

const queryClient = new QueryClient();

function App() {
  const { isOnline } = usePWA();

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Navigation />

        <Suspense
          fallback={
            <div className="h-screen w-screen grid place-items-center bg-black text-white/70 text-sm">
              Loading page...
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Index />} />

            {/* compatibilidade antiga */}
            <Route path="/a/:id" element={<Index />} />

            {/* ✅ share do WhatsApp (o seu link é /s/ID) */}
            <Route path="/s/:id" element={<Index />} />

            <Route path="/discover" element={<Discover />} />
            <Route path="/history" element={<History />} />

            {/* opcional: fallback */}
            <Route path="*" element={<Index />} />
          </Routes>
        </Suspense>


        <PWAInstallPrompt />
        <Toaster />

        {!isOnline && (
          <div className="fixed top-0 left-0 right-0 bg-red-600 text-white text-center py-2 z-50 text-sm">
            📡 You are offline - Some features may be limited
          </div>
        )}

        <a
          href="https://nwlab.app/"
          target="_blank"
          rel="noreferrer noopener"
          className="fixed bottom-2 left-3 z-30 text-[11px] md:text-xs text-white/55 hover:text-white/80 transition-colors"
        >
          Built by North Wind Lab
        </a>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
