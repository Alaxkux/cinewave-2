import { getPosterUrl } from "../../services/tmdb";
import { getGenreInfo, getPlaceholderGradient } from "../../utils/genres";
import { PlayIcon, HeartIcon } from "../ui/Icons";
import { useApp } from "../../context/AppContext";
import { toast } from "../ui/Toast";
import styles from "./MovieCard.module.css";

export default function MovieCard({ movie, onSelect, size = "md" }) {
  const { toggleFavorite, isFavorite, openMovieDetail } = useApp();
  const fav    = isFavorite(movie.id);
  const genre  = getGenreInfo(movie.genre_ids || []);
  const imgUrl = getPosterUrl(movie.poster_path, "md");

  const handleFav = (e) => {
    e.stopPropagation();
    toggleFavorite(movie);
    toast.success(fav ? "Removed from saved" : `Saved "${movie.title || movie.name}"`);
  };

  const handleClick = () => {
    if (onSelect) onSelect(movie);
    else openMovieDetail(movie);
  };

  const sizeClass = styles[size] || "";

  return (
    <div
      className={`${styles.card} ${sizeClass}`}
      style={!imgUrl ? { background: getPlaceholderGradient(movie.id) } : {}}
      onClick={handleClick}
    >
      {imgUrl && (
        <img src={imgUrl} alt={movie.title || movie.name} className={styles.img} loading="lazy" />
      )}
      <div className={styles.overlay} />

      {/* Genre badge — always visible */}
      <div className={styles.genre} style={{ background: genre.color }}>{genre.label}</div>

      {/* Fav — appears on hover via CSS */}
      <button className={`${styles.favBtn} ${fav ? styles.favActive : ""}`} onClick={handleFav} aria-label="Save">
        <HeartIcon size={12} filled={fav} />
      </button>

      {/* Bottom info */}
      <div className={styles.info}>
        <div className={styles.titleRow}>
          <p className={styles.title}>{movie.title || movie.name}</p>
          <button
            className={styles.playBtn}
            onClick={(e) => { e.stopPropagation(); handleClick(); }}
            aria-label="Play"
          >
            <PlayIcon size={14} />
          </button>
        </div>
        {size !== "sm" && <p className={styles.genreLabel}>{genre.label}</p>}
      </div>
    </div>
  );
}
