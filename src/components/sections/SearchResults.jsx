import MovieCard from "../cards/MovieCard";
import styles from "./SearchResults.module.css";

export default function SearchResults({ query, results, loading, onSelect }) {
  if (!query) return null;
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          {loading ? "Searching..." : `Results for "${query}"`}
        </h3>
        {!loading && <span className={styles.count}>{results.length} found</span>}
      </div>
      {loading ? (
        <div className={styles.grid}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`${styles.skeletonCard} skeleton`} />
          ))}
        </div>
      ) : results.length > 0 ? (
        <div className={styles.grid}>
          {results.map((m) => (
            <MovieCard key={m.id} movie={m} onSelect={onSelect} size="md" />
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>🎬</span>
          <p>No results found for "{query}"</p>
        </div>
      )}
    </div>
  );
}
