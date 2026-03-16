import { useState, useRef } from "react";
import { useApp } from "../../context/AppContext";
import styles from "./Profile.module.css";

/* ── Helpers ── */
function calcFavDecade(movies) {
  if (!movies.length) return null;
  const decades = {};
  movies.forEach(m => {
    const y = parseInt(m.release_date?.slice(0,4));
    if (!y) return;
    const d = `${Math.floor(y/10)*10}s`;
    decades[d] = (decades[d]||0) + 1;
  });
  return Object.entries(decades).sort((a,b)=>b[1]-a[1])[0]?.[0] || null;
}

function calcGenreBreakdown(movies) {
  const map = {};
  const GENRE_NAMES = {28:"Action",12:"Adventure",16:"Animation",35:"Comedy",80:"Crime",18:"Drama",14:"Fantasy",27:"Horror",9648:"Mystery",10749:"Romance",878:"Sci-Fi",53:"Thriller",36:"History",878:"Sci-Fi"};
  movies.forEach(m => {
    (m.genre_ids||[]).slice(0,2).forEach(id => {
      const name = GENRE_NAMES[id];
      if (name) map[name] = (map[name]||0) + 1;
    });
  });
  const total = Object.values(map).reduce((a,b)=>a+b,0) || 1;
  return Object.entries(map)
    .sort((a,b)=>b[1]-a[1])
    .slice(0,5)
    .map(([name,count])=>({ name, pct: Math.round(count/total*100) }));
}

const BADGE_DEFS = [
  { id:"binge",    icon:"🏆", label:"Binge Watcher",   desc:"Watch 5+ titles",  threshold:(f,d,cw)=>cw>=5 },
  { id:"explorer", icon:"🚀", label:"Sci-Fi Explorer",  desc:"Save 3 Sci-Fi",    threshold:(f)=>f.filter(m=>m.genre_ids?.includes(878)).length>=3 },
  { id:"noir",     icon:"🎭", label:"Film Noir Fan",    desc:"Save 3 Crime/Drama",threshold:(f)=>f.filter(m=>m.genre_ids?.some(g=>[80,18].includes(g))).length>=3 },
  { id:"collector",icon:"📚", label:"Collector",        desc:"Save 10+ movies",  threshold:(f)=>f.length>=10 },
  { id:"downloader",icon:"⬇️",label:"Offline King",    desc:"Download 5 movies",threshold:(f,d)=>d>=5 },
  { id:"reviewer", icon:"⭐", label:"Critic",           desc:"Rate a movie",     threshold:(f,d,cw,rated)=>rated>=1 },
];

/* ── Sub-components ── */
function Ring({ pct, size=80, stroke=7, color="#6366f1", children }) {
  const r = (size-stroke*2)/2;
  const circ = 2*Math.PI*r;
  const dash = (pct/100)*circ;
  return (
    <div className={styles.ring} style={{width:size,height:size}}>
      <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{transition:"stroke-dasharray 0.8s ease"}}
        />
      </svg>
      <div className={styles.ringInner}>{children}</div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, updateUser, favorites, downloads, continueWatching } = useApp();
  const [editing, setEditing] = useState(false);
  const [form, setForm]       = useState({ name:user.name, handle:user.handle, email:user.email });
  const fileRef = useRef(null);

  const favDecade    = calcFavDecade(favorites);
  const genreData    = calcGenreBreakdown([...favorites, ...continueWatching]);
  const watchHours   = Math.round(continueWatching.length * 1.8);
  const weekHours    = Math.min(watchHours, 40);
  const monthHours   = Math.min(watchHours * 4, 120);
  const earnedBadges = BADGE_DEFS.filter(b => b.threshold(favorites, downloads.length, continueWatching.length, 0));

  const handleSave = () => { updateUser(form); setEditing(false); };
  const handleAvatar = (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => updateUser({ avatar: ev.target.result });
    reader.readAsDataURL(file);
  };

  const GENRE_COLORS = ["#6366f1","#a855f7","#ec4899","#f59e0b","#10b981"];

  return (
    <div className={styles.page}>

      {/* ── Profile card ── */}
      <div className={styles.card}>
        <div className={styles.cover} />
        <div className={styles.cardBody}>
          <div className={styles.avatarWrap} onClick={()=>fileRef.current?.click()}>
            <div className={styles.avatar}>
              {user.avatar
                ? <img src={user.avatar} alt="avatar" className={styles.avatarImg}/>
                : <span>{user.name?.[0]?.toUpperCase()}</span>
              }
            </div>
            <div className={styles.avatarEdit}>✏️</div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleAvatar}/>

          {editing ? (
            <div className={styles.editForm}>
              <input className={styles.input} value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Full name"/>
              <input className={styles.input} value={form.handle} onChange={e=>setForm(f=>({...f,handle:e.target.value}))} placeholder="@handle"/>
              <input className={styles.input} value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="Email"/>
              <div className={styles.editBtns}>
                <button className={styles.saveBtn} onClick={handleSave}>Save</button>
                <button className={styles.cancelBtn} onClick={()=>setEditing(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <div className={styles.profileInfo}>
              <h2 className={styles.name}>{user.name}</h2>
              <p className={styles.handle}>{user.handle}</p>
              <p className={styles.email}>{user.email}</p>
              {favDecade && <p className={styles.decade}>📅 Favourite era: <strong>{favDecade}</strong></p>}
              <button className={styles.editBtn} onClick={()=>setEditing(true)}>Edit Profile</button>
            </div>
          )}
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className={styles.statsRow}>
        {[
          {label:"Saved",     val:favorites.length,        icon:"❤️"},
          {label:"Downloads", val:downloads.length,        icon:"⬇️"},
          {label:"Watching",  val:continueWatching.length, icon:"▶️"},
        ].map(({label,val,icon})=>(
          <div key={label} className={styles.statCard}>
            <span className={styles.statIcon}>{icon}</span>
            <span className={styles.statVal}>{val}</span>
            <span className={styles.statLabel}>{label}</span>
          </div>
        ))}
      </div>

      {/* ── Watchtime rings ── */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Watch Time</h3>
        <div className={styles.ringsRow}>
          <div className={styles.ringItem}>
            <Ring pct={Math.min(100, (weekHours/40)*100)} color="#6366f1">
              <span className={styles.ringVal}>{weekHours}h</span>
            </Ring>
            <span className={styles.ringLabel}>This Week</span>
          </div>
          <div className={styles.ringItem}>
            <Ring pct={Math.min(100,(monthHours/120)*100)} color="#a855f7" size={90} stroke={8}>
              <span className={styles.ringVal}>{monthHours}h</span>
            </Ring>
            <span className={styles.ringLabel}>This Month</span>
          </div>
          <div className={styles.ringItem}>
            <Ring pct={Math.min(100,(watchHours/200)*100)} color="#ec4899" size={80} stroke={7}>
              <span className={styles.ringVal}>{watchHours}h</span>
            </Ring>
            <span className={styles.ringLabel}>All Time</span>
          </div>
        </div>
      </div>

      {/* ── Genre breakdown ── */}
      {genreData.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Your Taste</h3>
          <div className={styles.genreList}>
            {genreData.map((g,i)=>(
              <div key={g.name} className={styles.genreRow}>
                <span className={styles.genreName}>{g.name}</span>
                <div className={styles.genreBarWrap}>
                  <div className={styles.genreBar}
                    style={{width:`${g.pct}%`, background: GENRE_COLORS[i%GENRE_COLORS.length]}}
                  />
                </div>
                <span className={styles.genrePct}>{g.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Badges ── */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Achievements</h3>
        <div className={styles.badgeGrid}>
          {BADGE_DEFS.map(b=>{
            const earned = earnedBadges.find(e=>e.id===b.id);
            return (
              <div key={b.id} className={`${styles.badge} ${earned ? styles.badgeEarned : styles.badgeLocked}`}>
                <span className={styles.badgeIcon}>{b.icon}</span>
                <span className={styles.badgeLabel}>{b.label}</span>
                <span className={styles.badgeDesc}>{earned ? "Unlocked!" : b.desc}</span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
