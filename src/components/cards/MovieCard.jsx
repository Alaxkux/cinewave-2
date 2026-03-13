import { useState } from "react";
import { getPosterUrl } from "../../services/tmdb";
import { getGenreInfo, getPlaceholderGradient } from "../../utils/genres";
import { PlayIcon, HeartIcon } from "../ui/Icons";
import { useApp } from "../../context/AppContext";
import styles from "./MovieCard.module.css";

export default function MovieCard({ movie, onSelect, size = "md", showBookmark = false }) {
  const [hovered, setHovered] = useState(false);
  const { toggleFavorite, isFavorite } = useApp();
  const fav = isFavorite(movie.id);
  const genre = getGenreInfo(movie.genre_ids || []);
  const imgUrl = getPosterUrl(movie.poster_path, "md");

  return (
    <div
      className={`${styles.card} ${styles[size]} ${hovered ? styles.hovered : ""}`}
      style={!imgUrl ? { background: getPlaceholderGradient(movie.id) } : {}}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect?.(movie)}
    >
      {imgUrl && <img src={imgUrl} alt={movie.title || movie.name} className={styles.img} loading="lazy" />}

      <div className={styles.overlay} />

      {/* Genre badge — ALWAYS visible */}
      <div className={styles.genre} style={{ background: genre.color }}>
        {genre.label}
      </div>

      {/* Favorite / Bookmark */}
      <button
        className={`${styles.favBtn} ${fav ? styles.favActive : ""}`}
        onClick={(e) => { e.stopPropagation(); toggleFavorite(movie); }}
        aria-label="Save"
      >
        <HeartIcon size={12} filled={fav} />
      </button>

      {/* Bottom */}
      <div className={styles.info}>
        <div className={styles.titleRow}>
          <p className={`${styles.title} clamp-2`}>{movie.title || movie.name}</p>
          <button
            className={styles.playBtn}
            onClick={(e) => { e.stopPropagation(); onSelect?.(movie); }}
            aria-label="Play"
          >
            <PlayIcon size={14} />
          </button>
        </div>
        {size !== "sm" && (
          <p className={styles.genreLabel}>{genre.label}</p>
        )}
      </div>
    </div>
  );
}
