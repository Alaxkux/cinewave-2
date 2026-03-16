import { useState, useEffect } from "react";
import { useTMDB } from "../hooks/useTMDB";
import { useApp } from "../context/AppContext";
import HeroSection from "../components/sections/HeroSection";
import MovieRow from "../components/sections/MovieRow";
import ContinueWatchingRow from "../components/sections/ContinueWatchingRow";
import SearchResults from "../components/sections/SearchResults";
import SortBar from "../components/sections/SortBar";
import Footer from "../components/layout/Footer";
import styles from "./Home.module.css";

function NoApiKey() {
  return (
    <div style={{
      textAlign:"center", padding:"48px 24px",
      background:"rgba(99,102,241,0.06)", border:"1px solid rgba(99,102,241,0.2)",
      borderRadius:16, margin:"0 0 24px"
    }}>
      <div style={{fontSize:40,marginBottom:12}}>🔑</div>
      <h3 style={{fontFamily:"var(--font-display)",fontSize:17,color:"var(--text-primary)",marginBottom:8}}>
        Connect your TMDB API Key
      </h3>
      <p style={{fontSize:13,color:"var(--text-muted)",maxWidth:360,margin:"0 auto 16px",lineHeight:1.6}}>
        To load real movies, open <code style={{color:"#a5b4fc"}}>src/services/tmdb.js</code> and paste your free API key from{" "}
        <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noreferrer" style={{color:"#6366f1"}}>themoviedb.org</a>
      </p>
      <code style={{
        display:"block", background:"rgba(0,0,0,0.3)", borderRadius:8,
        padding:"8px 14px", fontSize:12, color:"#a5b4fc", maxWidth:400, margin:"0 auto"
      }}>
        export const TMDB_API_KEY = "your_key_here";
      </code>
    </div>
  );
}

function trimToFullRows(movies, cols) {
  if (!movies.length) return movies;
  const count = Math.floor(movies.length / cols) * cols;
  return movies.slice(0, Math.max(cols, count));
}

export default function Home({ searchQuery, contentRef }) {
  const { data, loading, hasKey, search } = useTMDB();
  const { continueWatching, activeNav, openMovieDetail } = useApp();
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const trending  = data.trending;
  const popular   = data.popular;
  const tvShows   = data.tvShows;
  const animation = data.animation;
  const mystery   = data.mystery;
  const cwMovies  = continueWatching;

  const lastWatched = cwMovies[0];
  const becauseRow = lastWatched && popular.length
    ? trimToFullRows(
        popular.filter(m =>
          m.id !== lastWatched.id &&
          m.genre_ids?.some(g => lastWatched.genre_ids?.includes(g))
        ), 5)
    : [];

  const COLS = 5;
  const navConfig = {
    "Movies":    [
      { title:"You might like",      list: trimToFullRows(popular, COLS),   category:"popular" },
      { title:"Top Rated",           list: trimToFullRows([...popular].sort((a,b)=>b.vote_average-a.vote_average), COLS), category:"top_rated" },
      { title:"New This Week",       list: trimToFullRows(data.newReleases||[], COLS), category:"new_releases" },
      { title:"Featured TV Series",  list: trimToFullRows(tvShows, COLS),   category:"tv_popular" },
    ],
    "TV Series": [
      { title:"Popular TV Shows",    list: trimToFullRows(tvShows, COLS),   category:"tv_popular" },
      { title:"Trending Now",        list: trimToFullRows(trending, COLS),  category:"trending" },
    ],
    "Animation": [
      { title:"Animation Movies",    list: trimToFullRows(animation, COLS), category:"animation" },
      { title:"Popular Picks",       list: trimToFullRows(popular, COLS),   category:"popular" },
    ],
    "Mystery":   [
      { title:"Mystery & Thriller",  list: trimToFullRows(mystery, COLS),   category:"mystery" },
      { title:"Also Popular",        list: trimToFullRows(popular, COLS),   category:"popular" },
    ],
    "More":      [
      { title:"Popular",             list: trimToFullRows(popular, COLS),   category:"popular" },
      { title:"Trending",            list: trimToFullRows(trending, COLS),  category:"trending" },
      { title:"TV Series",           list: trimToFullRows(tvShows, COLS),   category:"tv_popular" },
    ],
  };
  const rows = navConfig[activeNav] || navConfig["Movies"];

  useEffect(() => {
    if (!searchQuery || !hasKey) { setSearchResults([]); return; }
    setSearchLoading(true);
    search(searchQuery).then(res => {
      setSearchResults(res);
      setSearchLoading(false);
    });
  }, [searchQuery, hasKey, search]);

  return (
    <div className={styles.page}>
      {searchQuery ? (
        <div className={styles.inner}>
          <SearchResults query={searchQuery} results={searchResults} loading={searchLoading} onSelect={openMovieDetail} />
        </div>
      ) : (
        <>
          <div className={styles.heroWrap}>
            {!hasKey
              ? <div className={styles.heroPlaceholder}><div className={styles.heroSkeleton} /></div>
              : <HeroSection movies={trending} onSelect={openMovieDetail} />
            }
          </div>

          <div className={styles.inner} id="movie-rows-section">
            {!hasKey && <NoApiKey />}

            <SortBar />

            {rows.map(({ title, list, category }, i) => (
              <div key={title}>
                <MovieRow
                  title={title}
                  movies={list}
                  loading={loading && hasKey}
                  onSelect={openMovieDetail}
                  categoryKey={category}
                />
                {i === 0 && cwMovies.length > 0 && (
                  <div style={{ marginTop:20 }}>
                    <ContinueWatchingRow movies={cwMovies} onSelect={openMovieDetail} />
                  </div>
                )}
                {i === 1 && becauseRow.length > 0 && (
                  <div style={{ marginTop:20 }}>
                    <MovieRow
                      title={`Because you watched "${lastWatched.title||lastWatched.name}"`}
                      movies={becauseRow}
                      onSelect={openMovieDetail}
                      categoryKey="popular"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <Footer contentRef={contentRef} />
        </>
      )}
    </div>
  );
}
