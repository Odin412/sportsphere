import React, { useState } from "react";
import { db } from "@/api/db";
import { useQuery } from "@tanstack/react-query";
import { FileText, Loader2, Send, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function ProgressReportGenerator({ orgId, coachEmail }) {
  const [selectedAthlete, setSelectedAthlete] = useState("");
  const [period, setPeriod] = useState("30"); // days
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState(null);

  const { data: athletes = [] } = useQuery({
    queryKey: ["org-athletes-report", orgId],
    queryFn: async () => {
      const members = await db.entities.OrgMember.filter({ organization_id: orgId });
      return members.filter(m => m.role === "athlete");
    },
    enabled: !!orgId,
  });

  const { data: reports = [], refetch: refetchReports } = useQuery({
    queryKey: ["progress-reports", orgId],
    queryFn: () => db.entities.ProgressReport.filter({ organization_id: orgId }),
    enabled: !!orgId,
  });

  const generateReport = async () => {
    if (!selectedAthlete) return;
    setGenerating(true);
    try {
      const athlete = athletes.find(a => a.user_email === selectedAthlete);
      const periodDays = parseInt(period);
      const periodStart = new Date(Date.now() - periodDays * 86400000).toISOString();
      const periodEnd = new Date().toISOString();

      // Fetch athlete data
      const profiles = await db.entities.SportProfile.filter({ user_email: selectedAthlete });
      const profile = profiles[0];
      let stats = [];
      if (profile) {
        const allStats = await db.entities.StatEntry.filter({ sport_profile_id: profile.id });
        stats = allStats.filter(s => new Date(s.date) >= new Date(periodStart));
      }

      const sessions = await db.entities.TrainingSession.filter({ organization_id: orgId });
      const athleteSessions = sessions.filter(s =>
        s.attendees?.includes(selectedAthlete) &&
        new Date(s.scheduled_date) >= new Date(periodStart)
      );

      const milestones = await db.entities.Milestone.filter({ organization_id: orgId });
      const athleteMilestones = milestones.filter(m =>
        m.athlete_email === selectedAthlete &&
        new Date(m.created_at) >= new Date(periodStart)
      );

      // Attendance
      const attended = athleteSessions.filter(s => {
        const att = s.attendance?.find(a => a.email === selectedAthlete);
        return att?.status === "present";
      }).length;

      // Generate AI narrative
      const prompt = `Generate a brief, encouraging progress report for a youth athlete.

Athlete: ${athlete?.user_name || selectedAthlete}
Sport: ${profile?.sport || "Unknown"}
Period: Last ${periodDays} days

Stats logged: ${stats.length} entries
${stats.slice(0, 5).map(s => `- ${s.date}: ${(s.metrics || []).map(m => `${m.name}: ${m.value}${m.unit}`).join(', ')}`).join('\n')}

Sessions: ${athleteSessions.length} total, ${attended} attended
Milestones: ${athleteMilestones.map(m => m.title).join(', ') || 'None'}

Write 2-3 paragraphs covering: performance trends, attendance, areas of improvement, and encouragement. Keep it parent-friendly.`;

      let aiSummary = "";
      try {
        aiSummary = await db.ai.invoke({ prompt, system: "You are a youth sports coach writing a brief progress report for parents. Be positive, specific, and constructive." });
        if (typeof aiSummary === "object") aiSummary = aiSummary.content || aiSummary.text || JSON.stringify(aiSummary);
      } catch {
        aiSummary = "AI summary unavailable. See stats below.";
      }

      const reportData = {
        stats_count: stats.length,
        sessions_count: athleteSessions.length,
        attended_count: attended,
        milestones: athleteMilestones.map(m => ({ title: m.title, type: m.milestone_type })),
        top_metrics: stats.slice(0, 3).flatMap(s => s.metrics || []).slice(0, 6),
      };

      const created = await db.entities.ProgressReport.create({
        organization_id: orgId,
        athlete_email: selectedAthlete,
        trainer_email: coachEmail,
        report_data: reportData,
        period_start: periodStart,
        period_end: periodEnd,
        ai_summary: aiSummary,
      });

      setReport(created);
      refetchReports();
      toast.success("Progress report generated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate report");
    } finally {
      setGenerating(false);
    }
  };

  const shareWithParent = async (rpt) => {
    try {
      const athlete = athletes.find(a => a.user_email === rpt.athlete_email);
      // Find parent members linked to this athlete
      const members = await db.entities.OrgMember.filter({ organization_id: orgId });
      const parents = members.filter(m => m.role === "parent" && m.athlete_emails?.includes(rpt.athlete_email));
      for (const parent of parents) {
        await db.entities.Notification.create({
          recipient_email: parent.user_email,
          actor_email: coachEmail,
          actor_name: "Coach",
          type: "progress_report",
          message: `New progress report for ${athlete?.user_name || rpt.athlete_email}`,
          is_read: false,
        });
      }
      toast.success(parents.length > 0 ? "Shared with parent(s)!" : "No linked parents found");
    } catch {
      toast.error("Failed to share");
    }
  };

  return (
    <div className="space-y-5">
      {/* Generator */}
      <div className="bg-gray-800 rounded-xl p-4 space-y-3">
        <h3 className="text-white font-bold text-sm flex items-center gap-2">
          <FileText className="w-4 h-4 text-red-400" /> Generate Progress Report
        </h3>
        <div className="grid sm:grid-cols-3 gap-3">
          <Select value={selectedAthlete} onValueChange={setSelectedAthlete}>
            <SelectTrigger className="rounded-xl bg-gray-900 border-gray-700 text-white">
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
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="rounded-xl bg-gray-900 border-gray-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={generateReport}
            disabled={!selectedAthlete || generating}
            className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileText className="w-4 h-4 mr-2" />}
            Generate
          </Button>
        </div>
      </div>

      {/* Latest generated report */}
      {report && (
        <div className="bg-gray-800 rounded-xl p-4 border border-green-800/50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-green-400 font-bold text-sm">Report Generated</h4>
            <Button
              size="sm"
              onClick={() => shareWithParent(report)}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs gap-1"
            >
              <Send className="w-3 h-3" /> Share with Parent
            </Button>
          </div>
          <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">{report.ai_summary}</p>
        </div>
      )}

      {/* Past reports */}
      {reports.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Past Reports</h3>
          {reports.slice(0, 10).map(r => (
            <div key={r.id} className="bg-gray-800 rounded-xl p-3 flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-semibold">{r.athlete_email}</p>
                <p className="text-gray-500 text-xs flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(r.period_start).toLocaleDateString()} — {new Date(r.period_end).toLocaleDateString()}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => shareWithParent(r)}
                className="rounded-xl text-xs border-gray-600 text-gray-300"
              >
                <Send className="w-3 h-3 mr-1" /> Share
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
