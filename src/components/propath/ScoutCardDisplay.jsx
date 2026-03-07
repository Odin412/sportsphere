import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";

const SPORT_GRADIENTS = {
  Basketball: "from-orange-600 via-red-700 to-red-900",
  Soccer: "from-green-600 via-teal-700 to-teal-900",
  Football: "from-amber-600 via-amber-800 to-amber-900",
  Baseball: "from-blue-600 via-blue-800 to-blue-900",
  Tennis: "from-yellow-500 via-yellow-700 to-amber-900",
  Swimming: "from-cyan-500 via-blue-600 to-blue-900",
  Track: "from-purple-500 via-purple-700 to-purple-900",
  Hockey: "from-blue-400 via-blue-700 to-slate-900",
  MMA: "from-red-600 via-red-800 to-slate-900",
  CrossFit: "from-rose-500 via-pink-700 to-red-900",
  Golf: "from-emerald-500 via-green-700 to-green-900",
  default: "from-red-900 via-red-800 to-slate-900",
};

export default function ScoutCardDisplay({
  profile,
  topMetrics = [],
  narrative = null,
  headline = null,
  onContact,
  onShare,
  compact = false,
}) {
  if (!profile) return null;

  const gradient = SPORT_GRADIENTS[profile.sport] || SPORT_GRADIENTS.default;
  const initials = profile.user_name?.[0]?.toUpperCase() || "?";

  if (compact) {
    return (
      <div className={`relative rounded-2xl bg-gradient-to-br ${gradient} p-4 text-white shadow-xl overflow-hidden`} style={{ aspectRatio: "2/3", maxWidth: 160 }}>
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
          <span className="text-[8px] font-black tracking-widest opacity-80">PROPATH</span>
          <CheckCircle className="w-3 h-3 text-white/70" />
        </div>
        <div className="flex flex-col items-center justify-center h-full gap-2 pt-4">
          <Avatar className="w-14 h-14 border-2 border-white/30">
            <AvatarImage src={profile.avatar_url} />
            <AvatarFallback className="bg-white/20 text-white font-bold">{initials}</AvatarFallback>
          </Avatar>
          <div className="text-center">
            <p className="text-xs font-black leading-tight">{profile.user_name}</p>
            <p className="text-[9px] opacity-70">{profile.sport}</p>
          </div>
          {topMetrics.slice(0, 2).map((m, i) => (
            <div key={i} className="bg-black/30 rounded-lg px-2 py-1 text-center">
              <p className="text-sm font-black">{m.value}{m.unit}</p>
              <p className="text-[8px] opacity-70">{m.name}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-3xl bg-gradient-to-br ${gradient} text-white shadow-2xl overflow-hidden`} style={{ maxWidth: 340, width: "100%" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div>
          <p className="text-xs font-black tracking-widest opacity-70">P R O P A T H</p>
          <div className="flex items-center gap-1 mt-0.5">
            <CheckCircle className="w-3.5 h-3.5 text-white/80" />
            <span className="text-[11px] font-bold text-white/80">VERIFIED</span>
          </div>
        </div>
        <div className="bg-white/10 rounded-xl px-2 py-1">
          <p className="text-xs font-bold">{profile.sport || "Athlete"}</p>
        </div>
      </div>

      {/* Athlete info */}
      <div className="flex flex-col items-center py-4 gap-3">
        <Avatar className="w-24 h-24 border-4 border-white/20 shadow-2xl">
          <AvatarImage src={profile.avatar_url} />
          <AvatarFallback className="text-3xl bg-white/20 font-black">{initials}</AvatarFallback>
        </Avatar>
        <div className="text-center">
          <h2 className="text-xl font-black tracking-tight">{profile.user_name}</h2>
          <p className="text-white/70 text-sm">
            {[profile.team, profile.location].filter(Boolean).join(" · ")}
          </p>
          {profile.level && (
            <Badge className="mt-1 bg-white/20 text-white border-0 text-xs capitalize">
              {profile.level}
            </Badge>
          )}
        </div>
      </div>

      {/* Stats */}
      {topMetrics.length > 0 && (
        <div className="flex justify-center gap-3 px-5 pb-4">
          {topMetrics.slice(0, 3).map((m, i) => (
            <div key={i} className="bg-black/30 backdrop-blur rounded-2xl px-4 py-3 text-center min-w-[72px]">
              <p className="text-xl font-black">{m.value}{m.unit && m.unit.length <= 3 ? m.unit : ""}</p>
              <p className="text-[10px] text-white/60 font-medium uppercase tracking-wide leading-tight">{m.name}</p>
            </div>
          ))}
        </div>
      )}

      {/* AI Narrative */}
      <div className="px-5 pb-4">
        <div className="bg-black/20 rounded-2xl p-3">
          {headline && <p className="text-xs font-black uppercase tracking-wide text-white/60 mb-1">{headline}</p>}
          <p className="text-sm text-white/85 leading-relaxed italic">
            "{narrative || `${profile.user_name} is a dedicated ${profile.sport || "athlete"} with ${profile.years_experience || "several"} years of experience.`}"
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 px-5 pb-5">
        {onContact && (
          <button
            onClick={onContact}
            className="flex-1 bg-white text-gray-900 font-bold text-sm py-2.5 rounded-2xl hover:bg-gray-100 transition-colors"
          >
            Contact
          </button>
        )}
        {onShare && (
          <button
            onClick={onShare}
            className="flex-1 bg-white/20 text-white font-bold text-sm py-2.5 rounded-2xl hover:bg-white/30 transition-colors"
          >
            Share ↗
          </button>
        )}
      </div>

      {/* Subtle logo watermark */}
      <div className="absolute bottom-3 right-4 opacity-20">
        <p className="text-[9px] font-black tracking-widest">SPORTSPHERE</p>
      </div>
    </div>
  );
}
