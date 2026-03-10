import React, { useState, useEffect } from "react";
import { db } from "@/api/db";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";

const STATUS_STYLES = {
  present: "bg-green-500/20 text-green-400 border-green-500/40",
  absent: "bg-red-500/20 text-red-400 border-red-500/40",
  late: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
};

export default function AttendanceDialog({ open, onClose, session, orgId }) {
  const qc = useQueryClient();
  const [attendance, setAttendance] = useState([]);
  const [saving, setSaving] = useState(false);

  const { data: members = [] } = useQuery({
    queryKey: ["org-members-attendance", orgId],
    queryFn: async () => {
      const all = await db.entities.OrgMember.filter({ organization_id: orgId });
      return all.filter(m => m.role === "athlete");
    },
    enabled: !!orgId && open,
  });

  // Initialize attendance from session data or from member list
  useEffect(() => {
    if (!members.length) return;
    const existing = session?.attendance || [];
    const merged = members.map(m => {
      const found = existing.find(a => a.email === m.user_email);
      return {
        email: m.user_email,
        name: m.user_name || m.user_email,
        avatar: m.avatar_url,
        status: found?.status || "present",
      };
    });
    setAttendance(merged);
  }, [members, session]);

  const toggleStatus = (email) => {
    setAttendance(prev => prev.map(a => {
      if (a.email !== email) return a;
      const next = a.status === "present" ? "absent" : a.status === "absent" ? "late" : "present";
      return { ...a, status: next };
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const attendanceData = attendance.map(a => ({
        email: a.email,
        status: a.status,
      }));
      await db.entities.TrainingSession.update(session.id, {
        attendance: attendanceData,
      });
      qc.invalidateQueries({ queryKey: ["org-sessions-all"] });
      toast.success("Attendance saved!");
      onClose();
    } catch (err) {
      toast.error("Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  const presentCount = attendance.filter(a => a.status === "present").length;
  const lateCount = attendance.filter(a => a.status === "late").length;
  const absentCount = attendance.filter(a => a.status === "absent").length;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-black">Take Attendance</DialogTitle>
          <p className="text-sm text-gray-500">{session?.title} · Tap to cycle: present → absent → late</p>
        </DialogHeader>

        {/* Summary bar */}
        <div className="flex gap-3 text-xs font-bold py-2">
          <span className="text-green-400">{presentCount} present</span>
          <span className="text-yellow-400">{lateCount} late</span>
          <span className="text-red-400">{absentCount} absent</span>
        </div>

        {/* Athlete list */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
          {attendance.map(a => (
            <button
              key={a.email}
              onClick={() => toggleStatus(a.email)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${STATUS_STYLES[a.status]}`}
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src={a.avatar} />
                <AvatarFallback className="bg-gray-700 text-white text-xs font-bold">
                  {a.name?.[0]?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <span className="flex-1 text-left text-sm font-semibold">{a.name}</span>
              {a.status === "present" && <CheckCircle className="w-5 h-5" />}
              {a.status === "absent" && <XCircle className="w-5 h-5" />}
              {a.status === "late" && <Clock className="w-5 h-5" />}
            </button>
          ))}
          {attendance.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-6">No athletes in this organization</p>
          )}
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-gradient-to-r from-red-900 to-red-700 text-white rounded-xl font-bold mt-3"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Save Attendance
        </Button>
      </DialogContent>
    </Dialog>
  );
}
