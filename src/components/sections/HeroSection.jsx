import { useState, useEffect, useRef } from "react";
import { getBackdropUrl } from "../../services/tmdb";
import { getGenreLabel, getPlaceholderGradient } from "../../utils/genres";
import { PlayIcon, DownloadIcon, DotsIcon } from "../ui/Icons";
import styles from "./HeroSection.module.css";

export default function HeroSection({ movies = [], onSelect }) {
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const timerRef = useRef(null);

  const goTo = (i) => {
    if (fading || i === index) return;
    setFading(true);
    setTimeout(() => { setIndex(i); setFading(false); }, 280);
  };

  // Auto-rotate
  useEffect(() => {
    if (movies.length < 2) return;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setIndex(i => (i + 1) % movies.length);
        setFading(false);
      }, 280);
    }, 7000);
    return () => clearInterval(timerRef.current);
  }, [movies.length, index]);

  const movie = movies[index];
  if (!movie) return <div className={styles.hero} style={{ background: getPlaceholderGradient(0) }} />;

  const backdropUrl = getBackdropUrl(movie.backdrop_path, "original");
  const genres = getGenreLabel(movie.genre_ids || []);
  const rating = movie.vote_average?.toFixed(1);

  return (
    <div className={`${styles.hero} ${fading ? styles.fading : ""}`}>

      {/* Backdrop — full width, centered */}
      {backdropUrl
        ? <img key={movie.id} src={backdropUrl} alt="" className={styles.backdrop} />
        : <div className={styles.backdropPlaceholder} style={{ background: getPlaceholderGradient(movie.id) }} />
      }

      {/* Gradient overlays */}
      <div className={styles.overlayLeft} />
      <div className={styles.overlayBottom} />

      {/* Top badges */}
      <div className={styles.topRow}>
        <div className={styles.trendingBadge}>
          <span className={styles.trendingDot}>●</span> Now Trending
        </div>
        {rating && <div className={styles.ratingBadge}>⭐ {rating}</div>}
      </div>

      {/* Main content */}
      <div className={styles.content}>
        {genres.length > 0 && (
          <div className={styles.genres}>
            {genres.map(g => <span key={g} className={styles.genreTag}>{g}</span>)}
          </div>
        )}
        <h1 className={styles.title}>{movie.title || movie.name}</h1>
        <p className={styles.overview}>{movie.overview}</p>
        <div className={styles.actions}>
          <button className={styles.watchBtn} onClick={() => onSelect?.(movie)}>
            <PlayIcon size={15} /> Watch Now
          </button>
          <button className={styles.downloadBtn} onClick={() => onSelect?.(movie)}>
            <DownloadIcon size={15} /> Download
          </button>
          <button className={styles.moreBtn}><DotsIcon size={15} /></button>
        </div>
      </div>

      {/* Dots — one per movie, no arrows */}
      {movies.length > 1 && (
        <div className={styles.dotsRow}>
          {movies.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === index ? styles.dotActive : ""}`}
              onClick={() => goTo(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
