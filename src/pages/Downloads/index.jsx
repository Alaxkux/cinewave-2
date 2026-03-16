
import { useApp } from "../../context/AppContext";
import { getPosterUrl } from "../../services/tmdb";
import { getGenreInfo, getPlaceholderGradient } from "../../utils/genres";
import { PlayIcon, DownloadIcon } from "../../components/ui/Icons";
import EmptyState from "../../components/ui/EmptyState";
import { toast } from "../../components/ui/Toast";
import styles from "./Downloads.module.css";

export default function DownloadsPage() {
  const { downloads, toggleDownload, setActivePage, openMovieDetail } = useApp();
  
  const totalSize = downloads.reduce((acc, m) => acc + parseFloat(m.size || 0), 0).toFixed(1);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>DOWNLOADS</h1>
        <p className={styles.pageSubtitle}>Movies and shows saved for offline viewing</p>
        {downloads.length > 0 && (
          <p className={styles.storageInfo}>{downloads.length} file{downloads.length !== 1 ? "s" : ""} · {totalSize} GB used</p>
        )}
      </div>

      {downloads.length === 0 ? (
        <EmptyState type="downloads" action="Find Movies to Download" onAction={() => setActivePage("home")} />
      ) : (
        <div className={styles.grid}>
          {downloads.map(movie => {
            const imgUrl = getPosterUrl(movie.poster_path, "md");
            const genre  = getGenreInfo(movie.genre_ids || []);
            return (
              <div
                key={movie.id}
                className={styles.card}
                style={!imgUrl ? { background: getPlaceholderGradient(movie.id) } : {}}
                onClick={() => openMovieDetail(movie)}
              >
                {imgUrl && <img src={imgUrl} alt={movie.title} className={styles.cardImg} loading="lazy" />}
                <div className={styles.cardOverlay} />
                <div className={styles.badge} style={{ background: genre.color }}>{genre.label}</div>
                <div className={styles.savedBadge}><DownloadIcon size={9}/> Saved</div>
                <button
                  className={styles.removeBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDownload(movie);
                    toast.info(`Removed "${movie.title || movie.name}"`);
                  }}
                  aria-label="Remove"
                >✕</button>
                <div className={styles.cardBottom}>
                  <div className={styles.cardInfo}>
                    <p className={styles.cardTitle}>{movie.title || movie.name}</p>
                    <p className={styles.cardMeta}>{movie.size}</p>
                  </div>
                  <button className={styles.playBtn} onClick={(e) => { e.stopPropagation(); openMovieDetail(movie); }}>
                    <PlayIcon size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
