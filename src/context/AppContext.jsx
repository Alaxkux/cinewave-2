import { createContext, useContext, useState, useCallback, useEffect } from "react";

const AppContext = createContext(null);

const load = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
};
const save = (key, val) => {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
};

const SITE_UPDATES = [
  { id: "u1", type: "update", text: "New feature: Download movies for offline viewing", time: Date.now() - 1000 * 60 * 60 * 2 },
  { id: "u2", type: "update", text: "Notification centre is now live!", time: Date.now() - 1000 * 60 * 30 },
];

export function AppProvider({ children }) {
  const [activePage, setActivePage]     = useState("home");
  const [activeNav, setActiveNav]       = useState("Movies");
  const [searchQuery, setSearchQuery]   = useState("");
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [favorites, setFavorites]       = useState(() => load("cw_favorites", []));
  const [downloads, setDownloads]       = useState(() => load("cw_downloads", []));
  const [continueWatching, setContinueWatching] = useState(() => load("cw_continue", []));
  const [notifications, setNotifications] = useState(() => load("cw_notifs", SITE_UPDATES));
  const [notifSeen, setNotifSeen]       = useState(() => load("cw_notif_seen", false));
  const [seeAllData, setSeeAllData]     = useState(null);
  const [user, setUser] = useState(() => load("cw_user", {
    name: "Arfi Maulana", handle: "@arfimaulana",
    email: "arfi@example.com", avatar: null,
  }));

  useEffect(() => save("cw_favorites", favorites),     [favorites]);
  useEffect(() => save("cw_downloads", downloads),     [downloads]);
  useEffect(() => save("cw_continue",  continueWatching), [continueWatching]);
  useEffect(() => save("cw_notifs",    notifications), [notifications]);
  useEffect(() => save("cw_notif_seen", notifSeen),    [notifSeen]);
  useEffect(() => save("cw_user",      user),          [user]);

  // Add notification helper
  const pushNotif = useCallback((notif) => {
    const entry = { id: `n_${Date.now()}`, time: Date.now(), ...notif };
    setNotifications(prev => [entry, ...prev].slice(0, 30));
    setNotifSeen(false);
  }, []);

  const markNotifsSeen = useCallback(() => setNotifSeen(true), []);
  const clearNotifs    = useCallback(() => { setNotifications(SITE_UPDATES); setNotifSeen(true); }, []);

  const unreadCount = notifSeen ? 0 : notifications.length;

  // Favorites
  const toggleFavorite = useCallback((movie) => {
    setFavorites(prev => {
      const exists = prev.find(m => m.id === movie.id);
      if (exists) {
        pushNotif({ type: "unsave", text: `Removed "${movie.title || movie.name}" from saved` });
        return prev.filter(m => m.id !== movie.id);
      } else {
        pushNotif({ type: "save", text: `Saved "${movie.title || movie.name}" to your list` });
        return [...prev, movie];
      }
    });
  }, [pushNotif]);
  const isFavorite = useCallback((id) => favorites.some(m => m.id === id), [favorites]);

  // Downloads
  const toggleDownload = useCallback((movie) => {
    setDownloads(prev => {
      const exists = prev.find(m => m.id === movie.id);
      if (exists) {
        pushNotif({ type: "remove_download", text: `Removed "${movie.title || movie.name}" from downloads` });
        return prev.filter(m => m.id !== movie.id);
      } else {
        pushNotif({ type: "download", text: `Downloaded "${movie.title || movie.name}"` });
        return [...prev, { ...movie, downloadedAt: Date.now(), size: `${(Math.random() * 1.5 + 0.3).toFixed(1)} GB` }];
      }
    });
  }, [pushNotif]);
  const isDownloaded = useCallback((id) => downloads.some(m => m.id === id), [downloads]);

  // Continue watching — only real watches, no demo data
  const addToContinueWatching = useCallback((movie) => {
    setContinueWatching(prev => {
      const filtered = prev.filter(m => m.id !== movie.id);
      const entry = { ...movie, progress: movie.progress || 5, subtitle: movie.subtitle || "Continue watching", watchedAt: Date.now() };
      pushNotif({ type: "watch", text: `Started watching "${movie.title || movie.name}"` });
      return [entry, ...filtered].slice(0, 12);
    });
  }, [pushNotif]);

  const updateProgress = useCallback((id, progress) => {
    setContinueWatching(prev => prev.map(m => m.id === id ? { ...m, progress } : m));
  }, []);

  // See All
  const openSeeAll  = useCallback((title, movies) => { setSeeAllData({ title, movies }); setActivePage("seeall"); }, []);
  const closeSeeAll = useCallback(() => { setSeeAllData(null); setActivePage("home"); }, []);

  // User
  const updateUser = useCallback((updates) => setUser(prev => ({ ...prev, ...updates })), []);

  return (
    <AppContext.Provider value={{
      activePage, setActivePage,
      activeNav, setActiveNav,
      searchQuery, setSearchQuery,
      sidebarOpen, setSidebarOpen,
      favorites, toggleFavorite, isFavorite,
      downloads, toggleDownload, isDownloaded,
      continueWatching, addToContinueWatching, updateProgress,
      notifications, unreadCount, markNotifsSeen, clearNotifs,
      seeAllData, openSeeAll, closeSeeAll,
      user, updateUser,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
