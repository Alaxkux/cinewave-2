import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { getPosterUrl } from "../../services/tmdb";
import { getGenreInfo, getPlaceholderGradient } from "../../utils/genres";
import { PlayIcon, HeartIcon } from "../../components/ui/Icons";
import MovieModal from "../../components/ui/MovieModal";
import styles from "./Saved.module.css";

const PER_PAGE = 12;

function SavedCard({ movie, onSelect }) {
  const { toggleFavorite } = useApp();
  const [hovered, setHovered] = useState(false);
  const imgUrl = getPosterUrl(movie.poster_path, "md");
  const genre = getGenreInfo(movie.genre_ids || []);

  return (
    <div
      className={`${styles.card} ${hovered ? styles.hovered : ""}`}
      style={!imgUrl ? { background: getPlaceholderGradient(movie.id) } : {}}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect(movie)}
    >
      {imgUrl && <img src={imgUrl} alt={movie.title} className={styles.cardImg} loading="lazy" />}
      <div className={styles.cardOverlay} />
      <div className={styles.badge} style={{ background: genre.color }}>ADDED</div>
      <button
        className={styles.removeBtn}
        onClick={(e) => { e.stopPropagation(); toggleFavorite(movie); }}
        aria-label="Remove"
      >
        <HeartIcon size={12} filled />
      </button>
      <div className={styles.cardBottom}>
        <div className={styles.cardInfo}>
          <p className={styles.cardTitle}>{movie.title || movie.name}</p>
          <p className={styles.cardGenre}>{genre.label}</p>
        </div>
        <button className={styles.playBtn} onClick={(e) => { e.stopPropagation(); onSelect(movie); }}>
          <PlayIcon size={13} />
        </button>
      </div>
    </div>
  );
}

export default function SavedPage() {
  const { favorites } = useApp();
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  const totalPages = Math.max(1, Math.ceil(favorites.length / PER_PAGE));
  const paginated = favorites.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>SAVED ITEMS</h1>
        <p className={styles.pageSubtitle}>Your collection of saved movies and series</p>
      </div>

      {favorites.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>🎬</span>
          <p className={styles.emptyText}>No saved items yet</p>
          <p className={styles.emptyHint}>Click the ❤️ icon on any movie to save it here</p>
        </div>
      ) : (
        <>
          <div className={styles.grid}>
            {paginated.map(m => <SavedCard key={m.id} movie={m} onSelect={setSelected} />)}
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <div className={styles.pageNumbers}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    className={`${styles.pageBtn} ${p === page ? styles.pageBtnActive : ""}`}
                    onClick={() => setPage(p)}
                  >{p}</button>
                ))}
                {page < totalPages && (
                  <button className={styles.pageBtn} onClick={() => setPage(p => p + 1)}>›</button>
                )}
              </div>
              {page < totalPages && (
                <button className={styles.nextBtn} onClick={() => setPage(p => p + 1)}>Next</button>
              )}
            </div>
          )}
        </>
      )}

      {selected && <MovieModal movie={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
