import { useApp } from "../../context/AppContext";
import MovieCard from "../cards/MovieCard";
import styles from "./MovieRow.module.css";

export default function MovieRow({ title, movies = [], onSelect, size = "md", loading = false }) {
  const { openSeeAll } = useApp();
  const skeletons = [1,2,3,4,5];

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        {movies.length > 0 && (
          <button className={styles.seeAll} onClick={() => openSeeAll(title, movies)}>
            See all
          </button>
        )}
      </div>

      {/* Desktop: horizontal scroll */}
      <div className={`${styles.row} ${styles.desktopRow}`}>
        {loading || movies.length === 0
          ? skeletons.map(i => <div key={i} className={`skeleton ${styles.skeletonCard}`} />)
          : movies.map(m => <MovieCard key={m.id} movie={m} onSelect={onSelect} size={size} />)
        }
      </div>

      {/* Mobile: 3-column grid */}
      <div className={styles.mobileGrid}>
        {loading || movies.length === 0
          ? skeletons.map(i => <div key={i} className={`skeleton ${styles.skeletonMobile}`} />)
          : movies.map(m => <MovieCard key={m.id} movie={m} onSelect={onSelect} size="sm" />)
        }
      </div>
    </section>
  );
}
