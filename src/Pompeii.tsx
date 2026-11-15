import React from "react";
import {
  AbsoluteFill,
  interpolate,
  random,
  useCurrentFrame,
  useVideoConfig,
  spring,
  Easing,
} from "remotion";

const W = 1920;
const H = 1080;

/** Timeline anchors (frames @ 30fps, 360 total = 12s) */
const T = {
  calmEnd: 70,
  eruptStart: 90,
  eruptPeak: 180,
  ashFull: 240,
  outroStart: 310,
};

/* ------------------------------------------------------------------ */
/*  SKY — layered gradients that shift from dusk to burning ash       */
/* ------------------------------------------------------------------ */
const Sky: React.FC<{ frame: number }> = ({ frame }) => {
  // darkness overlay grows as the eruption builds
  const dark = interpolate(
    frame,
    [T.calmEnd, T.eruptStart, T.ashFull],
    [0, 0.15, 0.85],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  // red volcanic glow from the horizon
  const glow = interpolate(
    frame,
    [T.calmEnd, T.eruptStart, T.eruptPeak],
    [0.1, 0.35, 0.7],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, #2a2340 0%, #5a3a55 45%, #8a4a3a 75%, #b9683a 100%)",
        }}
      />
      {/* red horizon glow */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 90% 60% at 50% 100%, rgba(255,90,30,1) 0%, rgba(180,40,20,0.6) 35%, rgba(0,0,0,0) 70%)",
          opacity: glow,
          mixBlendMode: "screen",
        }}
      />
      {/* darkening ash */}
      <AbsoluteFill style={{ backgroundColor: "#0a0608", opacity: dark }} />
    </>
  );
};

/* ------------------------------------------------------------------ */
/*  STARS / early embers in the dusk sky                              */
/* ------------------------------------------------------------------ */
const Stars: React.FC<{ frame: number }> = ({ frame }) => {
  const fade = interpolate(frame, [0, 30, T.eruptStart, T.ashFull], [0, 0.9, 0.9, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const stars = Array.from({ length: 90 }, (_, i) => {
    const x = random(`sx${i}`) * W;
    const y = random(`sy${i}`) * H * 0.55;
    const s = 1 + random(`ss${i}`) * 2;
    const tw = 0.4 + 0.6 * Math.sin(frame / (6 + random(`st${i}`) * 10) + i);
    return (
      <div
        key={i}
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: s,
          height: s,
          borderRadius: "50%",
          background: "#fff6e0",
          opacity: tw,
        }}
      />
    );
  });
  return <AbsoluteFill style={{ opacity: fade }}>{stars}</AbsoluteFill>;
};

/* ------------------------------------------------------------------ */
/*  MOUNT VESUVIUS                                                     */
/* ------------------------------------------------------------------ */
const Volcano: React.FC<{ frame: number }> = ({ frame }) => {
  // crater glow pulsing, intensifying with eruption
  const craterGlow = interpolate(
    frame,
    [T.calmEnd, T.eruptStart, T.eruptPeak],
    [0.3, 0.8, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const pulse = 0.75 + 0.25 * Math.sin(frame / 5);

  // tiny ground shake once the eruption hits
  const shake =
    frame > T.eruptStart
      ? (random(`shk${Math.floor(frame)}`) - 0.5) *
        interpolate(frame, [T.eruptStart, T.eruptPeak], [0, 10], {
          extrapolateRight: "clamp",
        })
      : 0;

  return (
    <AbsoluteFill style={{ transform: `translateX(${shake}px)` }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <radialGradient id="crater" cx="50%" cy="20%" r="60%">
            <stop offset="0%" stopColor="#fff2b0" />
            <stop offset="40%" stopColor="#ff7a1a" />
            <stop offset="100%" stopColor="#7a1a0a" />
          </radialGradient>
          <linearGradient id="mtn" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#241a28" />
            <stop offset="100%" stopColor="#120a14" />
          </linearGradient>
        </defs>
        {/* lava light spilling down the slopes */}
        <polygon
          points={`${W / 2},${H * 0.42} ${W * 0.32},${H * 0.82} ${W * 0.68},${H * 0.82}`}
          fill="url(#crater)"
          opacity={craterGlow * 0.5 * pulse}
        />
        {/* mountain body */}
        <polygon
          points={`${W / 2},${H * 0.46} ${W * 0.12},${H * 0.86} ${W * 0.88},${H * 0.86}`}
          fill="url(#mtn)"
        />
        {/* crater mouth glow */}
        <ellipse
          cx={W / 2}
          cy={H * 0.47}
          rx={70}
          ry={22}
          fill="url(#crater)"
          opacity={craterGlow * pulse}
        />
      </svg>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/*  ERUPTION PLUME — stacked expanding ash puffs rising from crater   */
/* ------------------------------------------------------------------ */
const Plume: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const grow = spring({
    frame: frame - T.eruptStart,
    fps,
    config: { damping: 200, mass: 2 },
    durationInFrames: 120,
  });
  if (frame < T.eruptStart) return null;

  const cx = W / 2;
  const baseY = H * 0.47;

  const puffs = Array.from({ length: 34 }, (_, i) => {
    const t = i / 33;
    // appear progressively up the column
    const appear = interpolate(grow, [t * 0.7, Math.min(1, t * 0.7 + 0.3)], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const rise = t * H * 0.55;
    const drift = (random(`pd${i}`) - 0.5) * (120 + t * 420);
    const size = (60 + t * 340) * (0.6 + 0.4 * random(`ps${i}`));
    const wobble = Math.sin(frame / 8 + i) * (6 + t * 30);
    // mushroom spread near the top
    const spread = Math.pow(t, 2) * 260 * (random(`pm${i}`) > 0.5 ? 1 : -1);
    const shade = 30 + Math.floor(random(`pc${i}`) * 40);
    return (
      <div
        key={i}
        style={{
          position: "absolute",
          left: cx + drift + spread + wobble - size / 2,
          top: baseY - rise - size / 2,
          width: size,
          height: size,
          borderRadius: "50%",
          background: `radial-gradient(circle at 40% 40%, rgba(${shade + 30},${shade + 15},${shade},0.95), rgba(${shade},${shade - 5},${shade - 8},0.75) 60%, rgba(10,8,8,0) 72%)`,
          filter: "blur(6px)",
          opacity: appear * 0.9,
        }}
      />
    );
  });

  // hot glowing base where lava meets ash
  const baseGlow = (
    <div
      style={{
        position: "absolute",
        left: cx - 160,
        top: baseY - 180,
        width: 320,
        height: 260,
        borderRadius: "50%",
        background:
          "radial-gradient(circle, rgba(255,150,40,0.9), rgba(255,70,20,0.4) 50%, rgba(0,0,0,0) 70%)",
        filter: "blur(10px)",
        opacity: grow,
        mixBlendMode: "screen",
      }}
    />
  );

  return (
    <AbsoluteFill>
      {baseGlow}
      {puffs}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/*  RISING EMBERS from the crater                                     */
/* ------------------------------------------------------------------ */
const Embers: React.FC<{ frame: number }> = ({ frame }) => {
  if (frame < T.eruptStart - 10) return null;
  const embers = Array.from({ length: 70 }, (_, i) => {
    const life = 90 + random(`el${i}`) * 90;
    const born = T.eruptStart - 10 + random(`eb${i}`) * 220;
    const age = frame - born;
    if (age < 0 || age > life) return null;
    const p = age / life;
    const x = W / 2 + (random(`ex${i}`) - 0.5) * 140 + Math.sin(age / 10 + i) * (40 + p * 160);
    const y = H * 0.47 - p * (H * 0.5) * (0.6 + random(`ey${i}`) * 0.6);
    const s = (2 + random(`es${i}`) * 5) * (1 - p * 0.5);
    const op = Math.sin(p * Math.PI);
    return (
      <div
        key={i}
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: s,
          height: s,
          borderRadius: "50%",
          background: `rgba(255,${160 - Math.floor(p * 120)},${60 - Math.floor(p * 50)},1)`,
          boxShadow: `0 0 ${6 * s}px rgba(255,120,30,${op})`,
          opacity: op,
        }}
      />
    );
  });
  return <AbsoluteFill style={{ mixBlendMode: "screen" }}>{embers}</AbsoluteFill>;
};

/* ------------------------------------------------------------------ */
/*  FALLING ASH over the whole frame                                  */
/* ------------------------------------------------------------------ */
const Ash: React.FC<{ frame: number }> = ({ frame }) => {
  const density = interpolate(frame, [T.eruptStart, T.ashFull], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (density <= 0) return null;
  const flakes = Array.from({ length: 180 }, (_, i) => {
    const speed = 60 + random(`af${i}`) * 140;
    const startX = random(`ax${i}`) * W;
    const sway = Math.sin(frame / (20 + random(`aw${i}`) * 20) + i) * 40;
    const y = ((frame * speed) / 30 + random(`ay${i}`) * H) % (H + 100);
    const s = 1.5 + random(`as${i}`) * 4;
    const g = 150 + Math.floor(random(`ag${i}`) * 70);
    return (
      <div
        key={i}
        style={{
          position: "absolute",
          left: startX + sway,
          top: y - 50,
          width: s,
          height: s,
          borderRadius: "50%",
          background: `rgb(${g},${g - 10},${g - 20})`,
          opacity: 0.6 * density,
        }}
      />
    );
  });
  return <AbsoluteFill>{flakes}</AbsoluteFill>;
};

/* ------------------------------------------------------------------ */
/*  PYROCLASTIC LIGHTNING flashes                                     */
/* ------------------------------------------------------------------ */
const Lightning: React.FC<{ frame: number }> = ({ frame }) => {
  if (frame < T.eruptPeak) return null;
  // flash on a few specific frames
  const strikes = [195, 212, 238, 266, 290];
  const near = strikes.find((s) => Math.abs(frame - s) < 3);
  if (near === undefined) return null;
  const intensity = interpolate(Math.abs(frame - near), [0, 3], [0.5, 0], {
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse 50% 40% at 50% 30%, rgba(200,180,255,1), rgba(120,90,200,0) 60%)",
        opacity: intensity,
        mixBlendMode: "screen",
      }}
    />
  );
};

/* ------------------------------------------------------------------ */
/*  CITY SILHOUETTE in the foreground                                 */
/* ------------------------------------------------------------------ */
const City: React.FC<{ frame: number }> = ({ frame }) => {
  const rimLight = interpolate(
    frame,
    [T.eruptStart, T.eruptPeak],
    [0.15, 0.6],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const groundY = H * 0.86;

  const columns = [0.1, 0.18, 0.26].map((fx, i) => {
    const x = W * fx;
    return (
      <g key={`col${i}`}>
        <rect x={x} y={groundY - 150} width={22} height={150} fill="#0d0810" />
        <rect x={x - 6} y={groundY - 160} width={34} height={12} fill="#0d0810" />
        <rect x={x - 6} y={groundY - 150} width={34} height={8} fill="#0d0810" />
      </g>
    );
  });

  return (
    <AbsoluteFill>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {/* rim glow behind buildings */}
        <rect
          x={0}
          y={groundY - 170}
          width={W}
          height={10}
          fill="#ff6a20"
          opacity={rimLight}
          filter="blur(6px)"
        />
        {/* right-side buildings */}
        <rect x={W * 0.74} y={groundY - 200} width={90} height={200} fill="#0d0810" />
        <polygon
          points={`${W * 0.72},${groundY - 200} ${W * 0.74 + 45},${groundY - 260} ${W * 0.74 + 90 + 20},${groundY - 200}`}
          fill="#0d0810"
        />
        <rect x={W * 0.86} y={groundY - 150} width={70} height={150} fill="#0b060c" />
        {/* left temple */}
        <rect x={W * 0.06} y={groundY - 170} width={180} height={20} fill="#0d0810" />
        <polygon
          points={`${W * 0.05},${groundY - 170} ${W * 0.06 + 95},${groundY - 215} ${W * 0.06 + 190},${groundY - 170}`}
          fill="#0d0810"
        />
        {columns}
        {/* ground */}
        <rect x={0} y={groundY} width={W} height={H - groundY} fill="#080509" />
      </svg>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/*  TITLE                                                              */
/* ------------------------------------------------------------------ */
const Title: React.FC<{ frame: number }> = ({ frame }) => {
  const inOp = interpolate(frame, [8, 34], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeMid = interpolate(frame, [T.eruptStart, T.eruptStart + 30], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleOp = inOp * fadeMid;

  // outro title
  const outOp = interpolate(
    frame,
    [T.outroStart, T.outroStart + 25, 345, 360],
    [0, 1, 1, 0.9],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const letterSpace = interpolate(frame, [T.outroStart, 360], [30, 46], {
    extrapolateRight: "clamp",
  });

  return (
    <>
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          opacity: titleOp,
        }}
      >
        <div
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            color: "#f3e6c8",
            fontSize: 150,
            fontWeight: 700,
            letterSpacing: 24,
            textShadow: "0 0 40px rgba(0,0,0,0.8)",
            marginBottom: 10,
          }}
        >
          POMPEII
        </div>
        <div
          style={{
            fontFamily: "Georgia, serif",
            color: "#d9a05a",
            fontSize: 34,
            letterSpacing: 18,
          }}
        >
          AD 79 · THE LAST DAY
        </div>
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          opacity: outOp,
        }}
      >
        <div
          style={{
            fontFamily: "Georgia, serif",
            color: "#efe2c4",
            fontSize: 120,
            letterSpacing: letterSpace,
            textShadow: "0 0 50px rgba(0,0,0,0.9)",
          }}
        >
          POMPEII
        </div>
      </AbsoluteFill>
    </>
  );
};

/* ------------------------------------------------------------------ */
/*  COMPOSITION                                                        */
/* ------------------------------------------------------------------ */
export const Pompeii: React.FC = () => {
  const frame = useCurrentFrame();

  // gentle camera push-in
  const scale = interpolate(frame, [0, 360], [1.0, 1.12], {
    easing: Easing.inOut(Easing.ease),
  });
  const camY = interpolate(frame, [0, 360], [0, -30]);

  // final fade to black
  const fadeOut = interpolate(frame, [350, 360], [0, 0.25], {
    extrapolateLeft: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill
        style={{ transform: `scale(${scale}) translateY(${camY}px)` }}
      >
        <Sky frame={frame} />
        <Stars frame={frame} />
        <Volcano frame={frame} />
        <Embers frame={frame} />
        <Plume frame={frame} />
        <Ash frame={frame} />
        <Lightning frame={frame} />
        <City frame={frame} />
      </AbsoluteFill>
      <Title frame={frame} />
      <AbsoluteFill style={{ backgroundColor: "#000", opacity: fadeOut }} />
    </AbsoluteFill>
  );
};
