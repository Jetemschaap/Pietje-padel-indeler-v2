"use client";

import { useEffect, useMemo, useState } from "react";

type SpelerBron = {
  naam: string;
  bestand: string;
};

const spelersBron: SpelerBron[] = [
  { naam: "Ed Beijn", bestand: "edb.png" },
  { naam: "Jan Bonnema", bestand: "janb.png" },
  { naam: "Henny Gouw", bestand: "hennyg.png" },
  { naam: "Cees de Graaf", bestand: "ceesdg.png" },
  { naam: "Henk de Graaf", bestand: "henkdg.png" },
  { naam: "Cor Heijboer", bestand: "corh.png" },
  { naam: "Jan Hollemans", bestand: "tijdelijk.png" },
  { naam: "Ed Jonker", bestand: "edj.png" },
  { naam: "Arie Langstraat", bestand: "ariel.png" },
  { naam: "Piet van Loon", bestand: "pietvl.png" },
  { naam: "Cees Meeuwis", bestand: "ceesm.png" },
  { naam: "Huug Noordermeer", bestand: "huugn.png" },
  { naam: "Dick Nugteren", bestand: "dickn.png" },
  { naam: "John Schaap", bestand: "johns.png" },
  { naam: "Martin Schoenmakers", bestand: "martin.png" },
  { naam: "Pieter Slijkoord", bestand: "pieters.png" },
  { naam: "Wim Smit", bestand: "wims.png" },
  { naam: "Aad Tettero", bestand: "aadt.png" },
  { naam: "Cees van Tooren", bestand: "ceesvt.png" },
  { naam: "Johan van Zon", bestand: "johanvz.png" },
  { naam: "Gerard Klaui", bestand: "tijdelijk.png" },
  { naam: "Henny de Graaf", bestand: "hennydg.png" },
  { naam: "Leo Koster", bestand: "leo.png" },
  { naam: "Invaller 1", bestand: "tijdelijk.png" },
];

type Speler = {
  naam: string;
  foto: string;
};

function baanVerdeling(aantalSpelers: number, aantalBanen: number): number[] | null {
  if (aantalSpelers === 6) {
    if (aantalBanen === 1) return [6];
    if (aantalBanen === 2) return [4, 2];
    return null;
  }

  if (aantalSpelers === 11) {
    if (aantalBanen === 2) return [6, 5];
    if (aantalBanen === 3) return [4, 4, 3];
    return null;
  }

  return null;
}

export default function WieDoetMee() {
  const [klaar, setKlaar] = useState(false);

  useEffect(() => {
  setKlaar(true);

  const restore = localStorage.getItem("pietje_restore");

  if (restore === "1") {
    const raw = localStorage.getItem("pietje_spelers");
    const arr: { naam: string }[] = raw ? JSON.parse(raw) : [];
    setGeselecteerd(arr.map((s) => s.naam));

    setVast([]);
    localStorage.setItem("pietje_vast", JSON.stringify({ geel: [], groen: [] }));

    localStorage.removeItem("pietje_restore");
  } else {
    setGeselecteerd([]);
    setVast([]);
    localStorage.removeItem("pietje_spelers");
    localStorage.setItem("pietje_vast", JSON.stringify({ geel: [], groen: [] }));
  }
}, []);


  useEffect(() => {
  setKlaar(true);

  const restore = localStorage.getItem("pietje_restore");

  if (restore === "1") {
    const raw = localStorage.getItem("pietje_spelers");
    const arr: { naam: string }[] = raw ? JSON.parse(raw) : [];
    setGeselecteerd(arr.map((s) => s.naam));

    setVast([]);
    localStorage.setItem("pietje_vast", JSON.stringify({ geel: [], groen: [] }));

    localStorage.removeItem("pietje_restore");
  } else {
    setGeselecteerd([]);
    setVast([]);
    localStorage.removeItem("pietje_spelers");
    localStorage.setItem("pietje_vast", JSON.stringify({ geel: [], groen: [] }));
  }
}, []);




  const actieveMap = useMemo(() => {
    const mappen = ["players", "players-net", "players-bobble", "beroep", "hipers", "knuffels"];
    return mappen[Math.floor(Math.random() * mappen.length)];
  }, []);

  const spelers: Speler[] = useMemo(() => {
    return spelersBron.map((s) => ({
      naam: s.naam,
      foto: `/${actieveMap}/${s.bestand}`,
    }));
  }, [actieveMap]);

  // 1) aanwezig
  const [geselecteerd, setGeselecteerd] = useState<string[]>([]);
  // 2) vaste selectie in volgorde: eerste 4 = geel, tweede 4 = groen
  const [vast, setVast] = useState<string[]>([]);
  // banenkeuze
  const [banen, setBanen] = useState<string[]>([]);

  function kleurVoorSpeler(naam: string): "geel" | "groen" | null {
    const idx = vast.indexOf(naam);
    if (idx === -1) return null;
    if (idx < 4) return "geel";
    if (idx < 8) return "groen";
    return null;
  }

  // ✅ JOUW AFSPRAAK:
  // 1e klik = aanwezig
  // 2e klik = randje (geel/groen)
  // 3e klik = randje weg -> blijft aanwezig
  function klikSpeler(naam: string) {
  const isAanwezig = geselecteerd.includes(naam);
  const isVast = vast.includes(naam);

  // 1e klik: niet aanwezig -> aanwezig
  if (!isAanwezig) {
    setGeselecteerd((prev) => [...prev, naam]);
    return;
  }

  // Als hij vast is: terug naar grijs
  if (isVast) {
    setVast((prev) => prev.filter((n) => n !== naam));
    return;
  }

  // Hij is grijs (aanwezig maar niet vast)

  // Als er nog plek is bij vast: maak hem vast
  if (vast.length < 8) {
    setVast((prev) => [...prev, naam]);
    return;
  }

  // Anders: aanwezig uitzetten
  setGeselecteerd((prev) => prev.filter((n) => n !== naam));
}


  function toggleBaan(letter: string) {
    setBanen((prev) => (prev.includes(letter) ? prev.filter((b) => b !== letter) : [...prev, letter]));
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 20,
        backgroundColor: "#000",
        color: "#fff",
      }}
    >
      {/* SPELERS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: 12,
        }}
      >
        {spelers.map((s, i) => {
          const aan = geselecteerd.includes(s.naam);
          const kleur = kleurVoorSpeler(s.naam);

          const border =
            kleur === "geel"
              ? "4px solid #facc15"
              : kleur === "groen"
              ? "4px solid #22c55e"
              : aan
              ? "4px solid rgba(255,255,255,0.35)"
              : "4px solid transparent";

          return (
            <div
              key={s.naam + "-" + i}
              onClick={() => klikSpeler(s.naam)}
              style={{
                borderRadius: 16,
                overflow: "hidden",
                cursor: "pointer",
                textAlign: "center",
                border,
                opacity: aan ? 1 : 0.35,
              }}
            >
              {klaar && (
                <img
                  src={s.foto}
                  alt={s.naam}
                  style={{
                    width: "100%",
                    height: 140,
                    objectFit: "cover",
                    background: "#333",
                    display: "block",
                  }}
                />
              )}

              <div style={{ padding: 8, fontWeight: 800 }}>{s.naam}</div>
            </div>
          );
        })}
      </div>

      {/* BANEN */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 12,
          marginTop: 20,
          marginBottom: 20,
        }}
      >
        {["a", "b", "c", "d"].map((letter) => (
          <img
            key={letter}
            src={`/banen/knop${letter}.png`}
            alt={`Baan ${letter.toUpperCase()}`}
            onClick={() => toggleBaan(letter)}
            style={{
              width: 80,
              cursor: "pointer",
              opacity: banen.includes(letter) ? 1 : 0.35,
              display: "block",
            }}
          />
        ))}
      </div>

      {/* INDELEN */}
      <div style={{ marginTop: 10 }}>
        <img
          src="/indelen.png"
          alt="Indelen"
          style={{
            width: "100%",
            maxWidth: 366,
            display: "block",
            margin: "0 auto",
            cursor: "pointer",
            opacity: banen.length === 0 ? 0.4 : 1,
          }}
          onClick={() => {
            if (banen.length === 0) return;

            // ✅ REGEL A: vast moet 0, 4 of 8 zijn
            if (![0, 4, 8].includes(vast.length)) {
              alert("Vaste groep moet precies 4 spelers zijn (of 2 groepjes = 8).");
              return;
            }

            const gekozenSpelers = spelers.filter((s) => geselecteerd.includes(s.naam));
            const verdeling = baanVerdeling(gekozenSpelers.length, banen.length);

            if ((gekozenSpelers.length === 6 || gekozenSpelers.length === 11) && !verdeling) {
              alert(
                gekozenSpelers.length === 6
                  ? "Met 6 spelers kan je kiezen: 1 baan (6) of 2 banen (4+2)."
                  : "Met 11 spelers kan je kiezen: 2 banen (6+5) of 3 banen (4+4+3)."
              );
              return;
            }

            const geel = vast.slice(0, 4);
            const groen = vast.slice(4, 8);

            localStorage.setItem("pietje_spelers", JSON.stringify(gekozenSpelers));
            localStorage.setItem("pietje_banen", JSON.stringify(banen));
            if (verdeling) {
  localStorage.setItem("pietje_verdeling", JSON.stringify(verdeling));
} else {
  localStorage.removeItem("pietje_verdeling"); // ✅ heel belangrijk (anders blijft oud hangen)
}

            localStorage.setItem("pietje_vast", JSON.stringify({ geel, groen }));

            window.location.href = "/banen";
          }}
        />
      </div>
    </main>
  );
}
