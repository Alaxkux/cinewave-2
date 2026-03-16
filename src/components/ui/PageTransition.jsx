import { useEffect, useState } from "react";
import styles from "./PageTransition.module.css";

export default function PageTransition({ children, pageKey }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
    const t = requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
    return () => cancelAnimationFrame(t);
  }, [pageKey]);

  return (
    <div className={`${styles.wrap} ${visible ? styles.in : styles.out}`}>
      {children}
    </div>
  );
}
