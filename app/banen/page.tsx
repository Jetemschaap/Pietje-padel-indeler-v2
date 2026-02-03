"use client";

import { useEffect, useMemo, useState } from "react";
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
  const max6 = spelers.slice(0, 6);

  const boven = max6.slice(0, 2);
  const onder = max6.slice(2, 4);
  const extras = max6.slice(4);

  const leeg: Speler = { naam: "", foto: "/leeg.png" };
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

      {extras.length > 0 && (
        <div style={{ marginTop: 16, display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
          {extras.map((sp, idx) => (
            <div key={sp.naam + idx} style={{ width: 160 }}>
              <SpelerVak speler={sp} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function rotate<T>(arr: T[], offset: number) {
  if (arr.length === 0) return arr;
  const k = ((offset % arr.length) + arr.length) % arr.length;
  return arr.slice(k).concat(arr.slice(0, k));
}

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function computeTargetSizes(n: number, banen: string[], hourIndex: number) {
  const m = banen.length;
  const sizes = Array.from({ length: m }, () => 4);

  const baseTotal = 4 * m;
  let diff = n - baseTotal;

  let start = hourIndex % m;

  if (diff > 0) {
    while (diff > 0) {
      sizes[start] = sizes[start] + 1;
      diff--;
      start = (start + 1) % m;
      if (diff > 0 && sizes.every((s) => s >= 6)) break;
    }
  } else if (diff < 0) {
    diff = -diff;
    while (diff > 0) {
      sizes[start] = Math.max(1, sizes[start] - 1);
      diff--;
      start = (start + 1) % m;
      if (diff > 0 && sizes.every((s) => s === 1)) break;
    }
  }

  return sizes;
}

function assignWith53Rule(spelers: Speler[], banen: string[], prevSpecialNames: Set<string>, hourIndex: number) {
  const n = spelers.length;
  const sizes = computeTargetSizes(n, banen, hourIndex);

  const normalLanes: string[] = [];
  const specialLanes: string[] = [];

  banen.forEach((b, idx) => {
    if (sizes[idx] === 4) normalLanes.push(b);
    else specialLanes.push(b);
  });

  const ordered = shuffle([...spelers]);

  let prevSpecial: Speler[] = [];
  let others: Speler[] = [];
  for (const s of ordered) {
    if (prevSpecialNames.has(s.naam)) prevSpecial.push(s);
    else others.push(s);
  }

  prevSpecial = shuffle(prevSpecial);
  others = shuffle(others);

  prevSpecial = rotate(prevSpecial, hourIndex);
  others = rotate(others, hourIndex);

  const map: Record<string, Speler[]> = {};
  banen.forEach((b) => (map[b] = []));

  const fillLaneRoundRobin = (laneLetters: string[], pool: Speler[]) => {
    if (laneLetters.length === 0) return;
    let laneIdx = 0;

    while (pool.length > 0) {
      const lane = laneLetters[laneIdx];
      const target = sizes[banen.indexOf(lane)];

      if (map[lane].length < target) {
        map[lane].push(pool.shift()!);
      }

      laneIdx = (laneIdx + 1) % laneLetters.length;

      const allFull = laneLetters.every((l) => map[l].length >= sizes[banen.indexOf(l)]);
      if (allFull) break;
    }
  };

  fillLaneRoundRobin(normalLanes, prevSpecial);
  fillLaneRoundRobin(normalLanes, others);
  fillLaneRoundRobin(specialLanes, others);
  fillLaneRoundRobin(specialLanes, prevSpecial);

  const specialNow = new Set<string>();
  banen.forEach((b) => {
    const target = sizes[banen.indexOf(b)];
    if (target !== 4) {
      map[b].forEach((s) => specialNow.add(s.naam));
    }
  });

  return { map, specialNow };
}

function getVasteGroepen(): { geel: string[]; groen: string[] } | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("pietje_vast");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function buildMapMetVast(
  spelersShuffled: Speler[],
  letters: string[],
  prevSpecialNames: Set<string>,
  hourIndex: number
) {
  const vast = getVasteGroepen();
  const geel = vast?.geel ?? [];
  const groen = vast?.groen ?? [];

  const hasGeel = geel.length === 4;
  const hasGroen = groen.length === 4;

  if (!hasGeel && !hasGroen) {
    const { map, specialNow } = assignWith53Rule(spelersShuffled, letters, prevSpecialNames, hourIndex);
    return { map, specialNow };
  }

  const geelSet = new Set(geel);
  const groenSet = new Set(groen);

  const geelSpelers = spelersShuffled.filter((s) => geelSet.has(s.naam));
  const groenSpelers = spelersShuffled.filter((s) => groenSet.has(s.naam));
  const restSpelers = spelersShuffled.filter((s) => !geelSet.has(s.naam) && !groenSet.has(s.naam));

  let reservedCount = 0;
  if (hasGeel) reservedCount += 1;
  if (hasGroen) reservedCount += 1;

  const reservedLanes = letters.slice(0, reservedCount);
  const remainingLanes = letters.slice(reservedCount);

  const map: Record<string, Speler[]> = {};
  letters.forEach((l) => (map[l] = []));

  let idx = 0;
  if (hasGeel && reservedLanes[idx]) {
    map[reservedLanes[idx]] = shuffle([...geelSpelers]);
    idx++;
  }
  if (hasGroen && reservedLanes[idx]) {
    map[reservedLanes[idx]] = shuffle([...groenSpelers]);
    idx++;
  }

  if (remainingLanes.length > 0) {
    const { map: restMap, specialNow } = assignWith53Rule(restSpelers, remainingLanes, prevSpecialNames, hourIndex);
    remainingLanes.forEach((l) => {
      map[l] = restMap[l] || [];
    });
    return { map, specialNow };
  }

  return { map, specialNow: new Set<string>() };
}

export default function Banen() {
  const router = useRouter();

  const [spelers, setSpelers] = useState<Speler[]>([]);
  const [banen, setBanen] = useState<string[]>([]);
  const [baanMap, setBaanMap] = useState<Record<string, Speler[]>>({});
  const [hourIndex, setHourIndex] = useState<number>(0);

  const prevSpecialNames = useMemo(() => {
    if (typeof window === "undefined") return new Set<string>();
    const raw = localStorage.getItem("pietje_prev_special");
    const arr: string[] = raw ? JSON.parse(raw) : [];
    return new Set(arr);
  }, [hourIndex]);

  useEffect(() => {
    const spelersRaw = localStorage.getItem("pietje_spelers");
    const banenRaw = localStorage.getItem("pietje_banen");

    const s: Speler[] = spelersRaw ? JSON.parse(spelersRaw) : [];
    const b: string[] = banenRaw ? JSON.parse(banenRaw) : [];
    const letters = b.map((x) => x.toUpperCase());

    const hRaw = localStorage.getItem("pietje_hour");
    const h = hRaw ? Number(hRaw) : 0;

    setSpelers(s);
    setBanen(letters);
    setHourIndex(h);

    const verdelingRaw = localStorage.getItem("pietje_verdeling");
    const verdeling: number[] | null = verdelingRaw ? JSON.parse(verdelingRaw) : null;

    const magVerdeling = verdeling && (s.length === 6 || s.length === 11) && verdeling.length === letters.length;

    if (magVerdeling) {
      const ordered = shuffle([...s]);
      const map: Record<string, Speler[]> = {};
      let idx = 0;

      letters.forEach((letter, i) => {
        const size = verdeling![i];
        map[letter] = ordered.slice(idx, idx + size);
        idx += size;
      });

      setBaanMap(map);
      localStorage.setItem("pietje_prev_special", JSON.stringify([]));
    } else {
      localStorage.removeItem("pietje_verdeling");

      const ordered = shuffle([...s]);
      const { map, specialNow } = buildMapMetVast(ordered, letters, new Set<string>(), h);

      setBaanMap(map);
      localStorage.setItem("pietje_prev_special", JSON.stringify(Array.from(specialNow)));
    }

    localStorage.setItem("pietje_hour", String(h));
  }, []);

  function volgendUur() {
    if (banen.length === 0) return;

    const nextHour = hourIndex + 1;

    // ✅ belangrijke afspraak:
    // - aanwezigen blijven hetzelfde (dus pietje_spelers bewaren)
    // - vaste kleuren worden leeggemaakt (dus alles grijs)
    // - daarna terug naar /wie-doet-mee met restore=1
    if (typeof window !== "undefined") {
      localStorage.setItem("pietje_spelers", JSON.stringify(spelers));
      localStorage.setItem("pietje_vast", JSON.stringify({ geel: [], groen: [] }));
      localStorage.setItem("pietje_restore", "1");
      localStorage.setItem("pietje_hour", String(nextHour));
    }

    const verdelingRaw =
      typeof window !== "undefined" ? localStorage.getItem("pietje_verdeling") : null;
    const verdeling: number[] | null = verdelingRaw ? JSON.parse(verdelingRaw) : null;

    const magVerdeling =
      verdeling && (spelers.length === 6 || spelers.length === 11) && verdeling.length === banen.length;

    if (magVerdeling) {
      const ordered = shuffle([...spelers]);
      const map: Record<string, Speler[]> = {};
      let idx = 0;

      banen.forEach((letter, i) => {
        const size = verdeling![i];
        map[letter] = ordered.slice(idx, idx + size);
        idx += size;
      });

      setBaanMap(map);
      setHourIndex(nextHour);

      if (typeof window !== "undefined") {
        localStorage.setItem("pietje_prev_special", JSON.stringify([]));
      }

      router.push("/wie-doet-mee");
      return;
    }

    // anders: geen verdeling
    if (typeof window !== "undefined") {
      localStorage.removeItem("pietje_verdeling");
    }

    const ordered = shuffle([...spelers]);
    const { map, specialNow } = buildMapMetVast(ordered, banen, prevSpecialNames, nextHour);

    setBaanMap(map);
    setHourIndex(nextHour);

    if (typeof window !== "undefined") {
      localStorage.setItem("pietje_prev_special", JSON.stringify(Array.from(specialNow)));
    }

    router.push("/wie-doet-mee");
  }

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
            onClick={volgendUur}
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
