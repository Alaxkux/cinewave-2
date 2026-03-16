import { useState, useEffect, useRef } from "react";
import { useApp } from "../../context/AppContext";
import { getBackdropUrl, getPosterUrl } from "../../services/tmdb";
import { getGenreLabel } from "../../utils/genres";
import { useMovieDetails } from "../../hooks/useTMDB";
import { PlayIcon, HeartIcon, DownloadIcon, StarIcon } from "../../components/ui/Icons";
import { toast } from "../../components/ui/Toast";
import styles from "./MovieDetail.module.css";

/* ── Trailer Popup ── */
function TrailerPopup({ videos, onClose }) {
  const [activeVideo, setActiveVideo] = useState(videos[0]);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [showAllVideos, setShowAllVideos]     = useState(false);
  const moreRef = useRef(null);

  // close "more options" when clicking outside
  useEffect(() => {
    const h = (e) => { if (!moreRef.current?.contains(e.target)) setShowMoreOptions(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handlePlayTrailer = () => {
    window.open(`https://www.youtube.com/watch?v=${activeVideo.key}`, "_blank");
  };

  const handleShare = () => {
    const url = `https://www.youtube.com/watch?v=${activeVideo.key}`;
    if (navigator.share) {
      navigator.share({ title: activeVideo.name, url }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(url);
      toast.success("Link copied to clipboard!");
    }
    setShowMoreOptions(false);
  };

  return (
    <div className={styles.trailerOverlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.trailerPopup}>
        {/* Header */}
        <div className={styles.trailerHeader}>
          <h3 className={styles.trailerTitle}>Trailer</h3>
          <button className={styles.trailerClose} onClick={onClose}>✕</button>
        </div>

        {/* YouTube embed */}
        <div className={styles.trailerEmbed}>
          <iframe
            src={`https://www.youtube.com/embed/${activeVideo.key}?autoplay=1&rel=0`}
            title={activeVideo.name}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Video info */}
        <div className={styles.trailerInfo}>
          <p className={styles.trailerName}>{activeVideo.name}</p>
          <p className={styles.trailerMeta}>YouTube · {activeVideo.type}</p>
        </div>

        {/* Action buttons */}
        <div className={styles.trailerActions}>
          <button className={styles.trailerPlayBtn} onClick={handlePlayTrailer}>
            <PlayIcon size={14} /> Play Trailer
          </button>

          {/* More Options */}
          <div className={styles.moreWrap} ref={moreRef}>
            <button
              className={styles.trailerMoreBtn}
              onClick={() => setShowMoreOptions(d => !d)}
            >More Options</button>
            {showMoreOptions && (
              <div className={styles.moreMenu}>
                <button className={styles.moreItem} onClick={handlePlayTrailer}>
                  ▶️ Open on YouTube
                </button>
                <button className={styles.moreItem} onClick={() => { setShowAllVideos(true); setShowMoreOptions(false); }}>
                  🎬 More Trailers / Clips
                </button>
                <button className={styles.moreItem} onClick={handleShare}>
                  🔗 Share
                </button>
              </div>
            )}
          </div>
        </div>

        {/* More trailers list */}
        {showAllVideos && videos.length > 1 && (
          <div className={styles.videoList}>
            <p className={styles.videoListTitle}>All Videos</p>
            {videos.map(v => (
              <button
                key={v.key}
                className={`${styles.videoItem} ${activeVideo.key === v.key ? styles.videoItemActive : ""}`}
                onClick={() => { setActiveVideo(v); setShowAllVideos(false); }}
              >
                <span className={styles.videoItemIcon}>▶</span>
                <div className={styles.videoItemInfo}>
                  <p className={styles.videoItemName}>{v.name}</p>
                  <p className={styles.videoItemType}>{v.type}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main Modal ── */
export default function MovieDetailModal() {
  const {
    movieDetail, closeMovieDetail,
    toggleFavorite, isFavorite,
    toggleDownload, isDownloaded,
    addToContinueWatching,
  } = useApp();

  const { movie: details, videos } = useMovieDetails(movieDetail?.id);
  const [userRating,   setUserRating]   = useState(0);
  const [hoverRating,  setHoverRating]  = useState(0);
  const [review,       setReview]       = useState("");
  const [reviews,      setReviews]      = useState([]);
  const [showTrailer,  setShowTrailer]  = useState(false);
  const overlayRef = useRef(null);

  const movie   = details || movieDetail;
  const fav     = isFavorite(movie?.id);
  const dl      = isDownloaded(movie?.id);
  // All YouTube videos
  const allVideos = videos?.filter(v => v.site === "YouTube") || [];
  const trailer   = allVideos[0];

  useEffect(() => {
    setUserRating(0); setHoverRating(0); setReview(""); setReviews([]); setShowTrailer(false);
  }, [movieDetail?.id]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") { if (showTrailer) setShowTrailer(false); else closeMovieDetail(); } };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [closeMovieDetail, showTrailer]);

  if (!movie) return null;

  const backdropUrl = getBackdropUrl(movie.backdrop_path, "original");
  const posterUrl   = getPosterUrl(movie.poster_path, "w342");
  const genres      = getGenreLabel(movie.genre_ids || movie.genres?.map(g => g.id) || []);
  const rating      = movie.vote_average?.toFixed(1);
  const year        = movie.release_date?.slice(0, 4) || movie.first_air_date?.slice(0, 4);
  const runtime     = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : null;

  const handleWatch = () => {
    addToContinueWatching({ ...movie, subtitle: "Continue watching", progress: 5 });
    if (trailer) {
      setShowTrailer(true);
    } else {
      toast.info("No trailer available for this title.");
    }
  };
  const handleFav = () => { toggleFavorite(movie); toast.success(fav ? "Removed from saved" : "Saved to your list"); };
  const handleDl  = () => { toggleDownload(movie); toast.info(dl ? "Download removed" : "Downloading…"); };
  const submitReview = () => {
    if (!review.trim() || !userRating) { toast.error("Add a rating and write something first"); return; }
    setReviews(prev => [{ id: Date.now(), user: "You", rating: userRating, text: review, time: "just now" }, ...prev]);
    setReview(""); setUserRating(0);
    toast.success("Review posted!");
  };

  return (
    <>
      <div className={styles.overlay} ref={overlayRef} onClick={(e) => e.target === overlayRef.current && closeMovieDetail()}>
        <div className={styles.modal}>
          <div className={styles.handle} />
          <button className={styles.closeBtn} onClick={closeMovieDetail} aria-label="Close">✕</button>

          <div className={styles.body}>

            {/* Full background image */}
            <div className={styles.heroBg}>
              {backdropUrl
                ? <img src={backdropUrl} alt="" className={styles.heroBgImg} />
                : <div className={styles.heroBgFallback} />
              }
              {/* heavy gradient so text is readable */}
              <div className={styles.heroBgGradient} />
            </div>

            {/* Content floats above the bg */}
            <div className={styles.heroContent}>
              {/* Poster + title/specs row */}
              <div className={styles.mainRow}>
                {posterUrl && (
                  <img
                    src={posterUrl}
                    alt={movie.title || movie.name}
                    className={styles.poster}
                    onError={e => { e.target.style.display = "none"; }}
                  />
                )}
                <div className={styles.info}>
                  <h2 className={styles.title}>{movie.title || movie.name}</h2>
                  <div className={styles.specRow}>
                    {rating && <span className={styles.specRating}><StarIcon size={10} /> {rating}</span>}
                    {year    && <span className={styles.spec}>{year}</span>}
                    {runtime && <span className={styles.spec}>{runtime}</span>}
                    <span className={styles.spec}>HD</span>
                    {genres.slice(0, 2).map(g => <span key={g} className={styles.specGenre}>{g}</span>)}
                  </div>
                  <p className={styles.overview}>{movie.overview}</p>
                </div>
              </div>

              {/* Action buttons — always one straight line */}
              <div className={styles.actions}>
                <button className={styles.watchBtn} onClick={handleWatch}>
                  <PlayIcon size={13} /> Watch Now
                </button>
                <button className={`${styles.actionBtn} ${fav ? styles.actionActive : ""}`} onClick={handleFav}>
                  <HeartIcon size={13} filled={fav} />
                  {fav ? "Saved" : "Save"}
                </button>
                <button className={`${styles.actionBtn} ${dl ? styles.actionActive : ""}`} onClick={handleDl}>
                  <DownloadIcon size={13} />
                  {dl ? "Downloaded" : "Download"}
                </button>
              </div>
            </div>

            {/* Rate & Review */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Rate this</h3>
              <div className={styles.starsRow}>
                {[1,2,3,4,5].map(s => (
                  <button key={s}
                    className={`${styles.star} ${s <= (hoverRating || userRating) ? styles.starOn : ""}`}
                    onMouseEnter={() => setHoverRating(s)} onMouseLeave={() => setHoverRating(0)}
                    onClick={() => { setUserRating(s); toast.success(`Rated ${s}/5 ⭐`); }}
                  >★</button>
                ))}
                {userRating > 0 && <span className={styles.ratingLabel}>{userRating}/5</span>}
              </div>
              <textarea className={styles.reviewInput} placeholder="Write a short review…"
                value={review} onChange={e => setReview(e.target.value)} rows={2} />
              <button className={styles.reviewBtn} onClick={submitReview}>Post Review</button>
            </div>

            {reviews.length > 0 && (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Reviews</h3>
                <div className={styles.reviewList}>
                  {reviews.map(r => (
                    <div key={r.id} className={styles.reviewCard}>
                      <div className={styles.reviewTop}>
                        <div className={styles.reviewAvatar}>{r.user[0]}</div>
                        <div className={styles.reviewMeta}>
                          <span className={styles.reviewUser}>{r.user}</span>
                          <span className={styles.reviewStars}>{"★".repeat(r.rating)}{"☆".repeat(5-r.rating)}</span>
                        </div>
                        <span className={styles.reviewTime}>{r.time}</span>
                      </div>
                      <p className={styles.reviewText}>{r.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div style={{ height: 24 }} />
          </div>
        </div>
      </div>

      {/* Trailer popup — rendered outside modal so it overlays everything */}
      {showTrailer && allVideos.length > 0 && (
        <TrailerPopup videos={allVideos} onClose={() => setShowTrailer(false)} />
      )}
    </>
  );
}
