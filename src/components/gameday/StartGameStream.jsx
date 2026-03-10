import React, { useState, useEffect } from "react";
import { db } from "@/api/db";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Radio, ChevronRight, ChevronLeft, Copy, Check, Loader2, Camera, Wifi, Monitor, Building2, Lock } from "lucide-react";
import { toast } from "sonner";
import { getSupportedSports, SPORT_SCORING } from "@/lib/sportScoringConfig";

const STEPS = ["Select Game", "Game Setup", "Camera Setup", "Go Live"];

export default function StartGameStream({ user, membership, onClose, onCreated }) {
  const [step, setStep] = useState(0);
  const [creating, setCreating] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // Form state
  const [selectedSession, setSelectedSession] = useState(null);
  const [sport, setSport] = useState("baseball");
  const [homeTeam, setHomeTeam] = useState("");
  const [awayTeam, setAwayTeam] = useState("");
  const [venue, setVenue] = useState("");
  const [cameraType, setCameraType] = useState("phone"); // "phone" | "rtmp"

  // Mux stream details (populated after creation)
  const [muxDetails, setMuxDetails] = useState(null);

  const orgId = membership?.organization_id;

  // Fetch org streaming tier for gating
  const { data: orgTier } = useQuery({
    queryKey: ["org-tier", orgId],
    queryFn: async () => {
      const orgs = await db.entities.Organization.filter({ id: orgId });
      return orgs[0]?.game_streaming_tier || "free";
    },
    enabled: !!orgId,
  });

  // Fetch upcoming org sessions of type "game"
  const { data: upcomingSessions } = useQuery({
    queryKey: ["org-game-sessions", orgId],
    queryFn: async () => {
      const sessions = await db.entities.TrainingSession.filter({ organization_id: orgId });
      const now = new Date();
      return sessions
        .filter(s => s.session_type === "game" && new Date(s.scheduled_at) >= now)
        .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))
        .slice(0, 20);
    },
    enabled: !!orgId,
  });

  // Fetch org details for default home team name
  const { data: org } = useQuery({
    queryKey: ["org-detail", orgId],
    queryFn: async () => {
      const orgs = await db.entities.Organization.filter({ id: orgId });
      return orgs[0] || null;
    },
    enabled: !!orgId,
  });

  useEffect(() => {
    if (org?.name && !homeTeam) setHomeTeam(org.name);
  }, [org?.name]);

  const selectSession = (session) => {
    setSelectedSession(session);
    if (session.sport) setSport(session.sport.toLowerCase());
    if (session.location) setVenue(session.location);
    setStep(1);
  };

  const handleCreateStream = async () => {
    if (!homeTeam.trim() || !awayTeam.trim()) {
      toast.error("Please enter both team names");
      return;
    }
    setCreating(true);
    try {
      // 1. Create Mux live stream via edge function
      const muxRes = await db.functions.invoke("mux", {
        body: { action: "create-stream" },
      });
      if (muxRes.error) throw new Error(muxRes.error);
      const mux = muxRes.data || muxRes;

      setMuxDetails(mux);

      // 2. Create LiveStream record
      const stream = await db.entities.LiveStream.create({
        host_email: user.email,
        host_name: user.full_name,
        host_avatar: user.avatar_url,
        title: `${homeTeam} vs ${awayTeam}`,
        sport: sport.charAt(0).toUpperCase() + sport.slice(1),
        status: "live",
        viewers: [],
        started_at: new Date().toISOString(),
        mux_playback_id: mux.playback_id,
        mux_stream_id: mux.stream_id,
      });

      // 3. Create Game record
      const sportConfig = SPORT_SCORING[sport];
      const game = await db.entities.Game.create({
        organization_id: orgId,
        sport: sport.charAt(0).toUpperCase() + sport.slice(1),
        title: `${homeTeam} vs ${awayTeam}`,
        home_team_name: homeTeam.trim(),
        away_team_name: awayTeam.trim(),
        venue: venue.trim() || null,
        scheduled_at: selectedSession?.scheduled_at || new Date().toISOString(),
        status: "live",
        live_stream_id: stream.id,
        mux_stream_id: mux.stream_id,
        mux_playback_id: mux.playback_id,
        scorekeeper_email: user.email,
        created_by_email: user.email,
        game_config: sportConfig?.defaultConfig || {},
        current_period: sport === "baseball" ? "T1" : sport === "soccer" ? "H1" : "Q1",
      });

      // 4. Create initial game_score entry
      await db.entities.GameScore.create({
        game_id: game.id,
        period: sport === "baseball" ? "T1" : sport === "soccer" ? "H1" : "Q1",
        home_score: 0,
        away_score: 0,
        event_type: "game_start",
        description: "Game started",
        recorded_by_email: user.email,
      });

      // 5. Notify org members
      const members = await db.entities.OrgMember.filter({ organization_id: orgId });
      Promise.all(
        members
          .filter(m => m.user_email !== user.email)
          .map(m =>
            db.entities.Notification.create({
              recipient_email: m.user_email,
              actor_email: user.email,
              actor_name: user.full_name,
              actor_avatar: user.avatar_url,
              type: "live_stream",
              stream_id: stream.id,
              message: `${homeTeam} vs ${awayTeam} is now live!`,
            })
          )
      ).catch(() => {});

      if (cameraType === "rtmp") {
        // Show RTMP details — user stays on this step
        setStep(3);
        setCreating(false);
      } else {
        // Phone camera — go straight to ViewLive
        setCreating(false);
        onCreated(game.id, stream.id);
      }
    } catch (err) {
      toast.error(err.message || "Failed to create game stream");
      setCreating(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
    toast.success("Copied!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-black text-slate-900">Start Game Stream</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Step {step + 1} of {STEPS.length}: {STEPS[step]}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex gap-1 px-6 pt-4">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? "bg-red-500" : "bg-slate-200"}`}
            />
          ))}
        </div>

        <div className="p-6">
          {/* Step 0: Select Game */}
          {step === 0 && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 font-medium">
                Select an upcoming game from your schedule, or create an ad-hoc game.
              </p>

              {upcomingSessions?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-500 uppercase">Upcoming Games</p>
                  {upcomingSessions.map(s => (
                    <button
                      key={s.id}
                      onClick={() => selectSession(s)}
                      className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-red-300 hover:bg-red-50 transition-all"
                    >
                      <p className="font-bold text-sm text-slate-900">{s.title || "Game"}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {new Date(s.scheduled_at).toLocaleDateString()} at{" "}
                        {new Date(s.scheduled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        {s.location && ` — ${s.location}`}
                      </p>
                    </button>
                  ))}
                </div>
              )}

              <button
                onClick={() => setStep(1)}
                className="w-full p-3 rounded-xl border-2 border-dashed border-slate-300 hover:border-red-300 text-slate-500 hover:text-red-600 text-sm font-bold transition-all"
              >
                + Create Ad-Hoc Game
              </button>
            </div>
          )}

          {/* Step 1: Game Setup */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1.5 block">Sport</label>
                <Select value={sport} onValueChange={setSport}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getSupportedSports().map(s => (
                      <SelectItem key={s} value={s}>
                        {SPORT_SCORING[s].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 mb-1.5 block">Home Team</label>
                <Input
                  value={homeTeam}
                  onChange={e => setHomeTeam(e.target.value)}
                  placeholder="e.g., Eagles"
                  className="rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 mb-1.5 block">Away Team</label>
                <Input
                  value={awayTeam}
                  onChange={e => setAwayTeam(e.target.value)}
                  placeholder="e.g., Hawks"
                  className="rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 mb-1.5 block">Venue (optional)</label>
                <Input
                  value={venue}
                  onChange={e => setVenue(e.target.value)}
                  placeholder="e.g., Central Park Field 3"
                  className="rounded-xl"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(0)}
                  className="rounded-xl gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </Button>
                <Button
                  onClick={() => setStep(2)}
                  disabled={!homeTeam.trim() || !awayTeam.trim()}
                  className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold gap-1"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Camera Setup */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 font-medium">
                Choose how you'll stream this game.
              </p>

              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setCameraType("phone")}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    cameraType === "phone"
                      ? "border-red-500 bg-red-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <Camera className={`w-8 h-8 mx-auto mb-2 ${cameraType === "phone" ? "text-red-500" : "text-slate-400"}`} />
                  <p className="text-sm font-bold text-slate-900">Phone/Tablet</p>
                  <p className="text-xs text-slate-500 mt-1">Use this device's camera</p>
                </button>

                <button
                  onClick={() => setCameraType("rtmp")}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    cameraType === "rtmp"
                      ? "border-red-500 bg-red-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <Wifi className={`w-8 h-8 mx-auto mb-2 ${cameraType === "rtmp" ? "text-red-500" : "text-slate-400"}`} />
                  <p className="text-sm font-bold text-slate-900">External Camera</p>
                  <p className="text-xs text-slate-500 mt-1">GoPro, Mevo, or RTMP</p>
                </button>

                <div className="relative p-4 rounded-xl border-2 border-slate-200 text-center opacity-60 cursor-not-allowed">
                  <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                    COMING SOON
                  </div>
                  <Building2 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm font-bold text-slate-400">Facility Camera</p>
                  <p className="text-xs text-slate-400 mt-1">Fixed RTMP pull stream</p>
                </div>
              </div>

              {/* Tier gating message */}
              {orgTier === "free" && (
                <div className="flex items-start gap-2 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600">
                  <Lock className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-700">Free Tier</p>
                    <p className="mt-0.5">Upgrade to Basic or Pro for multi-camera streams, auto-highlights, and extended VOD storage.</p>
                  </div>
                </div>
              )}

              {cameraType === "rtmp" && (
                <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-600 space-y-1">
                  <p className="font-bold text-slate-700">How to connect:</p>
                  <p>1. Open your camera's streaming app (Larix, GoPro, Mevo)</p>
                  <p>2. Set the RTMP URL and stream key from the next step</p>
                  <p>3. Start streaming from your camera</p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="rounded-xl gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </Button>
                <Button
                  onClick={handleCreateStream}
                  disabled={creating}
                  className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold gap-1"
                >
                  {creating ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Creating Stream...</>
                  ) : (
                    <><Radio className="w-4 h-4" /> {cameraType === "phone" ? "Go Live" : "Create Stream"}</>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: RTMP Details (shown only for external camera) */}
          {step === 3 && muxDetails && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                <Monitor className="w-8 h-8 text-green-600 mx-auto mb-1" />
                <p className="text-sm font-bold text-green-800">Stream Created!</p>
                <p className="text-xs text-green-600 mt-0.5">
                  Connect your camera with the details below.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 mb-1.5 block">RTMP URL</label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={muxDetails.rtmp_url}
                    className="rounded-xl bg-slate-50 font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(muxDetails.rtmp_url)}
                    className="rounded-xl flex-shrink-0"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 mb-1.5 block">Stream Key</label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={muxDetails.stream_key}
                    type="password"
                    className="rounded-xl bg-slate-50 font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(muxDetails.stream_key)}
                    className="rounded-xl flex-shrink-0"
                  >
                    {copiedKey ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
                <p className="font-bold mb-1">Keep this window open</p>
                <p>Once your camera connects, the stream will go live automatically. You can close this dialog and view the stream.</p>
              </div>

              <Button
                onClick={() => onCreated(null, muxDetails.stream_id)}
                className="w-full rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold"
              >
                View Live Stream
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
