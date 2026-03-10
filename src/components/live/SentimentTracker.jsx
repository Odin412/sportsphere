import React, { useEffect, useRef, useState, useCallback } from "react";
import { db } from "@/api/db";
import { Zap } from "lucide-react";
import { toast } from "sonner";

const HYPE_KEYWORDS = [
  "lets go", "let's go", "omg", "wow", "insane", "clutch", "goat",
  "fire", "beast", "sheesh", "no way", "bruh", "crazy", "unreal",
];
const HYPE_EMOJIS = ["\u{1F525}", "\u{1F4A5}", "\u{1F389}", "\u{1F3C6}", "\u{1F92F}", "\u{1F60D}", "\u{2764}\uFE0F", "\u{1F64F}"];

const WINDOW_SECONDS = 30;
const SPIKE_MULTIPLIER = 2; // trigger when rate > 2x average
const COOLDOWN_MS = 60000; // min 60s between triggers

/**
 * SentimentTracker — monitors live chat for hype spikes.
 * When message rate exceeds 2x the rolling average AND contains hype keywords/emojis,
 * it invokes create-live-clip to capture the moment.
 *
 * Props:
 *   streamId  - live stream ID
 *   gameId    - linked game ID (optional)
 *   messages  - array of chat messages (real-time, from parent)
 *   streamStartTime - Date when the stream started (for timestamp calc)
 */
export default function SentimentTracker({ streamId, gameId, messages = [], streamStartTime }) {
  const [lastClipTime, setLastClipTime] = useState(0);
  const [clipCount, setClipCount] = useState(0);
  const messageTimestamps = useRef([]);
  const rollingAvg = useRef(0);
  const messageCount = useRef(0);

  const isHypeMessage = useCallback((text) => {
    if (!text) return false;
    const lower = text.toLowerCase();
    // All caps (at least 4 chars) is hype
    if (text.length >= 4 && text === text.toUpperCase() && /[A-Z]/.test(text)) return true;
    // Contains hype keyword
    if (HYPE_KEYWORDS.some((kw) => lower.includes(kw))) return true;
    // Contains hype emoji
    if (HYPE_EMOJIS.some((e) => text.includes(e))) return true;
    return false;
  }, []);

  useEffect(() => {
    if (!messages.length) return;
    const latest = messages[messages.length - 1];
    if (!latest) return;

    const now = Date.now();
    messageTimestamps.current.push(now);
    messageCount.current++;

    // Track rolling average (messages per 30s window, updated every message)
    const windowStart = now - WINDOW_SECONDS * 1000;
    messageTimestamps.current = messageTimestamps.current.filter((t) => t > windowStart);
    const currentRate = messageTimestamps.current.length;

    // Update rolling average (exponential moving average)
    if (messageCount.current <= 10) {
      rollingAvg.current = currentRate; // need baseline first
      return;
    }
    rollingAvg.current = rollingAvg.current * 0.95 + currentRate * 0.05;

    // Check for spike
    const isSpike = currentRate > rollingAvg.current * SPIKE_MULTIPLIER;
    const isCooldownOver = now - lastClipTime > COOLDOWN_MS;
    const hasHype = isHypeMessage(latest.message || latest.content || "");

    if (isSpike && isCooldownOver && hasHype) {
      triggerClip(now);
    }
  }, [messages.length]);

  const triggerClip = async (now) => {
    setLastClipTime(now);
    setClipCount((c) => c + 1);

    // Calculate stream timestamp
    const streamStart = streamStartTime ? new Date(streamStartTime).getTime() : 0;
    const timestampSeconds = streamStart ? Math.floor((now - streamStart) / 1000) : 0;

    toast.success("Highlight detected! Creating clip...", {
      icon: <Zap className="w-4 h-4 text-yellow-400" />,
    });

    try {
      const result = await db.functions.invoke("create-live-clip", {
        stream_id: streamId,
        game_id: gameId,
        timestamp_seconds: timestampSeconds,
        trigger_type: "chat_spike",
        description: `Chat spike at ${Math.floor(timestampSeconds / 60)}:${String(timestampSeconds % 60).padStart(2, "0")}`,
      });

      // If clip was created successfully, auto-post it
      if (result?.clip_playback_id) {
        await db.functions.invoke("auto-post-highlight", {
          clip_playback_id: result.clip_playback_id,
          stream_title: `Live Highlight`,
          sport: "",
          game_id: gameId,
        });
      }
    } catch (err) {
      console.error("Failed to create live clip:", err);
    }
  };

  // Visual indicator (subtle, for the host)
  if (clipCount === 0) return null;

  return (
    <div className="flex items-center gap-1.5 text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-2.5 py-1.5">
      <Zap className="w-3.5 h-3.5" />
      <span className="font-medium">{clipCount} highlight{clipCount !== 1 ? "s" : ""} captured</span>
    </div>
  );
}
