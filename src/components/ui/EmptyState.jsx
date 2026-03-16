import styles from "./EmptyState.module.css";

const PRESETS = {
  saved:     { emoji: "🎬", title: "Nothing saved yet",     sub: "Hit the ❤️ on any movie to save it here" },
  downloads: { emoji: "⬇️", title: "No downloads yet",      sub: "Download movies to watch them offline" },
  watching:  { emoji: "▶️", title: "Nothing in progress",   sub: "Start watching a movie to see it here" },
  search:    { emoji: "🔍", title: "No results found",      sub: "Try a different title, genre or keyword" },
  generic:   { emoji: "📭", title: "Nothing here yet",      sub: "Check back later" },
};

export default function EmptyState({ type = "generic", title, sub, action, onAction }) {
  const preset = PRESETS[type] || PRESETS.generic;
  return (
    <div className={styles.wrap}>
      <div className={styles.emoji}>{preset.emoji}</div>
      <h3 className={styles.title}>{title || preset.title}</h3>
      <p className={styles.sub}>{sub || preset.sub}</p>
      {action && (
        <button className={styles.btn} onClick={onAction}>{action}</button>
      )}
    </div>
  );
}
