import { useState, useRef, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import styles from "./SortBar.module.css";

const OPTIONS = [
  { value:"Movies",    label:"Movies",    icon:"🎬", desc:"All movies" },
  { value:"TV Series", label:"TV Series", icon:"📺", desc:"Shows & series" },
  { value:"Animation", label:"Animation", icon:"🎨", desc:"Animated films" },
  { value:"Mystery",   label:"Mystery",   icon:"🔍", desc:"Mystery & thriller" },
  { value:"More",      label:"More",      icon:"✨", desc:"Everything else" },
];

export default function SortBar() {
  const { activeNav, setActiveNav } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const current = OPTIONS.find(o => o.value === activeNav) || OPTIONS[0];

  useEffect(() => {
    const h = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const select = (val) => { setActiveNav(val); setOpen(false); };

  return (
    <div className={styles.wrap} ref={ref}>
      <span className={styles.label}>Sort by</span>

      <div className={styles.trigger} onClick={() => setOpen(d => !d)}>
        <span className={styles.icon}>{current.icon}</span>
        <span className={styles.current}>{current.label}</span>
        <span className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}>▾</span>
      </div>

      {open && (
        <div className={styles.dropdown}>
          {OPTIONS.map(opt => (
            <button
              key={opt.value}
              className={`${styles.option} ${opt.value === activeNav ? styles.optionActive : ""}`}
              onClick={() => select(opt.value)}
            >
              <span className={styles.optIcon}>{opt.icon}</span>
              <div className={styles.optText}>
                <span className={styles.optLabel}>{opt.label}</span>
                <span className={styles.optDesc}>{opt.desc}</span>
              </div>
              {opt.value === activeNav && <span className={styles.check}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
