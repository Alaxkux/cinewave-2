import { useState, useRef, useEffect, useCallback } from "react";
import { useApp } from "../../context/AppContext";
import { useTMDB } from "../../hooks/useTMDB";
import { SearchIcon, BellIcon, ChevronDown, MenuIcon, PersonIcon, SettingsIcon, DownloadIcon, HeartIcon } from "../ui/Icons";
import SearchSuggestions from "../sections/SearchSuggestions";
import styles from "./TopNav.module.css";

const NAV_ITEMS = ["Movies", "TV Series", "Animation", "Mystery", "More"];
function timeAgo(ts) {
  const m = Math.floor((Date.now()-ts)/60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m/60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h/24)}d ago`;
}
const NOTIF_ICONS = { save:"❤️", unsave:"💔", download:"⬇️", remove_download:"🗑️", watch:"▶️", update:"✨" };

export default function TopNav({ onSearch }) {
  const { activeNav, setActiveNav, setSidebarOpen, user, setActivePage, activePage,
          notifications, unreadCount, markNotifsSeen, clearNotifs, openMovieDetail } = useApp();
  const { search: tmdbSearch, hasKey } = useTMDB();

  const [inputVal,    setInputVal]    = useState("");
  const [focused,     setFocused]     = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [sugLoading,  setSugLoading]  = useState(false);
  const [profileDrop, setProfileDrop] = useState(false);
  const [notifDrop,   setNotifDrop]   = useState(false);
  const debounceRef = useRef(null);
  const sugDebRef   = useRef(null);
  const profileRef  = useRef(null);
  const notifRef    = useRef(null);
  const searchRef   = useRef(null);

  useEffect(() => {
    const h = (e) => {
      if (!profileRef.current?.contains(e.target)) setProfileDrop(false);
      if (!notifRef.current?.contains(e.target))   setNotifDrop(false);
      if (!searchRef.current?.contains(e.target))  { setFocused(false); }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // "/" shortcut to focus search
  useEffect(() => {
    const h = (e) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        searchRef.current?.querySelector("input")?.focus();
      }
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);

  const handleInput = (e) => {
    const val = e.target.value;
    setInputVal(val);
    clearTimeout(debounceRef.current);
    clearTimeout(sugDebRef.current);
    if (!val.trim()) { setSuggestions([]); setSugLoading(false); onSearch?.(""); return; }
    onSearch?.(val);
    setSugLoading(true);
    sugDebRef.current = setTimeout(async () => {
      if (hasKey && tmdbSearch) {
        const res = await tmdbSearch(val);
        setSuggestions(res.slice(0, 6));
      } else {
        setSuggestions([]);
      }
      setSugLoading(false);
    }, 350);
  };

  const handleClear = () => { setInputVal(""); setSuggestions([]); setSugLoading(false); onSearch?.(""); };
  const openNotifs  = () => { setNotifDrop(d => !d); markNotifsSeen(); };
  const goTo = (page) => { setActivePage(page); setProfileDrop(false); };

  return (
    <header className={styles.topNav}>

      {/* Search with live suggestions */}
      <div className={`${styles.searchWrap} ${focused ? styles.searchFocused : ""}`} ref={searchRef}>
        <div className={`${styles.search} ${focused ? styles.focused : ""}`}>
          <SearchIcon size={15}/>
          <input
            type="text"
            placeholder='Search movies… ( press "/" )'
            value={inputVal}
            onChange={handleInput}
            onFocus={() => setFocused(true)}
          />
          {inputVal && <button className={styles.clearBtn} onClick={handleClear}>×</button>}
        </div>
        {focused && inputVal.length >= 2 && (
          <SearchSuggestions
            query={inputVal}
            results={suggestions}
            loading={sugLoading}
            onSelect={(m) => { setSuggestions([]); setInputVal(""); setFocused(false); onSearch?.(""); openMovieDetail(m); }}
            onClose={() => setFocused(false)}
          />
        )}
      </div>

      <nav className={styles.navTabs}>
        {NAV_ITEMS.map(item => (
          <button key={item}
            className={`${styles.tab} ${activeNav === item && activePage === "home" ? styles.activeTab : ""}`}
            onClick={() => {
              setActiveNav(item);
              setActivePage("home");
              // scroll to movie rows after state update
              setTimeout(() => {
                const el = document.getElementById("movie-rows-section");
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
              }, 80);
            }}
          >{item}</button>
        ))}
      </nav>

      <div className={styles.rightControls}>
        {/* Notifications */}
        <div className={styles.notifWrap} ref={notifRef}>
          <button className={styles.iconBtn} onClick={openNotifs} aria-label="Notifications">
            <BellIcon size={19}/>
            {unreadCount > 0 && <span className={styles.notifBadge}>{unreadCount > 9 ? "9+" : unreadCount}</span>}
          </button>
          {notifDrop && (
            <div className={styles.notifDropdown}>
              <div className={styles.notifHeader}>
                <span className={styles.notifTitle}>Notifications</span>
                <button className={styles.notifClear} onClick={clearNotifs}>Clear all</button>
              </div>
              <div className={styles.notifList}>
                {notifications.length === 0
                  ? <div className={styles.notifEmpty}>No notifications yet</div>
                  : notifications.map(n => (
                    <div key={n.id} className={styles.notifItem}>
                      <span className={styles.notifIcon}>{NOTIF_ICONS[n.type] || "🔔"}</span>
                      <div className={styles.notifBody}>
                        <p className={styles.notifText}>{n.text}</p>
                        <p className={styles.notifTime}>{timeAgo(n.time)}</p>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          )}
        </div>

        {/* Profile dropdown */}
        <div className={styles.profileWrap} ref={profileRef}>
          <div className={styles.profile} onClick={() => setProfileDrop(d => !d)}>
            <div className={styles.avatar}>
              {user.avatar
                ? <img src={user.avatar} alt="avatar" style={{width:"100%",height:"100%",borderRadius:"50%",objectFit:"cover"}}/>
                : user.name?.[0]?.toUpperCase()
              }
            </div>
            <div className={styles.profileInfo}>
              <span className={styles.profileName}>{user.name}</span>
              <span className={styles.profileHandle}>{user.handle}</span>
            </div>
            <span className={styles.chevron}><ChevronDown size={15}/></span>
          </div>
          {profileDrop && (
            <div className={styles.dropdown}>
              <div className={styles.dropHeader}>
                <div className={styles.dropAvatar}>
                  {user.avatar
                    ? <img src={user.avatar} alt="" style={{width:"100%",height:"100%",borderRadius:"50%",objectFit:"cover"}}/>
                    : user.name?.[0]?.toUpperCase()
                  }
                </div>
                <div>
                  <p className={styles.dropName}>{user.name}</p>
                  <p className={styles.dropHandle}>{user.handle}</p>
                </div>
              </div>
              <div className={styles.dropDivider}/>
              <button className={styles.dropItem} onClick={() => goTo("profile")}><PersonIcon size={15}/> My Profile</button>
              <button className={styles.dropItem} onClick={() => goTo("favorites")}><HeartIcon size={15}/> Saved Items</button>
              <button className={styles.dropItem} onClick={() => goTo("downloads")}><DownloadIcon size={15}/> Downloads</button>
              <button className={styles.dropItem} onClick={() => goTo("settings")}><SettingsIcon size={15}/> Settings</button>
              <div className={styles.dropDivider}/>
              <button className={`${styles.dropItem} ${styles.dropLogout}`}>Sign Out</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
