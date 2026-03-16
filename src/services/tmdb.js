export const TMDB_API_KEY = "f8219d7b30271f44e74993e7463b145b";

export const TMDB_BASE_URL = "https://api.themoviedb.org/3";
export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

export const IMAGE_SIZES = {
  poster:   { sm:"w185", md:"w342", lg:"w500", xl:"w780", original:"original" },
  backdrop: { sm:"w300", md:"w780", lg:"w1280", original:"original" },
};

export function getPosterUrl(path, size = "md") {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${IMAGE_SIZES.poster[size]}${path}`;
}
export function getBackdropUrl(path, size = "lg") {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${IMAGE_SIZES.backdrop[size]}${path}`;
}

async function request(endpoint, params = {}) {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.set("api_key", TMDB_API_KEY);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TMDB error: ${res.status}`);
  return res.json();
}

export const tmdbService = {
  getTrending:       (timeWindow = "day", page = 1) => request(`/trending/movie/${timeWindow}`, { page }),
  getPopular:        (page = 1) => request("/movie/popular", { page }),
  getUpcoming:       (page = 1) => request("/movie/upcoming", { page }),
  getNowPlaying:     (page = 1) => request("/movie/now_playing", { page }),
  getTopRated:       (page = 1) => request("/movie/top_rated", { page }),
  searchMovies:      (query, page = 1) => request("/search/movie", { query, page }),
  getMovieDetails:   (id) => request(`/movie/${id}`),
  getMovieVideos:    (id) => request(`/movie/${id}/videos`),
  getTVPopular:      (page = 1) => request("/tv/popular", { page }),
  getTVTopRated:     (page = 1) => request("/tv/top_rated", { page }),
  getTVTrending:     (page = 1) => request("/trending/tv/week", { page }),
  getAnimationMovies:(page = 1) => request("/discover/movie", { with_genres:"16", sort_by:"popularity.desc", page }),
  getMysteryMovies:  (page = 1) => request("/discover/movie", { with_genres:"9648", sort_by:"popularity.desc", page }),
  getActionMovies:   (page = 1) => request("/discover/movie", { with_genres:"28", sort_by:"popularity.desc", page }),
  getSciFiMovies:    (page = 1) => request("/discover/movie", { with_genres:"878", sort_by:"popularity.desc", page }),
  getHorrorMovies:   (page = 1) => request("/discover/movie", { with_genres:"27", sort_by:"popularity.desc", page }),
  getComedyMovies:   (page = 1) => request("/discover/movie", { with_genres:"35", sort_by:"popularity.desc", page }),
  getDramaMovies:    (page = 1) => request("/discover/movie", { with_genres:"18", sort_by:"popularity.desc", page }),
  getThrillerMovies: (page = 1) => request("/discover/movie", { with_genres:"53", sort_by:"popularity.desc", page }),
  getNewReleases:    (page = 1) => request("/discover/movie", { sort_by:"release_date.desc", "vote_count.gte":"100", page }),
  getGenres:         () => request("/genre/movie/list"),

  // Fetch multiple pages at once and merge
  getPagedResults: async (fetcher, pages = 3) => {
    const results = await Promise.all(
      Array.from({ length: pages }, (_, i) => fetcher(i + 1))
    );
    return {
      results: results.flatMap(r => r.results || []),
      total_pages: results[0]?.total_pages || 1,
      total_results: results[0]?.total_results || 0,
    };
  },
};

// Map category keys → fetcher functions (used by SeeAll)
export const CATEGORY_FETCHERS = {
  "popular":          (p) => tmdbService.getPopular(p),
  "trending":         (p) => tmdbService.getTrending("day", p),
  "top_rated":        (p) => tmdbService.getTopRated(p),
  "upcoming":         (p) => tmdbService.getUpcoming(p),
  "now_playing":      (p) => tmdbService.getNowPlaying(p),
  "tv_popular":       (p) => tmdbService.getTVPopular(p),
  "tv_top_rated":     (p) => tmdbService.getTVTopRated(p),
  "tv_trending":      (p) => tmdbService.getTVTrending(p),
  "animation":        (p) => tmdbService.getAnimationMovies(p),
  "mystery":          (p) => tmdbService.getMysteryMovies(p),
  "action":           (p) => tmdbService.getActionMovies(p),
  "scifi":            (p) => tmdbService.getSciFiMovies(p),
  "horror":           (p) => tmdbService.getHorrorMovies(p),
  "comedy":           (p) => tmdbService.getComedyMovies(p),
  "drama":            (p) => tmdbService.getDramaMovies(p),
  "thriller":         (p) => tmdbService.getThrillerMovies(p),
  "new_releases":     (p) => tmdbService.getNewReleases(p),
};
