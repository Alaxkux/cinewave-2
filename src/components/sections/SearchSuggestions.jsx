import { useState, useEffect, useRef } from "react";
import { getPosterUrl } from "../../services/tmdb";
import { getGenreInfo } from "../../utils/genres";
import { SearchIcon } from "../ui/Icons";
import { useApp } from "../../context/AppContext";
import styles from "./SearchSuggestions.module.css";

export default function SearchSuggestions({ query, results, loading, onSelect, onClose }) {
  if (!query || query.length < 2) return null;

  return (
    <div className={styles.dropdown}>
      {loading ? (
        <div className={styles.loadingWrap}>
          {[1,2,3].map(i => (
            <div key={i} className={styles.skeletonRow}>
              <div className={`${styles.skeletonImg} skeleton`} />
              <div className={styles.skeletonText}>
                <div className={`${styles.skeletonLine} skeleton`} />
                <div className={`${styles.skeletonLineSm} skeleton`} />
              </div>
            </div>
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className={styles.empty}>No results for "{query}"</div>
      ) : (
        <ul className={styles.list}>
          {results.slice(0, 6).map(movie => {
            const img   = getPosterUrl(movie.poster_path, "sm");
            const genre = getGenreInfo(movie.genre_ids || []);
            const year  = movie.release_date?.slice(0, 4);
            return (
              <li key={movie.id} className={styles.item} onClick={() => { onSelect(movie); onClose(); }}>
                <div className={styles.thumb}>
                  {img
                    ? <img src={img} alt="" className={styles.poster} />
                    : <div className={styles.posterPlaceholder} style={{ background: genre.color }} />
                  }
                </div>
                <div className={styles.info}>
                  <p className={styles.title}>{movie.title || movie.name}</p>
                  <div className={styles.meta}>
                    <span className={styles.genre} style={{ background: genre.color }}>{genre.label}</span>
                    {year && <span className={styles.year}>{year}</span>}
                    {movie.vote_average > 0 && <span className={styles.rating}>⭐ {movie.vote_average.toFixed(1)}</span>}
                  </div>
                </div>
              </li>
            );
          })}
          {results.length > 6 && (
            <li className={styles.viewAll}>
              <SearchIcon size={13} /> {results.length - 6} more results — press Enter
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
