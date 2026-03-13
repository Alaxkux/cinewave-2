import { useState } from "react";
import { useApp } from "../../context/AppContext";
import MovieCard from "../../components/cards/MovieCard";
import MovieModal from "../../components/ui/MovieModal";
import styles from "./SeeAll.module.css";

const PER_PAGE = 20;

export default function SeeAllPage() {
  const { seeAllData, closeSeeAll } = useApp();
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  if (!seeAllData) return null;

  const { title, movies } = seeAllData;
  const totalPages = Math.max(1, Math.ceil(movies.length / PER_PAGE));
  const paginated = movies.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={closeSeeAll}>
          ← Back
        </button>
        <h1 className={styles.title}>{title}</h1>
        <span className={styles.count}>{movies.length} titles</span>
      </div>

      <div className={styles.grid}>
        {paginated.map(m => (
          <MovieCard key={m.id} movie={m} onSelect={setSelected} size="md" />
        ))}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              className={`${styles.pageBtn} ${p === page ? styles.active : ""}`}
              onClick={() => { setPage(p); window.scrollTo(0, 0); }}
            >{p}</button>
          ))}
        </div>
      )}

      {selected && <MovieModal movie={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
