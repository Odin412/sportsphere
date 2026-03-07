import React, { useState, useRef } from "react";
import { db } from "@/api/db";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, CheckCircle, Loader2, ChevronRight } from "lucide-react";
import { toast } from "sonner";

async function extractPDFText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      // Simple text extraction for PDF — works for text-layer PDFs
      const bytes = new Uint8Array(e.target.result);
      let text = "";
      for (let i = 0; i < bytes.length; i++) {
        const char = String.fromCharCode(bytes[i]);
        if (char.match(/[\x20-\x7E\n\r\t]/)) text += char;
      }
      resolve(text.replace(/\s+/g, " ").trim());
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

export default function GameChangerPDFImport({ onClose, userEmail, sportProfileId }) {
  const [step, setStep] = useState("upload"); // upload | parsing | preview | done
  const [file, setFile] = useState(null);
  const [extractedStats, setExtractedStats] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  const handleFile = async (f) => {
    if (!f || !f.name.endsWith(".pdf")) {
      toast.error("Please upload a PDF file");
      return;
    }
    setFile(f);
    setStep("parsing");

    try {
      const pdfText = await extractPDFText(f);

      const result = await db.ai.invoke({
        prompt: `You are parsing a GameChanger sports stats PDF export. Extract all player/team statistics.
Return structured JSON. The PDF text is:

${pdfText.slice(0, 8000)}`,
        schema: {
          type: "object",
          properties: {
            sport: { type: "string" },
            season: { type: "string" },
            player_name: { type: "string" },
            games_played: { type: "number" },
            stats: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  value: { type: "number" },
                  unit: { type: "string" }
                }
              }
            }
          }
        }
      });

      if (!result?.stats?.length) {
        toast.error("Could not extract stats from this PDF. Make sure it's a GameChanger export.");
        setStep("upload");
        return;
      }

      setExtractedStats(result);
      setStep("preview");
    } catch (err) {
      console.error(err);
      toast.error("Failed to parse PDF. Try again.");
      setStep("upload");
    }
  };

  const handleImport = async () => {
    if (!extractedStats) return;
    setSaving(true);
    try {
      await db.entities.StatEntry.create({
        user_email: userEmail,
        sport_profile_id: sportProfileId,
        sport: extractedStats.sport || "Unknown",
        date: new Date().toISOString().split("T")[0],
        session_type: "game",
        metrics: extractedStats.stats,
        notes: JSON.stringify({
          source: "gamechanger_import",
          season: extractedStats.season,
          player_name: extractedStats.player_name,
          games_played: extractedStats.games_played,
        }),
      });
      setStep("done");
    } catch (err) {
      toast.error("Failed to save stats");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-black flex items-center gap-2">
            <FileText className="w-5 h-5 text-red-500" />
            Import from GameChanger
          </DialogTitle>
        </DialogHeader>

        {step === "upload" && (
          <div className="space-y-4">
            {/* Instructions */}
            <div className="bg-gray-50 rounded-2xl p-4 space-y-2 text-sm text-gray-600">
              <p className="font-semibold text-gray-800">How to export from GameChanger:</p>
              <div className="space-y-1">
                <div className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p>Open GameChanger → go to your team</p>
                </div>
                <div className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p>Tap Stats → Season Stats → Share/Export</p>
                </div>
                <div className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p>Select PDF format → Save to device</p>
                </div>
              </div>
            </div>

            {/* Upload area */}
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center cursor-pointer hover:border-red-400 hover:bg-red-50/30 transition-colors"
            >
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-700">Click to upload PDF</p>
              <p className="text-xs text-gray-400 mt-1">GameChanger stats export (.pdf)</p>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={e => handleFile(e.target.files?.[0])}
              />
            </div>
          </div>
        )}

        {step === "parsing" && (
          <div className="flex flex-col items-center py-10 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-red-500" />
            <p className="font-semibold text-gray-800">Extracting stats...</p>
            <p className="text-sm text-gray-400">Claude is reading your GameChanger export</p>
          </div>
        )}

        {step === "preview" && extractedStats && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              {extractedStats.sport && <Badge className="bg-red-100 text-red-700">{extractedStats.sport}</Badge>}
              {extractedStats.season && <Badge variant="outline">{extractedStats.season}</Badge>}
              {extractedStats.player_name && <span className="text-sm text-gray-600">{extractedStats.player_name}</span>}
            </div>
            <div className="border rounded-2xl overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wide grid grid-cols-3">
                <span>Stat</span><span className="text-center">Value</span><span className="text-center">Unit</span>
              </div>
              <div className="divide-y max-h-48 overflow-y-auto">
                {extractedStats.stats.map((s, i) => (
                  <div key={i} className="px-4 py-2 text-sm grid grid-cols-3">
                    <span className="text-gray-700">{s.name}</span>
                    <span className="text-center font-bold text-gray-900">{s.value}</span>
                    <span className="text-center text-gray-400">{s.unit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("upload")} className="flex-1 rounded-xl">Back</Button>
              <Button
                onClick={handleImport}
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-red-900 to-red-700 text-white rounded-xl font-bold"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Import {extractedStats.stats.length} Stats
              </Button>
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="flex flex-col items-center py-8 gap-3">
            <CheckCircle className="w-12 h-12 text-green-500" />
            <p className="text-lg font-black text-gray-900">{extractedStats?.stats?.length} stats imported</p>
            <Badge className="bg-green-100 text-green-700 border-0 px-3 py-1">ProPath Verified ✓</Badge>
            <p className="text-sm text-gray-500 text-center">Your GameChanger stats are now part of your ProPath profile</p>
            <Button onClick={onClose} className="mt-2 bg-gradient-to-r from-red-900 to-red-700 text-white rounded-xl">Done</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
