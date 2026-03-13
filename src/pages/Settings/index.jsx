import { useState } from "react";
import { useApp } from "../../context/AppContext";
import styles from "./Settings.module.css";

function Toggle({ value, onChange }) {
  return (
    <div className={`${styles.toggle} ${value ? styles.toggleOn : ""}`} onClick={() => onChange(!value)}>
      <div className={styles.toggleThumb} />
    </div>
  );
}

function SettingRow({ label, description, children }) {
  return (
    <div className={styles.row}>
      <div className={styles.rowInfo}>
        <p className={styles.rowLabel}>{label}</p>
        {description && <p className={styles.rowDesc}>{description}</p>}
      </div>
      <div className={styles.rowControl}>{children}</div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>{title}</h3>
      <div className={styles.sectionBody}>{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const { user, updateUser } = useApp();
  const [settings, setSettings] = useState({
    notifications: true,
    autoplay: true,
    hd: true,
    dataSaver: false,
    darkMode: true,
    language: "English",
    subtitles: false,
    privateMode: false,
  });

  const set = (key, val) => setSettings(s => ({ ...s, [key]: val }));

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>SETTINGS</h1>
        <p className={styles.pageSubtitle}>Manage your account and preferences</p>
      </div>

      <Section title="Account">
        <SettingRow label="Display Name" description="How your name appears on the platform">
          <input
            className={styles.input}
            value={user.name}
            onChange={e => updateUser({ name: e.target.value })}
          />
        </SettingRow>
        <SettingRow label="Email" description="Your account email address">
          <input
            className={styles.input}
            value={user.email}
            onChange={e => updateUser({ email: e.target.value })}
          />
        </SettingRow>
        <SettingRow label="Handle" description="Your unique username">
          <input
            className={styles.input}
            value={user.handle}
            onChange={e => updateUser({ handle: e.target.value })}
          />
        </SettingRow>
      </Section>

      <Section title="Playback">
        <SettingRow label="Autoplay" description="Automatically play next episode">
          <Toggle value={settings.autoplay} onChange={v => set("autoplay", v)} />
        </SettingRow>
        <SettingRow label="HD Streaming" description="Stream in high definition when available">
          <Toggle value={settings.hd} onChange={v => set("hd", v)} />
        </SettingRow>
        <SettingRow label="Data Saver" description="Reduce video quality to save data">
          <Toggle value={settings.dataSaver} onChange={v => set("dataSaver", v)} />
        </SettingRow>
        <SettingRow label="Subtitles" description="Show subtitles by default">
          <Toggle value={settings.subtitles} onChange={v => set("subtitles", v)} />
        </SettingRow>
      </Section>

      <Section title="Notifications">
        <SettingRow label="Push Notifications" description="Get notified about new releases">
          <Toggle value={settings.notifications} onChange={v => set("notifications", v)} />
        </SettingRow>
      </Section>

      <Section title="Appearance">
        <SettingRow label="Dark Mode" description="Use dark theme">
          <Toggle value={settings.darkMode} onChange={v => set("darkMode", v)} />
        </SettingRow>
        <SettingRow label="Language">
          <select
            className={styles.select}
            value={settings.language}
            onChange={e => set("language", e.target.value)}
          >
            {["English", "Spanish", "French", "German", "Japanese", "Korean"].map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </SettingRow>
      </Section>

      <Section title="Privacy">
        <SettingRow label="Private Mode" description="Don't save watch history">
          <Toggle value={settings.privateMode} onChange={v => set("privateMode", v)} />
        </SettingRow>
      </Section>

      <div className={styles.dangerZone}>
        <h3 className={styles.dangerTitle}>Danger Zone</h3>
        <div className={styles.dangerBtns}>
          <button className={styles.logoutBtn}>Sign Out</button>
          <button className={styles.deleteBtn}>Delete Account</button>
        </div>
      </div>
    </div>
  );
}
