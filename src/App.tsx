import { useCallback, useEffect, useState } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { LenisProvider } from './hooks/useLenis';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { DownloadSheet } from './components/DownloadSheet';
import { HomePage } from './pages/HomePage';
import { ScenesPage } from './pages/ScenesPage';
import { ChangelogPage } from './pages/ChangelogPage';

function DownloadRouteView({ onOpenDownload }: { onOpenDownload: () => void }) {
  useEffect(() => {
    onOpenDownload();
  }, [onOpenDownload]);

  return (
    <main className="flex-1">
      <HomePage onOpenDownload={onOpenDownload} />
    </main>
  );
}

function AppShell() {
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const openDownload = useCallback(() => {
    setIsDownloadOpen(true);
  }, []);

  const closeDownload = useCallback(() => {
    setIsDownloadOpen(false);
    if (location.pathname === '/download') {
      navigate('/', { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <LenisProvider>
      <div className="flex min-h-[100dvh] flex-col bg-ns-base text-ns-ink">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-ns-ivory focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-ns-ink"
        >
          Skip to main content
        </a>

        <Navbar onOpenDownload={openDownload} />

        <div id="main-content" className="flex-1">
          <Routes>
            <Route
              path="/"
              element={
                <main>
                  <HomePage onOpenDownload={openDownload} />
                </main>
              }
            />
            <Route
              path="/scenes"
              element={
                <main>
                  <ScenesPage onOpenDownload={openDownload} />
                </main>
              }
            />
            <Route
              path="/changelog"
              element={
                <main>
                  <ChangelogPage onOpenDownload={openDownload} />
                </main>
              }
            />
            <Route path="/features" element={<Navigate to="/#features" replace />} />
            <Route path="/breeds" element={<Navigate to="/#breeds" replace />} />
            <Route path="/pricing" element={<Navigate to="/#pricing" replace />} />
            <Route path="/faq" element={<Navigate to="/#faq" replace />} />
            <Route
              path="/download"
              element={<DownloadRouteView onOpenDownload={openDownload} />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>

        <Footer onOpenDownload={openDownload} />
        <DownloadSheet isOpen={isDownloadOpen} onClose={closeDownload} />
      </div>
    </LenisProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
