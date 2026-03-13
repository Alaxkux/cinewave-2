import { useState } from "react";
import { getPosterUrl } from "../../services/tmdb";
import { getGenreInfo, getPlaceholderGradient } from "../../utils/genres";
import { PlayIcon } from "../ui/Icons";
import styles from "./SidePanels.module.css";

// ── Trailer Item ──────────────────────────────────────────────
function TrailerItem({ movie, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const imgUrl = getPosterUrl(movie.poster_path, "sm");
  const genre = getGenreInfo(movie.genre_ids || []);

  return (
    <div
      className={`${styles.trailerItem} ${hovered ? styles.trailerHovered : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect?.(movie)}
    >
      <div
        className={styles.trailerThumb}
        style={!imgUrl ? { background: getPlaceholderGradient(movie.id) } : {}}
      >
        {imgUrl && <img src={imgUrl} alt={movie.title} loading="lazy" />}
        <div className={styles.trailerPlayOverlay}>
          <div className={styles.trailerPlayBtn}>
            <PlayIcon size={12} />
          </div>
        </div>
      </div>
      <div className={styles.trailerInfo}>
        <p className={`${styles.trailerTitle} clamp-2`}>{movie.title || movie.name}</p>
        <span className={styles.trailerGenre} style={{ color: genre.color }}>
          {genre.label}
        </span>
      </div>
    </div>
  );
}

// ── Continue Watching Item ────────────────────────────────────
function ContinueItem({ movie, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const imgUrl = getPosterUrl(movie.poster_path, "sm");
  const genre = getGenreInfo(movie.genre_ids || []);
  const progress = movie.progress || Math.floor(Math.random() * 80) + 10;

  return (
    <div
      className={`${styles.continueItem} ${hovered ? styles.continueHovered : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect?.(movie)}
    >
      <div
        className={styles.continueThumb}
        style={!imgUrl ? { background: getPlaceholderGradient(movie.id) } : {}}
      >
        {imgUrl && <img src={imgUrl} alt="" loading="lazy" />}
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>
      </div>
      <div className={styles.continueInfo}>
        <p className={`${styles.continueTitle} clamp-1`}>{movie.title || movie.name}</p>
        <p className={styles.continueEp}>{movie.subtitle || "Continue watching"}</p>
      </div>
      <button className={styles.continuePlay}>
        <PlayIcon size={13} />
      </button>
    </div>
  );
}

// ── Trailers Panel ────────────────────────────────────────────
export function TrailersPanel({ movies = [], onSelect }) {
  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <div className={styles.panelTitleRow}>
          <span className={styles.panelIcon}>▶</span>
          <h3 className={styles.panelTitle}>New Trailer</h3>
        </div>
        <span className={styles.panelMeta}>Today ↑</span>
      </div>
      <div className={styles.list}>
        {movies.map((m) => (
          <TrailerItem key={m.id} movie={m} onSelect={onSelect} />
        ))}
        {movies.length === 0 &&
          [1, 2, 3].map((i) => <div key={i} className={`${styles.skeletonItem} skeleton`} />)}
      </div>
    </div>
  );
}

// ── Continue Watching Panel ───────────────────────────────────
export function ContinueWatchingPanel({ movies = [], onSelect }) {
  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h3 className={styles.panelTitle}>Continue Watching</h3>
        <span className={styles.panelSeeAll}>See all</span>
      </div>
      <div className={styles.list}>
        {movies.map((m) => (
          <ContinueItem key={m.id} movie={m} onSelect={onSelect} />
        ))}
        {movies.length === 0 &&
          [1, 2, 3, 4].map((i) => <div key={i} className={`${styles.skeletonItem} skeleton`} />)}
      </div>
    </div>
  );
}
