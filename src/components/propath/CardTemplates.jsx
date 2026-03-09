/**
 * Card Template Renderers — 4 visual styles for the Scout Card.
 *
 * Each template exports renderFront(props) and renderBack(props).
 * Props shape: { profile, topMetrics, allMetrics, theme, serial, statCount,
 *   narrative, headline, achievements, bio, onFlip, onContact, onShare, onDownload,
 *   customization }
 *
 * The "classic" template is the default (rendered inline in ScoutCardDisplay).
 * These are the alternative templates.
 */
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, RotateCcw, Share2, Mail, Download, Star } from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
// CHROME TEMPLATE — metallic silver/platinum, heavy specular, embossed text
// ═══════════════════════════════════════════════════════════════════════════════
export const ChromeFront = ({ profile, theme, serial, customization, onFlip }) => {
  const initials = (profile.user_name || "?").charAt(0).toUpperCase();
  return (
    <div className="absolute inset-0 flex flex-col">
      {profile.avatar_url ? (
        <img src={profile.avatar_url} alt={profile.user_name} className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center" style={{ background: `linear-gradient(160deg, ${theme.bg2}, ${theme.bg})` }}>
          <span className="text-[120px] font-black" style={{ color: `${theme.accent}20` }}>{initials}</span>
        </div>
      )}
      {/* Chrome overlay — silver metallic gradient at top and bottom */}
      <div className="absolute inset-x-0 top-0 h-14 z-10"
        style={{ background: "linear-gradient(180deg, rgba(200,200,210,0.9) 0%, rgba(180,180,190,0.7) 40%, transparent 100%)" }} />
      <div className="relative z-20 flex items-center justify-between px-4 pt-2.5">
        <span className="text-[11px] font-black tracking-[0.25em] uppercase"
          style={{ color: "#333", textShadow: "0 1px 0 rgba(255,255,255,0.6)" }}>PROPATH</span>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md" style={{ backgroundColor: theme.accent, color: "#000" }}>
          {profile.sport || "Athlete"}
        </span>
      </div>
      {/* Team logo */}
      {customization?.team_logo_url && (
        <div className="absolute top-12 right-3 z-20">
          <img src={customization.team_logo_url} alt="team" className="w-8 h-8 rounded-full object-cover border-2 border-white/30" />
        </div>
      )}
      <div className="flex-1" />
      {/* Chrome bottom bar */}
      <div className="relative z-10"
        style={{ background: "linear-gradient(to top, rgba(200,200,210,0.95) 0%, rgba(180,180,190,0.8) 50%, transparent 100%)" }}>
        <div className="px-4 pt-12 pb-3">
          <div className="flex items-end justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-black leading-tight truncate"
                style={{ color: "#1a1a1a", textShadow: "0 1px 2px rgba(255,255,255,0.5), 0 -1px 1px rgba(0,0,0,0.2)" }}>
                {profile.user_name || "Unknown Athlete"}
              </h2>
              {customization?.team_name && (
                <p className="text-[11px] font-bold" style={{ color: theme.accent }}>{customization.team_name}</p>
              )}
              <p className="text-[11px] text-gray-600 font-semibold mt-0.5 truncate">
                {[profile.position, profile.sport].filter(Boolean).join(" · ")}
              </p>
            </div>
            <span className="text-[11px] font-mono font-bold text-gray-400 ml-2">{serial}</span>
          </div>
          {/* Signature */}
          {customization?.signature_url && (
            <img src={customization.signature_url} alt="signature" className="h-8 mt-1 opacity-60" />
          )}
          <div className="flex justify-end mt-2">
            <button onClick={(e) => { e.stopPropagation(); onFlip(); }}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-white/40 border border-gray-300 hover:scale-110 active:scale-90 transition-all">
              <RotateCcw className="w-3.5 h-3.5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ChromeBack = ({ profile, allMetrics, narrative, headline, achievements, bio, theme, serial, statCount, onFlip, onContact, onShare, onDownload }) => (
  <div className="absolute inset-0 flex flex-col overflow-y-auto"
    style={{ background: "linear-gradient(180deg, #d4d4d8, #a1a1aa 30%, #71717a 70%, #52525b)" }}>
    <div className="flex items-start gap-3 px-4 pt-4 pb-2">
      <Avatar className="w-12 h-12 flex-shrink-0 border-2 border-white/50">
        <AvatarImage src={profile.avatar_url} />
        <AvatarFallback className="bg-gray-300 text-gray-700 font-bold">{(profile.user_name || "?")[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-black text-gray-900 leading-tight truncate">{profile.user_name}</h3>
        <p className="text-[11px] font-semibold text-gray-700">{[profile.position, profile.sport].filter(Boolean).join(" · ")}</p>
      </div>
      <span className="text-[10px] font-mono font-bold text-gray-500">{serial}</span>
    </div>
    <div className="mx-4 my-1 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, #fff, transparent)" }} />
    {allMetrics && Object.keys(allMetrics).length > 0 && (
      <div className="mx-4 mt-2 mb-2">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-1.5 text-gray-800">Career Stats</p>
        <div className="rounded-lg overflow-hidden border border-white/30">
          <div className="flex px-3 py-1.5 bg-white/20">
            <span className="flex-1 text-[9px] font-black uppercase tracking-wider text-gray-800">Metric</span>
            <span className="text-[9px] font-black uppercase tracking-wider text-gray-800 text-right">Best</span>
          </div>
          {Object.entries(allMetrics).map(([name, { value, unit }], i) => (
            <div key={name} className="flex items-center px-3 py-1.5" style={{
              backgroundColor: i % 2 === 0 ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)",
              borderTop: "1px solid rgba(255,255,255,0.1)",
            }}>
              <span className="flex-1 text-[10px] text-gray-800 font-medium truncate mr-2">{name}</span>
              <span className="text-[11px] font-black text-gray-900">{value}{unit && <span className="text-[9px] text-gray-600 ml-0.5">{unit}</span>}</span>
            </div>
          ))}
        </div>
      </div>
    )}
    {(narrative || headline) && (
      <div className="mx-4 mb-2 rounded-xl p-3 bg-white/10 border border-white/20">
        {headline && <p className="text-[10px] font-black uppercase tracking-wider mb-1 text-gray-800">{headline}</p>}
        <p className="text-[10px] text-gray-800 leading-relaxed italic">"{narrative}"</p>
      </div>
    )}
    {achievements?.length > 0 && (
      <div className="mx-4 mb-2">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-1 text-gray-800">Achievements</p>
        {achievements.slice(0, 4).map((a, i) => (
          <div key={i} className="flex items-start gap-1.5">
            <Star className="w-3 h-3 mt-px flex-shrink-0 text-gray-700" />
            <span className="text-[10px] text-gray-800 font-medium">{a}</span>
          </div>
        ))}
      </div>
    )}
    <div className="flex-1 min-h-[4px]" />
    <div className="flex gap-1.5 px-3 pb-1.5">
      {onContact && (
        <button onClick={(e) => { e.stopPropagation(); onContact(); }}
          className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[10px] font-black bg-white/30 text-gray-900 hover:scale-[1.02] active:scale-[0.98] transition-all">
          <Mail className="w-3 h-3" /> Contact
        </button>
      )}
      {onShare && (
        <button onClick={(e) => { e.stopPropagation(); onShare(); }}
          className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[10px] font-bold text-gray-900 bg-white/20 border border-white/30 hover:scale-[1.02] active:scale-[0.98] transition-all">
          <Share2 className="w-3 h-3" /> Share
        </button>
      )}
      {onDownload && (
        <button onClick={(e) => { e.stopPropagation(); onDownload(); }}
          className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[10px] font-bold text-gray-900 bg-white/20 border border-white/30 hover:scale-[1.02] active:scale-[0.98] transition-all">
          <Download className="w-3 h-3" /> Save
        </button>
      )}
    </div>
    <div className="flex items-center justify-between px-4 pb-2.5">
      <div className="flex items-center gap-2">
        <span className="text-[7px] font-black tracking-[0.3em] uppercase text-gray-600">SPORTSPHERE</span>
        {statCount > 0 && <span className="flex items-center gap-0.5 text-[8px] font-bold text-gray-700"><CheckCircle className="w-2.5 h-2.5" /> Verified</span>}
      </div>
      <button onClick={(e) => { e.stopPropagation(); onFlip(); }}
        className="w-7 h-7 rounded-full flex items-center justify-center bg-white/30 border border-white/30 hover:scale-110 active:scale-90 transition-all">
        <RotateCcw className="w-3 h-3 text-gray-700" />
      </button>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// PRIZM TEMPLATE — angular geometric cuts, prismatic bands, bold diagonals
// ═══════════════════════════════════════════════════════════════════════════════
export const PrizmFront = ({ profile, theme, serial, customization, onFlip }) => {
  const initials = (profile.user_name || "?").charAt(0).toUpperCase();
  return (
    <div className="absolute inset-0 flex flex-col">
      {profile.avatar_url ? (
        <img src={profile.avatar_url} alt={profile.user_name} className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center" style={{ background: `linear-gradient(160deg, ${theme.bg2}, ${theme.bg})` }}>
          <span className="text-[120px] font-black" style={{ color: `${theme.accent}20` }}>{initials}</span>
        </div>
      )}
      {/* Geometric angular overlay — top-left triangle */}
      <div className="absolute inset-0 z-10 pointer-events-none"
        style={{ background: `linear-gradient(135deg, ${theme.accent}cc 0%, ${theme.accent}60 15%, transparent 30%)` }} />
      {/* Bottom-right angular bar */}
      <div className="absolute inset-0 z-10 pointer-events-none"
        style={{ background: `linear-gradient(315deg, ${theme.bg}ee 0%, ${theme.bg}80 12%, transparent 25%)` }} />

      <div className="relative z-20 px-4 pt-3">
        <span className="text-[11px] font-black tracking-[0.3em] uppercase" style={{ color: "#fff" }}>PROPATH</span>
        {customization?.team_logo_url && (
          <img src={customization.team_logo_url} alt="team" className="w-7 h-7 rounded-full object-cover border border-white/30 inline-block ml-2 align-middle" />
        )}
      </div>
      <div className="flex-1" />
      {/* Angular diagonal name bar */}
      <div className="relative z-20" style={{ clipPath: "polygon(0 25%, 100% 0%, 100% 100%, 0 100%)" }}>
        <div className="pt-10 pb-3 px-4" style={{ backgroundColor: `${theme.bg}ee` }}>
          <h2 className="text-2xl font-black text-white leading-tight truncate uppercase tracking-wide"
            style={{ textShadow: `0 0 15px ${theme.glow}` }}>
            {profile.user_name || "Unknown Athlete"}
          </h2>
          {customization?.team_name && (
            <p className="text-[11px] font-bold" style={{ color: theme.accent }}>{customization.team_name}</p>
          )}
          <div className="flex items-center justify-between mt-1">
            <p className="text-[11px] text-white/60 font-semibold truncate">
              {[profile.position, profile.sport].filter(Boolean).join(" · ")}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold" style={{ color: `${theme.border}70` }}>{serial}</span>
              <button onClick={(e) => { e.stopPropagation(); onFlip(); }}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-90"
                style={{ backgroundColor: `${theme.accent}60`, border: `1.5px solid ${theme.border}` }}>
                <RotateCcw className="w-3.5 h-3.5" style={{ color: theme.border }} />
              </button>
            </div>
          </div>
          {customization?.signature_url && (
            <img src={customization.signature_url} alt="signature" className="h-7 mt-1 opacity-50" />
          )}
        </div>
      </div>
    </div>
  );
};

export const PrizmBack = ({ profile, allMetrics, narrative, headline, achievements, bio, theme, serial, statCount, onFlip, onContact, onShare, onDownload }) => (
  <div className="absolute inset-0 flex flex-col overflow-y-auto"
    style={{ background: `linear-gradient(180deg, ${theme.bg2}, ${theme.bg})` }}>
    {/* Angular header */}
    <div className="relative" style={{ clipPath: "polygon(0 0, 100% 0, 100% 80%, 0 100%)" }}>
      <div className="px-4 pt-4 pb-6" style={{ backgroundColor: `${theme.accent}20` }}>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black tracking-[0.25em] uppercase" style={{ color: theme.accent }}>Scout Report</span>
            <h3 className="text-base font-black text-white leading-tight mt-0.5">{profile.user_name}</h3>
            <p className="text-[11px] font-semibold" style={{ color: theme.border }}>{[profile.position, profile.sport].filter(Boolean).join(" · ")}</p>
          </div>
          <span className="text-[10px] font-mono font-bold" style={{ color: `${theme.border}50` }}>{serial}</span>
        </div>
      </div>
    </div>
    {allMetrics && Object.keys(allMetrics).length > 0 && (
      <div className="mx-4 mb-2 -mt-2">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-1.5" style={{ color: theme.accent }}>Career Stats</p>
        <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${theme.border}30` }}>
          <div className="flex px-3 py-1.5" style={{ backgroundColor: `${theme.accent}20` }}>
            <span className="flex-1 text-[9px] font-black uppercase tracking-wider" style={{ color: theme.border }}>Metric</span>
            <span className="text-[9px] font-black uppercase tracking-wider text-right" style={{ color: theme.border }}>Best</span>
          </div>
          {Object.entries(allMetrics).map(([name, { value, unit }], i) => (
            <div key={name} className="flex items-center px-3 py-1.5" style={{
              backgroundColor: i % 2 === 0 ? "rgba(255,255,255,0.03)" : "transparent",
              borderTop: `1px solid ${theme.border}12`,
            }}>
              <span className="flex-1 text-[10px] text-white/60 font-medium truncate mr-2">{name}</span>
              <span className="text-[11px] font-black text-white">{value}{unit && <span className="text-[9px] text-white/40 ml-0.5">{unit}</span>}</span>
            </div>
          ))}
        </div>
      </div>
    )}
    {(narrative || headline) && (
      <div className="mx-4 mb-2 rounded-xl p-3" style={{ backgroundColor: `${theme.accent}10`, border: `1px solid ${theme.accent}25` }}>
        {headline && <p className="text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: theme.accent }}>{headline}</p>}
        <p className="text-[10px] text-white/70 leading-relaxed italic">"{narrative}"</p>
      </div>
    )}
    {achievements?.length > 0 && (
      <div className="mx-4 mb-2">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-1" style={{ color: theme.accent }}>Achievements</p>
        {achievements.slice(0, 4).map((a, i) => (
          <div key={i} className="flex items-start gap-1.5"><Star className="w-3 h-3 mt-px flex-shrink-0" style={{ color: theme.accent }} /><span className="text-[10px] text-white/60 font-medium">{a}</span></div>
        ))}
      </div>
    )}
    <div className="flex-1 min-h-[4px]" />
    <div className="flex gap-1.5 px-3 pb-1.5">
      {onContact && <button onClick={(e) => { e.stopPropagation(); onContact(); }} className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[10px] font-black transition-all hover:scale-[1.02] active:scale-[0.98]" style={{ backgroundColor: theme.accent, color: "#000" }}><Mail className="w-3 h-3" /> Contact</button>}
      {onShare && <button onClick={(e) => { e.stopPropagation(); onShare(); }} className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[10px] font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98]" style={{ backgroundColor: "rgba(255,255,255,0.08)", border: `1px solid ${theme.border}30` }}><Share2 className="w-3 h-3" /> Share</button>}
      {onDownload && <button onClick={(e) => { e.stopPropagation(); onDownload(); }} className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[10px] font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98]" style={{ backgroundColor: "rgba(255,255,255,0.08)", border: `1px solid ${theme.border}30` }}><Download className="w-3 h-3" /> Save</button>}
    </div>
    <div className="flex items-center justify-between px-4 pb-2.5">
      <div className="flex items-center gap-2">
        <span className="text-[7px] font-black tracking-[0.3em] uppercase" style={{ color: `${theme.border}25` }}>SPORTSPHERE</span>
        {statCount > 0 && <span className="flex items-center gap-0.5 text-[8px] font-bold" style={{ color: `${theme.border}60` }}><CheckCircle className="w-2.5 h-2.5" /> Verified</span>}
      </div>
      <button onClick={(e) => { e.stopPropagation(); onFlip(); }} className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-90" style={{ backgroundColor: `${theme.accent}40`, border: `1.5px solid ${theme.border}60` }}><RotateCcw className="w-3 h-3" style={{ color: theme.border }} /></button>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// RETRO TEMPLATE — vintage card, inset photo, solid color bar, textured feel
// ═══════════════════════════════════════════════════════════════════════════════
export const RetroFront = ({ profile, theme, serial, customization, onFlip }) => {
  const initials = (profile.user_name || "?").charAt(0).toUpperCase();
  return (
    <div className="absolute inset-0 flex flex-col" style={{ backgroundColor: "#f5f0e1" }}>
      {/* Vintage paper texture overlay */}
      <div className="absolute inset-0 opacity-[0.15] pointer-events-none" style={{
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='6' height='6' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")",
      }} />
      {/* Top color bar */}
      <div className="px-4 py-2.5 flex items-center justify-between" style={{ backgroundColor: theme.accent }}>
        <span className="text-[10px] font-black tracking-[0.2em] uppercase text-white/90">PROPATH</span>
        <span className="text-[10px] font-bold text-white/80">{profile.sport || "Athlete"}</span>
      </div>
      {/* Inset photo with colored border */}
      <div className="mx-5 mt-3 rounded-lg overflow-hidden flex-1 min-h-0" style={{ border: `4px solid ${theme.accent}`, boxShadow: "inset 0 2px 8px rgba(0,0,0,0.2)" }}>
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt={profile.user_name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: "#e8e0d0" }}>
            <span className="text-7xl font-black" style={{ color: `${theme.accent}30` }}>{initials}</span>
          </div>
        )}
        {customization?.team_logo_url && (
          <div className="absolute top-2 right-2">
            <img src={customization.team_logo_url} alt="team" className="w-8 h-8 rounded-full object-cover border-2" style={{ borderColor: theme.accent }} />
          </div>
        )}
      </div>
      {/* Name bar below photo */}
      <div className="mx-5 mt-2 px-3 py-2 rounded-lg" style={{ backgroundColor: theme.accent }}>
        <h2 className="text-xl font-black text-white leading-tight truncate text-center">
          {profile.user_name || "Unknown Athlete"}
        </h2>
        {customization?.team_name && (
          <p className="text-[10px] font-bold text-white/80 text-center">{customization.team_name}</p>
        )}
        <p className="text-[10px] text-white/70 font-semibold text-center">
          {[profile.position, profile.sport].filter(Boolean).join(" · ")}
        </p>
      </div>
      {customization?.signature_url && (
        <div className="mx-5 mt-1 flex justify-center">
          <img src={customization.signature_url} alt="signature" className="h-6 opacity-40" style={{ filter: "sepia(1) brightness(0.3)" }} />
        </div>
      )}
      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-2">
        <span className="text-[9px] font-mono font-bold" style={{ color: "#999" }}>{serial}</span>
        <button onClick={(e) => { e.stopPropagation(); onFlip(); }}
          className="w-7 h-7 rounded-full flex items-center justify-center border transition-all hover:scale-110 active:scale-90"
          style={{ backgroundColor: `${theme.accent}20`, borderColor: theme.accent }}>
          <RotateCcw className="w-3 h-3" style={{ color: theme.accent }} />
        </button>
      </div>
    </div>
  );
};

export const RetroBack = ({ profile, allMetrics, narrative, headline, achievements, bio, theme, serial, statCount, onFlip, onContact, onShare, onDownload }) => (
  <div className="absolute inset-0 flex flex-col overflow-y-auto" style={{ backgroundColor: "#f5f0e1" }}>
    {/* Vintage paper texture */}
    <div className="absolute inset-0 opacity-[0.15] pointer-events-none" style={{
      backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='6' height='6' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")",
    }} />
    {/* Header bar */}
    <div className="px-4 py-2 flex items-center justify-between relative z-10" style={{ backgroundColor: theme.accent }}>
      <span className="text-[10px] font-black tracking-[0.15em] uppercase text-white/90">Scout Report</span>
      <span className="text-[10px] font-mono font-bold text-white/60">{serial}</span>
    </div>
    {/* Player info */}
    <div className="px-4 pt-3 pb-2 relative z-10">
      <h3 className="text-base font-black leading-tight" style={{ color: "#2a2a2a" }}>{profile.user_name}</h3>
      <p className="text-[11px] font-semibold" style={{ color: theme.accent }}>{[profile.position, profile.sport].filter(Boolean).join(" · ")}</p>
    </div>
    <div className="mx-4 my-1 h-[1px] bg-gray-300 relative z-10" />
    {/* Stats table — classic newspaper style */}
    {allMetrics && Object.keys(allMetrics).length > 0 && (
      <div className="mx-4 mt-2 mb-2 relative z-10">
        <p className="text-[9px] font-black uppercase tracking-[0.15em] mb-1" style={{ color: theme.accent }}>Statistics</p>
        <div className="rounded-lg overflow-hidden border border-gray-300">
          <div className="flex px-3 py-1.5 bg-gray-200">
            <span className="flex-1 text-[9px] font-black uppercase tracking-wider text-gray-700">Metric</span>
            <span className="text-[9px] font-black uppercase tracking-wider text-gray-700 text-right">Best</span>
          </div>
          {Object.entries(allMetrics).map(([name, { value, unit }], i) => (
            <div key={name} className="flex items-center px-3 py-1.5" style={{
              backgroundColor: i % 2 === 0 ? "#ece7d8" : "#f5f0e1",
              borderTop: "1px solid #d4cfc0",
            }}>
              <span className="flex-1 text-[10px] text-gray-600 font-medium truncate mr-2">{name}</span>
              <span className="text-[11px] font-black text-gray-900">{value}{unit && <span className="text-[9px] text-gray-500 ml-0.5">{unit}</span>}</span>
            </div>
          ))}
        </div>
      </div>
    )}
    {(narrative || headline) && (
      <div className="mx-4 mb-2 relative z-10">
        {headline && <p className="text-[10px] font-black mb-0.5" style={{ color: "#2a2a2a" }}>{headline}</p>}
        <p className="text-[10px] text-gray-600 leading-relaxed italic" style={{ fontFamily: "Georgia, serif" }}>"{narrative}"</p>
      </div>
    )}
    {achievements?.length > 0 && (
      <div className="mx-4 mb-2 relative z-10">
        <p className="text-[9px] font-black uppercase tracking-[0.15em] mb-1" style={{ color: theme.accent }}>Achievements</p>
        {achievements.slice(0, 4).map((a, i) => (
          <div key={i} className="flex items-start gap-1.5"><Star className="w-3 h-3 mt-px flex-shrink-0" style={{ color: theme.accent }} /><span className="text-[10px] text-gray-600 font-medium">{a}</span></div>
        ))}
      </div>
    )}
    <div className="flex-1 min-h-[4px]" />
    <div className="flex gap-1.5 px-3 pb-1.5 relative z-10">
      {onContact && <button onClick={(e) => { e.stopPropagation(); onContact(); }} className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[10px] font-black text-white transition-all hover:scale-[1.02] active:scale-[0.98]" style={{ backgroundColor: theme.accent }}><Mail className="w-3 h-3" /> Contact</button>}
      {onShare && <button onClick={(e) => { e.stopPropagation(); onShare(); }} className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[10px] font-bold transition-all hover:scale-[1.02] active:scale-[0.98] border border-gray-300 text-gray-700 bg-white/50"><Share2 className="w-3 h-3" /> Share</button>}
      {onDownload && <button onClick={(e) => { e.stopPropagation(); onDownload(); }} className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[10px] font-bold transition-all hover:scale-[1.02] active:scale-[0.98] border border-gray-300 text-gray-700 bg-white/50"><Download className="w-3 h-3" /> Save</button>}
    </div>
    <div className="flex items-center justify-between px-4 pb-2.5 relative z-10">
      <div className="flex items-center gap-2">
        <span className="text-[7px] font-black tracking-[0.3em] uppercase text-gray-400">SPORTSPHERE</span>
        {statCount > 0 && <span className="flex items-center gap-0.5 text-[8px] font-bold text-gray-500"><CheckCircle className="w-2.5 h-2.5" /> Verified</span>}
      </div>
      <button onClick={(e) => { e.stopPropagation(); onFlip(); }} className="w-7 h-7 rounded-full flex items-center justify-center border transition-all hover:scale-110 active:scale-90" style={{ backgroundColor: `${theme.accent}20`, borderColor: theme.accent }}><RotateCcw className="w-3 h-3" style={{ color: theme.accent }} /></button>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE REGISTRY
// ═══════════════════════════════════════════════════════════════════════════════
export const CARD_TEMPLATES = {
  classic: { name: "Classic", description: "Topps-style full bleed photo" },
  chrome: { name: "Chrome", description: "Metallic silver finish", Front: ChromeFront, Back: ChromeBack },
  prizm: { name: "Prizm", description: "Angular geometric cuts", Front: PrizmFront, Back: PrizmBack },
  retro: { name: "Retro", description: "Vintage paper card feel", Front: RetroFront, Back: RetroBack },
};
