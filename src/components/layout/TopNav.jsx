import { useState, useRef, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { SearchIcon, BellIcon, ChevronDown, MenuIcon, PersonIcon, SettingsIcon, DownloadIcon, HeartIcon } from "../ui/Icons";
import styles from "./TopNav.module.css";

const NAV_ITEMS = ["Movies", "TV Series", "Animation", "Mystery", "More"];

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const NOTIF_ICONS = {
  save:           "❤️",
  unsave:         "💔",
  download:       "⬇️",
  remove_download:"🗑️",
  watch:          "▶️",
  update:         "✨",
};

export default function TopNav({ onSearch }) {
  const {
    activeNav, setActiveNav, setSidebarOpen, user, setActivePage, activePage,
    notifications, unreadCount, markNotifsSeen, clearNotifs,
  } = useApp();

  const [inputVal, setInputVal]     = useState("");
  const [focused, setFocused]       = useState(false);
  const [profileDrop, setProfileDrop] = useState(false);
  const [notifDrop, setNotifDrop]   = useState(false);
  const debounceRef = useRef(null);
  const profileRef  = useRef(null);
  const notifRef    = useRef(null);

  const handleInput = (e) => {
    const val = e.target.value;
    setInputVal(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onSearch?.(val), 350);
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!profileRef.current?.contains(e.target)) setProfileDrop(false);
      if (!notifRef.current?.contains(e.target))   setNotifDrop(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  const goTo = (page) => { setActivePage(page); setProfileDrop(false); };

  const openNotifs = () => {
    setNotifDrop(d => !d);
    markNotifsSeen();
  };

  return (
    <header className={styles.topNav}>
      {/* Mobile hamburger */}
      <button className={styles.mobileMenu} onClick={() => setSidebarOpen(o => !o)} aria-label="Menu">
        <MenuIcon size={22} />
      </button>

      {/* Search */}
      <div className={`${styles.search} ${focused ? styles.focused : ""}`}>
        <SearchIcon size={15} />
        <input
          type="text"
          placeholder="Search movies..."
          value={inputVal}
          onChange={handleInput}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {inputVal && (
          <button className={styles.clearBtn} onClick={() => { setInputVal(""); onSearch?.(""); }}>×</button>
        )}
      </div>

      {/* Desktop nav tabs */}
      <nav className={styles.navTabs}>
        {NAV_ITEMS.map(item => (
          <button
            key={item}
            className={`${styles.tab} ${activeNav === item && activePage === "home" ? styles.activeTab : ""}`}
            onClick={() => { setActiveNav(item); setActivePage("home"); }}
          >{item}</button>
        ))}
      </nav>

      {/* Right controls */}
      <div className={styles.rightControls}>

        {/* Notifications */}
        <div className={styles.notifWrap} ref={notifRef}>
          <button className={styles.iconBtn} onClick={openNotifs} aria-label="Notifications">
            <BellIcon size={19} />
            {unreadCount > 0 && (
              <span className={styles.notifBadge}>{unreadCount > 9 ? "9+" : unreadCount}</span>
            )}
          </button>

          {notifDrop && (
            <div className={styles.notifDropdown}>
              <div className={styles.notifHeader}>
                <span className={styles.notifTitle}>Notifications</span>
                <button className={styles.notifClear} onClick={clearNotifs}>Clear all</button>
              </div>

              <div className={styles.notifList}>
                {notifications.length === 0 ? (
                  <div className={styles.notifEmpty}>No notifications yet</div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className={styles.notifItem}>
                      <span className={styles.notifIcon}>{NOTIF_ICONS[n.type] || "🔔"}</span>
                      <div className={styles.notifBody}>
                        <p className={styles.notifText}>{n.text}</p>
                        <p className={styles.notifTime}>{timeAgo(n.time)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile dropdown */}
        <div className={styles.profileWrap} ref={profileRef}>
          <div className={styles.profile} onClick={() => setProfileDrop(d => !d)}>
            <div className={styles.avatar}>
              {user.avatar
                ? <img src={user.avatar} alt="avatar" style={{ width:"100%", height:"100%", borderRadius:"50%", objectFit:"cover" }} />
                : user.name?.[0]?.toUpperCase()
              }
            </div>
            <div className={styles.profileInfo}>
              <span className={styles.profileName}>{user.name}</span>
              <span className={styles.profileHandle}>{user.handle}</span>
            </div>
            <span className={styles.chevron}><ChevronDown size={15} /></span>
          </div>

          {profileDrop && (
            <div className={styles.dropdown}>
              <div className={styles.dropHeader}>
                <div className={styles.dropAvatar}>
                  {user.avatar
                    ? <img src={user.avatar} alt="" style={{ width:"100%", height:"100%", borderRadius:"50%", objectFit:"cover" }} />
                    : user.name?.[0]?.toUpperCase()
                  }
                </div>
                <div>
                  <p className={styles.dropName}>{user.name}</p>
                  <p className={styles.dropHandle}>{user.handle}</p>
                </div>
              </div>
              <div className={styles.dropDivider} />
              <button className={styles.dropItem} onClick={() => goTo("profile")}><PersonIcon size={15} /> My Profile</button>
              <button className={styles.dropItem} onClick={() => goTo("favorites")}><HeartIcon size={15} /> Saved Items</button>
              <button className={styles.dropItem} onClick={() => goTo("downloads")}><DownloadIcon size={15} /> Downloads</button>
              <button className={styles.dropItem} onClick={() => goTo("settings")}><SettingsIcon size={15} /> Settings</button>
              <div className={styles.dropDivider} />
              <button className={`${styles.dropItem} ${styles.dropLogout}`}>Sign Out</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
