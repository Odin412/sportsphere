import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { db } from "@/api/db";
import AdminLayout from "@/components/admin/AdminLayout";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  Users, FileText, Radio, ShieldAlert, DollarSign,
  TrendingUp, AlertCircle, UserPlus, ExternalLink,
} from "lucide-react";
import { format, subDays, startOfDay, isToday } from "date-fns";

// ── Metric card ────────────────────────────────────────────────────────────
function MetricCard({ label, value, sub, icon: Icon, color, loading, pulse }) {
  const colors = {
    blue:   { bg: "bg-blue-950/40",   border: "border-blue-800/40",   icon: "text-blue-400",   val: "text-blue-300"   },
    green:  { bg: "bg-green-950/40",  border: "border-green-800/40",  icon: "text-green-400",  val: "text-green-300"  },
    red:    { bg: "bg-red-950/40",    border: "border-red-800/40",    icon: "text-red-400",    val: "text-red-300"    },
    amber:  { bg: "bg-amber-950/40",  border: "border-amber-800/40",  icon: "text-amber-400",  val: "text-amber-300"  },
    purple: { bg: "bg-purple-950/40", border: "border-purple-800/40", icon: "text-purple-400", val: "text-purple-300" },
  };
  const c = colors[color] || colors.blue;

  return (
    <div className={`rounded-xl border ${c.bg} ${c.border} p-4`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
          {loading ? (
            <div className="h-8 w-20 bg-gray-800 rounded animate-pulse" />
          ) : (
            <p className={`text-2xl font-bold ${c.val}`}>{value}</p>
          )}
          {sub && <p className="text-gray-600 text-xs mt-1">{sub}</p>}
        </div>
        <div className={`${c.icon} opacity-70 relative`}>
          <Icon className="w-5 h-5" />
          {pulse && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Custom tooltip for chart ───────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs">
      <p className="text-gray-400 mb-1">{label}</p>
      <p className="text-white font-semibold">{payload[0].value} posts</p>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function Admin() {
  const { data: allProfiles = [], isLoading: profilesLoading } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: () => db.entities.User.list("-created_at", 500),
  });

  const { data: allPosts = [], isLoading: postsLoading } = useQuery({
    queryKey: ["admin-posts"],
    queryFn: () => db.entities.Post.list("-created_date", 200),
  });

  const { data: allStreams = [] } = useQuery({
    queryKey: ["admin-streams"],
    queryFn: () => db.entities.LiveStream.filter({ status: "live" }),
    refetchInterval: 30000,
  });

  const { data: allFlags = [] } = useQuery({
    queryKey: ["admin-flags"],
    queryFn: () => db.entities.ModerationFlag.list("-created_date", 50),
  });

  const { data: allTxns = [] } = useQuery({
    queryKey: ["admin-txns"],
    queryFn: () => db.entities.Transaction.list("-created_date", 200),
  });

  const { data: allReports = [] } = useQuery({
    queryKey: ["admin-reports"],
    queryFn: () => db.entities.Report.list("-created_date", 20),
  });

  // ── Derived metrics ──────────────────────────────────────────────────────
  const postsToday = useMemo(
    () => allPosts.filter(p => isToday(new Date(p.created_date))).length,
    [allPosts]
  );

  const pendingFlags = useMemo(
    () => allFlags.filter(f => f.status === "pending"),
    [allFlags]
  );

  const revenueMTD = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return allTxns
      .filter(t => new Date(t.created_date) >= startOfMonth)
      .reduce((sum, t) => sum + (t.amount || 0), 0);
  }, [allTxns]);

  const newUsersToday = useMemo(
    () => allProfiles.filter(p => isToday(new Date(p.created_at))),
    [allProfiles]
  );

  // ── 14-day bar chart data ────────────────────────────────────────────────
  const chartData = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const day = subDays(new Date(), 13 - i);
      const label = format(day, "MMM d");
      const count = allPosts.filter(p =>
        startOfDay(new Date(p.created_date)).getTime() === startOfDay(day).getTime()
      ).length;
      return { label, count };
    });
  }, [allPosts]);

  const loading = profilesLoading || postsLoading;

  return (
    <AdminLayout currentPage="Admin">
      <div className="p-6 max-w-6xl mx-auto space-y-6">

        {/* Page title */}
        <div>
          <h1 className="text-xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Platform overview and key metrics</p>
        </div>

        {/* ── Metric cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <MetricCard
            label="Total Users"
            value={loading ? "—" : allProfiles.length.toLocaleString()}
            sub={`${newUsersToday.length} joined today`}
            icon={Users}
            color="blue"
            loading={loading}
          />
          <MetricCard
            label="Posts Today"
            value={loading ? "—" : postsToday.toLocaleString()}
            sub={`${allPosts.length} total`}
            icon={FileText}
            color="green"
            loading={loading}
          />
          <MetricCard
            label="Live Streams"
            value={allStreams.length.toLocaleString()}
            sub="active now"
            icon={Radio}
            color="red"
            pulse={allStreams.length > 0}
          />
          <MetricCard
            label="Pending Flags"
            value={pendingFlags.length.toLocaleString()}
            sub="need review"
            icon={ShieldAlert}
            color="amber"
          />
          <MetricCard
            label="Revenue MTD"
            value={`$${revenueMTD.toFixed(2)}`}
            sub="this month"
            icon={DollarSign}
            color="purple"
          />
        </div>

        {/* ── Charts + Side panels ── */}
        <div className="grid lg:grid-cols-[1fr_320px] gap-4">

          {/* Activity chart */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-gray-400" />
              <h2 className="text-sm font-semibold text-white">Post Activity — Last 14 Days</h2>
            </div>
            {postsLoading ? (
              <div className="h-48 bg-gray-800 rounded-lg animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "#6b7280", fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#6b7280", fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                  <Bar dataKey="count" fill="#dc2626" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* New users today */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
            <div className="flex items-center gap-2 mb-4">
              <UserPlus className="w-4 h-4 text-gray-400" />
              <h2 className="text-sm font-semibold text-white">New Users Today</h2>
              {newUsersToday.length > 0 && (
                <span className="ml-auto text-xs bg-green-900/40 text-green-400 border border-green-800/40 px-2 py-0.5 rounded-full font-medium">
                  {newUsersToday.length}
                </span>
              )}
            </div>
            {newUsersToday.length === 0 ? (
              <p className="text-gray-600 text-sm text-center py-8">No new signups today</p>
            ) : (
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                {newUsersToday.map(u => (
                  <div key={u.id} className="flex items-center gap-3 py-1">
                    <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {u.avatar_url ? (
                        <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-gray-400 text-xs font-bold">
                          {(u.full_name || u.email || "?")[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-xs font-medium truncate">{u.full_name || "—"}</p>
                      <p className="text-gray-500 text-[10px] truncate">{u.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Pending flags + Recent reports ── */}
        <div className="grid lg:grid-cols-2 gap-4">

          {/* Pending flags */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-semibold text-white">Pending Flags</h2>
                {pendingFlags.length > 0 && (
                  <span className="text-xs bg-amber-900/40 text-amber-400 border border-amber-800/40 px-2 py-0.5 rounded-full font-medium">
                    {pendingFlags.length}
                  </span>
                )}
              </div>
              <Link
                to={createPageUrl("ModerationQueue")}
                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
              >
                View all <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
            {pendingFlags.length === 0 ? (
              <p className="text-gray-600 text-sm text-center py-6">No pending flags</p>
            ) : (
              <div className="space-y-2">
                {pendingFlags.slice(0, 5).map(flag => (
                  <div key={flag.id} className="flex items-start gap-3 p-2.5 bg-gray-800/50 rounded-lg">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-xs font-medium truncate">
                        {flag.reason || "No reason provided"}
                      </p>
                      <p className="text-gray-500 text-[10px] mt-0.5">
                        {flag.flagged_by_email || "Anonymous"} · {flag.flag_type || "general"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent reports */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
            <div className="flex items-center gap-2 mb-4">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <h2 className="text-sm font-semibold text-white">Recent Reports</h2>
            </div>
            {allReports.length === 0 ? (
              <p className="text-gray-600 text-sm text-center py-6">No reports</p>
            ) : (
              <div className="space-y-2">
                {allReports.slice(0, 5).map(report => (
                  <div key={report.id} className="flex items-start gap-3 p-2.5 bg-gray-800/50 rounded-lg">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-xs font-medium truncate">
                        {report.reason || "Reported content"}
                      </p>
                      <p className="text-gray-500 text-[10px] mt-0.5">
                        {report.reporter_email || "Anonymous"} · {report.type || "post"}
                      </p>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium flex-shrink-0 ${
                      report.status === "resolved"
                        ? "bg-green-900/40 text-green-400"
                        : "bg-gray-700 text-gray-400"
                    }`}>
                      {report.status || "open"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
