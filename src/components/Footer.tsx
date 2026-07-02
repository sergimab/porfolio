"use client";

const socials = [
  {
    id: "instagram",
    href: "https://instagram.com",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.9" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    id: "linkedin",
    href: "https://linkedin.com",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <line x1="7.5" y1="10.5" x2="7.5" y2="16.5" />
        <circle cx="7.5" cy="7.2" r="0.9" fill="currentColor" stroke="none" />
        <path d="M11.5 16.5V10.5" />
        <path d="M11.5 13c0-1.4 1-2.5 2.4-2.5s2.1 1 2.1 2.6v3.4" />
      </svg>
    ),
  },
  {
    id: "behance",
    href: "https://behance.net",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 7h5.2a2.4 2.4 0 0 1 0 4.8H3z" />
        <path d="M3 11.8h5.6a2.6 2.6 0 0 1 0 5.2H3z" />
        <path d="M14 9.5h6" />
        <path d="M14.3 14.3c0 1.8 1.3 2.9 2.9 2.9 1.3 0 2.2-.6 2.7-1.6" />
        <path d="M14.3 13.3c.2-1.6 1.3-2.6 2.8-2.6 1.6 0 2.7 1.1 2.8 2.6z" />
      </svg>
    ),
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{
      width: "100%",
      padding: "12px 24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderLeft: "1.5px solid var(--foreground)",
      borderRight: "1.5px solid var(--foreground)",
      borderTop: "1.5px solid var(--foreground)",
      borderRadius: "16px 16px 0 0",
    }}>
      <span style={{ fontSize: "11px", color: "var(--muted)" }}>
        © {year} Sharkastic
      </span>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {socials.map(s => (
          <a
            key={s.id}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={s.id}
            className="hover-trail-target"
            style={{ color: "var(--muted)", display: "flex", transition: "color 0.15s", position: "relative", zIndex: 6 }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--foreground)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
          >
            {s.icon}
          </a>
        ))}
      </div>

      <span style={{ fontSize: "11px", color: "var(--muted)" }}>
        All rights reserved
      </span>
    </footer>
  );
}
