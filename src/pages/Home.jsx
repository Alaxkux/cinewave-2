import { useState, useEffect, useRef } from "react";
import { useTMDB } from "../hooks/useTMDB";
import { useApp } from "../context/AppContext";
import HeroSection from "../components/sections/HeroSection";
import MovieRow from "../components/sections/MovieRow";
import ContinueWatchingRow from "../components/sections/ContinueWatchingRow";
import SearchResults from "../components/sections/SearchResults";
import SortBar from "../components/sections/SortBar";
import Footer from "../components/layout/Footer";
import MovieModal from "../components/ui/MovieModal";
import styles from "./Home.module.css";

const mk = (id, title, overview, genreIds) => ({
  id, title, overview, genre_ids: genreIds,
  poster_path: null, backdrop_path: null,
  vote_average: parseFloat((6.5 + (id % 3) * 0.8).toFixed(1)),
  release_date: "2024-01-01",
});

const DEMO_TRENDING = [
  mk(1, "Spider-Man: Across the Spider-Verse", "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.", [16, 12, 28]),
  mk(2, "Oppenheimer", "The story of J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.", [18, 36]),
  mk(3, "Guardians of the Galaxy Vol. 3", "Peter Quill rallies his team on a mission to protect the universe and one of their own.", [28, 12, 35]),
  mk(4, "The Flash", "Barry Allen uses his super speed to change the past, but faces unintended consequences.", [14, 28]),
  mk(5, "Elemental", "In a city where fire, water, land and air residents live together, two unlikely souls discover something elemental.", [16, 35]),
];
const DEMO_POPULAR = [
  mk(6,  "The Flash",               "Barry Allen uses his super speed to change the past.", [14, 28]),
  mk(7,  "Manifest",                "A commercial airliner suddenly reappears after being missing.", [9648, 18]),
  mk(8,  "Elemental",               "Ember and Wade live in a city where elements live together.", [16, 35]),
  mk(9,  "Interstellar",            "A farmer sets out on a time travel journey to save Earth.", [878, 18]),
  mk(10, "Avatar: The Way of Water","Jake Sully lives with his newfound family on Pandora.", [878, 12]),
  mk(11, "John Wick: Chapter 4",    "John Wick uncovers a path to defeating The High Table.", [28, 53]),
  mk(12, "Dune: Part Two",          "Paul Atreides unites with the Fremen to seek revenge.", [878, 12]),
];
const DEMO_TV = [
  mk(20, "Breaking Bad",    "A chemistry teacher becomes a drug kingpin.", [80, 18]),
  mk(21, "Stranger Things", "Strange events unfold in a small Indiana town.", [878, 27]),
  mk(22, "The Mandalorian", "A lone bounty hunter travels the outer reaches of the galaxy.", [878, 12]),
  mk(23, "Game of Thrones", "Noble families battle for control of the Iron Throne.", [18, 37]),
  mk(24, "The Boys",        "Superheroes misuse their powers. A group fights back.", [28, 18]),
  mk(25, "Dark",            "A time-travel conspiracy unfolds in a German town.", [9648, 878]),
];

export default function Home({ searchQuery, contentRef }) {
  const { data, loading, hasKey, search } = useTMDB();
  const { continueWatching, activeNav } = useApp();
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const trending  = hasKey && data.trending.length  ? data.trending  : DEMO_TRENDING;
  const popular   = hasKey && data.popular.length   ? data.popular   : DEMO_POPULAR;
  const tvShows   = hasKey && data.tvShows.length   ? data.tvShows   : DEMO_TV;
  const animation = hasKey && data.animation.length ? data.animation : DEMO_POPULAR.filter(m => m.genre_ids.includes(16));
  const mystery   = hasKey && data.mystery.length   ? data.mystery   : DEMO_POPULAR.filter(m => m.genre_ids.includes(9648));

  // Only real watched movies — no demo data injected
  const cwMovies = continueWatching;

  const navConfig = {
    "Movies":    [
      { title: "You might like",     list: popular },
      { title: "Top Rated",          list: [...popular].sort((a,b) => b.vote_average - a.vote_average) },
      { title: "Featured TV Series", list: tvShows },
    ],
    "TV Series": [
      { title: "Popular TV Shows",   list: tvShows },
      { title: "Trending Now",       list: trending },
    ],
    "Animation": [
      { title: "Animation Movies",   list: animation },
      { title: "Popular Picks",      list: popular },
    ],
    "Mystery":   [
      { title: "Mystery & Thriller", list: mystery },
      { title: "Also Popular",       list: popular },
    ],
    "More":      [
      { title: "Popular",            list: popular },
      { title: "Trending",           list: trending },
      { title: "TV Series",          list: tvShows },
    ],
  };
  const rows = navConfig[activeNav] || navConfig["Movies"];

  useEffect(() => {
    if (!searchQuery) { setSearchResults([]); return; }
    setSearchLoading(true);
    search(searchQuery).then(res => {
      setSearchResults(res.length > 0 ? res : DEMO_POPULAR);
      setSearchLoading(false);
    });
  }, [searchQuery, search]);

  return (
    <div className={styles.page}>
      {searchQuery ? (
        <div className={styles.inner}>
          <SearchResults query={searchQuery} results={searchResults} loading={searchLoading} onSelect={setSelectedMovie} />
        </div>
      ) : (
        <>
          {/* Hero — full width with just outer padding */}
          <div className={styles.heroWrap}>
            <HeroSection movies={trending} onSelect={setSelectedMovie} />
          </div>

          <div className={styles.inner}>
            {/* Sort bar linked to nav tabs */}
            <SortBar />

            {/* Movie rows — Continue Watching inserted after row[0] only if user has watched something */}
            {rows.map(({ title, list }, i) => (
              <>
                <MovieRow key={title} title={title} movies={list} loading={loading} onSelect={setSelectedMovie} />
                {i === 0 && cwMovies.length > 0 && (
                  <ContinueWatchingRow key="cw" movies={cwMovies} onSelect={setSelectedMovie} />
                )}
              </>
            ))}
          </div>

          <Footer contentRef={contentRef} />
        </>
      )}

      {selectedMovie && <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />}
    </div>
  );
}
