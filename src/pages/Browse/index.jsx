import { useState, useEffect, useCallback } from "react";
import { useApp } from "../../context/AppContext";
import { tmdbService, TMDB_API_KEY } from "../../services/tmdb";
import MovieCard from "../../components/cards/MovieCard";
import EmptyState from "../../components/ui/EmptyState";
import styles from "./Browse.module.css";

const HAS_KEY = TMDB_API_KEY !== "YOUR_TMDB_API_KEY_HERE";

const GENRES = [
  { id: 28,    label: "Action",     color: "#FF4E4E", emoji: "💥" },
  { id: 12,    label: "Adventure",  color: "#FF9B4E", emoji: "🗺️" },
  { id: 16,    label: "Animation",  color: "#A855F7", emoji: "🎨" },
  { id: 35,    label: "Comedy",     color: "#F59E0B", emoji: "😂" },
  { id: 80,    label: "Crime",      color: "#EF4444", emoji: "🔫" },
  { id: 18,    label: "Drama",      color: "#3B82F6", emoji: "🎭" },
  { id: 14,    label: "Fantasy",    color: "#8B5CF6", emoji: "🧙" },
  { id: 27,    label: "Horror",     color: "#6B7280", emoji: "👻" },
  { id: 9648,  label: "Mystery",    color: "#6366F1", emoji: "🔍" },
  { id: 10749, label: "Romance",    color: "#F43F5E", emoji: "💕" },
  { id: 878,   label: "Sci-Fi",     color: "#0EA5E9", emoji: "🚀" },
  { id: 53,    label: "Thriller",   color: "#84CC16", emoji: "😰" },
];

const SORT_OPTIONS = [
  { label: "Popularity", value: "popularity.desc" },
  { label: "Rating",     value: "vote_average.desc" },
  { label: "Newest",     value: "release_date.desc" },
  { label: "Oldest",     value: "release_date.asc" },
];

export default function BrowsePage() {
  const { setActivePage, openMovieDetail } = useApp();
  const [activeGenre, setActiveGenre] = useState(null);
  const [sortBy,      setSortBy]      = useState("popularity.desc");
  const [movies,      setMovies]      = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [page,        setPage]        = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);

  const fetchMovies = useCallback(async (genreId, sort, pg) => {
    if (!HAS_KEY) return;
    setLoading(true);
    try {
      const params = { sort_by: sort, "vote_count.gte": "50", page: pg };
      if (genreId) params.with_genres = String(genreId);
      const res = await tmdbService.getPagedResults(
        (p) => {
          const url = new URL("https://api.themoviedb.org/3/discover/movie");
          url.searchParams.set("api_key", TMDB_API_KEY);
          url.searchParams.set("sort_by", sort);
          url.searchParams.set("vote_count.gte", "50");
          url.searchParams.set("page", p);
          if (genreId) url.searchParams.set("with_genres", String(genreId));
          return fetch(url.toString()).then(r => r.json());
        },
        2 // fetch 2 pages = ~40 movies
      );
      setMovies(res.results || []);
      setTotalPages(Math.min(res.total_pages || 1, 10));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load — popular movies
  useEffect(() => {
    if (!HAS_KEY) return;
    fetchMovies(null, "popularity.desc", 1);
  }, [fetchMovies]);

  // Re-fetch when genre or sort changes
  useEffect(() => {
    if (!HAS_KEY) return;
    setPage(1);
    fetchMovies(activeGenre, sortBy, 1);
  }, [activeGenre, sortBy, fetchMovies]);

  const handleGenre = (id) => {
    setActiveGenre(prev => prev === id ? null : id);
  };

  const activeGenreData = GENRES.find(g => g.id === activeGenre);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <button className={styles.backBtn} onClick={() => setActivePage("home")}>← Back</button>
          <h1 className={styles.title}>
            Browse{activeGenreData ? ` · ${activeGenreData.emoji} ${activeGenreData.label}` : " by Genre"}
          </h1>
        </div>
      </div>

      {/* Genre chips */}
      <div className={styles.genreRow}>
        <button
          className={`${styles.chip} ${!activeGenre ? styles.chipActive : ""}`}
          onClick={() => handleGenre(null)}
        >🎬 All</button>
        {GENRES.map(g => (
          <button
            key={g.id}
            className={`${styles.chip} ${activeGenre === g.id ? styles.chipActive : ""}`}
            style={activeGenre === g.id ? { background: g.color, borderColor: g.color } : {}}
            onClick={() => handleGenre(g.id)}
          >
            {g.emoji} {g.label}
          </button>
        ))}
      </div>

      {/* Sort + count toolbar */}
      <div className={styles.toolbar}>
        <span className={styles.count}>
          {loading ? "Loading…" : `${movies.length} titles`}
        </span>
        <div className={styles.sortWrap}>
          <span className={styles.sortLabel}>Sort:</span>
          {SORT_OPTIONS.map(s => (
            <button
              key={s.value}
              className={`${styles.sortBtn} ${sortBy === s.value ? styles.sortActive : ""}`}
              onClick={() => setSortBy(s.value)}
            >{s.label}</button>
          ))}
        </div>
      </div>

      {/* No API key notice */}
      {!HAS_KEY && (
        <div className={styles.noKey}>
          <span>🔑</span>
          <p>Add your TMDB API key in <code>src/services/tmdb.js</code> to browse real movies.</p>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className={styles.grid}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className={`skeleton ${styles.skeletonCard}`} />
          ))}
        </div>
      ) : movies.length === 0 ? (
        <EmptyState type="search" title="No movies found" sub="Try a different genre or sort" />
      ) : (
        <div className={styles.grid}>
          {movies.map(m => (
            <MovieCard key={m.id} movie={m} onSelect={openMovieDetail} size="md" />
          ))}
        </div>
      )}
    </div>
  );
}
