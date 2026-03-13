export const GENRE_MAP = {
  28:    { label: "Action",      color: "#FF4E4E" },
  12:    { label: "Adventure",   color: "#FF9B4E" },
  16:    { label: "Animation",   color: "#A855F7" },
  35:    { label: "Comedy",      color: "#F59E0B" },
  80:    { label: "Crime",       color: "#EF4444" },
  99:    { label: "Documentary", color: "#10B981" },
  18:    { label: "Drama",       color: "#3B82F6" },
  10751: { label: "Family",      color: "#EC4899" },
  14:    { label: "Fantasy",     color: "#8B5CF6" },
  36:    { label: "History",     color: "#D97706" },
  27:    { label: "Horror",      color: "#6B7280" },
  10402: { label: "Music",       color: "#06B6D4" },
  9648:  { label: "Mystery",     color: "#6366F1" },
  10749: { label: "Romance",     color: "#F43F5E" },
  878:   { label: "Sci-Fi",      color: "#0EA5E9" },
  53:    { label: "Thriller",    color: "#84CC16" },
  10752: { label: "War",         color: "#475569" },
  37:    { label: "Western",     color: "#92400E" },
  10770: { label: "TV Movie",    color: "#14B8A6" },
};

export const PLACEHOLDER_GRADIENTS = [
  "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
  "linear-gradient(135deg, #0f3460 0%, #533483 100%)",
  "linear-gradient(135deg, #1b262c 0%, #0f4c75 100%)",
  "linear-gradient(135deg, #2d1b69 0%, #11998e 100%)",
  "linear-gradient(135deg, #373b44 0%, #4286f4 100%)",
  "linear-gradient(135deg, #1a1a2e 0%, #e94560 100%)",
  "linear-gradient(135deg, #200122 0%, #6f0000 100%)",
  "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
];

export function getGenreInfo(ids = []) {
  for (const id of ids) {
    if (GENRE_MAP[id]) return GENRE_MAP[id];
  }
  return { label: "Movie", color: "#6366F1" };
}

export function getPlaceholderGradient(id) {
  return PLACEHOLDER_GRADIENTS[id % PLACEHOLDER_GRADIENTS.length];
}

export function getGenreLabel(ids = []) {
  return ids
    .slice(0, 2)
    .map((id) => GENRE_MAP[id]?.label)
    .filter(Boolean);
}
