"use client";

import Link from "next/link";

export default function Home() {
  function resetAlles() {
    if (typeof window === "undefined") return;

    // ✅ nieuwe fotoset bij nieuwe sessie
    localStorage.removeItem("pietje_map");

    // ✅ sessie/keuzes leeg
    localStorage.removeItem("pietje_spelers");
    localStorage.removeItem("pietje_banen");
    localStorage.removeItem("pietje_verdeling");
    localStorage.removeItem("pietje_prev_special");
    localStorage.removeItem("pietje_hour");
    localStorage.removeItem("pietje_restore");

    // ✅ vaste groepen leeg (alles grijs)
    localStorage.setItem("pietje_vast", JSON.stringify({ geel: [], groen: [] }));
  }

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
        onClick={resetAlles}
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
