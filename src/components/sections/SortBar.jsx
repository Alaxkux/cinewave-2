import { useApp } from "../../context/AppContext";
import { ChevronDown } from "../ui/Icons";
import styles from "./SortBar.module.css";

const SORT_OPTIONS = ["Movies", "TV Series", "Animation", "Mystery", "More"];

export default function SortBar() {
  const { activeNav, setActiveNav } = useApp();

  return (
    <div className={styles.bar}>
      <span className={styles.label}>Sort by:</span>
      <div className={styles.selectWrap}>
        <select
          className={styles.select}
          value={activeNav}
          onChange={e => setActiveNav(e.target.value)}
        >
          {SORT_OPTIONS.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <span className={styles.chevron}><ChevronDown size={14} /></span>
      </div>
    </div>
  );
}
