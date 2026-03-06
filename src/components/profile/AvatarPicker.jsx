import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, Sparkles, X } from "lucide-react";

/**
 * AvatarPicker — lets users choose between:
 * 1. Upload a photo (file input)
 * 2. Create a 3D avatar via Ready Player Me
 *
 * Props:
 *   onSelect(url: string) — called with the selected avatar URL (PNG)
 *   onClose()             — called to close the picker
 */
export default function AvatarPicker({ onSelect, onClose }) {
  const [mode, setMode] = useState("choice"); // "choice" | "rpm" | "upload"
  const [rpmLoading, setRpmLoading] = useState(true);
  const fileRef = useRef(null);

  // Listen for Ready Player Me postMessage
  useEffect(() => {
    if (mode !== "rpm") return;

    const handler = (event) => {
      if (typeof event.data !== "string") return;
      try {
        const json = JSON.parse(event.data);
        if (json?.source === "readyplayerme" && json?.eventName === "v1.avatar.exported") {
          const glbUrl = json.data?.url;
          if (!glbUrl) return;
          // Convert .glb → .png portrait render (Ready Player Me render API)
          const pngUrl = glbUrl.replace(".glb", ".png?scene=fullbody-portrait-v1-transparent&quality=high");
          onSelect(pngUrl);
          onClose();
        }
      } catch (_) {
        // Not a JSON message from RPM — ignore
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [mode, onSelect, onClose]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Return a local object URL for preview; caller is responsible for uploading
    const objectUrl = URL.createObjectURL(file);
    onSelect({ file, previewUrl: objectUrl });
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className={`p-0 overflow-hidden ${mode === "rpm" ? "max-w-2xl h-[85vh]" : "max-w-sm"}`}>
        {mode === "choice" && (
          <>
            <DialogHeader className="p-6 pb-2">
              <DialogTitle className="text-lg font-black">Choose Your Avatar</DialogTitle>
            </DialogHeader>
            <div className="p-6 pt-3 space-y-3">
              {/* Ready Player Me */}
              <button
                onClick={() => setMode("rpm")}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-200 hover:border-red-500 hover:bg-red-50 transition-all group text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 group-hover:text-red-900">Create 3D Avatar</p>
                  <p className="text-xs text-gray-500 mt-0.5">Customize a realistic 3D avatar with Ready Player Me</p>
                </div>
              </button>

              {/* Upload photo */}
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-200 hover:border-red-500 hover:bg-red-50 transition-all group text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Upload className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 group-hover:text-red-900">Upload a Photo</p>
                  <p className="text-xs text-gray-500 mt-0.5">Use your own image (JPG, PNG, WebP)</p>
                </div>
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />

              <button
                onClick={onClose}
                className="w-full text-center text-sm text-gray-400 hover:text-gray-600 py-1 transition-colors"
              >
                Cancel
              </button>
            </div>
          </>
        )}

        {mode === "rpm" && (
          <div className="relative w-full h-full">
            {rpmLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-red-600" />
                <p className="text-sm text-gray-500 font-medium">Loading avatar creator...</p>
              </div>
            )}
            <button
              onClick={() => setMode("choice")}
              className="absolute top-3 right-3 z-20 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <iframe
              src="https://readyplayer.me/avatar?frameApi&clearCache&bodyType=fullbody"
              className="w-full h-full border-0"
              allow="camera *; microphone *"
              onLoad={() => setRpmLoading(false)}
              title="Ready Player Me Avatar Creator"
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
