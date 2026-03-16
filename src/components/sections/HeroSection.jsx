import { useState, useEffect, useRef } from "react";
import { getBackdropUrl } from "../../services/tmdb";
import { getGenreLabel, getPlaceholderGradient } from "../../utils/genres";
import { PlayIcon, DownloadIcon, DotsIcon, HeartIcon, ShareIcon } from "../ui/Icons";
import { useApp } from "../../context/AppContext";
import { toast } from "../ui/Toast";
import styles from "./HeroSection.module.css";

function DotsMenu({ movie, onClose }) {
  const { toggleFavorite, isFavorite, toggleDownload } = useApp();
  const fav = isFavorite(movie?.id);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (!ref.current?.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);

  const share = () => {
    const text = `Check out "${movie.title || movie.name}" on Cinewave!`;
    if (navigator.share) {
      navigator.share({ title: movie.title || movie.name, text }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(text);
      toast.success("Link copied to clipboard!");
    }
    onClose();
  };

  return (
    <div className={styles.dotsMenu} ref={ref}>
      <button className={styles.dotsItem} onClick={() => { toggleFavorite(movie); toast.success(fav ? "Removed from saved" : "Added to saved list"); onClose(); }}>
        <HeartIcon size={14} filled={fav} /> {fav ? "Remove from List" : "Add to List"}
      </button>
      <button className={styles.dotsItem} onClick={share}>
        <ShareIcon size={14} /> Share
      </button>
      <div className={styles.dotsDivider} />
      <button className={styles.dotsItem} onClick={() => { toggleDownload(movie); toast.info("Download started"); onClose(); }}>
        <DownloadIcon size={14} /> Download
      </button>
    </div>
  );
}

export default function HeroSection({ movies = [], onSelect }) {
  const { addToContinueWatching } = useApp();
  const [index,    setIndex]    = useState(0);
  const [fading,   setFading]   = useState(false);
  const [dotsOpen, setDotsOpen] = useState(false);
  const timerRef = useRef(null);
  const touchX   = useRef(null);
  const touchY   = useRef(null);

  const goTo = (i) => {
    if (fading || i === index) return;
    setFading(true);
    setDotsOpen(false);
    setTimeout(() => { setIndex(i); setFading(false); }, 280);
  };

  const next = () => { setIndex(i => { const n=(i+1)%movies.length; return n; }); };
  const prev = () => { setIndex(i => { const n=(i-1+movies.length)%movies.length; return n; }); };

  useEffect(() => {
    if (movies.length < 2) return;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setFading(true);
      setTimeout(() => { setIndex(i => (i+1)%movies.length); setFading(false); }, 280);
    }, 7000);
    return () => clearInterval(timerRef.current);
  }, [movies.length]);

  // Reliable touch swipe
  const onTouchStart = (e) => {
    touchX.current = e.touches[0].clientX;
    touchY.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    const dy = Math.abs(e.changedTouches[0].clientY - touchY.current);
    if (dy < 40 && Math.abs(dx) > 45) {
      clearInterval(timerRef.current);
      dx < 0 ? next() : prev();
    }
    touchX.current = null; touchY.current = null;
  };

  const movie = movies[index];
  if (!movie) return (
    <div className={styles.hero}>
      <div className={styles.skeleton} />
    </div>
  );

  const backdropUrl = getBackdropUrl(movie.backdrop_path, "original");
  const genres      = getGenreLabel(movie.genre_ids || []);
  const rating      = movie.vote_average?.toFixed(1);

  const handleWatch = () => {
    addToContinueWatching({ ...movie, progress: 5, subtitle: "Continue watching" });
    onSelect?.(movie);
  };

  return (
    <div
      className={`${styles.hero} ${fading ? styles.fading : ""}`}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Backdrop */}
      {backdropUrl
        ? <img key={movie.id} src={backdropUrl} alt="" className={styles.backdrop} />
        : <div className={styles.backdropPlaceholder} style={{ background: getPlaceholderGradient(movie.id) }} />
      }
      <div className={styles.overlayLeft} />
      <div className={styles.overlayBottom} />

      {/* Top badges */}
      <div className={styles.topRow}>
        <div className={styles.trendingBadge}>
          <span className={styles.trendingDot}>●</span> Now Trending
        </div>
        {rating && <div className={styles.ratingBadge}>⭐ {rating}</div>}
      </div>

      {/* Content — shifted down with more breathing room */}
      <div className={styles.content}>
        {genres.length > 0 && (
          <div className={styles.genres}>
            {genres.map(g => <span key={g} className={styles.genreTag}>{g}</span>)}
          </div>
        )}
        <h1 className={styles.title}>{movie.title || movie.name}</h1>
        <p className={styles.overview}>{movie.overview}</p>

        <div className={styles.actions}>
          <button className={styles.watchBtn} onClick={handleWatch}>
            <PlayIcon size={13} /> Watch Now
          </button>
          <button className={styles.downloadBtn} onClick={() => { onSelect?.(movie); }}>
            <DownloadIcon size={13} /> Download
          </button>
          <div className={styles.dotsWrap}>
            <button className={styles.moreBtn} onClick={() => setDotsOpen(d => !d)}>
              <DotsIcon size={14} />
            </button>
            {dotsOpen && <DotsMenu movie={movie} onClose={() => setDotsOpen(false)} />}
          </div>
        </div>
      </div>

      {/* Dots — hidden on mobile */}
      {movies.length > 1 && (
        <div className={styles.dotsRow}>
          {movies.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === index ? styles.dotActive : ""}`}
              onClick={() => goTo(i)}
              aria-label={`Slide ${i+1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
