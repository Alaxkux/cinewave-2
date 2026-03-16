import { useState, useCallback, useRef, useEffect } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import Sidebar from "./components/layout/Sidebar";
import TopNav from "./components/layout/TopNav";
import BottomNav from "./components/layout/BottomNav";
import PageTransition from "./components/ui/PageTransition";
import { ToastProvider } from "./components/ui/Toast";
import Onboarding from "./components/ui/Onboarding";
import Home from "./pages/Home";
import SavedPage from "./pages/Saved";
import DownloadsPage from "./pages/Downloads";
import ProfilePage from "./pages/Profile";
import SettingsPage from "./pages/Settings";
import SeeAllPage from "./pages/SeeAll";
import MovieDetailModal from "./pages/MovieDetail";
import BrowsePage from "./pages/Browse";
import "./styles/global.css";
import styles from "./App.module.css";

function AppShell() {
  const { activePage, user, updateUser, movieDetail } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const debounceRef    = useRef(null);
  const contentRef     = useRef(null);
  const scrollPositions = useRef({});
  const prevPage       = useRef(activePage);

  const handleSearch = useCallback((q) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearchQuery(q), 300);
  }, []);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const leaving = prevPage.current;
    scrollPositions.current[leaving] = el.scrollTop;
    prevPage.current = activePage;
    const saved = scrollPositions.current[activePage] ?? 0;
    requestAnimationFrame(() => { el.scrollTop = saved; });
  }, [activePage]);

  const showOnboarding = !user?.onboarded;

  const renderPage = () => {
    switch (activePage) {
      case "favorites": return <div className={styles.pageContainer}><SavedPage /></div>;
      case "downloads": return <div className={styles.pageContainer}><DownloadsPage /></div>;
      case "profile":   return <div className={styles.pageWide}><ProfilePage /></div>;
      case "settings":  return <div className={styles.pageContainer}><SettingsPage /></div>;
      case "seeall":    return <div className={styles.pageContainer}><SeeAllPage /></div>;
      case "browse":    return <div className={styles.pageContainer}><BrowsePage /></div>;
      default:          return <Home searchQuery={searchQuery} contentRef={contentRef} />;
    }
  };

  return (
    <div className={styles.app}>
      {showOnboarding && <Onboarding onComplete={() => updateUser({ onboarded: true })} />}
      <Sidebar />
      <div className={styles.main}>
        <TopNav onSearch={handleSearch} />
        <div className={styles.content} ref={contentRef}>
          <PageTransition pageKey={activePage}>
            {renderPage()}
          </PageTransition>
        </div>
      </div>
      <BottomNav onSearchTap={() => {
        document.querySelector("input[placeholder*='Search']")?.focus();
      }} />
      <ToastProvider />
      {/* Global MovieDetail modal — renders on top of any page */}
      {movieDetail && <MovieDetailModal />}
    </div>
  );
}

export default function App() {
  return <AppProvider><AppShell /></AppProvider>;
}
