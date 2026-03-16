import { useState } from "react";
import { useApp } from "../../context/AppContext";
import styles from "./Onboarding.module.css";

const GENRES = [
  { id: 28,    label: "Action",    emoji: "💥", color: "#FF4E4E" },
  { id: 35,    label: "Comedy",    emoji: "😂", color: "#F59E0B" },
  { id: 18,    label: "Drama",     emoji: "🎭", color: "#3B82F6" },
  { id: 878,   label: "Sci-Fi",    emoji: "🚀", color: "#0EA5E9" },
  { id: 27,    label: "Horror",    emoji: "👻", color: "#6B7280" },
  { id: 16,    label: "Animation", emoji: "🎨", color: "#A855F7" },
  { id: 9648,  label: "Mystery",   emoji: "🔍", color: "#6366F1" },
  { id: 10749, label: "Romance",   emoji: "💕", color: "#F43F5E" },
  { id: 12,    label: "Adventure", emoji: "🗺️", color: "#FF9B4E" },
  { id: 53,    label: "Thriller",  emoji: "😰", color: "#84CC16" },
];

const STEPS = ["welcome", "genres", "done"];

export default function Onboarding({ onComplete }) {
  const { updateUser } = useApp();
  const [step, setStep]         = useState(0);
  const [selected, setSelected] = useState([]);
  const [name, setName]         = useState("");

  const toggle = (id) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleDone = () => {
    if (name.trim()) updateUser({ name: name.trim(), handle: `@${name.trim().toLowerCase().replace(/\s+/g, "")}` });
    updateUser({ onboarded: true, preferredGenres: selected });
    onComplete();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Progress dots */}
        <div className={styles.progress}>
          {STEPS.map((_, i) => (
            <div key={i} className={`${styles.progressDot} ${i <= step ? styles.progressActive : ""}`} />
          ))}
        </div>

        {step === 0 && (
          <div className={styles.step}>
            <div className={styles.logoWrap}>🎬</div>
            <h1 className={styles.heading}>Welcome to Cinewave</h1>
            <p className={styles.sub}>Your personal streaming universe. Let's set things up for you.</p>
            <div className={styles.nameWrap}>
              <label className={styles.label}>What's your name?</label>
              <input
                className={styles.input}
                placeholder="Enter your name…"
                value={name}
                onChange={e => setName(e.target.value)}
                autoFocus
              />
            </div>
            <button
              className={styles.nextBtn}
              onClick={() => setStep(1)}
              disabled={!name.trim()}
            >
              Continue →
            </button>
          </div>
        )}

        {step === 1 && (
          <div className={styles.step}>
            <h2 className={styles.heading}>What do you like watching?</h2>
            <p className={styles.sub}>Pick at least 3 genres to personalise your feed.</p>
            <div className={styles.genreGrid}>
              {GENRES.map(g => (
                <button
                  key={g.id}
                  className={`${styles.genreChip} ${selected.includes(g.id) ? styles.genreSelected : ""}`}
                  style={selected.includes(g.id) ? { borderColor: g.color, background: `${g.color}22` } : {}}
                  onClick={() => toggle(g.id)}
                >
                  <span className={styles.genreEmoji}>{g.emoji}</span>
                  <span className={styles.genreLabel}>{g.label}</span>
                  {selected.includes(g.id) && <span className={styles.check}>✓</span>}
                </button>
              ))}
            </div>
            <div className={styles.btnRow}>
              <button className={styles.backBtn} onClick={() => setStep(0)}>← Back</button>
              <button
                className={styles.nextBtn}
                onClick={() => setStep(2)}
                disabled={selected.length < 3}
              >
                Continue ({selected.length}/3 min) →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className={styles.step}>
            <div className={styles.doneIcon}>🎉</div>
            <h2 className={styles.heading}>You're all set{name ? `, ${name}` : ""}!</h2>
            <p className={styles.sub}>
              Your feed is personalised with {selected.length} genre{selected.length !== 1 ? "s" : ""}. Enjoy Cinewave!
            </p>
            <div className={styles.selectedGenres}>
              {selected.map(id => {
                const g = GENRES.find(x => x.id === id);
                return g ? (
                  <span key={id} className={styles.selectedTag} style={{ borderColor: g.color, color: g.color }}>
                    {g.emoji} {g.label}
                  </span>
                ) : null;
              })}
            </div>
            <button className={styles.doneBtn} onClick={handleDone}>
              Start Watching 🚀
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
