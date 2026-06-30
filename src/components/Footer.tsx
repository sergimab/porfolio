"use client";

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
      <span style={{ fontSize: "11px", color: "var(--muted)" }}>
        All rights reserved
      </span>
    </footer>
  );
}
