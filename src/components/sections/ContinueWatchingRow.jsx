import { useState } from "react";
import { getPosterUrl } from "../../services/tmdb";
import { getGenreInfo, getPlaceholderGradient } from "../../utils/genres";
import { PlayIcon } from "../ui/Icons";
import { useApp } from "../../context/AppContext";
import styles from "./ContinueWatchingRow.module.css";

function ContinueCard({ movie, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const imgUrl = getPosterUrl(movie.backdrop_path || movie.poster_path, "md");
  const genre = getGenreInfo(movie.genre_ids || []);
  const progress = movie.progress || 20;

  return (
    <div
      className={`${styles.card} ${hovered ? styles.hovered : ""}`}
      style={!imgUrl ? { background: getPlaceholderGradient(movie.id) } : {}}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect?.(movie)}
    >
      {imgUrl && <img src={imgUrl} alt={movie.title} className={styles.img} loading="lazy" />}
      <div className={styles.overlay} />

      {/* Genre badge — always visible */}
      <div className={styles.genre} style={{ background: genre.color }}>{genre.label}</div>

      {/* Play button */}
      <div className={styles.playWrap}>
        <button className={styles.playBtn}><PlayIcon size={16} /></button>
      </div>

      {/* Title */}
      <div className={styles.info}>
        <p className={styles.title}>{movie.title || movie.name}</p>
        {movie.subtitle && <p className={styles.subtitle}>{movie.subtitle}</p>}
      </div>

      {/* Progress bar + % below card — rendered outside card in parent */}
    </div>
  );
}

export default function ContinueWatchingRow({ movies = [], onSelect }) {
  const { openSeeAll } = useApp();

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h3 className={styles.title}>Continue Watching</h3>
        {movies.length > 3 && (
          <button className={styles.seeAll} onClick={() => openSeeAll("Continue Watching", movies)}>
            See all
          </button>
        )}
      </div>

      {/* Desktop scroll */}
      <div className={styles.desktopRow}>
        {movies.map(m => (
          <div key={m.id} className={styles.cardWrap}>
            <ContinueCard movie={m} onSelect={onSelect} />
            <div className={styles.progressWrap}>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${m.progress || 20}%` }} />
              </div>
              <span className={styles.progressPct}>{m.progress || 20}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile 3-col grid */}
      <div className={styles.mobileGrid}>
        {movies.map(m => (
          <div key={m.id} className={styles.cardWrap}>
            <ContinueCard movie={m} onSelect={onSelect} />
            <div className={styles.progressWrap}>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${m.progress || 20}%` }} />
              </div>
              <span className={styles.progressPct}>{m.progress || 20}%</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
