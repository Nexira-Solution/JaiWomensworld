// Decorative SVGs shared by the hero, category rail and footer.
// Everything here is aria-hidden and pointer-events-none.

function Flower({ cx, cy, r = 14, rot = 0 }) {
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${rot})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="0" cy={-r * 0.62} rx={r * 0.52} ry={r * 0.78} transform={`rotate(${a})`} fill="url(#petalGrad)" stroke="#E87C9B" strokeWidth=".6" />
      ))}
      <circle r={r * 0.2} fill="#F6D573" />
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <circle key={a} cx={Math.cos((a * Math.PI) / 180) * r * 0.32} cy={Math.sin((a * Math.PI) / 180) * r * 0.32} r={r * 0.045} fill="#B02F5E" />
      ))}
    </g>
  );
}

function Leaf({ x, y, rot, s = 1 }) {
  return <ellipse cx={x} cy={y} rx={14 * s} ry={6 * s} transform={`rotate(${rot} ${x} ${y})`} fill="#7FA05B" opacity=".9" />;
}

/** Blossoming branch, anchored to a top corner. `flip` mirrors it for the right side. */
export function BlossomBranch({ flip = false, className = '' }) {
  return (
    <svg
      viewBox="0 0 320 200"
      className={`pointer-events-none absolute top-0 ${flip ? 'right-0 -scale-x-100' : 'left-0'} ${className}`}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="petalGrad" cx=".5" cy=".7" r=".8">
          <stop offset="0" stopColor="#FFE3EA" />
          <stop offset="1" stopColor="#F59BB5" />
        </radialGradient>
      </defs>
      <path d="M-10 30 C60 40 110 70 170 60 C220 52 260 70 305 120" fill="none" stroke="#7A3B2E" strokeWidth="4" strokeLinecap="round" />
      <path d="M90 55 C110 90 120 120 150 150" fill="none" stroke="#7A3B2E" strokeWidth="3" strokeLinecap="round" />
      <path d="M170 60 C190 30 215 18 250 12" fill="none" stroke="#7A3B2E" strokeWidth="2.6" strokeLinecap="round" />
      <Leaf x="60" y="42" rot="-20" />
      <Leaf x="130" y="74" rot="40" s=".9" />
      <Leaf x="205" y="58" rot="-30" />
      <Leaf x="235" y="26" rot="-50" s=".8" />
      <Flower cx="28" cy="38" r="22" rot="10" />
      <Flower cx="95" cy="62" r="17" rot="30" />
      <Flower cx="150" cy="150" r="15" rot="-12" />
      <Flower cx="170" cy="62" r="19" rot="50" />
      <Flower cx="252" cy="14" r="14" rot="0" />
      <Flower cx="290" cy="108" r="12" rot="20" />
    </svg>
  );
}

/** Soft pink silk waves for section floors. */
export function SilkWaves({ className = '', flip = false }) {
  return (
    <svg
      viewBox="0 0 1440 220"
      preserveAspectRatio="none"
      className={`pointer-events-none absolute inset-x-0 bottom-0 w-full h-[120px] sm:h-[170px] ${flip ? '-scale-x-100' : ''} ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="silkA" x1="0" x2="1">
          <stop offset="0" stopColor="#F9B8C8" />
          <stop offset=".5" stopColor="#FFD5E0" />
          <stop offset="1" stopColor="#F59BB5" />
        </linearGradient>
        <linearGradient id="silkB" x1="0" x2="1">
          <stop offset="0" stopColor="#F4A7BA" stopOpacity=".55" />
          <stop offset="1" stopColor="#FFE3EA" stopOpacity=".2" />
        </linearGradient>
      </defs>
      <path d="M0 140 C220 60 380 190 620 150 C860 110 1040 30 1440 110 L1440 220 L0 220 Z" fill="url(#silkB)" />
      <path d="M0 175 C240 110 420 215 700 180 C980 145 1150 90 1440 150 L1440 220 L0 220 Z" fill="url(#silkA)" opacity=".85" />
      <path d="M0 175 C240 110 420 215 700 180 C980 145 1150 90 1440 150" fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth="2" />
    </svg>
  );
}

/** A handful of petals drifting down. Pure CSS, pauses with prefers-reduced-motion. */
export function FallingPetals({ count = 9 }) {
  const petals = Array.from({ length: count }, (_, i) => ({
    left: `${(i * 97) % 100}%`,
    delay: `${(i * 1.7) % 12}s`,
    duration: `${12 + ((i * 3) % 8)}s`,
    scale: 0.6 + ((i * 7) % 6) / 10,
  }));
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {petals.map((p, i) => (
        <span
          key={i}
          className="petal"
          style={{ left: p.left, animationDelay: p.delay, animationDuration: p.duration, transform: `scale(${p.scale})` }}
        />
      ))}
    </div>
  );
}

export function LotusDivider({ className = '' }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`} aria-hidden="true">
      <span className="h-px w-16 sm:w-24 bg-gradient-to-r from-transparent to-[#12233F]/60" />
      <svg width="34" height="22" viewBox="0 0 34 22" fill="none" stroke="#B02F5E" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 3 C13 8 13 14 17 19 C21 14 21 8 17 3Z" />
        <path d="M17 19 C10 18 5 14 4 8 C10 8 14 12 17 19Z" />
        <path d="M17 19 C24 18 29 14 30 8 C24 8 20 12 17 19Z" />
      </svg>
      <span className="h-px w-16 sm:w-24 bg-gradient-to-l from-transparent to-[#12233F]/60" />
    </div>
  );
}
