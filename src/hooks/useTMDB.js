import { useState, useEffect, useCallback } from "react";
import { tmdbService, TMDB_API_KEY } from "../services/tmdb";

export function useTMDB() {
  const [data, setData] = useState({
    trending: [], popular: [], tvShows: [],
    animation: [], mystery: [], newReleases: [],
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const hasKey = TMDB_API_KEY !== "YOUR_TMDB_API_KEY_HERE";

  useEffect(() => {
    if (!hasKey) return;
    setLoading(true);
    Promise.all([
      tmdbService.getTrending(),
      tmdbService.getPopular(),
      tmdbService.getTVPopular(),
      tmdbService.getAnimationMovies(),
      tmdbService.getMysteryMovies(),
      tmdbService.getNewReleases(),
    ])
      .then(([trending, popular, tv, animation, mystery, newReleases]) => {
        setData({
          trending:    trending.results    || [],
          popular:     popular.results     || [],
          tvShows:     tv.results          || [],
          animation:   animation.results   || [],
          mystery:     mystery.results     || [],
          newReleases: newReleases.results || [],
        });
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [hasKey]);

  const search = useCallback(async (query) => {
    if (!hasKey || !query.trim()) return [];
    try {
      const res = await tmdbService.searchMovies(query);
      return res.results || [];
    } catch { return []; }
  }, [hasKey]);

  return { data, loading, error, hasKey, search };
}

export function useMovieDetails(id) {
  const [movie,   setMovie]   = useState(null);
  const [videos,  setVideos]  = useState([]);
  const [loading, setLoading] = useState(false);
  const hasKey = TMDB_API_KEY !== "YOUR_TMDB_API_KEY_HERE";

  useEffect(() => {
    if (!id || !hasKey) return;
    setLoading(true);
    Promise.all([
      tmdbService.getMovieDetails(id),
      tmdbService.getMovieVideos(id),
    ])
      .then(([details, vids]) => {
        setMovie(details);
        setVideos((vids.results || []).filter(v => v.site === "YouTube"));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, hasKey]);

  return { movie, videos, loading };
}
