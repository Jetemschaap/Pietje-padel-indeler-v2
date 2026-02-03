"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: 20,
        gap: 16,
      }}
    >
      {/* Grote foto */}
      <img
        src="/pietgroot.png"
        alt="Padel"
        style={{
          width: "100%",
          maxWidth: 520,
          borderRadius: 18,
          objectFit: "cover",
        }}
      />

      {/* Titel */}
      <h1
        style={{
          fontSize: 36,
          fontWeight: 800,
          textAlign: "center",
          margin: 0,
        }}
      >
        Piet Padel Indeler
      </h1>

      {/* Knop */}
      <Link
        href="/wie-doet-mee"
        style={{
          width: "100%",
          maxWidth: 520,
          display: "block",
        }}
      >
        <img
          src="/wiedoetmee.png"
          alt="Wie doet mee?"
          style={{
            width: "100%",
            borderRadius: 20,
            display: "block",
          }}
        />
      </Link>
    </main>
  );
}
