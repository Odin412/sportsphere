import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, RotateCcw, Share2, Mail, Download } from "lucide-react";

// ── Sport Themes ─────────────────────────────────────────────────────────────
const SPORT_THEMES = {
  Basketball: { bg: "from-orange-950 via-orange-900 to-red-950", accent: "#f97316", border: "#fb923c", glow: "rgba(249,115,22,0.3)" },
  Soccer:     { bg: "from-green-950 via-teal-900 to-teal-950",   accent: "#14b8a6", border: "#2dd4bf", glow: "rgba(20,184,166,0.3)" },
  Football:   { bg: "from-amber-950 via-amber-900 to-amber-950", accent: "#d97706", border: "#fbbf24", glow: "rgba(217,119,6,0.3)" },
  Baseball:   { bg: "from-blue-950 via-blue-900 to-blue-950",    accent: "#3b82f6", border: "#60a5fa", glow: "rgba(59,130,246,0.3)" },
  Tennis:     { bg: "from-yellow-950 via-yellow-900 to-amber-950", accent: "#eab308", border: "#facc15", glow: "rgba(234,179,8,0.3)" },
  Swimming:   { bg: "from-cyan-950 via-cyan-900 to-blue-950",    accent: "#06b6d4", border: "#22d3ee", glow: "rgba(6,182,212,0.3)" },
  Track:      { bg: "from-purple-950 via-purple-900 to-purple-950", accent: "#a855f7", border: "#c084fc", glow: "rgba(168,85,247,0.3)" },
  Hockey:     { bg: "from-slate-900 via-blue-950 to-slate-950",  accent: "#64748b", border: "#94a3b8", glow: "rgba(100,116,139,0.3)" },
  MMA:        { bg: "from-red-950 via-red-900 to-slate-950",     accent: "#ef4444", border: "#f87171", glow: "rgba(239,68,68,0.3)" },
  Boxing:     { bg: "from-red-950 via-rose-900 to-slate-950",    accent: "#e11d48", border: "#fb7185", glow: "rgba(225,29,72,0.3)" },
  CrossFit:   { bg: "from-rose-950 via-pink-900 to-red-950",     accent: "#ec4899", border: "#f472b6", glow: "rgba(236,72,153,0.3)" },
  Golf:       { bg: "from-emerald-950 via-green-900 to-green-950", accent: "#10b981", border: "#34d399", glow: "rgba(16,185,129,0.3)" },
  Volleyball: { bg: "from-indigo-950 via-indigo-900 to-violet-950", accent: "#6366f1", border: "#818cf8", glow: "rgba(99,102,241,0.3)" },
  Cycling:    { bg: "from-sky-950 via-sky-900 to-blue-950",      accent: "#0ea5e9", border: "#38bdf8", glow: "rgba(14,165,233,0.3)" },
  Yoga:       { bg: "from-violet-950 via-purple-900 to-fuchsia-950", accent: "#8b5cf6", border: "#a78bfa", glow: "rgba(139,92,246,0.3)" },
  Softball:   { bg: "from-lime-950 via-green-900 to-emerald-950", accent: "#84cc16", border: "#a3e635", glow: "rgba(132,204,22,0.3)" },
  default:    { bg: "from-gray-950 via-gray-900 to-slate-950",   accent: "#ef4444", border: "#f87171", glow: "rgba(239,68,68,0.3)" },
};

// ── Serial number from ID ────────────────────────────────────────────────────
function serialFromId(id) {
  if (!id) return "#0001";
  let hash = 0;
  const str = String(id);
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return `#${String(Math.abs(hash) % 10000).padStart(4, "0")}`;
}

// ── Holographic Tilt Hook ────────────────────────────────────────────────────
function useHolographicTilt(cardRef) {
  const [tilt, setTilt] = useState({ x: 0, y: 0, mx: 50, my: 50 });
  const [isHovering, setIsHovering] = useState(false);
  const rafRef = useRef(null);
  const isMobile = useRef(
    typeof window !== "undefined" && window.matchMedia("(hover: none)").matches
  ).current;

  const handleMove = useCallback((e) => {
    if (!cardRef.current || isMobile) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const rect = cardRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const rotateY = ((e.clientX - cx) / (rect.width / 2)) * 12;
      const rotateX = -((e.clientY - cy) / (rect.height / 2)) * 12;
      setTilt({ x: rotateX, y: rotateY, mx: px * 100, my: py * 100 });
    });
  }, [cardRef, isMobile]);

  const handleEnter = useCallback(() => setIsHovering(true), []);
  const handleLeave = useCallback(() => {
    setIsHovering(false);
    setTilt({ x: 0, y: 0, mx: 50, my: 50 });
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  const angle = Math.atan2(tilt.mx - 50, tilt.my - 50) * (180 / Math.PI) + 180;

  const cardStyle = isMobile ? {} : {
    transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
    transition: isHovering ? "transform 0.1s ease-out" : "transform 0.5s ease-out",
  };

  const shimmerStyle = {
    background: `linear-gradient(${angle}deg, transparent 0%, rgba(255,0,0,0.07) 10%, rgba(255,165,0,0.07) 20%, rgba(255,255,0,0.07) 30%, rgba(0,255,0,0.07) 40%, rgba(0,200,255,0.07) 50%, rgba(100,0,255,0.07) 60%, rgba(255,0,200,0.07) 70%, transparent 100%)`,
  };

  const specularStyle = {
    background: `radial-gradient(circle at ${tilt.mx}% ${tilt.my}%, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.05) 40%, transparent 70%)`,
  };

  return {
    cardStyle, shimmerStyle, specularStyle, isMobile,
    handlers: isMobile ? {} : { onMouseMove: handleMove, onMouseEnter: handleEnter, onMouseLeave: handleLeave },
  };
}

// ── Mobile shimmer keyframes (injected once) ─────────────────────────────────
const SHIMMER_CSS_ID = "scout-card-shimmer-css";
if (typeof document !== "undefined" && !document.getElementById(SHIMMER_CSS_ID)) {
  const style = document.createElement("style");
  style.id = SHIMMER_CSS_ID;
  style.textContent = `
    @keyframes holoSweep {
      0%   { background-position: 0% 50%; }
      50%  { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    .scout-card-shimmer-mobile {
      background: linear-gradient(
        120deg,
        transparent 0%, rgba(255,0,0,0.06) 10%, rgba(255,165,0,0.06) 20%,
        rgba(255,255,0,0.06) 30%, rgba(0,255,0,0.06) 40%, rgba(0,200,255,0.06) 50%,
        rgba(100,0,255,0.06) 60%, rgba(255,0,200,0.06) 70%, transparent 100%
      );
      background-size: 200% 200%;
      animation: holoSweep 4s ease-in-out infinite;
    }
  `;
  document.head.appendChild(style);
}

// ── CardFront ────────────────────────────────────────────────────────────────
function CardFront({ profile, topMetrics, theme, serial, statCount, onFlip }) {
  const initials = profile.user_name?.[0]?.toUpperCase() || "?";
  return (
    <div className="relative w-full h-full flex flex-col" style={{ backfaceVisibility: "hidden" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div>
          <p className="text-[10px] font-black tracking-[0.25em] text-white/60">P R O P A T H</p>
          {statCount > 0 && (
            <div className="flex items-center gap-1 mt-0.5">
              <CheckCircle className="w-3 h-3 text-white/70" />
              <span className="text-[9px] font-bold text-white/70 tracking-wide">VERIFIED</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.12)" }}>
            <p className="text-[11px] font-bold text-white/90">{profile.sport || "Athlete"}</p>
          </div>
        </div>
      </div>

      {/* Photo */}
      <div className="relative flex-1 mx-3 rounded-xl overflow-hidden min-h-0">
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.user_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl font-black text-white/20">{initials}</span>
          </div>
        )}
        {/* Bottom fade */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent" />
      </div>

      {/* Name + Serial */}
      <div className="px-4 pt-3 pb-1 flex items-end justify-between">
        <div>
          <h2
            className="text-lg font-black text-white tracking-tight leading-tight"
            style={{ textShadow: "0 1px 3px rgba(0,0,0,0.5), 0 0 20px rgba(255,255,255,0.08)" }}
          >
            {profile.user_name}
          </h2>
          <p className="text-[11px] text-white/50 font-medium mt-0.5">
            {[profile.position, profile.team].filter(Boolean).join(" · ") || profile.location || ""}
          </p>
        </div>
        <span className="text-[11px] font-mono font-bold text-white/30">{serial}</span>
      </div>

      {/* Stats */}
      {topMetrics.length > 0 && (
        <div className="flex gap-2 px-4 pt-2 pb-3">
          {topMetrics.slice(0, 3).map((m, i) => (
            <div
              key={i}
              className="flex-1 rounded-xl py-2 text-center"
              style={{ backgroundColor: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}
            >
              <p className="text-base font-black text-white leading-none">
                {m.value}
                {m.unit && m.unit.length <= 3 && <span className="text-[9px] font-medium text-white/50 ml-0.5">{m.unit}</span>}
              </p>
              <p className="text-[8px] text-white/50 font-semibold uppercase tracking-wider mt-1 truncate px-1">{m.name}</p>
            </div>
          ))}
        </div>
      )}

      {/* Bottom bar */}
      <div className="flex items-center justify-between px-4 pb-3">
        <p className="text-[8px] font-black tracking-[0.2em] text-white/20">SPORTSPHERE</p>
        <button
          onClick={(e) => { e.stopPropagation(); onFlip(); }}
          className="w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-white/20"
          style={{ backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}
          aria-label="Flip card"
        >
          <RotateCcw className="w-3.5 h-3.5 text-white/70" />
        </button>
      </div>
    </div>
  );
}

// ── CardBack ─────────────────────────────────────────────────────────────────
function CardBack({ profile, allMetrics, narrative, headline, achievements, bio, serial, onFlip, onContact, onShare, onDownload }) {
  return (
    <div className="relative w-full h-full flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div>
          <p className="text-[10px] font-black tracking-[0.2em] text-white/60">SCOUT REPORT</p>
          <p className="text-sm font-black text-white mt-0.5">{profile.user_name}</p>
        </div>
        <span className="text-[11px] font-mono font-bold text-white/30">{serial}</span>
      </div>

      {/* Stat grid */}
      {allMetrics && Object.keys(allMetrics).length > 0 && (
        <div className="mx-4 mb-3 rounded-xl overflow-hidden" style={{ backgroundColor: "rgba(0,0,0,0.3)" }}>
          <div className="grid grid-cols-2">
            {Object.entries(allMetrics).map(([name, { value, unit }], i) => (
              <div
                key={name}
                className="flex items-center justify-between px-3 py-2 border-b border-white/5"
                style={{ backgroundColor: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent" }}
              >
                <span className="text-[10px] text-white/50 font-medium truncate mr-2">{name}</span>
                <span className="text-xs font-bold text-white whitespace-nowrap">
                  {value}{unit && <span className="text-[9px] text-white/40 ml-0.5">{unit}</span>}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Narrative */}
      {(narrative || headline) && (
        <div className="mx-4 mb-3 rounded-xl p-3" style={{ backgroundColor: "rgba(0,0,0,0.25)" }}>
          {headline && (
            <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1">{headline}</p>
          )}
          <p className="text-[11px] text-white/80 leading-relaxed italic">
            "{narrative || `${profile.user_name} is a dedicated ${profile.sport || "athlete"}.`}"
          </p>
        </div>
      )}

      {/* Achievements */}
      {achievements?.length > 0 && (
        <div className="mx-4 mb-3">
          <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1.5">Achievements</p>
          <div className="space-y-1">
            {achievements.slice(0, 4).map((a, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <span className="text-[10px] mt-px">&#127942;</span>
                <span className="text-[10px] text-white/70 font-medium">{a}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Details */}
      <div className="mx-4 mb-3 flex flex-wrap gap-x-4 gap-y-1">
        {profile.level && (
          <span className="text-[10px] text-white/60 font-semibold capitalize">{profile.level}</span>
        )}
        {profile.years_experience && (
          <span className="text-[10px] text-white/40">{profile.years_experience} yrs exp</span>
        )}
        {profile.location && (
          <span className="text-[10px] text-white/40">{profile.location}</span>
        )}
      </div>

      {/* Bio excerpt */}
      {bio && (
        <div className="mx-4 mb-3">
          <p className="text-[10px] text-white/50 leading-relaxed line-clamp-3">{bio}</p>
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Actions */}
      <div className="flex gap-2 px-4 pb-2">
        {onContact && (
          <button
            onClick={(e) => { e.stopPropagation(); onContact(); }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-bold text-gray-900 bg-white hover:bg-gray-100 transition-colors"
          >
            <Mail className="w-3 h-3" /> Contact
          </button>
        )}
        {onShare && (
          <button
            onClick={(e) => { e.stopPropagation(); onShare(); }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-bold text-white hover:bg-white/25 transition-colors"
            style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
          >
            <Share2 className="w-3 h-3" /> Share
          </button>
        )}
        {onDownload && (
          <button
            onClick={(e) => { e.stopPropagation(); onDownload(); }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-bold text-white hover:bg-white/25 transition-colors"
            style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
          >
            <Download className="w-3 h-3" /> Save
          </button>
        )}
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between px-4 pb-3">
        <p className="text-[8px] font-black tracking-[0.2em] text-white/20">SPORTSPHERE</p>
        <button
          onClick={(e) => { e.stopPropagation(); onFlip(); }}
          className="w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-white/20"
          style={{ backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}
          aria-label="Flip card"
        >
          <RotateCcw className="w-3.5 h-3.5 text-white/70" />
        </button>
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function ScoutCardDisplay({
  profile,
  topMetrics = [],
  allMetrics = null,
  narrative = null,
  headline = null,
  achievements = null,
  bio = null,
  statCount = 0,
  onContact,
  onShare,
  onDownload,
  compact = false,
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef(null);
  const { cardStyle, shimmerStyle, specularStyle, isMobile, handlers } = useHolographicTilt(cardRef);

  if (!profile) return null;

  const theme = SPORT_THEMES[profile.sport] || SPORT_THEMES.default;
  const serial = serialFromId(profile.id);
  const initials = profile.user_name?.[0]?.toUpperCase() || "?";

  // ── Compact mode (ProPathHub preview) ──────────────────────────────────────
  if (compact) {
    return (
      <div
        className={`relative rounded-2xl bg-gradient-to-br ${theme.bg} text-white shadow-xl overflow-hidden`}
        style={{
          aspectRatio: "2/3",
          maxWidth: 160,
          border: `2px solid ${theme.border}`,
          boxShadow: `inset 0 0 20px ${theme.glow}, 0 4px 20px rgba(0,0,0,0.4)`,
        }}
      >
        {/* Shimmer overlay */}
        <div className="scout-card-shimmer-mobile absolute inset-0 pointer-events-none rounded-2xl" />

        <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
          <span className="text-[7px] font-black tracking-[0.2em] text-white/50">PROPATH</span>
          {statCount > 0 && <CheckCircle className="w-2.5 h-2.5 text-white/50" />}
        </div>
        <div className="flex flex-col items-center justify-center h-full gap-1.5 pt-5 pb-3 px-2">
          <Avatar className="w-14 h-14 ring-2 shadow-lg" style={{ "--tw-ring-color": theme.border }}>
            <AvatarImage src={profile.avatar_url} />
            <AvatarFallback className="bg-white/20 text-white font-bold text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div className="text-center">
            <p className="text-[11px] font-black leading-tight">{profile.user_name}</p>
            <p className="text-[8px] text-white/50 font-medium">{profile.sport}</p>
          </div>
          {topMetrics.slice(0, 2).map((m, i) => (
            <div key={i} className="rounded-lg px-2 py-1 text-center w-full" style={{ backgroundColor: "rgba(0,0,0,0.3)" }}>
              <p className="text-sm font-black leading-none">{m.value}{m.unit && m.unit.length <= 3 ? m.unit : ""}</p>
              <p className="text-[7px] text-white/50 font-medium uppercase tracking-wide">{m.name}</p>
            </div>
          ))}
        </div>
        <div className="absolute bottom-1.5 left-0 right-0 text-center">
          <span className="text-[6px] font-black tracking-[0.15em] text-white/15">SPORTSPHERE</span>
        </div>
      </div>
    );
  }

  // ── Full card with flip ────────────────────────────────────────────────────
  return (
    <div
      ref={cardRef}
      className="mx-auto"
      style={{ perspective: 1000, maxWidth: 360, width: "100%" }}
      {...handlers}
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        style={{
          transformStyle: "preserve-3d",
          ...cardStyle,
          willChange: "transform",
        }}
      >
        {/* Card shell */}
        <div
          className={`relative rounded-3xl bg-gradient-to-br ${theme.bg} overflow-hidden`}
          style={{
            aspectRatio: "2.5/3.5",
            border: `3px solid ${theme.border}`,
            boxShadow: `inset 0 0 30px ${theme.glow}, 0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)`,
          }}
        >
          {/* Holographic overlays */}
          <div
            className={`absolute inset-0 pointer-events-none rounded-3xl z-10 ${isMobile ? "scout-card-shimmer-mobile" : ""}`}
            style={isMobile ? {} : shimmerStyle}
          />
          <div
            className="absolute inset-0 pointer-events-none rounded-3xl z-10"
            style={isMobile ? {} : specularStyle}
          />

          {/* Front face */}
          <CardFront
            profile={profile}
            topMetrics={topMetrics}
            theme={theme}
            serial={serial}
            statCount={statCount}
            onFlip={() => setIsFlipped(true)}
          />

          {/* Back face (absolutely positioned) */}
          <div className="absolute inset-0" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
            <CardBack
              profile={profile}
              allMetrics={allMetrics}
              narrative={narrative}
              headline={headline}
              achievements={achievements}
              bio={bio}
              serial={serial}
              onFlip={() => setIsFlipped(false)}
              onContact={onContact}
              onShare={onShare}
              onDownload={onDownload}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
