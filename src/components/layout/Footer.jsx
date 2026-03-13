import styles from "./Footer.module.css";

const LINKS = {
  Company: ["About Us", "FAQ", "Content", "Account", "Help Center", "Gift Us", "Jobs"],
  Support:  ["FAQ", "Privacy Policy", "Terms of Service", "Support", "Press", "Copyright Notice", "Cookie Preference"],
  Legal:    ["Legal", "Investor Relations", "Redeem", "Watch Anywhere", "Speed Test"],
  Manage:   ["Watch Anywhere", "Manage Profiles"],
};

export default function Footer({ contentRef }) {
  const handleBackToTop = () => {
    if (contentRef?.current) {
      // Scroll the actual scrollable content div back to top
      contentRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className={styles.footer}>
      {/* Back to Top row */}
      <div className={styles.backToTopRow}>
        <button className={styles.backBtn} onClick={handleBackToTop}>
          Back to Top <span className={styles.arrow}>▲</span>
        </button>
      </div>

      <div className={styles.inner}>
        {/* Logo */}
        <div className={styles.brand}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>🎬</span>
            <span className={styles.logoText}>CINEWAVE</span>
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(LINKS).map(([col, items]) => (
          <div key={col} className={styles.col}>
            {items.map(item => (
              <a key={item} href="#" className={styles.link} onClick={e => e.preventDefault()}>{item}</a>
            ))}
          </div>
        ))}

        {/* Right: selects + socials */}
        <div className={styles.colRight}>
          <select className={styles.select}>
            <option>Language</option>
            <option>English</option>
            <option>Spanish</option>
            <option>French</option>
          </select>
          <select className={styles.select}>
            <option>Location</option>
            <option>Nigeria</option>
            <option>United States</option>
            <option>United Kingdom</option>
          </select>
          <div className={styles.socials}>
            {["📸","🐦","📘","▶️"].map((icon, i) => (
              <a key={i} href="#" className={styles.socialBtn} onClick={e => e.preventDefault()}>
                {icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.copyright}>
        © 2024 Cinewave Entertainment. All Rights Reserved.
      </div>
    </footer>
  );
}
