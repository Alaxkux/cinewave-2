import { useState, useRef } from "react";
import { useApp } from "../../context/AppContext";
import styles from "./Profile.module.css";

export default function ProfilePage() {
  const { user, updateUser, favorites, downloads, continueWatching } = useApp();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user.name, handle: user.handle, email: user.email });
  const fileRef = useRef(null);

  const handleSave = () => {
    updateUser(form);
    setEditing(false);
  };

  const handleAvatar = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => updateUser({ avatar: ev.target.result });
    reader.readAsDataURL(file);
  };

  return (
    <div className={styles.page}>
      {/* Header card */}
      <div className={styles.profileCard}>
        <div className={styles.coverBg} />
        <div className={styles.profileBody}>
          <div className={styles.avatarWrap} onClick={() => fileRef.current?.click()}>
            <div className={styles.avatar}>
              {user.avatar
                ? <img src={user.avatar} alt="avatar" className={styles.avatarImg} />
                : <span>{user.name?.[0]?.toUpperCase()}</span>
              }
            </div>
            <div className={styles.avatarEdit}>✏️</div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatar} />

          {editing ? (
            <div className={styles.editForm}>
              <input
                className={styles.input}
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Full name"
              />
              <input
                className={styles.input}
                value={form.handle}
                onChange={e => setForm(f => ({ ...f, handle: e.target.value }))}
                placeholder="@handle"
              />
              <input
                className={styles.input}
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="Email"
              />
              <div className={styles.editActions}>
                <button className={styles.saveBtn} onClick={handleSave}>Save Changes</button>
                <button className={styles.cancelBtn} onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <div className={styles.profileInfo}>
              <h2 className={styles.profileName}>{user.name}</h2>
              <p className={styles.profileHandle}>{user.handle}</p>
              <p className={styles.profileEmail}>{user.email}</p>
              <button className={styles.editBtn} onClick={() => setEditing(true)}>Edit Profile</button>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        {[
          { label: "Saved", value: favorites.length, icon: "❤️" },
          { label: "Downloads", value: downloads.length, icon: "⬇️" },
          { label: "Watching", value: continueWatching.length, icon: "▶️" },
        ].map(({ label, value, icon }) => (
          <div key={label} className={styles.statCard}>
            <span className={styles.statIcon}>{icon}</span>
            <span className={styles.statValue}>{value}</span>
            <span className={styles.statLabel}>{label}</span>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      {continueWatching.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Recently Watched</h3>
          <div className={styles.recentList}>
            {continueWatching.slice(0, 5).map(m => (
              <div key={m.id} className={styles.recentItem}>
                <div className={styles.recentInfo}>
                  <p className={styles.recentTitle}>{m.title || m.name}</p>
                  <p className={styles.recentSub}>{m.subtitle || "In progress"}</p>
                </div>
                <div className={styles.recentProgress}>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: `${m.progress || 20}%` }} />
                  </div>
                  <span className={styles.progressPct}>{m.progress || 20}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
