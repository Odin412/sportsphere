import React, { useState, useEffect } from "react";
import { db } from "@/api/db";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Upload, X, Palette, Search, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { TEAM_TEMPLATES, SPORT_TO_LEAGUE, findTeamById } from "@/data/teamTemplates";
import { CARD_TEMPLATES } from "./CardTemplates";
import ScoutCardDisplay from "./ScoutCardDisplay";

const TEMPLATE_KEYS = ["classic", "chrome", "prizm", "retro"];

export default function CustomizeCardModal({
  open,
  onClose,
  onOpenChange,
  profile,
  topMetrics = [],
  allMetrics = null,
  statCount = 0,
  narrative = null,
  headline = null,
  achievements = null,
  bio = null,
  userEmail,
  customizations,
  existingCustomizations,
  onSaved,
}) {
  const closeModal = onClose || ((v) => onOpenChange?.(v));
  const initialCards = customizations || existingCustomizations || [];
  // ── State ──
  const [cards, setCards] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [saving, setSaving] = useState(false);
  const [teamSearch, setTeamSearch] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingSig, setUploadingSig] = useState(false);

  // Initialize cards from existing customizations or create a default
  useEffect(() => {
    if (open) {
      if (initialCards.length > 0) {
        setCards(initialCards.map(c => ({ ...c })));
        const activeI = initialCards.findIndex(c => c.is_active);
        setActiveIdx(activeI >= 0 ? activeI : 0);
      } else {
        setCards([{
          card_name: "Default",
          is_active: true,
          template: "classic",
          team_template_id: null,
          primary_color: "",
          secondary_color: "",
          border_color: "",
          team_name: "",
          team_logo_url: "",
          signature_url: "",
        }]);
        setActiveIdx(0);
      }
    }
  }, [open]);

  const current = cards[activeIdx] || {};

  const updateCurrent = (updates) => {
    setCards(prev => prev.map((c, i) => i === activeIdx ? { ...c, ...updates } : c));
  };

  const addNewCard = () => {
    setCards(prev => [...prev, {
      card_name: `Card ${prev.length + 1}`,
      is_active: false,
      template: "classic",
      team_template_id: null,
      primary_color: "",
      secondary_color: "",
      border_color: "",
      team_name: "",
      team_logo_url: "",
      signature_url: "",
    }]);
    setActiveIdx(cards.length);
  };

  const setAsActive = (idx) => {
    setCards(prev => prev.map((c, i) => ({ ...c, is_active: i === idx })));
  };

  const deleteCard = (idx) => {
    if (cards.length <= 1) return;
    const newCards = cards.filter((_, i) => i !== idx);
    if (newCards.every(c => !c.is_active)) newCards[0].is_active = true;
    setCards(newCards);
    setActiveIdx(Math.min(activeIdx, newCards.length - 1));
  };

  // ── Team Selection ──
  const league = SPORT_TO_LEAGUE[profile?.sport] || null;
  const allTeams = league ? (TEAM_TEMPLATES[league] || []) : Object.values(TEAM_TEMPLATES).flat();
  const filteredTeams = teamSearch
    ? allTeams.filter(t => t.name.toLowerCase().includes(teamSearch.toLowerCase()) || t.abbr.toLowerCase().includes(teamSearch.toLowerCase()))
    : allTeams;

  const selectTeam = (team) => {
    updateCurrent({
      team_template_id: team.id,
      team_name: team.name,
      primary_color: team.primary,
      secondary_color: team.secondary,
      border_color: team.border,
    });
  };

  const clearTeam = () => {
    updateCurrent({
      team_template_id: null,
      team_name: "",
      primary_color: "",
      secondary_color: "",
      border_color: "",
    });
  };

  // ── File Upload ──
  const handleUpload = async (file, field) => {
    const setter = field === "team_logo_url" ? setUploadingLogo : setUploadingSig;
    setter(true);
    try {
      const { file_url } = await db.integrations.Core.UploadFile({ file });
      updateCurrent({ [field]: file_url });
    } catch {
      toast.error("Upload failed");
    } finally {
      setter(false);
    }
  };

  // ── Save ──
  const handleSave = async () => {
    setSaving(true);
    try {
      for (const card of cards) {
        const payload = {
          user_email: userEmail,
          card_name: card.card_name || "Default",
          is_active: card.is_active,
          template: card.template || "classic",
          team_template_id: card.team_template_id || null,
          primary_color: card.primary_color || null,
          secondary_color: card.secondary_color || null,
          border_color: card.border_color || null,
          team_name: card.team_name || null,
          team_logo_url: card.team_logo_url || null,
          signature_url: card.signature_url || null,
          updated_date: new Date().toISOString(),
        };
        if (card.id) {
          await db.entities.CardCustomization.update(card.id, payload);
        } else {
          payload.created_date = new Date().toISOString();
          const created = await db.entities.CardCustomization.create(payload);
          card.id = created.id;
        }
      }
      toast.success("Card customization saved!");
      onSaved?.();
      closeModal();
    } catch (err) {
      console.error("Save failed:", err);
      toast.error("Failed to save customization");
    } finally {
      setSaving(false);
    }
  };

  // Build preview customization object
  const previewCustomization = {
    template: current.template || "classic",
    primary_color: current.primary_color || null,
    secondary_color: current.secondary_color || null,
    border_color: current.border_color || null,
    team_name: current.team_name || null,
    team_logo_url: current.team_logo_url || null,
    signature_url: current.signature_url || null,
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) closeModal(); }}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden p-0 rounded-2xl bg-gray-950 border-gray-800">
        <div className="flex flex-col lg:flex-row h-full max-h-[90vh]">
          {/* ═══ LEFT: Live Preview ═══ */}
          <div className="lg:w-[400px] flex-shrink-0 bg-gray-900 p-6 flex items-center justify-center overflow-y-auto">
            <div className="w-full max-w-[340px]">
              <ScoutCardDisplay
                profile={profile}
                topMetrics={topMetrics}
                allMetrics={allMetrics}
                statCount={statCount}
                narrative={narrative}
                headline={headline}
                achievements={achievements}
                bio={bio}
                customization={previewCustomization}
              />
            </div>
          </div>

          {/* ═══ RIGHT: Controls ═══ */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Palette className="w-5 h-5 text-orange-400" /> Customize Card
              </h2>
              <button onClick={() => closeModal()} className="text-gray-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ── Card Versions ── */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Card Versions</Label>
              <div className="flex flex-wrap gap-2">
                {cards.map((card, i) => (
                  <button key={i} onClick={() => setActiveIdx(i)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${i === activeIdx ? "bg-orange-500 text-black" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}>
                    {card.card_name || `Card ${i + 1}`}
                    {card.is_active && <span className="ml-1 text-[9px]">(Active)</span>}
                  </button>
                ))}
                <button onClick={addNewCard} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-800 text-gray-400 hover:bg-gray-700 border border-dashed border-gray-600">
                  + New Card
                </button>
              </div>
              <div className="flex items-center gap-3">
                <Input value={current.card_name || ""} onChange={(e) => updateCurrent({ card_name: e.target.value })}
                  placeholder="Card name" className="h-8 text-xs bg-gray-800 border-gray-700 text-white rounded-lg flex-1" />
                <div className="flex items-center gap-2">
                  <Label className="text-[10px] text-gray-500">Active</Label>
                  <Switch checked={current.is_active} onCheckedChange={() => setAsActive(activeIdx)} />
                </div>
                {cards.length > 1 && (
                  <button onClick={() => deleteCard(activeIdx)} className="text-red-400 hover:text-red-300 text-xs">Delete</button>
                )}
              </div>
            </div>

            {/* ── Template Style ── */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Card Style</Label>
              <div className="grid grid-cols-4 gap-2">
                {TEMPLATE_KEYS.map((key) => {
                  const t = CARD_TEMPLATES[key];
                  return (
                    <button key={key} onClick={() => updateCurrent({ template: key })}
                      className={`rounded-xl p-3 text-center transition-all border-2 ${current.template === key ? "border-orange-500 bg-gray-800" : "border-gray-800 bg-gray-900 hover:border-gray-600"}`}>
                      <p className="text-xs font-bold text-white">{t.name}</p>
                      <p className="text-[9px] text-gray-500 mt-0.5">{t.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Pick a Team ── */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Pick a Team {league && <span className="text-gray-600">({league})</span>}
                </Label>
                {current.team_template_id && (
                  <button onClick={clearTeam} className="text-xs text-gray-500 hover:text-white flex items-center gap-1">
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                )}
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                <Input value={teamSearch} onChange={(e) => setTeamSearch(e.target.value)}
                  placeholder="Search teams..." className="h-8 text-xs bg-gray-800 border-gray-700 text-white rounded-lg pl-8" />
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 max-h-[160px] overflow-y-auto pr-1">
                {filteredTeams.slice(0, 40).map((team) => (
                  <button key={team.id} onClick={() => selectTeam(team)}
                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-left transition-all ${current.team_template_id === team.id ? "ring-2 ring-orange-500 bg-gray-800" : "bg-gray-900 hover:bg-gray-800"}`}>
                    <div className="w-5 h-5 rounded-full flex-shrink-0" style={{ backgroundColor: team.primary, border: `2px solid ${team.border}` }} />
                    <span className="text-[10px] font-bold text-gray-300 truncate">{team.abbr}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Custom Colors ── */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Custom Colors</Label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] text-gray-500 block mb-1">Primary (BG)</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={current.primary_color || "#1a1a1a"}
                      onChange={(e) => updateCurrent({ primary_color: e.target.value, team_template_id: null })}
                      className="w-8 h-8 rounded-lg border border-gray-700 cursor-pointer bg-transparent" />
                    <Input value={current.primary_color || ""} onChange={(e) => updateCurrent({ primary_color: e.target.value, team_template_id: null })}
                      placeholder="#hex" className="h-7 text-[10px] bg-gray-800 border-gray-700 text-white rounded-lg flex-1" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 block mb-1">Accent</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={current.secondary_color || "#ef4444"}
                      onChange={(e) => updateCurrent({ secondary_color: e.target.value, team_template_id: null })}
                      className="w-8 h-8 rounded-lg border border-gray-700 cursor-pointer bg-transparent" />
                    <Input value={current.secondary_color || ""} onChange={(e) => updateCurrent({ secondary_color: e.target.value, team_template_id: null })}
                      placeholder="#hex" className="h-7 text-[10px] bg-gray-800 border-gray-700 text-white rounded-lg flex-1" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 block mb-1">Border</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={current.border_color || "#f87171"}
                      onChange={(e) => updateCurrent({ border_color: e.target.value, team_template_id: null })}
                      className="w-8 h-8 rounded-lg border border-gray-700 cursor-pointer bg-transparent" />
                    <Input value={current.border_color || ""} onChange={(e) => updateCurrent({ border_color: e.target.value, team_template_id: null })}
                      placeholder="#hex" className="h-7 text-[10px] bg-gray-800 border-gray-700 text-white rounded-lg flex-1" />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Team Info ── */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Team Info</Label>
              <Input value={current.team_name || ""} onChange={(e) => updateCurrent({ team_name: e.target.value })}
                placeholder="Team name (shown on card)" className="h-8 text-xs bg-gray-800 border-gray-700 text-white rounded-lg" />
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 cursor-pointer transition-colors text-xs text-gray-400 border border-gray-700">
                  {uploadingLogo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  Team Logo
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], "team_logo_url")} />
                </label>
                {current.team_logo_url && (
                  <div className="flex items-center gap-2">
                    <img src={current.team_logo_url} alt="logo" className="w-8 h-8 rounded-full object-cover border border-gray-600" />
                    <button onClick={() => updateCurrent({ team_logo_url: "" })} className="text-red-400 text-xs">Remove</button>
                  </div>
                )}
              </div>
            </div>

            {/* ── Signature ── */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Signature</Label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 cursor-pointer transition-colors text-xs text-gray-400 border border-gray-700">
                  {uploadingSig ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  Upload Signature
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], "signature_url")} />
                </label>
                {current.signature_url && (
                  <div className="flex items-center gap-2">
                    <img src={current.signature_url} alt="signature" className="h-6 opacity-70" />
                    <button onClick={() => updateCurrent({ signature_url: "" })} className="text-red-400 text-xs">Remove</button>
                  </div>
                )}
              </div>
              <p className="text-[10px] text-gray-600">Upload a PNG with transparent background for best results.</p>
            </div>

            {/* ── Save/Cancel ── */}
            <div className="flex gap-3 pt-3 border-t border-gray-800">
              <Button onClick={handleSave} disabled={saving}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-black font-bold rounded-xl h-10">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => closeModal()}
                className="rounded-xl h-10 border-gray-700 text-gray-400 hover:bg-gray-800">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
