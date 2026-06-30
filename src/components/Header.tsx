"use client";

import { useEffect, useState } from "react";

const names = ["ergio", "harkastic"];

const labels = {
  es: { dark: "Oscuro", light: "Claro" },
  en: { dark: "Dark", light: "Light" },
};

type Lang = keyof typeof labels;

function formatDateTime(date: Date, lang: Lang) {
  const timeStr = date.toLocaleTimeString(lang === "es" ? "es-ES" : "en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: lang === "en",
  });
  const dateStr = date.toLocaleDateString(lang === "es" ? "es-ES" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return { timeStr, dateStr };
}

function useTypewriter(words: string[], typingSpeed = 80, deletingSpeed = 50, pauseMs = 10000) {
  const [displayed, setDisplayed] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIndex];

    if (!isDeleting && displayed === current) {
      const pause = setTimeout(() => setIsDeleting(true), pauseMs);
      return () => clearTimeout(pause);
    }

    if (isDeleting && displayed === "") {
      setIsDeleting(false);
      setWordIndex((i) => (i + 1) % words.length);
      return;
    }

    const timeout = setTimeout(() => {
      setDisplayed(isDeleting
        ? current.slice(0, displayed.length - 1)
        : current.slice(0, displayed.length + 1)
      );
    }, isDeleting ? deletingSpeed : typingSpeed);

    return () => clearTimeout(timeout);
  }, [displayed, isDeleting, wordIndex, words, typingSpeed, deletingSpeed, pauseMs]);

  return displayed;
}

export default function Header() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [lang, setLang] = useState<Lang>("es");
  const [now, setNow] = useState(new Date());
  const typedName = useTypewriter(names);

  useEffect(() => {
    const stored = localStorage.getItem("theme") as "light" | "dark" | null;
    const storedLang = localStorage.getItem("lang") as Lang | null;
    if (stored) setTheme(stored);
    if (storedLang) setLang(storedLang);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("lang", lang);
    window.dispatchEvent(new CustomEvent("langchange", { detail: lang }));
  }, [lang]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { timeStr, dateStr } = formatDateTime(now, lang);
  const t = labels[lang];

  const avatarNode = (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <div style={{
        width: "36px", height: "36px", borderRadius: "50%", overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "transparent", border: "1px solid var(--foreground)", flexShrink: 0,
      }}>
        <img src="/sharkastic-logo.svg" alt="logo" style={{ width: "34px", height: "34px", filter: theme === "dark" ? "invert(1)" : "invert(0)" }} />
      </div>
      <span style={{ fontSize: "14px", color: "var(--foreground)" }}>
        {lang === "es" ? "Hola, soy " : "Hi, it's "}
        <span style={{ fontWeight: 500 }}>
          S{typedName}
          <span style={{ display:"inline-block", width:"1.5px", height:"0.9em", background:"var(--foreground)", marginLeft:"1px", verticalAlign:"text-bottom", animation:"blink 1s step-end infinite" }} aria-hidden="true" />
        </span>{" "}
        👋
      </span>
    </div>
  );

  return (
    <>
    <header style={{
      width: "100%",
      padding: "16px 24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderLeft: "1.5px solid var(--foreground)",
      borderRight: "1.5px solid var(--foreground)",
      borderBottom: "1.5px solid var(--foreground)",
      borderRadius: "0 0 16px 16px",
    }}>

      {/* Avatar — visible only on desktop */}
      <div className="header-avatar-desktop">
        {avatarNode}
      </div>

      {/* Right: time + date + toggles — on mobile splits into left (time) and right (toggles) */}
      <div className="header-right">

        {/* Time + date */}
        <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
          <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--foreground)", fontVariantNumeric: "tabular-nums" }}>
            {timeStr}
          </span>
          <span style={{ fontSize: "13px", color: "var(--muted)" }}>
            {dateStr}
          </span>
        </div>

        {/* Divider — hidden on mobile */}
        <div className="header-divider" style={{ width: "1px", height: "16px", background: "var(--border)" }} aria-hidden="true" />

        {/* Theme + language toggles grouped */}
        <div className="header-toggles">
          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            aria-label="Cambiar tema"
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center" }}
          >
            <div style={{
              width: "52px", height: "30px",
              borderRadius: "999px",
              border: "1px solid var(--foreground)",
              position: "relative",
              transition: "border-color 0.2s",
              display: "flex",
              alignItems: "center",
            }}>
              {/* sun icon — always on right side */}
              <span style={{
                position: "absolute", right: "6px",
                display: "flex", alignItems: "center",
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--muted)" }}>
                  <circle cx="12" cy="12" r="4"/>
                  <line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              </span>
              {/* moon icon — always on left side */}
              <span style={{
                position: "absolute", left: "6px",
                display: "flex", alignItems: "center",
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--muted)" }}>
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              </span>
              {/* sliding dot */}
              <div style={{
                position: "absolute",
                top: "4px",
                left: theme === "dark" ? "24px" : "4px",
                width: "20px", height: "20px",
                borderRadius: "50%",
                border: "1px solid var(--foreground)",
                background: "var(--background)",
                transition: "left 0.2s",
                zIndex: 1,
              }} />
            </div>
          </button>

        {/* Language toggle */}
        <div style={{
          display: "flex", alignItems: "center", gap: "2px",
          border: "1px solid var(--foreground)", borderRadius: "999px",
          padding: "4px 8px",
        }}>
          <button
            onClick={() => setLang("es")}
            aria-label="Español"
            style={{
              background: "none", border: "none", cursor: "pointer",
              padding: "0",
              fontSize: "13px",
              color: lang === "es" ? "var(--foreground)" : "var(--muted)",
              fontWeight: lang === "es" ? 500 : 400,
              transition: "color 0.2s",
            }}
          >
            ES
          </button>
          <span style={{ color: "var(--border)", fontSize: "12px" }}>/</span>
          <button
            onClick={() => setLang("en")}
            aria-label="English"
            style={{
              background: "none", border: "none", cursor: "pointer",
              padding: "0",
              fontSize: "13px",
              color: lang === "en" ? "var(--foreground)" : "var(--muted)",
              fontWeight: lang === "en" ? 500 : 400,
              transition: "color 0.2s",
            }}
          >
            EN
          </button>
        </div>

        </div> {/* end header-toggles */}
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .header-avatar-desktop { display: flex; }
        .header-avatar-mobile  { display: none; }
        .header-right    { display: flex; align-items: center; gap: 20px; }
        .header-divider  { display: block; }
        .header-toggles  { display: flex; align-items: center; gap: 20px; }
        @media (max-width: 768px) {
          .header-avatar-desktop { display: none; }
          .header-avatar-mobile  { display: flex; padding: 12px 0; }
          .header-right    { flex: 1; justify-content: space-between; gap: 12px; }
          .header-divider  { display: none; }
          .header-toggles  { gap: 8px; }
        }
      `}</style>
    </header>

    {/* Avatar — visible only on mobile, sits below header */}
    <div className="header-avatar-mobile" style={{ paddingLeft: "24px" }}>
      {avatarNode}
    </div>
    </>
  );
}
