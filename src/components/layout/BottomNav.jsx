import { useApp } from "../../context/AppContext";
import { HomeIcon, HeartIcon, DownloadIcon, PersonIcon, SearchIcon } from "../ui/Icons";
import styles from "./BottomNav.module.css";

const ITEMS = [
  { id: "home",      icon: HomeIcon,     label: "Home" },
  { id: "search",    icon: SearchIcon,   label: "Search" },
  { id: "favorites", icon: HeartIcon,    label: "Saved" },
  { id: "downloads", icon: DownloadIcon, label: "Downloads" },
  { id: "profile",   icon: PersonIcon,   label: "Profile" },
];

export default function BottomNav({ onSearchTap }) {
  const { activePage, setActivePage } = useApp();

  const handleTap = (id) => {
    if (id === "search") { onSearchTap?.(); return; }
    setActivePage(id);
  };

  return (
    <nav className={styles.nav}>
      {ITEMS.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          className={`${styles.item} ${activePage === id ? styles.active : ""}`}
          onClick={() => handleTap(id)}
        >
          <Icon size={22} />
          <span className={styles.label}>{label}</span>
          {activePage === id && <span className={styles.indicator} />}
        </button>
      ))}
    </nav>
  );
}
