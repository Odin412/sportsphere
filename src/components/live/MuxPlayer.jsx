import React, { useRef, useEffect, useState } from "react";

/**
 * MuxPlayer — HLS video player for Mux live streams and VODs.
 *
 * Uses the native <video> tag with HLS.js for broad browser support,
 * avoiding the heavier @mux/mux-player-react package.
 *
 * Props:
 *  - playbackId: Mux playback ID (primary)
 *  - cameras: optional array of { label, mux_playback_id, type } for multi-camera
 *  - streamType: "live" | "on-demand"
 *  - autoPlay: boolean
 *  - muted: boolean (defaults true for autoplay compliance)
 *  - onTimeUpdate: (currentTime: number) => void
 *  - className: optional wrapper class
 */
export default function MuxPlayer({
  playbackId,
  cameras = [],
  streamType = "live",
  autoPlay = true,
  muted = true,
  onTimeUpdate = null,
  className = "",
}) {
  const [activeCamera, setActiveCamera] = useState(0);
  const effectivePlaybackId = cameras.length > 1
    ? cameras[activeCamera]?.mux_playback_id || playbackId
    : playbackId;
  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  const hlsUrl = `https://stream.mux.com/${effectivePlaybackId}.m3u8`;
  const posterUrl = `https://image.mux.com/${effectivePlaybackId}/thumbnail.webp?time=0`;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !playbackId) return;

    let hls = null;

    const initHls = async () => {
      // Check if browser natively supports HLS (Safari)
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = hlsUrl;
        if (autoPlay) video.play().catch(() => {});
        return;
      }

      // Use HLS.js for other browsers
      try {
        const { default: Hls } = await import("hls.js");
        if (!Hls.isSupported()) {
          // Fallback: try direct src
          video.src = hlsUrl;
          return;
        }

        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: streamType === "live",
          liveSyncDurationCount: streamType === "live" ? 3 : undefined,
        });
        hlsRef.current = hls;

        hls.loadSource(hlsUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (autoPlay) video.play().catch(() => {});
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                hls.destroy();
                break;
            }
          }
        });
      } catch {
        // HLS.js not available, try direct
        video.src = hlsUrl;
      }
    };

    initHls();

    return () => {
      if (hls) {
        hls.destroy();
        hlsRef.current = null;
      }
    };
  }, [effectivePlaybackId, hlsUrl, autoPlay, streamType]);

  // Time update callback
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !onTimeUpdate) return;

    const handler = () => onTimeUpdate(video.currentTime);
    video.addEventListener("timeupdate", handler);
    return () => video.removeEventListener("timeupdate", handler);
  }, [onTimeUpdate]);

  if (!playbackId) return null;

  return (
    <video
      ref={videoRef}
      className={`w-full h-full object-cover ${className}`}
      poster={posterUrl}
      autoPlay={autoPlay}
      muted={muted}
      playsInline
      controls
      controlsList="nodownload"
    />
  );
}
