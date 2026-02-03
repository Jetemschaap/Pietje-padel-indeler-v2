"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Speler = { naam: string; foto: string };

function SpelerVak({ speler }: { speler: Speler }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          width: "100%",
          aspectRatio: "1 / 1",
          borderRadius: 10,
          background: "#222",
          overflow: "hidden",
        }}
      >
        <img
          src={speler.foto}
          alt={speler.naam}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
      <div style={{ marginTop: 6, fontWeight: 800, fontSize: 14 }}>
        {speler.naam}
      </div>
    </div>
  );
}

function BaanFullWidth({ letter, spelers }: { letter: string; spelers: Speler[] }) {
  const max5 = spelers.slice(0, 5);

  const boven = max5.slice(0, 2);
  const onder = max5.slice(2, 4);
  const extra = max5[4];

  const leeg: Speler = { naam: "", foto: "/players/tijdelijk.png" };
  const b0 = boven[0] ?? leeg;
  const b1 = boven[1] ?? leeg;
  const o0 = onder[0] ?? leeg;
  const o1 = onder[1] ?? leeg;

  return (
    <section style={{ background: "#4f63ff", borderRadius: 18, padding: 16 }}>
      <div style={{ textAlign: "center", fontSize: 34, fontWeight: 900, marginBottom: 12 }}>
        Baan {letter}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <SpelerVak speler={b0} />
        <SpelerVak speler={b1} />
      </div>

      <div style={{ height: 4, background: "#fff", borderRadius: 2, margin: "14px 0" }} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <SpelerVak speler={o0} />
        <SpelerVak speler={o1} />
      </div>

      {extra && (
        <div style={{ marginTop: 16, display: "flex", justifyContent: "center" }}>
          <div style={{ width: 160 }}>
            <SpelerVak speler={extra} />
          </div>
        </div>
      )}
    </section>
  );
}

function verdeelOverBanen(spelers: Speler[], banen: string[]) {
  const map: Record<string, Speler[]> = {};
  banen.forEach((b) => (map[b] = []));

  if (banen.length === 0) return map;

  let i = 0;
  for (const s of spelers) {
    map[banen[i]].push(s);
    if (map[banen[i]].length >= 5) i = (i + 1) % banen.length;
    else i = (i + 1) % banen.length;
  }

  return map;
}

export default function Banen() {
  const router = useRouter();
  const [banen, setBanen] = useState<string[]>([]);
  const [baanMap, setBaanMap] = useState<Record<string, Speler[]>>({});

  useEffect(() => {
    const spelersRaw = localStorage.getItem("pietje_spelers");
    const banenRaw = localStorage.getItem("pietje_banen");

    const spelers: Speler[] = spelersRaw ? JSON.parse(spelersRaw) : [];
    const gekozenBanen: string[] = banenRaw ? JSON.parse(banenRaw) : [];

    const letters = gekozenBanen.map((b) => b.toUpperCase());

    setBanen(letters);
    setBaanMap(verdeelOverBanen(spelers, letters));
  }, []);

  return (
    <main style={{ minHeight: "100vh", background: "#000", color: "#fff", padding: 16 }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {banen.map((letter) => (
            <BaanFullWidth key={letter} letter={letter} spelers={baanMap[letter] || []} />
          ))}
        </div>

        <div style={{ maxWidth: 520, margin: "26px auto 0 auto" }}>
          <img
            src="/volgenduur.png"
            alt="Volgend uur"
            style={{ width: "100%", cursor: "pointer", marginBottom: 16 }}
          />
          <img
            src="/reset.png"
            alt="Reset"
            style={{ width: "100%", cursor: "pointer" }}
            onClick={() => router.push("/")}
          />
        </div>
      </div>
    </main>
  );
}
