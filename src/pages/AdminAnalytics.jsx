import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { db } from "@/api/db";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, Tooltip,
  XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend,
} from "recharts";
import { format, subDays, subWeeks, startOfWeek, startOfDay, getHours } from "date-fns";
import { TrendingUp, Users, FileText, DollarSign, Award, Activity } from "lucide-react";

// ── Shared chart tooltip ───────────────────────────────────────────────────
function ChartTip({ active, payload, label, unit = "" }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.value}{unit}
        </p>
      ))}
    </div>
  );
}

// ── KPI card ──────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, icon: Icon, color }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <p className="text-gray-500 text-xs uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-white text-xl font-bold">{value}</p>
      {sub && <p className="text-gray-600 text-xs mt-1">{sub}</p>}
    </div>
  );
}

const PIE_COLORS = ["#dc2626", "#2563eb", "#16a34a", "#d97706", "#9333ea", "#0891b2", "#db2777", "#65a30d"];

export default function AdminAnalytics() {
  const { data: profiles = [], isLoading: loadP } = useQuery({
    queryKey: ["analytics-profiles"],
    queryFn: () => db.entities.User.list("-created_at", 500),
  });

  const { data: posts = [], isLoading: loadPosts } = useQuery({
    queryKey: ["analytics-posts"],
    queryFn: () => db.entities.Post.list("-created_date", 500),
  });

  const { data: txns = [] } = useQuery({
    queryKey: ["analytics-txns"],
    queryFn: () => db.entities.Transaction.list("-created_date", 500),
  });

  const { data: follows = [] } = useQuery({
    queryKey: ["analytics-follows"],
    queryFn: () => db.entities.Follow.list(null, 500),
  });

  const loading = loadP || loadPosts;

  // ── User growth: new signups per week, last 12 weeks ──────────────────
  const userGrowthData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const weekStart = startOfWeek(subWeeks(new Date(), 11 - i));
      const weekEnd   = startOfWeek(subWeeks(new Date(), 10 - i));
      const count = profiles.filter(p => {
        const d = new Date(p.created_at);
        return d >= weekStart && d < weekEnd;
      }).length;
      return { label: format(weekStart, "MMM d"), count };
    });
  }, [profiles]);

  // ── Post volume: posts per day, last 30 days ──────────────────────────
  const postVolumeData = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const day = subDays(new Date(), 29 - i);
      const count = posts.filter(p =>
        startOfDay(new Date(p.created_date)).getTime() === startOfDay(day).getTime()
      ).length;
      return { label: format(day, "MMM d"), count };
    });
  }, [posts]);

  // ── Revenue by type ────────────────────────────────────────────────────
  const revenueData = useMemo(() => {
    const byWeek = {};
    txns.forEach(t => {
      const weekStart = format(startOfWeek(new Date(t.created_date)), "MMM d");
      if (!byWeek[weekStart]) byWeek[weekStart] = { label: weekStart, tip: 0, subscription: 0, ppv: 0 };
      const type = t.type || "tip";
      if (type === "tip") byWeek[weekStart].tip += t.amount || 0;
      else if (type === "subscription") byWeek[weekStart].subscription += t.amount || 0;
      else byWeek[weekStart].ppv += t.amount || 0;
    });
    return Object.values(byWeek).slice(-10);
  }, [txns]);

  // ── Sport distribution pie ─────────────────────────────────────────────
  const sportData = useMemo(() => {
    const counts = {};
    posts.forEach(p => { if (p.sport) counts[p.sport] = (counts[p.sport] || 0) + 1; });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));
  }, [posts]);

  // ── Top creators ───────────────────────────────────────────────────────
  const topCreators = useMemo(() => {
    const map = {};
    posts.forEach(p => {
      if (!map[p.author_email]) map[p.author_email] = {
        email: p.author_email, name: p.author_name, avatar: p.author_avatar,
        posts: 0, likes: 0,
      };
      map[p.author_email].posts++;
      map[p.author_email].likes += p.likes?.length || 0;
    });
    // Attach follower count
    const followerCounts = {};
    follows.forEach(f => { followerCounts[f.following_email] = (followerCounts[f.following_email] || 0) + 1; });
    return Object.values(map)
      .map(c => ({ ...c, followers: followerCounts[c.email] || 0 }))
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 10);
  }, [posts, follows]);

  // ── KPIs ───────────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const avgPostsPerUser = profiles.length ? (posts.length / profiles.length).toFixed(1) : 0;
    const oneWeekAgo = subDays(new Date(), 7);
    const activeUsers = new Set(posts.filter(p => new Date(p.created_date) > oneWeekAgo).map(p => p.author_email));
    const activePercent = profiles.length ? ((activeUsers.size / profiles.length) * 100).toFixed(1) : 0;

    const sportCounts = {};
    posts.forEach(p => { if (p.sport) sportCounts[p.sport] = (sportCounts[p.sport] || 0) + 1; });
    const topSport = Object.entries(sportCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

    const hourCounts = {};
    posts.forEach(p => {
      const h = getHours(new Date(p.created_date));
      hourCounts[h] = (hourCounts[h] || 0) + 1;
    });
    const peakHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    const peakLabel = peakHour !== undefined
      ? `${peakHour}:00–${peakHour}:59`
      : "—";

    const totalRevenue = txns.reduce((s, t) => s + (t.amount || 0), 0);

    return { avgPostsPerUser, activePercent, topSport, peakLabel, totalRevenue };
  }, [profiles, posts, txns]);

  if (loading) {
    return (
      <AdminLayout currentPage="AdminAnalytics">
        <div className="p-6 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-gray-900 border border-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentPage="AdminAnalytics">
      <div className="p-6 max-w-6xl mx-auto space-y-6">

        <div>
          <h1 className="text-xl font-bold text-white">Analytics</h1>
          <p className="text-gray-500 text-sm mt-0.5">Platform growth, engagement, and revenue</p>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <KpiCard label="Avg Posts/User"  value={kpis.avgPostsPerUser} sub="all time"                     icon={FileText}   color="text-blue-400" />
          <KpiCard label="Active This Week" value={`${kpis.activePercent}%`} sub="posted in last 7 days"   icon={Users}      color="text-green-400" />
          <KpiCard label="Top Sport"        value={kpis.topSport}        sub="by post count"               icon={Award}      color="text-amber-400" />
          <KpiCard label="Peak Hour"        value={kpis.peakLabel}       sub="most posts created"          icon={Activity}   color="text-purple-400" />
          <KpiCard label="Total Revenue"    value={`$${kpis.totalRevenue.toFixed(2)}`} sub="all time"      icon={DollarSign} color="text-emerald-400" />
        </div>

        {/* User growth */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-semibold text-white">User Growth — Last 12 Weeks</h2>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={userGrowthData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="label" tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip content={<ChartTip unit=" users" />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar dataKey="count" name="New Users" fill="#2563eb" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Post volume */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-4 h-4 text-green-400" />
            <h2 className="text-sm font-semibold text-white">Content Volume — Last 30 Days</h2>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={postVolumeData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="postGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#16a34a" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="label" tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip content={<ChartTip unit=" posts" />} cursor={{ stroke: "#16a34a", strokeWidth: 1, strokeDasharray: "4 4" }} />
              <Area dataKey="count" name="Posts" stroke="#16a34a" fill="url(#postGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue + Sport dist side by side */}
        <div className="grid lg:grid-cols-2 gap-4">

          {/* Revenue by week */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-semibold text-white">Revenue by Week</h2>
            </div>
            {revenueData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-gray-600 text-sm">No transaction data</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={revenueData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="label" tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTip unit="$" />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                  <Legend wrapperStyle={{ fontSize: 10, color: "#6b7280" }} />
                  <Bar dataKey="tip"          name="Tips"          fill="#16a34a" stackId="a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="subscription" name="Subscriptions" fill="#2563eb" stackId="a" />
                  <Bar dataKey="ppv"          name="PPV"           fill="#9333ea" stackId="a" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Sport distribution */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-semibold text-white">Posts by Sport</h2>
            </div>
            {sportData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-gray-600 text-sm">No sport data</div>
            ) : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={180}>
                  <PieChart>
                    <Pie
                      data={sportData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {sportData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v, n) => [`${v} posts`, n]} contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8, fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-1.5">
                  {sportData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-gray-400 text-xs truncate flex-1">{d.name}</span>
                      <span className="text-gray-500 text-xs">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Top creators leaderboard */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-semibold text-white">Top Creators by Engagement</h2>
          </div>
          {topCreators.length === 0 ? (
            <p className="text-gray-600 text-sm text-center py-8">No creator data available</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-500 uppercase tracking-wider text-[10px]">
                    <th className="text-left pb-3 pr-4 font-medium">#</th>
                    <th className="text-left pb-3 font-medium">Creator</th>
                    <th className="text-right pb-3 px-4 font-medium">Posts</th>
                    <th className="text-right pb-3 px-4 font-medium">Likes</th>
                    <th className="text-right pb-3 font-medium">Followers</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {topCreators.map((c, i) => (
                    <tr key={c.email} className="hover:bg-gray-800/40 transition-colors">
                      <td className="py-2.5 pr-4 text-gray-600 font-medium">{i + 1}</td>
                      <td className="py-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {c.avatar ? (
                              <img src={c.avatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-gray-400 text-[10px] font-bold">
                                {(c.name || c.email || "?")[0].toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-white font-medium truncate max-w-[160px]">{c.name || "—"}</p>
                            <p className="text-gray-500 truncate max-w-[160px]">{c.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-right text-gray-400">{c.posts}</td>
                      <td className="py-2.5 px-4 text-right text-gray-400">{c.likes}</td>
                      <td className="py-2.5 text-right text-gray-400">{c.followers}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </AdminLayout>
  );
}
