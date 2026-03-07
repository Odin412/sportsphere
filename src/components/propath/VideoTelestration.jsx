import React, { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Pen, ArrowRight, Circle, Square, Type, Trash2, Save, Play, Pause } from "lucide-react";

const TOOLS = [
  { id: "freehand", icon: Pen, label: "Draw" },
  { id: "arrow", icon: ArrowRight, label: "Arrow" },
  { id: "circle", icon: Circle, label: "Circle" },
  { id: "rect", icon: Square, label: "Rect" },
  { id: "text", icon: Type, label: "Text" },
];

const COLORS = ["#ff4444", "#ffdd00", "#44ff88", "#ffffff", "#00aaff"];

export default function VideoTelestration({ videoUrl, annotations: initAnnotations = [], onSave }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [tool, setTool] = useState("freehand");
  const [color, setColor] = useState("#ff4444");
  const [annotations, setAnnotations] = useState(initAnnotations);
  const [currentShapes, setCurrentShapes] = useState([]);
  const [drawing, setDrawing] = useState(false);
  const [startPos, setStartPos] = useState(null);
  const [freehandPoints, setFreehandPoints] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);

  // Draw all current shapes on canvas
  const drawShapes = useCallback((shapes) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    shapes.forEach(shape => drawShape(ctx, shape, canvas.width, canvas.height));
  }, []);

  function drawShape(ctx, shape, w, h) {
    ctx.strokeStyle = shape.color;
    ctx.fillStyle = shape.color;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";

    if (shape.type === "freehand" && shape.points?.length > 1) {
      ctx.beginPath();
      ctx.moveTo(shape.points[0].x * w, shape.points[0].y * h);
      shape.points.forEach(p => ctx.lineTo(p.x * w, p.y * h));
      ctx.stroke();
    } else if (shape.type === "arrow") {
      const x1 = shape.x1 * w, y1 = shape.y1 * h;
      const x2 = shape.x2 * w, y2 = shape.y2 * h;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      // Arrowhead
      const angle = Math.atan2(y2 - y1, x2 - x1);
      const size = 14;
      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - size * Math.cos(angle - 0.5), y2 - size * Math.sin(angle - 0.5));
      ctx.lineTo(x2 - size * Math.cos(angle + 0.5), y2 - size * Math.sin(angle + 0.5));
      ctx.closePath();
      ctx.fill();
    } else if (shape.type === "circle") {
      const cx = shape.cx * w, cy = shape.cy * h;
      const r = shape.r * Math.min(w, h);
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    } else if (shape.type === "rect") {
      ctx.beginPath();
      ctx.strokeRect(shape.x * w, shape.y * h, shape.width * w, shape.height * h);
    } else if (shape.type === "text") {
      ctx.font = "bold 20px sans-serif";
      ctx.fillText(shape.label || "Note", shape.x * w, shape.y * h);
    }
  }

  useEffect(() => {
    drawShapes(currentShapes);
  }, [currentShapes, drawShapes]);

  // Update canvas dimensions when video loads
  const onVideoLoad = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (canvas && video) {
      canvas.width = video.videoWidth || video.clientWidth;
      canvas.height = video.videoHeight || video.clientHeight;
    }
  };

  // Video time update — show annotations at timestamp
  const onTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || isAnnotating) return;
    const t = video.currentTime;
    const active = annotations
      .filter(a => Math.abs(a.timestamp - t) < 0.3)
      .flatMap(a => a.shapes || []);
    drawShapes(active);
  };

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    return { x, y };
  };

  const onMouseDown = (e) => {
    if (!isAnnotating) return;
    const pos = getPos(e);
    setDrawing(true);
    setStartPos(pos);
    if (tool === "freehand") setFreehandPoints([pos]);
  };

  const onMouseMove = (e) => {
    if (!drawing || !isAnnotating) return;
    const pos = getPos(e);
    if (tool === "freehand") {
      setFreehandPoints(pts => {
        const next = [...pts, pos];
        drawShapes([...currentShapes, { type: "freehand", points: next, color }]);
        return next;
      });
    } else {
      // Preview shape
      let preview = null;
      if (tool === "arrow") preview = { type: "arrow", x1: startPos.x, y1: startPos.y, x2: pos.x, y2: pos.y, color };
      if (tool === "circle") {
        const r = Math.hypot(pos.x - startPos.x, pos.y - startPos.y) / 2;
        preview = { type: "circle", cx: (startPos.x + pos.x) / 2, cy: (startPos.y + pos.y) / 2, r, color };
      }
      if (tool === "rect") preview = { type: "rect", x: Math.min(startPos.x, pos.x), y: Math.min(startPos.y, pos.y), width: Math.abs(pos.x - startPos.x), height: Math.abs(pos.y - startPos.y), color };
      if (preview) drawShapes([...currentShapes, preview]);
    }
  };

  const onMouseUp = (e) => {
    if (!drawing || !isAnnotating) return;
    const pos = getPos(e);
    setDrawing(false);

    let shape = null;
    if (tool === "freehand") {
      shape = { type: "freehand", points: freehandPoints, color };
      setFreehandPoints([]);
    } else if (tool === "arrow") {
      shape = { type: "arrow", x1: startPos.x, y1: startPos.y, x2: pos.x, y2: pos.y, color };
    } else if (tool === "circle") {
      const r = Math.hypot(pos.x - startPos.x, pos.y - startPos.y) / 2;
      shape = { type: "circle", cx: (startPos.x + pos.x) / 2, cy: (startPos.y + pos.y) / 2, r, color };
    } else if (tool === "rect") {
      shape = { type: "rect", x: Math.min(startPos.x, pos.x), y: Math.min(startPos.y, pos.y), width: Math.abs(pos.x - startPos.x), height: Math.abs(pos.y - startPos.y), color };
    } else if (tool === "text") {
      const label = prompt("Enter annotation text:");
      if (label) shape = { type: "text", x: pos.x, y: pos.y, label, color };
    }

    if (shape) setCurrentShapes(s => [...s, shape]);
  };

  const saveAnnotation = () => {
    if (currentShapes.length === 0) return;
    const timestamp = videoRef.current?.currentTime || 0;
    const newAnnotation = { timestamp, duration: 3, shapes: currentShapes };
    const updated = [...annotations, newAnnotation];
    setAnnotations(updated);
    setCurrentShapes([]);
    setIsAnnotating(false);
    if (videoRef.current) videoRef.current.play();
    onSave?.(updated);
  };

  const clearCanvas = () => {
    setCurrentShapes([]);
    const canvas = canvasRef.current;
    if (canvas) canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
  };

  const startAnnotating = () => {
    if (videoRef.current) videoRef.current.pause();
    setIsAnnotating(true);
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setIsPlaying(true); }
    else { v.pause(); setIsPlaying(false); }
  };

  return (
    <div className="space-y-3">
      {/* Video + Canvas */}
      <div className="relative rounded-2xl overflow-hidden bg-black" style={{ aspectRatio: "16/9" }}>
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-contain"
          onLoadedMetadata={onVideoLoad}
          onTimeUpdate={onTimeUpdate}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ cursor: isAnnotating ? "crosshair" : "default", pointerEvents: isAnnotating ? "auto" : "none" }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
        />
        {/* Play/Pause button overlay */}
        {!isAnnotating && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
          >
            <div className="bg-black/50 rounded-full p-4">
              {isPlaying ? <Pause className="w-8 h-8 text-white" /> : <Play className="w-8 h-8 text-white" />}
            </div>
          </button>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {!isAnnotating ? (
          <Button onClick={startAnnotating} variant="outline" className="gap-2 text-sm rounded-xl border-gray-600">
            <Pen className="w-4 h-4" /> Pause & Annotate
          </Button>
        ) : (
          <>
            {/* Tool selector */}
            <div className="flex gap-1">
              {TOOLS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTool(t.id)}
                  className={`p-2 rounded-lg text-xs ${tool === t.id ? "bg-red-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}
                  title={t.label}
                >
                  <t.icon className="w-4 h-4" />
                </button>
              ))}
            </div>
            {/* Color picker */}
            <div className="flex gap-1">
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full border-2 ${color === c ? "border-white scale-125" : "border-transparent"}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <Button onClick={clearCanvas} variant="ghost" size="sm" className="gap-1 text-gray-400">
              <Trash2 className="w-3 h-3" /> Clear
            </Button>
            <Button onClick={saveAnnotation} size="sm" className="gap-1 bg-green-700 hover:bg-green-600 text-white rounded-xl">
              <Save className="w-3 h-3" /> Save
            </Button>
          </>
        )}
        {annotations.length > 0 && (
          <span className="text-xs text-gray-500 ml-auto">{annotations.length} annotation{annotations.length !== 1 ? "s" : ""} saved</span>
        )}
      </div>
    </div>
  );
}
