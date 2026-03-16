import { useEffect, useState, useCallback, useRef } from "react";
import styles from "./Toast.module.css";

let _addToast = null;
export const toast = {
  show: (msg, type = "success") => _addToast?.({ msg, type }),
  success: (msg) => _addToast?.({ msg, type: "success" }),
  error:   (msg) => _addToast?.({ msg, type: "error" }),
  info:    (msg) => _addToast?.({ msg, type: "info" }),
};

const ICONS = { success: "✓", error: "✕", info: "ℹ" };

export function ToastProvider() {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const addToast = useCallback(({ msg, type }) => {
    const id = ++idRef.current;
    setToasts(prev => [...prev, { id, msg, type, visible: true }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, visible: false } : t));
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 350);
    }, 3000);
  }, []);

  useEffect(() => { _addToast = addToast; return () => { _addToast = null; }; }, [addToast]);

  return (
    <div className={styles.container}>
      {toasts.map(t => (
        <div key={t.id} className={`${styles.toast} ${styles[t.type]} ${t.visible ? styles.in : styles.out}`}>
          <span className={styles.icon}>{ICONS[t.type]}</span>
          <span className={styles.msg}>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}
