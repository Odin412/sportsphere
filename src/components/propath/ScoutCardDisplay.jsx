import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, RotateCcw, Share2, Mail, Download, Trophy, MapPin, Clock, Star } from "lucide-react";
import { CARD_TEMPLATES } from "./CardTemplates";

/* ═══════════════════════════════════════════════════════════════════════════════
   SPORT THEMES
   ═══════════════════════════════════════════════════════════════════════════════ */
const SPORT_THEMES = {
  Basketball: { bg: "#1a0800", bg2: "#2d1200", accent: "#f97316", border: "#fb923c", glow: "rgba(249,115,22,0.5)" },
  Soccer:     { bg: "#001a14", bg2: "#002d22", accent: "#14b8a6", border: "#2dd4bf", glow: "rgba(20,184,166,0.5)" },
  Football:   { bg: "#1a1000", bg2: "#2d1c00", accent: "#d97706", border: "#fbbf24", glow: "rgba(217,119,6,0.5)" },
  Baseball:   { bg: "#000a1a", bg2: "#00122d", accent: "#3b82f6", border: "#60a5fa", glow: "rgba(59,130,246,0.5)" },
  Tennis:     { bg: "#1a1500", bg2: "#2d2400", accent: "#eab308", border: "#facc15", glow: "rgba(234,179,8,0.5)" },
  Swimming:   { bg: "#001419", bg2: "#00222d", accent: "#06b6d4", border: "#22d3ee", glow: "rgba(6,182,212,0.5)" },
  Track:      { bg: "#0f001a", bg2: "#1a002d", accent: "#a855f7", border: "#c084fc", glow: "rgba(168,85,247,0.5)" },
  Hockey:     { bg: "#0a0e14", bg2: "#141c28", accent: "#64748b", border: "#94a3b8", glow: "rgba(100,116,139,0.5)" },
  MMA:        { bg: "#1a0000", bg2: "#2d0000", accent: "#ef4444", border: "#f87171", glow: "rgba(239,68,68,0.5)" },
  Boxing:     { bg: "#1a0008", bg2: "#2d0010", accent: "#e11d48", border: "#fb7185", glow: "rgba(225,29,72,0.5)" },
  CrossFit:   { bg: "#1a000f", bg2: "#2d001a", accent: "#ec4899", border: "#f472b6", glow: "rgba(236,72,153,0.5)" },
  Golf:       { bg: "#001a0d", bg2: "#002d16", accent: "#10b981", border: "#34d399", glow: "rgba(16,185,129,0.5)" },
  Volleyball: { bg: "#0a001a", bg2: "#12002d", accent: "#6366f1", border: "#818cf8", glow: "rgba(99,102,241,0.5)" },
  Cycling:    { bg: "#001019", bg2: "#001c2d", accent: "#0ea5e9", border: "#38bdf8", glow: "rgba(14,165,233,0.5)" },
  Yoga:       { bg: "#0d001a", bg2: "#18002d", accent: "#8b5cf6", border: "#a78bfa", glow: "rgba(139,92,246,0.5)" },
  Softball:   { bg: "#0d1a00", bg2: "#162d00", accent: "#84cc16", border: "#a3e635", glow: "rgba(132,204,22,0.5)" },
  default:    { bg: "#0f0f0f", bg2: "#1a1a1a", accent: "#ef4444", border: "#f87171", glow: "rgba(239,68,68,0.5)" },
};

function serialFromId(id) {
  if (!id) return "#0001";
  let hash = 0;
  const str = String(id);
  for (let i = 0; i < str.length; i++) hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  return `#${String(Math.abs(hash) % 10000).padStart(4, "0")}`;
}

/* ═══════════════════════════════════════════════════════════════════════════════
   GLOBAL CSS — holographic effects
   ═══════════════════════════════════════════════════════════════════════════════ */
const CSS_ID = "scout-refractor-css";
if (typeof document !== "undefined" && !document.getElementById(CSS_ID)) {
  const s = document.createElement("style");
  s.id = CSS_ID;
  s.textContent = `
    .refractor-foil {
      position: absolute; inset: 0; border-radius: inherit;
      background-image:
        repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(255,255,255,0.03) 1px, rgba(255,255,255,0.03) 2px),
        repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(255,255,255,0.02) 1px, rgba(255,255,255,0.02) 2px);
      pointer-events: none; z-index: 4;
    }
    .refractor-card-outer { transition: transform 0.12s ease-out; will-change: transform; }
    @keyframes borderGlow {
      0%, 100% { opacity: 0.6; }
      50%      { opacity: 1; }
    }
  `;
  document.head.appendChild(s);
}

/* ═══════════════════════════════════════════════════════════════════════════════
   MOUSE-TRACKED REFRACTOR HOOK — rainbow + specular follow cursor
   ═══════════════════════════════════════════════════════════════════════════════ */
function useRefractorEffect(cardRef) {
  const [pos, setPos] = useState({ x: 50, y: 50, active: false });
  const raf = useRef(null);
  const isMobile = typeof window !== "undefined" && window.matchMedia("(hover: none)").matches;

  const onMove = useCallback((e) => {
    if (!cardRef.current) return;
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)), active: true });
    });
  }, [cardRef]);

  const onLeave = useCallback(() => {
    setPos({ x: 50, y: 50, active: false });
    if (raf.current) cancelAnimationFrame(raf.current);
  }, []);

  useEffect(() => () => { if (raf.current) cancelAnimationFrame(raf.current); }, []);

  // Compute rainbow angle from cursor position
  const angle = Math.atan2(pos.x - 50, pos.y - 50) * (180 / Math.PI) + 180;

  // Rainbow gradient — rotates based on mouse angle, centered on cursor
  const rainbowStyle = {
    position: "absolute", inset: 0, borderRadius: "inherit",
    background: pos.active
      ? `linear-gradient(${angle}deg,
          transparent 10%,
          rgba(255,0,0,0.18) 20%,
          rgba(255,154,0,0.22) 28%,
          rgba(255,255,0,0.18) 36%,
          rgba(0,255,0,0.22) 44%,
          rgba(0,200,255,0.25) 52%,
          rgba(100,0,255,0.22) 60%,
          rgba(255,0,200,0.18) 68%,
          transparent 78%
        )`
      : "none",
    opacity: pos.active ? 1 : 0,
    transition: pos.active ? "opacity 0.15s ease" : "opacity 0.6s ease",
    mixBlendMode: "screen",
    pointerEvents: "none",
    zIndex: 5,
  };

  // Specular highlight — bright spot that follows cursor
  const specularStyle = {
    position: "absolute", inset: 0, borderRadius: "inherit",
    background: pos.active
      ? `radial-gradient(ellipse at ${pos.x}% ${pos.y}%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.12) 25%, transparent 55%)`
      : "none",
    opacity: pos.active ? 1 : 0,
    transition: pos.active ? "opacity 0.15s ease" : "opacity 0.6s ease",
    pointerEvents: "none",
    zIndex: 6,
  };

  // 3D tilt — ±15° range, follows mouse position
  const tiltStyle = pos.active
    ? { transform: `perspective(800px) rotateX(${-(pos.y - 50) * 0.3}deg) rotateY(${(pos.x - 50) * 0.3}deg) scale(1.03)` }
    : { transform: "perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)", transition: "transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)" };

  const handlers = isMobile ? {} : { onMouseMove: onMove, onMouseLeave: onLeave };

  return { rainbowStyle, specularStyle, tiltStyle, handlers, isMobile };
}

/* ═══════════════════════════════════════════════════════════════════════════════
   CARD FRONT — Full-bleed photo, name at bottom. Like a real Topps card.
   ═══════════════════════════════════════════════════════════════════════════════ */
function CardFront({ profile, theme, serial, customization, onFlip }) {
  const initials = (profile.user_name || "?").charAt(0).toUpperCase();

  return (
    <div className="absolute inset-0 flex flex-col">
      {/* Full-bleed athlete photo */}
      {profile.avatar_url ? (
        <img src={profile.avatar_url} alt={profile.user_name}
          className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center"
          style={{ background: `linear-gradient(160deg, ${theme.bg2}, ${theme.bg})` }}>
          <span className="text-[120px] font-black" style={{ color: `${theme.accent}20` }}>{initials}</span>
        </div>
      )}

      {/* Top overlay — PROPATH logo + sport pill + team logo */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black tracking-[0.3em] uppercase drop-shadow-lg"
            style={{ color: theme.border }}>
            PROPATH
          </span>
          {customization?.team_logo_url && (
            <img src={customization.team_logo_url} alt="team" className="w-7 h-7 rounded-full object-cover border border-white/30 drop-shadow-lg" />
          )}
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md drop-shadow-lg"
          style={{ backgroundColor: `${theme.accent}cc`, color: "#000" }}>
          {profile.sport || "Athlete"}
        </span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom name bar — heavy gradient fade */}
      <div className="relative z-10"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0.4) 70%, transparent 100%)" }}>
        <div className="px-4 pt-10 pb-3">
          <div className="flex items-end justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-black text-white leading-tight truncate"
                style={{ textShadow: `0 0 20px ${theme.glow}, 0 2px 8px rgba(0,0,0,1)` }}>
                {profile.user_name || "Unknown Athlete"}
              </h2>
              {customization?.team_name && (
                <p className="text-[11px] font-bold" style={{ color: theme.accent }}>{customization.team_name}</p>
              )}
              <p className="text-[11px] text-white/60 font-semibold mt-0.5 truncate">
                {[profile.position, profile.sport].filter(Boolean).join(" \u00B7 ")}
              </p>
            </div>
            <span className="text-[11px] font-mono font-bold ml-2 flex-shrink-0"
              style={{ color: `${theme.border}70` }}>{serial}</span>
          </div>
          {/* Signature */}
          {customization?.signature_url && (
            <img src={customization.signature_url} alt="signature" className="h-8 mt-1 opacity-50" />
          )}
          {/* Flip icon */}
          <div className="flex justify-end mt-2">
            <button onClick={(e) => { e.stopPropagation(); onFlip(); }}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-90"
              style={{ backgroundColor: `${theme.accent}40`, border: `1.5px solid ${theme.border}60` }}>
              <RotateCcw className="w-3.5 h-3.5" style={{ color: theme.border }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   CARD BACK — Avatar header, stats table, narrative, achievements, actions
   ═══════════════════════════════════════════════════════════════════════════════ */
function CardBack({ profile, allMetrics, topMetrics, narrative, headline, achievements, bio, theme, serial, statCount, onFlip, onContact, onShare, onDownload }) {
  return (
    <div className="absolute inset-0 flex flex-col overflow-y-auto"
      style={{ background: `linear-gradient(180deg, ${theme.bg2}, ${theme.bg})` }}>

      {/* ── Player header with avatar ── */}
      <div className="flex items-start gap-3 px-4 pt-4 pb-2">
        <Avatar className="w-12 h-12 flex-shrink-0"
          style={{ border: `2px solid ${theme.border}`, boxShadow: `0 0 10px ${theme.glow}` }}>
          <AvatarImage src={profile.avatar_url} />
          <AvatarFallback style={{ backgroundColor: `${theme.accent}20`, color: "white" }} className="font-bold">
            {(profile.user_name || "?").charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <h3 className="text-base font-black text-white leading-tight truncate">{profile.user_name}</h3>
              <p className="text-[11px] font-semibold mt-0.5" style={{ color: theme.border }}>
                {[profile.position, profile.sport].filter(Boolean).join(" \u00B7 ")}
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold flex-shrink-0 ml-2" style={{ color: `${theme.border}50` }}>{serial}</span>
          </div>
          {/* Personal details */}
          <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1">
            {profile.level && (
              <span className="text-[9px] font-bold capitalize" style={{ color: `${theme.border}90` }}>{profile.level}</span>
            )}
            {profile.years_experience && (
              <span className="text-[9px] text-white/40">{profile.years_experience} yrs exp</span>
            )}
            {profile.location && (
              <span className="text-[9px] text-white/40">{profile.location}</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Metallic divider ── */}
      <div className="mx-4 my-1 h-[1.5px]"
        style={{ background: `linear-gradient(90deg, transparent, ${theme.border}, transparent)` }} />

      {/* ── Stats Table ── */}
      {allMetrics && Object.keys(allMetrics).length > 0 && (
        <div className="mx-4 mt-2 mb-2">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-1.5" style={{ color: theme.accent }}>
            Career Stats
          </p>
          <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${theme.border}30` }}>
            {/* Table header */}
            <div className="flex px-3 py-1.5" style={{ backgroundColor: `${theme.accent}20` }}>
              <span className="flex-1 text-[9px] font-black uppercase tracking-wider" style={{ color: theme.border }}>Metric</span>
              <span className="text-[9px] font-black uppercase tracking-wider text-right" style={{ color: theme.border }}>Best</span>
            </div>
            {/* Table rows */}
            {Object.entries(allMetrics).map(([name, { value, unit }], i) => (
              <div key={name} className="flex items-center px-3 py-1.5"
                style={{
                  backgroundColor: i % 2 === 0 ? "rgba(255,255,255,0.03)" : "transparent",
                  borderTop: `1px solid ${theme.border}12`,
                }}>
                <span className="flex-1 text-[10px] text-white/60 font-medium truncate mr-2">{name}</span>
                <span className="text-[11px] font-black text-white whitespace-nowrap">
                  {value}{unit && <span className="text-[9px] text-white/40 ml-0.5">{unit}</span>}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Metallic divider ── */}
      {(narrative || headline) && (
        <div className="mx-4 my-1 h-[1.5px]"
          style={{ background: `linear-gradient(90deg, transparent, ${theme.border}60, transparent)` }} />
      )}

      {/* ── AI Scout Narrative ── */}
      {(narrative || headline) && (
        <div className="mx-4 mt-1 mb-2">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-1" style={{ color: theme.accent }}>
            Scout Report
          </p>
          {headline && (
            <p className="text-[10px] font-bold text-white/90 mb-0.5">{headline}</p>
          )}
          <p className="text-[10px] text-white/60 leading-relaxed italic">
            "{narrative || `${profile.user_name} is a dedicated ${profile.sport || "athlete"}.`}"
          </p>
        </div>
      )}

      {/* ── Achievements ── */}
      {achievements?.length > 0 && (
        <div className="mx-4 mb-2">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-1" style={{ color: theme.accent }}>
            Achievements
          </p>
          <div className="space-y-0.5">
            {achievements.slice(0, 4).map((a, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <Star className="w-3 h-3 mt-px flex-shrink-0" style={{ color: theme.accent }} />
                <span className="text-[10px] text-white/60 font-medium">{a}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Bio ── */}
      {bio && (
        <div className="mx-4 mb-2">
          <p className="text-[10px] text-white/35 leading-relaxed line-clamp-2">{bio}</p>
        </div>
      )}

      <div className="flex-1 min-h-[4px]" />

      {/* ── Divider ── */}
      <div className="mx-4 mb-1.5 h-[1.5px]"
        style={{ background: `linear-gradient(90deg, transparent, ${theme.border}60, transparent)` }} />

      {/* ── Action buttons ── */}
      <div className="flex gap-1.5 px-3 pb-1.5">
        {onContact && (
          <button onClick={(e) => { e.stopPropagation(); onContact(); }}
            className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[10px] font-black transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ backgroundColor: theme.accent, color: "#000" }}>
            <Mail className="w-3 h-3" /> Contact
          </button>
        )}
        {onShare && (
          <button onClick={(e) => { e.stopPropagation(); onShare(); }}
            className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[10px] font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ backgroundColor: "rgba(255,255,255,0.08)", border: `1px solid ${theme.border}30` }}>
            <Share2 className="w-3 h-3" /> Share
          </button>
        )}
        {onDownload && (
          <button onClick={(e) => { e.stopPropagation(); onDownload(); }}
            className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[10px] font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ backgroundColor: "rgba(255,255,255,0.08)", border: `1px solid ${theme.border}30` }}>
            <Download className="w-3 h-3" /> Save
          </button>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between px-4 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-[7px] font-black tracking-[0.3em] uppercase" style={{ color: `${theme.border}25` }}>
            SPORTSPHERE
          </span>
          {statCount > 0 && (
            <span className="flex items-center gap-0.5 text-[8px] font-bold" style={{ color: `${theme.border}60` }}>
              <CheckCircle className="w-2.5 h-2.5" /> Verified
            </span>
          )}
        </div>
        <button onClick={(e) => { e.stopPropagation(); onFlip(); }}
          className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-90"
          style={{ backgroundColor: `${theme.accent}40`, border: `1.5px solid ${theme.border}60` }}>
          <RotateCcw className="w-3 h-3" style={{ color: theme.border }} />
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════════ */
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
  customization = null,
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef(null);
  const refractor = useRefractorEffect(cardRef);

  if (!profile) return null;

  // Build theme — start with sport default, override with customization colors
  const baseTheme = SPORT_THEMES[profile.sport] || SPORT_THEMES.default;
  const theme = customization ? {
    ...baseTheme,
    ...(customization.primary_color ? { bg: customization.primary_color, bg2: customization.primary_color } : {}),
    ...(customization.secondary_color ? { accent: customization.secondary_color } : {}),
    ...(customization.border_color ? {
      border: customization.border_color,
      glow: `${customization.border_color}80`,
    } : {}),
  } : baseTheme;

  const serial = serialFromId(profile.id);
  const initials = (profile.user_name || "?").charAt(0).toUpperCase();
  const templateId = customization?.template || "classic";
  const tmpl = CARD_TEMPLATES[templateId];

  // ── Shared card shell styles ──
  const cardShellStyle = {
    aspectRatio: "2.5/3.5",
    border: `3px solid ${theme.border}`,
    boxShadow: `inset 0 0 60px ${theme.glow}, 0 0 40px ${theme.glow}, 0 20px 60px rgba(0,0,0,0.7)`,
  };

  /* ── Compact mode (ProPathHub preview) ─────────────────────────────────── */
  if (compact) {
    return (
      <div className="relative rounded-2xl overflow-hidden text-white"
        style={{
          aspectRatio: "2/3",
          maxWidth: 160,
          background: `linear-gradient(160deg, ${theme.bg2}, ${theme.bg})`,
          border: `2px solid ${theme.border}`,
          boxShadow: `0 0 20px ${theme.glow}, 0 8px 30px rgba(0,0,0,0.5)`,
        }}>
        <div className="refractor-rainbow" />
        <div className="refractor-foil" />
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-10">
          <span className="text-[7px] font-black tracking-[0.2em]" style={{ color: theme.accent }}>PROPATH</span>
          {statCount > 0 && <CheckCircle className="w-2.5 h-2.5" style={{ color: theme.accent }} />}
        </div>
        <div className="flex flex-col items-center justify-center h-full gap-1.5 pt-5 pb-3 px-2 relative z-10">
          <Avatar className="w-14 h-14 shadow-lg"
            style={{ border: `2px solid ${theme.border}`, boxShadow: `0 0 15px ${theme.glow}` }}>
            <AvatarImage src={profile.avatar_url} />
            <AvatarFallback style={{ backgroundColor: `${theme.accent}20`, color: "white" }} className="font-bold text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div className="text-center">
            <p className="text-[11px] font-black leading-tight">{profile.user_name}</p>
            <p className="text-[8px] font-bold" style={{ color: theme.accent }}>{profile.sport}</p>
          </div>
          {topMetrics.slice(0, 2).map((m, i) => (
            <div key={i} className="rounded-lg px-2 py-1 text-center w-full"
              style={{ backgroundColor: "rgba(255,255,255,0.06)", border: `1px solid ${theme.border}20` }}>
              <p className="text-sm font-black leading-none">{m.value}{m.unit && m.unit.length <= 3 ? m.unit : ""}</p>
              <p className="text-[7px] font-bold uppercase tracking-wide" style={{ color: theme.accent }}>{m.name}</p>
            </div>
          ))}
        </div>
        <div className="absolute bottom-1.5 left-0 right-0 text-center z-10">
          <span className="text-[6px] font-black tracking-[0.15em]" style={{ color: `${theme.border}15` }}>SPORTSPHERE</span>
        </div>
      </div>
    );
  }

  /* ── Full-size trading card ──────────────────────────────────────────────── */
  return (
    <div style={{ perspective: 1000 }} className="mx-auto" ref={cardRef} {...refractor.handlers}>
      <div className="refractor-card-outer" style={{ maxWidth: 380, margin: "0 auto", ...refractor.tiltStyle }}>
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
          style={{ transformStyle: "preserve-3d", position: "relative" }}
        >
          {/* ═══ FRONT FACE ═══ */}
          <div
            className="relative rounded-2xl"
            style={{
              ...cardShellStyle,
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              opacity: isFlipped ? 0 : 1,
              transition: "opacity 0.15s ease",
              overflow: "hidden",
            }}
            data-card-capture
          >
            {/* Mouse-tracked holographic layers */}
            <div style={refractor.rainbowStyle} />
            <div style={refractor.specularStyle} />
            <div className="refractor-foil" />
            {/* Inner metallic border */}
            <div className="absolute inset-[4px] rounded-xl pointer-events-none z-[3]"
              style={{ border: `1px solid ${theme.border}35`, animation: "borderGlow 3s ease-in-out infinite" }} />
            {/* Front content — delegate to template if not classic */}
            {tmpl?.Front ? (
              <tmpl.Front profile={profile} theme={theme} serial={serial} customization={customization} onFlip={() => setIsFlipped(true)} />
            ) : (
              <CardFront profile={profile} theme={theme} serial={serial} customization={customization} onFlip={() => setIsFlipped(true)} />
            )}
          </div>

          {/* ═══ BACK FACE ═══ */}
          <div
            className="absolute inset-0 rounded-2xl"
            style={{
              ...cardShellStyle,
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              opacity: isFlipped ? 1 : 0,
              transition: "opacity 0.15s ease",
              overflow: "hidden",
              pointerEvents: isFlipped ? "auto" : "none",
            }}
          >
            {/* Mouse-tracked holographic layers */}
            <div style={refractor.rainbowStyle} />
            <div style={refractor.specularStyle} />
            <div className="refractor-foil" />
            {/* Inner metallic border */}
            <div className="absolute inset-[4px] rounded-xl pointer-events-none z-[3]"
              style={{ border: `1px solid ${theme.border}35`, animation: "borderGlow 3s ease-in-out infinite" }} />
            {/* Back content */}
            {tmpl?.Back ? (
              <tmpl.Back profile={profile} allMetrics={allMetrics} topMetrics={topMetrics} narrative={narrative} headline={headline} achievements={achievements} bio={bio} theme={theme} serial={serial} statCount={statCount} onFlip={() => setIsFlipped(false)} onContact={onContact} onShare={onShare} onDownload={onDownload} />
            ) : (
              <CardBack profile={profile} allMetrics={allMetrics} topMetrics={topMetrics} narrative={narrative} headline={headline} achievements={achievements} bio={bio} theme={theme} serial={serial} statCount={statCount} onFlip={() => setIsFlipped(false)} onContact={onContact} onShare={onShare} onDownload={onDownload} />
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
