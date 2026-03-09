import React, { useState, useEffect, useRef, useCallback } from "react";
import { db } from "@/api/db";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import ScoutCardDisplay from "@/components/propath/ScoutCardDisplay";

export default function ScoutCard() {
  const urlParams = new URLSearchParams(window.location.search);
  const targetEmail = urlParams.get("email");

  const [currentUser, setCurrentUser] = useState(null);
  const [narrative, setNarrative] = useState(null);
  const [loadingNarrative, setLoadingNarrative] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", role: "", email: "", message: "" });
  const [sendingContact, setSendingContact] = useState(false);
  const cardWrapperRef = useRef(null);

  useEffect(() => {
    db.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  // Track profile view for logged-in visitors
  useEffect(() => {
    if (currentUser && targetEmail && currentUser.email !== targetEmail) {
      db.entities.ProfileView.create({
        athlete_email: targetEmail,
        viewer_email: currentUser.email,
        viewer_role: "fan",
        created_date: new Date().toISOString(),
      }).catch(() => {});
    }
  }, [currentUser, targetEmail]);

  const { data: profiles = [] } = useQuery({
    queryKey: ["scout-card-profile", targetEmail],
    queryFn: () => db.entities.SportProfile.filter({ user_email: targetEmail }),
    enabled: !!targetEmail,
  });

  const { data: statEntries = [] } = useQuery({
    queryKey: ["scout-card-stats", targetEmail],
    queryFn: () => db.entities.StatEntry.filter({ user_email: targetEmail }, "-date", 100),
    enabled: !!targetEmail,
  });

  const { data: cardCustomizations = [] } = useQuery({
    queryKey: ["scout-card-customization", targetEmail],
    queryFn: () => db.entities.CardCustomization.filter({ user_email: targetEmail }),
    enabled: !!targetEmail,
  });
  const activeCustomization = cardCustomizations.find((c) => c.is_active) || cardCustomizations[0] || null;

  const profile = profiles[0];

  // Compute all metrics from stat entries
  const metricBests = {};
  statEntries.forEach((entry) => {
    (entry.metrics || []).forEach((m) => {
      if (!metricBests[m.name] || m.value > metricBests[m.name].value) {
        metricBests[m.name] = { value: m.value, unit: m.unit || "" };
      }
    });
  });
  const topMetrics = Object.entries(metricBests)
    .map(([name, { value, unit }]) => ({ name, value, unit }))
    .slice(0, 3);

  // Generate AI narrative once profile + stats are loaded
  useEffect(() => {
    if (!profile || loadingNarrative || narrative) return;
    if (!topMetrics.length && !profile.achievements?.length) return;

    setLoadingNarrative(true);
    db.ai.invoke({
      prompt: `Write a 2-sentence recruiting scout narrative for this athlete.
Name: ${profile.user_name || "Athlete"}
Sport: ${profile.sport || "Unknown"}
Position: ${profile.position || "N/A"}
Level: ${profile.level || "N/A"}
Years experience: ${profile.years_experience || "N/A"}
Location: ${profile.location || "N/A"}
Top stats: ${JSON.stringify(topMetrics)}
Achievements: ${(profile.achievements || []).join(", ") || "None listed"}
Bio: ${profile.bio || ""}

Be specific. Use active voice. Highlight what makes this athlete stand out. Return only the narrative text.`,
      schema: {
        type: "object",
        properties: {
          headline: { type: "string" },
          narrative: { type: "string" },
        },
      },
    })
      .then((res) => setNarrative(res))
      .catch(() => {})
      .finally(() => setLoadingNarrative(false));
  }, [profile, statEntries.length]);

  const handleShare = useCallback(() => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: `${profile?.user_name} Scout Card`, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => toast.success("Scout Card link copied!"));
    }
  }, [profile]);

  const handleDownload = useCallback(async () => {
    if (!cardWrapperRef.current) return;
    try {
      toast.info("Generating card image...");
      const cardEl = cardWrapperRef.current.querySelector("[data-card-capture]") || cardWrapperRef.current;
      const canvas = await html2canvas(cardEl, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(profile?.user_name || "athlete").replace(/\s+/g, "-").toLowerCase()}-scout-card.png`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Card saved!");
    } catch (err) {
      console.error("Download failed:", err);
      toast.error("Failed to save card image");
    }
  }, [profile]);

  const handleContact = async () => {
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSendingContact(true);
    try {
      await db.entities.Notification.create({
        recipient_email: targetEmail,
        type: "message",
        message: `Recruiter contact from ${contactForm.name} (${contactForm.role || "Scout/Coach"}): ${contactForm.message}`,
        actor_email: contactForm.email,
        actor_name: contactForm.name,
        is_read: false,
      });
      toast.success("Message sent to athlete!");
      setShowContact(false);
      setContactForm({ name: "", role: "", email: "", message: "" });
    } catch {
      toast.error("Failed to send message");
    } finally {
      setSendingContact(false);
    }
  };

  if (!targetEmail) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-5xl mb-4">&#127183;</p>
        <h2 className="text-white font-bold text-xl">No athlete selected</h2>
        <p className="text-gray-400 text-sm mt-2">Use a Scout Card link shared by an athlete.</p>
        <Link to={createPageUrl("GetNoticed")}>
          <Button className="mt-6 bg-red-600 hover:bg-red-700 text-white rounded-xl">Browse Athletes</Button>
        </Link>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Back + header */}
      <div className="flex items-center gap-3">
        <Link to={createPageUrl("GetNoticed")} className="p-2 rounded-xl hover:bg-gray-800 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-400" />
        </Link>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-red-400" />
          <span className="text-white font-black text-lg">ProPath Scout Card</span>
          {statEntries.length > 0 && (
            <Badge className="bg-green-900/50 text-green-400 border border-green-700 text-xs">
              Verified
            </Badge>
          )}
        </div>
      </div>

      {/* Scout Card */}
      <div ref={cardWrapperRef}>
        <ScoutCardDisplay
          profile={profile}
          topMetrics={topMetrics}
          allMetrics={metricBests}
          headline={narrative?.headline}
          narrative={narrative?.narrative}
          achievements={profile.achievements}
          bio={profile.bio}
          statCount={statEntries.length}
          onContact={() => setShowContact(true)}
          onShare={handleShare}
          onDownload={handleDownload}
          compact={false}
          customization={activeCustomization}
        />
      </div>

      {/* AI narrative loading */}
      {loadingNarrative && (
        <div className="flex items-center gap-2 text-gray-500 text-sm justify-center">
          <Loader2 className="w-4 h-4 animate-spin" />
          Generating scout narrative...
        </div>
      )}

      {/* Contact Dialog */}
      <Dialog open={showContact} onOpenChange={setShowContact}>
        <DialogContent className="max-w-sm rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-black">Contact {profile.user_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Your name *"
              value={contactForm.name}
              onChange={(e) => setContactForm((f) => ({ ...f, name: e.target.value }))}
              className="rounded-xl"
            />
            <Input
              placeholder="Your role (Coach, Scout, Agent...)"
              value={contactForm.role}
              onChange={(e) => setContactForm((f) => ({ ...f, role: e.target.value }))}
              className="rounded-xl"
            />
            <Input
              type="email"
              placeholder="Your email *"
              value={contactForm.email}
              onChange={(e) => setContactForm((f) => ({ ...f, email: e.target.value }))}
              className="rounded-xl"
            />
            <Textarea
              placeholder="Your message *"
              value={contactForm.message}
              onChange={(e) => setContactForm((f) => ({ ...f, message: e.target.value }))}
              className="rounded-xl min-h-[100px]"
            />
            <Button
              onClick={handleContact}
              disabled={sendingContact}
              className="w-full bg-gradient-to-r from-red-900 to-red-700 text-white rounded-xl font-bold"
            >
              {sendingContact ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Send Message
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
