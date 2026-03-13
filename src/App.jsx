import { useState, useCallback, useRef } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import Sidebar from "./components/layout/Sidebar";
import TopNav from "./components/layout/TopNav";
import Home from "./pages/Home";
import SavedPage from "./pages/Saved";
import DownloadsPage from "./pages/Downloads";
import ProfilePage from "./pages/Profile";
import SettingsPage from "./pages/Settings";
import SeeAllPage from "./pages/SeeAll";
import "./styles/global.css";
import styles from "./App.module.css";

function AppShell() {
  const { activePage } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const debounceRef  = useRef(null);
  const contentRef   = useRef(null);   // ← single ref for the scrollable area

  const handleSearch = useCallback((q) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearchQuery(q), 300);
  }, []);

  const renderPage = () => {
    switch (activePage) {
      case "favorites": return <div className={styles.pageContainer}><SavedPage /></div>;
      case "downloads": return <div className={styles.pageContainer}><DownloadsPage /></div>;
      case "profile":   return <div className={styles.pageContainer}><ProfilePage /></div>;
      case "settings":  return <div className={styles.pageContainer}><SettingsPage /></div>;
      case "seeall":    return <div className={styles.pageContainer}><SeeAllPage /></div>;
      default:          return <Home searchQuery={searchQuery} contentRef={contentRef} />;
    }
  };

  return (
    <div className={styles.app}>
      <Sidebar />
      <div className={styles.main}>
        <TopNav onSearch={handleSearch} />
        {/* contentRef is on THIS div — the actual scrollable element */}
        <div className={styles.content} ref={contentRef}>
          {renderPage()}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
