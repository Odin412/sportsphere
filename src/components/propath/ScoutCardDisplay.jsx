import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, RotateCcw, Share2, Mail, Download } from "lucide-react";

// ── Sport Themes ─────────────────────────────────────────────────────────────
const SPORT_THEMES = {
  Basketball: { bg: "from-orange-950 via-orange-900 to-red-950", accent: "#f97316", border: "#fb923c", glow: "rgba(249,115,22,0.4)" },
  Soccer:     { bg: "from-green-950 via-teal-900 to-teal-950",   accent: "#14b8a6", border: "#2dd4bf", glow: "rgba(20,184,166,0.4)" },
  Football:   { bg: "from-amber-950 via-amber-900 to-amber-950", accent: "#d97706", border: "#fbbf24", glow: "rgba(217,119,6,0.4)" },
  Baseball:   { bg: "from-blue-950 via-blue-900 to-blue-950",    accent: "#3b82f6", border: "#60a5fa", glow: "rgba(59,130,246,0.4)" },
  Tennis:     { bg: "from-yellow-950 via-yellow-900 to-amber-950", accent: "#eab308", border: "#facc15", glow: "rgba(234,179,8,0.4)" },
  Swimming:   { bg: "from-cyan-950 via-cyan-900 to-blue-950",    accent: "#06b6d4", border: "#22d3ee", glow: "rgba(6,182,212,0.4)" },
  Track:      { bg: "from-purple-950 via-purple-900 to-purple-950", accent: "#a855f7", border: "#c084fc", glow: "rgba(168,85,247,0.4)" },
  Hockey:     { bg: "from-slate-900 via-blue-950 to-slate-950",  accent: "#64748b", border: "#94a3b8", glow: "rgba(100,116,139,0.4)" },
  MMA:        { bg: "from-red-950 via-red-900 to-slate-950",     accent: "#ef4444", border: "#f87171", glow: "rgba(239,68,68,0.4)" },
  Boxing:     { bg: "from-red-950 via-rose-900 to-slate-950",    accent: "#e11d48", border: "#fb7185", glow: "rgba(225,29,72,0.4)" },
  CrossFit:   { bg: "from-rose-950 via-pink-900 to-red-950",     accent: "#ec4899", border: "#f472b6", glow: "rgba(236,72,153,0.4)" },
  Golf:       { bg: "from-emerald-950 via-green-900 to-green-950", accent: "#10b981", border: "#34d399", glow: "rgba(16,185,129,0.4)" },
  Volleyball: { bg: "from-indigo-950 via-indigo-900 to-violet-950", accent: "#6366f1", border: "#818cf8", glow: "rgba(99,102,241,0.4)" },
  Cycling:    { bg: "from-sky-950 via-sky-900 to-blue-950",      accent: "#0ea5e9", border: "#38bdf8", glow: "rgba(14,165,233,0.4)" },
  Yoga:       { bg: "from-violet-950 via-purple-900 to-fuchsia-950", accent: "#8b5cf6", border: "#a78bfa", glow: "rgba(139,92,246,0.4)" },
  Softball:   { bg: "from-lime-950 via-green-900 to-emerald-950", accent: "#84cc16", border: "#a3e635", glow: "rgba(132,204,22,0.4)" },
  default:    { bg: "from-gray-950 via-gray-900 to-slate-950",   accent: "#ef4444", border: "#f87171", glow: "rgba(239,68,68,0.4)" },
};

function serialFromId(id) {
  if (!id) return "#0001";
  let hash = 0;
  const str = String(id);
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return `#${String(Math.abs(hash) % 10000).padStart(4, "0")}`;
}

// ── Inject CSS once ──────────────────────────────────────────────────────────
const CSS_ID = "scout-card-css";
if (typeof document !== "undefined" && !document.getElementById(CSS_ID)) {
  const s = document.createElement("style");
  s.id = CSS_ID;
  s.textContent = `
    @keyframes holoSweep {
      0%   { transform: translateX(-100%) rotate(25deg); }
      100% { transform: translateX(200%) rotate(25deg); }
    }
    @keyframes holoShine {
      0%, 100% { opacity: 0.3; }
      50%      { opacity: 0.7; }
    }
    .scout-holo-sweep {
      position: absolute; inset: -50%; width: 200%; height: 200%;
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(255,0,0,0.12) 8%,
        rgba(255,165,0,0.15) 16%,
        rgba(255,255,0,0.12) 24%,
        rgba(0,255,100,0.15) 32%,
        rgba(0,200,255,0.15) 40%,
        rgba(80,0,255,0.12) 48%,
        rgba(255,0,200,0.12) 56%,
        transparent 64%
      );
      animation: holoSweep 3s ease-in-out infinite;
      pointer-events: none;
      mix-blend-mode: screen;
    }
    .scout-foil-pattern {
      background-image:
        repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          rgba(255,255,255,0.02) 2px,
          rgba(255,255,255,0.02) 4px
        ),
        repeating-linear-gradient(
          90deg,
          transparent,
          transparent 2px,
          rgba(255,255,255,0.015) 2px,
          rgba(255,255,255,0.015) 4px
        );
      pointer-events: none;
    }
    .scout-card-tilt {
      transition: transform 0.15s ease-out;
      will-change: transform;
    }
    .scout-card-tilt-reset {
      transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1);
    }
  `;
  document.head.appendChild(s);
}

// ── Holographic Tilt Hook ────────────────────────────────────────────────────
function useHolographicTilt(ref) {
  const [state, setState] = useState({ rx: 0, ry: 0, mx: 50, my: 50, hovering: false });
  const raf = useRef(null);
  const isMobile = typeof window !== "undefined" && window.matchMedia("(hover: none)").matches;

  const onMove = useCallback((e) => {
    if (!ref.current || isMobile) return;
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      if (!ref.current) return;
      const r = ref.current.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;   // 0-1
      const py = (e.clientY - r.top) / r.height;    // 0-1
      const ry = (px - 0.5) * 24;    // ±12 deg
      const rx = -(py - 0.5) * 24;   // ±12 deg
      setState({ rx, ry, mx: px * 100, my: py * 100, hovering: true });
    });
  }, [ref, isMobile]);

  const onEnter = useCallback(() => setState(s => ({ ...s, hovering: true })), []);
  const onLeave = useCallback(() => {
    setState({ rx: 0, ry: 0, mx: 50, my: 50, hovering: false });
    if (raf.current) cancelAnimationFrame(raf.current);
  }, []);

  useEffect(() => () => { if (raf.current) cancelAnimationFrame(raf.current); }, []);

  const angle = Math.atan2(state.mx - 50, state.my - 50) * (180 / Math.PI) + 180;

  return {
    isMobile,
    tiltClass: state.hovering ? "scout-card-tilt" : "scout-card-tilt-reset",
    tiltTransform: isMobile ? "" : `perspective(800px) rotateX(${state.rx}deg) rotateY(${state.ry}deg)`,
    // Rainbow prismatic sweep — follows mouse angle
    shimmerBg: `linear-gradient(${angle}deg,
      transparent 0%,
      rgba(255,50,50,0.18) 10%,
      rgba(255,180,0,0.20) 18%,
      rgba(255,255,0,0.18) 26%,
      rgba(0,255,120,0.20) 34%,
      rgba(0,180,255,0.22) 42%,
      rgba(120,0,255,0.18) 50%,
      rgba(255,0,180,0.18) 58%,
      rgba(255,50,50,0.15) 66%,
      transparent 74%
    )`,
    // Bright specular highlight that follows cursor
    specularBg: `radial-gradient(
      ellipse at ${state.mx}% ${state.my}%,
      rgba(255,255,255,0.4) 0%,
      rgba(255,255,255,0.15) 25%,
      rgba(255,255,255,0.03) 50%,
      transparent 70%
    )`,
    handlers: isMobile ? {} : { onMouseMove: onMove, onMouseEnter: onEnter, onMouseLeave: onLeave },
  };
}

// ── CardFront ────────────────────────────────────────────────────────────────
function CardFront({ profile, topMetrics, theme, serial, statCount, onFlip }) {
  const initials = profile.user_name?.[0]?.toUpperCase() || "?";
  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2 relative z-20">
        <div>
          <p
            className="text-[10px] font-black tracking-[0.3em]"
            style={{ color: theme.border, textShadow: `0 0 10px ${theme.glow}` }}
          >
            PROPATH
          </p>
          {statCount > 0 && (
            <div className="flex items-center gap-1 mt-0.5">
              <CheckCircle className="w-3 h-3" style={{ color: theme.border }} />
              <span className="text-[9px] font-bold tracking-wide" style={{ color: theme.border }}>VERIFIED</span>
            </div>
          )}
        </div>
        <div
          className="px-2.5 py-1 rounded-lg border"
          style={{ borderColor: `${theme.border}44`, backgroundColor: `${theme.accent}15` }}
        >
          <p className="text-[11px] font-bold text-white/90">{profile.sport || "Athlete"}</p>
        </div>
      </div>

      {/* Photo area */}
      <div className="relative flex-1 mx-3 rounded-xl overflow-hidden min-h-0 z-20">
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt={profile.user_name} className="w-full h-full object-cover" />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${theme.accent}33, ${theme.accent}11)` }}
          >
            <span className="text-7xl font-black" style={{ color: `${theme.border}40` }}>{initials}</span>
          </div>
        )}
        {/* Vignette overlay */}
        <div className="absolute inset-0 shadow-[inset_0_0_30px_rgba(0,0,0,0.5)]" />
        {/* Bottom fade */}
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        {/* Name overlay on photo */}
        <div className="absolute bottom-0 inset-x-0 px-3 pb-2">
          <h2
            className="text-xl font-black text-white tracking-tight leading-tight"
            style={{
              textShadow: `0 2px 4px rgba(0,0,0,0.8), 0 0 30px ${theme.glow}, 0 0 60px ${theme.glow}`,
            }}
          >
            {profile.user_name}
          </h2>
          <p className="text-[11px] text-white/60 font-semibold">
            {[profile.position, profile.team].filter(Boolean).join(" \u00B7 ") || profile.location || ""}
          </p>
        </div>
      </div>

      {/* Metallic divider */}
      <div className="mx-4 my-2 h-px relative z-20" style={{
        background: `linear-gradient(90deg, transparent, ${theme.border}80, ${theme.border}, ${theme.border}80, transparent)`
      }} />

      {/* Stats */}
      {topMetrics.length > 0 ? (
        <div className="flex gap-2 px-4 pb-2 relative z-20">
          {topMetrics.slice(0, 3).map((m, i) => (
            <div
              key={i}
              className="flex-1 rounded-xl py-2.5 text-center border"
              style={{
                backgroundColor: "rgba(0,0,0,0.4)",
                borderColor: `${theme.border}25`,
                boxShadow: `inset 0 1px 0 ${theme.border}15`,
              }}
            >
              <p className="text-lg font-black text-white leading-none" style={{ textShadow: `0 0 12px ${theme.glow}` }}>
                {m.value}
                {m.unit && m.unit.length <= 3 && <span className="text-[9px] font-bold text-white/40 ml-0.5">{m.unit}</span>}
              </p>
              <p className="text-[7px] font-bold uppercase tracking-widest mt-1 truncate px-1" style={{ color: `${theme.border}99` }}>
                {m.name}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1" />
      )}

      {/* Serial + Flip */}
      <div className="flex items-center justify-between px-4 pb-3 relative z-20">
        <div className="flex items-center gap-2">
          <span className="text-[8px] font-black tracking-[0.2em]" style={{ color: `${theme.border}40` }}>SPORTSPHERE</span>
          <span className="text-[10px] font-mono font-bold" style={{ color: `${theme.border}50` }}>{serial}</span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onFlip(); }}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          style={{
            background: `linear-gradient(135deg, ${theme.border}30, ${theme.accent}20)`,
            border: `1.5px solid ${theme.border}50`,
            boxShadow: `0 0 12px ${theme.glow}`,
          }}
          aria-label="Flip card"
        >
          <RotateCcw className="w-3.5 h-3.5" style={{ color: theme.border }} />
        </button>
      </div>
    </div>
  );
}

// ── CardBack ─────────────────────────────────────────────────────────────────
function CardBack({ profile, allMetrics, narrative, headline, achievements, bio, theme, serial, onFlip, onContact, onShare, onDownload }) {
  return (
    <div className="w-full h-full flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2 relative z-20">
        <div>
          <p className="text-[10px] font-black tracking-[0.2em]" style={{ color: theme.border }}>SCOUT REPORT</p>
          <p className="text-sm font-black text-white mt-0.5">{profile.user_name}</p>
        </div>
        <span className="text-[11px] font-mono font-bold" style={{ color: `${theme.border}50` }}>{serial}</span>
      </div>

      {/* Metallic divider */}
      <div className="mx-4 mb-3 h-px" style={{
        background: `linear-gradient(90deg, transparent, ${theme.border}80, ${theme.border}, ${theme.border}80, transparent)`
      }} />

      {/* Stat grid */}
      {allMetrics && Object.keys(allMetrics).length > 0 && (
        <div className="mx-4 mb-3 rounded-xl overflow-hidden border relative z-20" style={{
          backgroundColor: "rgba(0,0,0,0.3)",
          borderColor: `${theme.border}20`,
        }}>
          {Object.entries(allMetrics).map(([name, { value, unit }], i) => (
            <div
              key={name}
              className="flex items-center justify-between px-3 py-2"
              style={{
                borderBottom: `1px solid ${theme.border}10`,
                backgroundColor: i % 2 === 0 ? `${theme.accent}06` : "transparent",
              }}
            >
              <span className="text-[10px] text-white/50 font-semibold truncate mr-2">{name}</span>
              <span className="text-xs font-black text-white whitespace-nowrap">
                {value}{unit && <span className="text-[9px] text-white/40 ml-0.5">{unit}</span>}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* AI Narrative */}
      {(narrative || headline) && (
        <div className="mx-4 mb-3 rounded-xl p-3 border relative z-20" style={{
          backgroundColor: "rgba(0,0,0,0.25)",
          borderColor: `${theme.border}15`,
        }}>
          {headline && (
            <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: `${theme.border}80` }}>{headline}</p>
          )}
          <p className="text-[11px] text-white/80 leading-relaxed italic">
            &ldquo;{narrative || `${profile.user_name} is a dedicated ${profile.sport || "athlete"}.`}&rdquo;
          </p>
        </div>
      )}

      {/* Achievements */}
      {achievements?.length > 0 && (
        <div className="mx-4 mb-3 relative z-20">
          <p className="text-[9px] font-black uppercase tracking-widest mb-1.5" style={{ color: `${theme.border}70` }}>Achievements</p>
          <div className="space-y-1">
            {achievements.slice(0, 4).map((a, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <span className="text-[10px] mt-px" style={{ color: theme.border }}>&#9733;</span>
                <span className="text-[10px] text-white/70 font-medium">{a}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Details */}
      <div className="mx-4 mb-3 flex flex-wrap gap-x-3 gap-y-1 relative z-20">
        {profile.level && (
          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize" style={{
            backgroundColor: `${theme.accent}20`, color: theme.border,
          }}>{profile.level}</span>
        )}
        {profile.years_experience && (
          <span className="text-[10px] text-white/40 py-0.5">{profile.years_experience} yrs exp</span>
        )}
        {profile.location && (
          <span className="text-[10px] text-white/40 py-0.5">{profile.location}</span>
        )}
      </div>

      {/* Bio */}
      {bio && (
        <div className="mx-4 mb-3 relative z-20">
          <p className="text-[10px] text-white/50 leading-relaxed line-clamp-3">{bio}</p>
        </div>
      )}

      <div className="flex-1" />

      {/* Metallic divider */}
      <div className="mx-4 mb-2 h-px" style={{
        background: `linear-gradient(90deg, transparent, ${theme.border}60, ${theme.border}90, ${theme.border}60, transparent)`
      }} />

      {/* Actions */}
      <div className="flex gap-2 px-4 pb-2 relative z-20">
        {onContact && (
          <button
            onClick={(e) => { e.stopPropagation(); onContact(); }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ backgroundColor: theme.border, color: "#111" }}
          >
            <Mail className="w-3 h-3" /> Contact
          </button>
        )}
        {onShare && (
          <button
            onClick={(e) => { e.stopPropagation(); onShare(); }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ backgroundColor: `${theme.accent}30`, border: `1px solid ${theme.border}40` }}
          >
            <Share2 className="w-3 h-3" /> Share
          </button>
        )}
        {onDownload && (
          <button
            onClick={(e) => { e.stopPropagation(); onDownload(); }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ backgroundColor: `${theme.accent}30`, border: `1px solid ${theme.border}40` }}
          >
            <Download className="w-3 h-3" /> Save
          </button>
        )}
      </div>

      {/* Bottom */}
      <div className="flex items-center justify-between px-4 pb-3 relative z-20">
        <span className="text-[8px] font-black tracking-[0.2em]" style={{ color: `${theme.border}30` }}>SPORTSPHERE</span>
        <button
          onClick={(e) => { e.stopPropagation(); onFlip(); }}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          style={{
            background: `linear-gradient(135deg, ${theme.border}30, ${theme.accent}20)`,
            border: `1.5px solid ${theme.border}50`,
            boxShadow: `0 0 12px ${theme.glow}`,
          }}
          aria-label="Flip card"
        >
          <RotateCcw className="w-3.5 h-3.5" style={{ color: theme.border }} />
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
  const holo = useHolographicTilt(cardRef);

  if (!profile) return null;

  const theme = SPORT_THEMES[profile.sport] || SPORT_THEMES.default;
  const serial = serialFromId(profile.id);
  const initials = profile.user_name?.[0]?.toUpperCase() || "?";

  // ── Compact mode ───────────────────────────────────────────────────────────
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
        {/* Animated shimmer */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
          <div className="scout-holo-sweep" />
        </div>
        <div className="scout-foil-pattern absolute inset-0 rounded-2xl" />

        <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-10">
          <span className="text-[7px] font-black tracking-[0.2em]" style={{ color: `${theme.border}80` }}>PROPATH</span>
          {statCount > 0 && <CheckCircle className="w-2.5 h-2.5" style={{ color: `${theme.border}80` }} />}
        </div>
        <div className="flex flex-col items-center justify-center h-full gap-1.5 pt-5 pb-3 px-2 relative z-10">
          <Avatar className="w-14 h-14 shadow-lg" style={{ boxShadow: `0 0 15px ${theme.glow}`, border: `2px solid ${theme.border}` }}>
            <AvatarImage src={profile.avatar_url} />
            <AvatarFallback className="bg-white/20 text-white font-bold text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div className="text-center">
            <p className="text-[11px] font-black leading-tight">{profile.user_name}</p>
            <p className="text-[8px] font-medium" style={{ color: `${theme.border}90` }}>{profile.sport}</p>
          </div>
          {topMetrics.slice(0, 2).map((m, i) => (
            <div key={i} className="rounded-lg px-2 py-1 text-center w-full" style={{
              backgroundColor: "rgba(0,0,0,0.35)", border: `1px solid ${theme.border}20`,
            }}>
              <p className="text-sm font-black leading-none">{m.value}{m.unit && m.unit.length <= 3 ? m.unit : ""}</p>
              <p className="text-[7px] font-bold uppercase tracking-wide" style={{ color: `${theme.border}70` }}>{m.name}</p>
            </div>
          ))}
        </div>
        <div className="absolute bottom-1.5 left-0 right-0 text-center z-10">
          <span className="text-[6px] font-black tracking-[0.15em]" style={{ color: `${theme.border}20` }}>SPORTSPHERE</span>
        </div>
      </div>
    );
  }

  // ── Full card ──────────────────────────────────────────────────────────────
  return (
    <div
      ref={cardRef}
      className={`mx-auto ${holo.tiltClass}`}
      style={{
        perspective: 1200,
        maxWidth: 360,
        width: "100%",
        transform: holo.tiltTransform || undefined,
      }}
      {...holo.handlers}
    >
      {/* Flip container — only handles rotateY for flip */}
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Card shell — outer border + inner border for metallic frame */}
        <div
          className={`relative rounded-3xl bg-gradient-to-br ${theme.bg} text-white`}
          style={{
            aspectRatio: "2.5/3.5",
            border: `3px solid ${theme.border}`,
            boxShadow: `
              inset 0 0 40px ${theme.glow},
              inset 0 1px 0 rgba(255,255,255,0.1),
              0 0 30px ${theme.glow},
              0 10px 40px rgba(0,0,0,0.6)
            `,
          }}
        >
          {/* Inner metallic frame */}
          <div
            className="absolute inset-[3px] rounded-[21px] pointer-events-none z-0"
            style={{ border: `1px solid ${theme.border}30` }}
          />

          {/* ── Holographic layers ── */}
          {/* 1. Foil micro-pattern (always visible) */}
          <div className="scout-foil-pattern absolute inset-0 rounded-3xl z-[15]" />

          {/* 2. Rainbow prismatic gradient (mouse-tracked on desktop, sweep on mobile) */}
          {holo.isMobile ? (
            <div className="absolute inset-0 overflow-hidden rounded-3xl z-[15] pointer-events-none">
              <div className="scout-holo-sweep" />
            </div>
          ) : (
            <div
              className="absolute inset-0 rounded-3xl z-[15] pointer-events-none mix-blend-screen"
              style={{ background: holo.shimmerBg }}
            />
          )}

          {/* 3. Specular highlight (desktop only) */}
          {!holo.isMobile && (
            <div
              className="absolute inset-0 rounded-3xl z-[16] pointer-events-none"
              style={{ background: holo.specularBg }}
            />
          )}

          {/* ── FRONT FACE ── */}
          <div
            className="absolute inset-0 rounded-3xl overflow-hidden"
            style={{ backfaceVisibility: "hidden" }}
          >
            <CardFront
              profile={profile}
              topMetrics={topMetrics}
              theme={theme}
              serial={serial}
              statCount={statCount}
              onFlip={() => setIsFlipped(true)}
            />
          </div>

          {/* ── BACK FACE ── */}
          <div
            className="absolute inset-0 rounded-3xl overflow-hidden"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <CardBack
              profile={profile}
              allMetrics={allMetrics}
              narrative={narrative}
              headline={headline}
              achievements={achievements}
              bio={bio}
              theme={theme}
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
