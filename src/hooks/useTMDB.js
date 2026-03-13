import { useState, useEffect, useCallback } from "react";
import { tmdbService, TMDB_API_KEY } from "../services/tmdb";

export function useTMDB() {
  const [data, setData] = useState({
    trending: [],
    popular: [],
    trailers: [],
    tvShows: [],
    animation: [],
    mystery: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const hasKey = TMDB_API_KEY !== "YOUR_TMDB_API_KEY_HERE";

  useEffect(() => {
    if (!hasKey) return;
    setLoading(true);
    Promise.all([
      tmdbService.getTrending(),
      tmdbService.getPopular(),
      tmdbService.getUpcoming(),
      tmdbService.getTVPopular(),
      tmdbService.getAnimationMovies(),
      tmdbService.getMysteryMovies(),
    ])
      .then(([trending, popular, upcoming, tv, animation, mystery]) => {
        setData({
          trending: trending.results || [],
          popular: (popular.results || []).slice(0, 10),
          trailers: (upcoming.results || []).slice(0, 4),
          tvShows: (tv.results || []).slice(0, 10),
          animation: (animation.results || []).slice(0, 10),
          mystery: (mystery.results || []).slice(0, 10),
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [hasKey]);

  const search = useCallback(async (query) => {
    if (!hasKey || !query.trim()) return [];
    try {
      const res = await tmdbService.searchMovies(query);
      return res.results || [];
    } catch {
      return [];
    }
  }, [hasKey]);

  return { data, loading, error, hasKey, search };
}

export function useMovieDetails(id) {
  const [movie, setMovie] = useState(null);
  const [videos, setVideos] = useState([]);
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
        setVideos((vids.results || []).filter((v) => v.site === "YouTube"));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, hasKey]);

  return { movie, videos, loading };
}
