import styles from "./ApiKeyBanner.module.css";

export default function ApiKeyBanner() {
  return (
    <div className={styles.banner}>
      <span className={styles.icon}>🔑</span>
      <div className={styles.text}>
        <strong>Demo Mode</strong> — Add your TMDB API key in{" "}
        <code>src/services/tmdb.js</code> to load real movies, posters &amp; trailers.
      </div>
      <a
        href="https://www.themoviedb.org/settings/api"
        target="_blank"
        rel="noreferrer"
        className={styles.link}
      >
        Get free key →
      </a>
    </div>
  );
}
