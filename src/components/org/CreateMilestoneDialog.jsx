import React, { useState } from "react";
import { db } from "@/api/db";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Award, Loader2 } from "lucide-react";
import { toast } from "sonner";

const MILESTONE_TYPES = [
  { value: "pr", label: "Personal Record" },
  { value: "recovery", label: "Recovery Milestone" },
  { value: "skill", label: "Skill Mastery" },
  { value: "general", label: "General Achievement" },
];

export default function CreateMilestoneDialog({ open, onClose, orgId, trainerEmail }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    athlete_email: "",
    title: "",
    description: "",
    milestone_type: "general",
  });
  const [saving, setSaving] = useState(false);

  const { data: athletes = [] } = useQuery({
    queryKey: ["org-athletes-milestone", orgId],
    queryFn: async () => {
      const members = await db.entities.OrgMember.filter({ organization_id: orgId });
      return members.filter(m => m.role === "athlete");
    },
    enabled: !!orgId && open,
  });

  const handleSave = async () => {
    if (!form.athlete_email || !form.title) return;
    setSaving(true);
    try {
      await db.entities.Milestone.create({
        organization_id: orgId,
        athlete_email: form.athlete_email,
        trainer_email: trainerEmail,
        title: form.title,
        description: form.description,
        milestone_type: form.milestone_type,
        media_urls: [],
      });

      // Auto-post to social feed as a milestone post
      const athlete = athletes.find(a => a.user_email === form.athlete_email);
      try {
        await db.entities.Post.create({
          author_email: trainerEmail,
          author_name: "Coach",
          content: `${athlete?.user_name || form.athlete_email} just hit a milestone: ${form.title}! ${form.description || ""}`.trim(),
          post_type: "milestone",
          category: "milestone",
          likes: [],
          views: 0,
          comments_count: 0,
          shares: 0,
        });
      } catch {
        // Social post is optional
      }

      qc.invalidateQueries({ queryKey: ["org-milestones"] });
      toast.success("Milestone created!");
      onClose();
      setForm({ athlete_email: "", title: "", description: "", milestone_type: "general" });
    } catch (err) {
      toast.error("Failed to create milestone");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-black flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" /> Create Milestone
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <Label className="text-sm font-semibold mb-1.5 block">Athlete *</Label>
            <Select value={form.athlete_email} onValueChange={v => setForm(f => ({ ...f, athlete_email: v }))}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select athlete" />
              </SelectTrigger>
              <SelectContent>
                {athletes.map(a => (
                  <SelectItem key={a.user_email} value={a.user_email}>
                    {a.user_name || a.user_email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm font-semibold mb-1.5 block">Title *</Label>
            <Input
              placeholder="e.g. New 40-yard dash PR"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="rounded-xl"
            />
          </div>
          <div>
            <Label className="text-sm font-semibold mb-1.5 block">Type</Label>
            <Select value={form.milestone_type} onValueChange={v => setForm(f => ({ ...f, milestone_type: v }))}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MILESTONE_TYPES.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm font-semibold mb-1.5 block">Description</Label>
            <Textarea
              placeholder="Details about this achievement..."
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="rounded-xl"
              rows={3}
            />
          </div>
          <Button
            onClick={handleSave}
            disabled={saving || !form.athlete_email || !form.title}
            className="w-full bg-gradient-to-r from-red-900 to-red-700 text-white rounded-xl font-bold"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Award className="w-4 h-4 mr-2" />}
            Create Milestone
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
