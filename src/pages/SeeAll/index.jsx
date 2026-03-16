import { useState, useEffect, useRef, useCallback } from "react";
import { useApp } from "../../context/AppContext";
import { TMDB_API_KEY, CATEGORY_FETCHERS } from "../../services/tmdb";
import MovieCard from "../../components/cards/MovieCard";
import styles from "./SeeAll.module.css";

const PER_PAGE = 20;
const HAS_KEY  = TMDB_API_KEY !== "YOUR_TMDB_API_KEY_HERE";

// Generate large demo sets when no API key
const makeDemoMovies = (seed, count = 100) => {
  const titles = [
    "The Dark Knight","Inception","Interstellar","The Matrix","Pulp Fiction",
    "Goodfellas","Fight Club","Forrest Gump","The Shawshank Redemption","The Godfather",
    "Schindler's List","The Silence of the Lambs","Se7en","The Usual Suspects","Memento",
    "Apocalypse Now","Full Metal Jacket","Platoon","Saving Private Ryan","Dunkirk",
    "Dune","Avatar","Avengers","Black Panther","Thor","Iron Man","Spider-Man","Doctor Strange",
    "Guardians of the Galaxy","Ant-Man","Captain America","Black Widow","Shang-Chi",
    "Eternals","Moon Knight","She-Hulk","Ms Marvel","Hawkeye","Loki","WandaVision",
    "Blade Runner","2001 A Space Odyssey","Arrival","Contact","Gravity","The Martian",
    "Prometheus","Alien","Predator","Terminator","RoboCop","Total Recall","Minority Report",
    "Ex Machina","Her","Moon","District 9","Children of Men","28 Days Later","A Quiet Place",
    "Get Out","Hereditary","Midsommar","It Follows","The Witch","Annihilation","Nope",
    "Us","Parasite","Oldboy","The Handmaiden","Burning","Poetry","Memories of Murder",
    "Spirited Away","Princess Mononoke","Howl's Moving Castle","My Neighbor Totoro",
    "Akira","Ghost in the Shell","Paprika","Perfect Blue","The Wind Rises","Nausicaa",
    "The Grand Budapest Hotel","Moonrise Kingdom","Rushmore","The Royal Tenenbaums",
    "Fantastic Mr Fox","Isle of Dogs","Asteroid City","French Dispatch","Darjeeling Limited",
    "Knives Out","Glass Onion","Clue","Murder on the Orient Express","Rear Window",
    "Vertigo","Psycho","The Birds","North by Northwest","Rope","Strangers on a Train",
    "Casino Royale","Skyfall","Spectre","No Time to Die","GoldenEye","The Spy Who Loved Me",
  ];
  const genres = [[28,12],[18,36],[878,12],[9648,53],[16,35],[27],[80,18],[14,28],[10749,35],[878,18]];
  return Array.from({ length: count }, (_, i) => ({
    id: seed * 1000 + i,
    title: titles[(seed + i) % titles.length],
    overview: "An acclaimed film celebrated for its exceptional storytelling, compelling performances, and stunning visuals.",
    genre_ids: genres[(seed + i) % genres.length],
    poster_path: null,
    backdrop_path: null,
    vote_average: parseFloat((5.5 + ((seed + i) % 45) / 10).toFixed(1)),
    release_date: `${2018 + ((seed + i) % 7)}-0${1 + (i % 9)}-15`,
  }));
};

const DEMO_BY_CATEGORY = {
  popular:       makeDemoMovies(1),
  trending:      makeDemoMovies(2),
  top_rated:     makeDemoMovies(3),
  upcoming:      makeDemoMovies(4),
  now_playing:   makeDemoMovies(5),
  tv_popular:    makeDemoMovies(6),
  tv_top_rated:  makeDemoMovies(7),
  tv_trending:   makeDemoMovies(8),
  animation:     makeDemoMovies(9),
  mystery:       makeDemoMovies(10),
  action:        makeDemoMovies(11),
  scifi:         makeDemoMovies(12),
  horror:        makeDemoMovies(13),
  comedy:        makeDemoMovies(14),
  drama:         makeDemoMovies(15),
  thriller:      makeDemoMovies(16),
  new_releases:  makeDemoMovies(17),
};

export default function SeeAllPage() {
  const { seeAllData, closeSeeAll, openMovieDetail } = useApp();
  const [movies,      setMovies]      = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [page,        setPage]        = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  
  const contentRef = useRef(null);

  const { title, movies: seedMovies, categoryKey } = seeAllData || {};

  const fetchPage = useCallback(async (p) => {
    if (!categoryKey) {
      // No category key — use seed movies (already all loaded)
      setMovies(seedMovies || []);
      setTotalPages(Math.max(1, Math.ceil((seedMovies || []).length / PER_PAGE)));
      return;
    }

    if (!HAS_KEY) {
      // No API key — use large demo set
      const demo = DEMO_BY_CATEGORY[categoryKey] || makeDemoMovies(99);
      setMovies(demo);
      setTotalPages(Math.ceil(demo.length / PER_PAGE));
      return;
    }

    // Has API key — fetch real TMDB data
    setLoading(true);
    try {
      const fetcher = CATEGORY_FETCHERS[categoryKey];
      if (!fetcher) { setMovies(seedMovies || []); setLoading(false); return; }

      // Fetch 3 TMDB pages at once per "visual page" to get ~60 movies per page
      const tmdbPage = (p - 1) * 3 + 1;
      const responses = await Promise.all([
        fetcher(tmdbPage),
        fetcher(tmdbPage + 1).catch(() => ({ results: [] })),
        fetcher(tmdbPage + 2).catch(() => ({ results: [] })),
      ]);
      const combined = responses.flatMap(r => r.results || []);
      // Deduplicate by id
      const seen = new Set();
      const unique = combined.filter(m => { if (seen.has(m.id)) return false; seen.add(m.id); return true; });
      setMovies(unique);
      // TMDB gives up to 500 pages, we group 3 per visual page → up to 166 visual pages
      const rawTotal = responses[0]?.total_pages || 1;
      setTotalPages(Math.min(Math.ceil(rawTotal / 3), 20)); // cap at 20 visual pages
    } catch (e) {
      console.error(e);
      setMovies(seedMovies || []);
    } finally {
      setLoading(false);
    }
  }, [categoryKey, seedMovies]);

  // Fetch when page changes
  useEffect(() => {
    if (!seeAllData) return;
    fetchPage(page);
    // Scroll back to top of content on page change
    contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [page, fetchPage, seeAllData]);

  // Reset page when category changes
  useEffect(() => { setPage(1); }, [categoryKey]);

  if (!seeAllData) return null;

  // For no-key mode, paginate the full demo array client-side
  const displayMovies = (!HAS_KEY && categoryKey)
    ? movies.slice((page - 1) * PER_PAGE, page * PER_PAGE)
    : movies; // API mode already returns the right slice

  const displayTotalPages = (!HAS_KEY && categoryKey)
    ? Math.ceil(movies.length / PER_PAGE)
    : totalPages;

  // Build pagination range (show max 7 page buttons, with ellipsis)
  const buildPages = (current, total) => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages = [];
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push("...");
      pages.push(total);
    } else if (current >= total - 3) {
      pages.push(1);
      pages.push("...");
      for (let i = total - 4; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push("...");
      for (let i = current - 1; i <= current + 1; i++) pages.push(i);
      pages.push("...");
      pages.push(total);
    }
    return pages;
  };

  const pageList = buildPages(page, displayTotalPages);

  return (
    <div className={styles.page}>
      <div className={styles.topBar} ref={contentRef}>
        <button className={styles.backBtn} onClick={closeSeeAll}>← Back</button>
        <div className={styles.titleWrap}>
          <h1 className={styles.title}>{title}</h1>
          {!loading && (
            <span className={styles.count}>
              {HAS_KEY && categoryKey
                ? `Page ${page} of ${displayTotalPages}`
                : `${movies.length} titles`
              }
            </span>
          )}
        </div>
      </div>

      {/* Loading skeleton */}
      {loading ? (
        <div className={styles.grid}>
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className={`skeleton ${styles.skeletonCard}`} />
          ))}
        </div>
      ) : displayMovies.length === 0 ? (
        <div className={styles.empty}>
          <span>🎬</span>
          <p>No movies found</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {displayMovies.map(m => (
            <MovieCard key={m.id} movie={m} onSelect={openMovieDetail} size="md" />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && displayTotalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={`${styles.pageBtn} ${styles.navBtn}`}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >‹ Prev</button>

          <div className={styles.pageNumbers}>
            {pageList.map((p, i) =>
              p === "..." ? (
                <span key={`ellipsis-${i}`} className={styles.ellipsis}>…</span>
              ) : (
                <button
                  key={p}
                  className={`${styles.pageBtn} ${p === page ? styles.active : ""}`}
                  onClick={() => setPage(p)}
                >{p}</button>
              )
            )}
          </div>

          <button
            className={`${styles.pageBtn} ${styles.navBtn}`}
            onClick={() => setPage(p => Math.min(displayTotalPages, p + 1))}
            disabled={page === displayTotalPages}
          >Next ›</button>
        </div>
      )}

    </div>
  );
}
