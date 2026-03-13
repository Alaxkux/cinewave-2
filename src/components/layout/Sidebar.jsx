import { useApp } from "../../context/AppContext";
import { HomeIcon, HeartIcon, DownloadIcon, PersonIcon, SettingsIcon } from "../ui/Icons";
import styles from "./Sidebar.module.css";

const ITEMS = [
  { id: "home",      icon: HomeIcon,     label: "Home" },
  { id: "favorites", icon: HeartIcon,    label: "Saved Items" },
  { id: "downloads", icon: DownloadIcon, label: "Downloads" },
  { id: "profile",   icon: PersonIcon,   label: "Profile" },
  { id: "settings",  icon: SettingsIcon, label: "Settings" },
];

export default function Sidebar() {
  const { activePage, setActivePage, user } = useApp();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>🎬</div>

      <nav className={styles.nav}>
        {ITEMS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            className={`${styles.item} ${activePage === id ? styles.active : ""}`}
            onClick={() => setActivePage(id)}
            title={label}
            aria-label={label}
          >
            <Icon size={20} />
          </button>
        ))}
      </nav>

      {/* Bottom avatar */}
      <div
        className={styles.bottomAvatar}
        onClick={() => setActivePage("profile")}
        title="Profile"
      >
        {user.avatar
          ? <img src={user.avatar} alt="avatar" />
          : <span>{user.name?.[0]?.toUpperCase() || "A"}</span>
        }
      </div>
    </aside>
  );
}
