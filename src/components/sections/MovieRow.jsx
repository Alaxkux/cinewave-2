import { useApp } from "../../context/AppContext";
import MovieCard from "../cards/MovieCard";
import styles from "./MovieRow.module.css";

const TITLE_TO_CATEGORY = {
  "You might like": "popular", "Top Rated": "top_rated",
  "New This Week": "new_releases", "Featured TV Series": "tv_popular",
  "Popular TV Shows": "tv_popular", "Trending Now": "trending",
  "New Episodes": "tv_trending", "Animation Movies": "animation",
  "Popular Picks": "popular", "Mystery & Thriller": "mystery",
  "Also Popular": "popular", "Popular": "popular",
  "Trending": "trending", "TV Series": "tv_popular",
  "Action": "action", "Sci-Fi": "scifi", "Horror": "horror",
  "Comedy": "comedy", "Drama": "drama", "Thriller": "thriller",
};

const MOBILE_MAX = 9; // 3 rows × 3 cols

export default function MovieRow({ title, movies = [], onSelect, size = "md", loading = false, categoryKey }) {
  const { openSeeAll } = useApp();
  const resolvedKey = categoryKey || TITLE_TO_CATEGORY[title] || null;
  const mobileMovies = movies.slice(0, MOBILE_MAX);

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        {(movies.length > 0 || resolvedKey) && (
          <button className={styles.seeAll} onClick={() => openSeeAll(title, movies, resolvedKey)}>
            See all
          </button>
        )}
      </div>

      {/* Desktop: horizontal scroll, all movies */}
      <div className={styles.desktopRow}>
        {loading || movies.length === 0
          ? [1,2,3,4,5].map(i => <div key={i} className={`skeleton ${styles.skeletonCard}`} />)
          : movies.map(m => <MovieCard key={m.id} movie={m} onSelect={onSelect} size={size} />)
        }
      </div>

      {/* Mobile: 3×3 grid */}
      <div className={styles.mobileGrid}>
        {loading || movies.length === 0
          ? [1,2,3,4,5,6,7,8,9].map(i => <div key={i} className={`skeleton ${styles.skeletonMobile}`} />)
          : mobileMovies.map(m => <MovieCard key={m.id} movie={m} onSelect={onSelect} size="sm" />)
        }
      </div>
    </section>
  );
}
