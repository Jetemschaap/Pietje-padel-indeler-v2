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

function pickOrLoadActieveMap(): string {
  const mappen = ["players", "players-net", "players-bobble", "beroep", "hipers", "knuffels"];
  if (typeof window === "undefined") return "players";

  const bestaand = localStorage.getItem("pietje_map");
  if (bestaand && mappen.includes(bestaand)) return bestaand;

  const gekozen = mappen[Math.floor(Math.random() * mappen.length)];
  localStorage.setItem("pietje_map", gekozen);
  return gekozen;
}

export default function WieDoetMee() {
  const [klaar, setKlaar] = useState(false);

  // Aanwezigen (grijs)
  const [geselecteerd, setGeselecteerd] = useState<string[]>([]);

  // Kleuren (max 4 + max 4)
  const [geel, setGeel] = useState<string[]>([]);
  const [groen, setGroen] = useState<string[]>([]);

  // Banen
  const [banen, setBanen] = useState<string[]>([]);

  // Foto-set vasthouden tot reset
  const [actieveMap] = useState<string>(() => pickOrLoadActieveMap());

  const spelers: Speler[] = useMemo(() => {
    return spelersBron.map((s) => ({
      naam: s.naam,
      foto: `/${actieveMap}/${s.bestand}`,
    }));
  }, [actieveMap]);

  useEffect(() => {
    setKlaar(true);

    // Restore: dezelfde aanwezigen weer aanzetten (bij volgend uur)
    const raw = localStorage.getItem("pietje_spelers");
    if (raw) {
      try {
        const arr: { naam: string }[] = JSON.parse(raw);
        setGeselecteerd(arr.map((s) => s.naam));
      } catch {
        setGeselecteerd([]);
      }
    } else {
      setGeselecteerd([]);
    }

    // Banen herstellen als ze er nog staan
    const banenRaw = localStorage.getItem("pietje_banen");
    if (banenRaw) {
      try {
        const b: string[] = JSON.parse(banenRaw);
        setBanen(b);
      } catch {
        setBanen([]);
      }
    } else {
      setBanen([]);
    }

    // Bij binnenkomst altijd zonder kleuren (alles grijs)
    setGeel([]);
    setGroen([]);
    localStorage.setItem("pietje_vast", JSON.stringify({ geel: [], groen: [] }));

    // restore vlag opruimen (als hij er was)
    localStorage.removeItem("pietje_restore");
  }, []);

  function kleurVoorSpeler(naam: string): "geel" | "groen" | null {
    if (geel.includes(naam)) return "geel";
    if (groen.includes(naam)) return "groen";
    return null;
  }

  // JOUW REGEL: 1 tik aan, 2 tik geel, 3 tik groen, 4 tik uit
  // EXTRA: als geel al 4 is, dan bij "grijs -> geel" overslaan naar groen (of uit)
  function klikSpeler(naam: string) {
    const aan = geselecteerd.includes(naam);
    const isGeel = geel.includes(naam);
    const isGroen = groen.includes(naam);

    // UIT -> AAN (grijs)
    if (!aan) {
      setGeselecteerd((prev) => [...prev, naam]);
      return;
    }

    // GRIJS -> GEEL (als plek, anders GRIJS -> GROEN (als plek), anders UIT)
    if (!isGeel && !isGroen) {
      if (geel.length < 4) {
        setGeel((prev) => [...prev, naam]);
        return;
      }
      if (groen.length < 4) {
        setGroen((prev) => [...prev, naam]);
        return;
      }
      // beide vol -> uit
      setGeselecteerd((prev) => prev.filter((n) => n !== naam));
      return;
    }

    // GEEL -> GROEN (als plek, anders terug naar GRIJS als groen vol)
    if (isGeel) {
      // eerst uit geel halen
      setGeel((prev) => prev.filter((n) => n !== naam));

      if (groen.length < 4) {
        setGroen((prev) => [...prev, naam]);
        return;
      }
      // groen vol -> wordt grijs (blijft aanwezig)
      return;
    }

    // GROEN -> UIT
    if (isGroen) {
      setGroen((prev) => prev.filter((n) => n !== naam));
      setGeselecteerd((prev) => prev.filter((n) => n !== naam));
      return;
    }
  }

  function toggleBaan(letter: string) {
    setBanen((prev) => (prev.includes(letter) ? prev.filter((b) => b !== letter) : [...prev, letter]));
  }

  return (
    <main style={{ minHeight: "100vh", padding: 20, backgroundColor: "#000", color: "#fff" }}>
      {/* SPELERS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: 12,
        }}
      >
        {spelers.map((s) => {
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
              key={s.naam}
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

            const vastCount = geel.length + groen.length;

            // vaste groep moet 0, 4 of 8 zijn
            if (![0, 4, 8].includes(vastCount)) {
              alert("Vaste groep moet precies 4 spelers zijn (of 2 groepjes = 8).");
              return;
            }

            const gekozenSpelers = spelers.filter((sp) => geselecteerd.includes(sp.naam));
            const verdeling = baanVerdeling(gekozenSpelers.length, banen.length);

            if ((gekozenSpelers.length === 6 || gekozenSpelers.length === 11) && !verdeling) {
              alert(
                gekozenSpelers.length === 6
                  ? "Met 6 spelers kan je kiezen: 1 baan (6) of 2 banen (4+2)."
                  : "Met 11 spelers kan je kiezen: 2 banen (6+5) of 3 banen (4+4+3)."
              );
              return;
            }

            localStorage.setItem("pietje_spelers", JSON.stringify(gekozenSpelers));
            localStorage.setItem("pietje_banen", JSON.stringify(banen));

            if (verdeling) {
              localStorage.setItem("pietje_verdeling", JSON.stringify(verdeling));
            } else {
              localStorage.removeItem("pietje_verdeling");
            }

            localStorage.setItem("pietje_vast", JSON.stringify({ geel, groen }));

            window.location.href = "/banen";
          }}
        />
      </div>
    </main>
  );
}
