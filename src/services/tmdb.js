// ============================================================
// 🔑 PASTE YOUR TMDB API KEY HERE
// ============================================================
export const TMDB_API_KEY = "f8219d7b30271f44e74993e7463b145b";

export const TMDB_BASE_URL = "https://api.themoviedb.org/3";
export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

export const IMAGE_SIZES = {
  poster: {
    sm: "w185",
    md: "w342",
    lg: "w500",
    xl: "w780",
    original: "original",
  },
  backdrop: {
    sm: "w300",
    md: "w780",
    lg: "w1280",
    original: "original",
  },
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
  getTrending: (timeWindow = "day") => request(`/trending/movie/${timeWindow}`),
  getPopular: (page = 1) => request("/movie/popular", { page }),
  getUpcoming: () => request("/movie/upcoming"),
  getNowPlaying: () => request("/movie/now_playing"),
  getTopRated: () => request("/movie/top_rated"),
  searchMovies: (query) => request("/search/movie", { query }),
  getMovieDetails: (id) => request(`/movie/${id}`),
  getMovieVideos: (id) => request(`/movie/${id}/videos`),
  getTVPopular: () => request("/tv/popular"),
  getAnimationMovies: () =>
    request("/discover/movie", { with_genres: "16", sort_by: "popularity.desc" }),
  getMysteryMovies: () =>
    request("/discover/movie", { with_genres: "9648", sort_by: "popularity.desc" }),
  getGenres: () => request("/genre/movie/list"),
};
