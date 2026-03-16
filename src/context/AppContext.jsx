import { createContext, useContext, useState, useCallback, useEffect } from "react";

const AppContext = createContext(null);
const load = (key, fb) => { try { return JSON.parse(localStorage.getItem(key)) ?? fb; } catch { return fb; } };
const save = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };

const SITE_UPDATES = [
  { id:"u1", type:"update", text:"Welcome to Cinewave! Your streaming universe is ready.", time: Date.now() - 1000*60*60 },
  { id:"u2", type:"update", text:"New: Browse by genre, movie detail pages & video player!", time: Date.now() - 1000*60*30 },
  { id:"u3", type:"update", text:"Tip: Press \"/\" anywhere to instantly search.", time: Date.now() - 1000*60*10 },
];

export function AppProvider({ children }) {
  const [activePage, setActivePage]         = useState("home");
  const [activeNav, setActiveNav]           = useState("Movies");
  const [searchQuery, setSearchQuery]       = useState("");
  const [sidebarOpen, setSidebarOpen]       = useState(false);
  const [favorites, setFavorites]           = useState(() => load("cw_favorites", []));
  const [downloads, setDownloads]           = useState(() => load("cw_downloads", []));
  const [continueWatching, setContinueWatching] = useState(() => load("cw_continue", []));
  const [notifications, setNotifications]   = useState(() => load("cw_notifs", SITE_UPDATES));
  const [notifSeen, setNotifSeen]           = useState(() => load("cw_notif_seen", false));
  const [movieDetail, setMovieDetail]       = useState(null);
  const [seeAllData, setSeeAllData]         = useState(null);
  const [user, setUser] = useState(() => load("cw_user", {
    name: "Arfi Maulana", handle: "@arfimaulana",
    email: "arfi@example.com", avatar: null, onboarded: false, preferredGenres: [],
  }));

  useEffect(() => save("cw_favorites",   favorites),       [favorites]);
  useEffect(() => save("cw_downloads",   downloads),       [downloads]);
  useEffect(() => save("cw_continue",    continueWatching),[continueWatching]);
  useEffect(() => save("cw_notifs",      notifications),   [notifications]);
  useEffect(() => save("cw_notif_seen",  notifSeen),       [notifSeen]);
  useEffect(() => save("cw_user",        user),            [user]);

  const pushNotif = useCallback((notif) => {
    const entry = { id:`n_${Date.now()}`, time: Date.now(), ...notif };
    setNotifications(prev => [entry, ...prev].slice(0, 30));
    setNotifSeen(false);
  }, []);

  const markNotifsSeen = useCallback(() => setNotifSeen(true), []);
  const clearNotifs    = useCallback(() => { setNotifications([]); setNotifSeen(true); }, []);
  const unreadCount = notifSeen ? 0 : notifications.length;

  // Favorites
  const toggleFavorite = useCallback((movie) => {
    setFavorites(prev => {
      const exists = prev.find(m => m.id === movie.id);
      pushNotif(exists
        ? { type:"unsave",  text:`Removed "${movie.title||movie.name}" from saved` }
        : { type:"save",    text:`Saved "${movie.title||movie.name}" to your list` }
      );
      return exists ? prev.filter(m => m.id !== movie.id) : [...prev, movie];
    });
  }, [pushNotif]);
  const isFavorite = useCallback((id) => favorites.some(m => m.id === id), [favorites]);

  // Downloads
  const toggleDownload = useCallback((movie) => {
    setDownloads(prev => {
      const exists = prev.find(m => m.id === movie.id);
      pushNotif(exists
        ? { type:"remove_download", text:`Removed "${movie.title||movie.name}" from downloads` }
        : { type:"download",        text:`Downloaded "${movie.title||movie.name}"` }
      );
      return exists
        ? prev.filter(m => m.id !== movie.id)
        : [...prev, { ...movie, downloadedAt: Date.now(), size:`${(Math.random()*1.5+0.3).toFixed(1)} GB` }];
    });
  }, [pushNotif]);
  const isDownloaded = useCallback((id) => downloads.some(m => m.id === id), [downloads]);

  // Continue watching — no demo data
  const addToContinueWatching = useCallback((movie) => {
    setContinueWatching(prev => {
      const entry = { ...movie, progress: movie.progress||5, subtitle: movie.subtitle||"Continue watching", watchedAt: Date.now() };
      pushNotif({ type:"watch", text:`Started watching "${movie.title||movie.name}"` });
      return [entry, ...prev.filter(m => m.id !== movie.id)].slice(0, 12);
    });
  }, [pushNotif]);
  const updateProgress = useCallback((id, p) =>
    setContinueWatching(prev => prev.map(m => m.id === id ? { ...m, progress: p } : m)), []);

  // Navigation
  const openMovieDetail  = useCallback((movie) => { setMovieDetail(movie); }, []);
  const closeMovieDetail = useCallback(() => setMovieDetail(null), []);
  const openSeeAll  = useCallback((title, movies, categoryKey = null) => { setSeeAllData({ title, movies, categoryKey }); setActivePage("seeall"); }, []);
  const closeSeeAll = useCallback(() => { setSeeAllData(null); setActivePage("home"); }, []);
  const updateUser  = useCallback((u) => setUser(prev => ({ ...prev, ...u })), []);

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
      movieDetail, openMovieDetail, closeMovieDetail,
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
