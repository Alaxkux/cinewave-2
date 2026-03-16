import { getPosterUrl } from "../../services/tmdb";
import { getGenreInfo, getPlaceholderGradient } from "../../utils/genres";
import { PlayIcon } from "../ui/Icons";
import { useApp } from "../../context/AppContext";
import styles from "./ContinueWatchingRow.module.css";

function ContinueCard({ movie, onSelect }) {
  const imgUrl   = getPosterUrl(movie.backdrop_path || movie.poster_path, "md");
  const genre    = getGenreInfo(movie.genre_ids || []);
  const progress = movie.progress || 20;

  return (
    <div
      className={styles.cardWrap}
      onClick={() => onSelect?.(movie)}
    >
      <div
        className={styles.card}
        style={!imgUrl ? { background: getPlaceholderGradient(movie.id) } : {}}
      >
        {imgUrl && <img src={imgUrl} alt={movie.title} className={styles.img} loading="lazy" />}
        <div className={styles.overlay} />
        <div className={styles.genre} style={{ background: genre.color }}>{genre.label}</div>
        <div className={styles.playWrap}>
          <button className={styles.playBtn} onClick={e => { e.stopPropagation(); onSelect?.(movie); }}>
            <PlayIcon size={14} />
          </button>
        </div>
        <div className={styles.info}>
          <p className={styles.title}>{movie.title || movie.name}</p>
          {movie.subtitle && <p className={styles.subtitle}>{movie.subtitle}</p>}
        </div>
      </div>
      {/* Progress bar always below card */}
      <div className={styles.progressWrap}>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>
        <span className={styles.progressPct}>{progress}%</span>
      </div>
    </div>
  );
}

export default function ContinueWatchingRow({ movies = [], onSelect }) {
  const { openSeeAll } = useApp();
  if (!movies.length) return null;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h3 className={styles.rowTitle}>Continue Watching</h3>
        {movies.length > 3 && (
          <button className={styles.seeAll} onClick={() => openSeeAll("Continue Watching", movies)}>
            See all
          </button>
        )}
      </div>
      {/* Always horizontal scroll — desktop and mobile */}
      <div className={styles.scrollRow}>
        {movies.map(m => (
          <ContinueCard key={m.id} movie={m} onSelect={onSelect} />
        ))}
      </div>
    </section>
  );
}
