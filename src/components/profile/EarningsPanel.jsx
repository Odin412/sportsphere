import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { db } from "@/api/db";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DollarSign, TrendingUp, Heart, Users, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { format, formatDistanceToNow, subWeeks, startOfWeek, isWithinInterval } from "date-fns";

export default function EarningsPanel({ user }) {
  const { data: tips = [], isLoading: loadingTips } = useQuery({
    queryKey: ["my-tips-received", user?.email],
    queryFn: () => db.entities.Tip.filter({ recipient_email: user.email }, "-created_date", 50),
    enabled: !!user?.email,
    staleTime: 2 * 60 * 1000,
  });

  const { data: transactions = [], isLoading: loadingTx } = useQuery({
    queryKey: ["my-transactions-received", user?.email],
    queryFn: () => db.entities.Transaction.filter({ recipient_email: user.email }, "-created_date", 50),
    enabled: !!user?.email,
    staleTime: 2 * 60 * 1000,
  });

  const isLoading = loadingTips || loadingTx;

  const allEarnings = useMemo(() => (
    [...tips.map(t => ({ ...t, _type: "tip" })), ...transactions.map(t => ({ ...t, _type: "subscription" }))]
      .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
  ), [tips, transactions]);

  const totalEarnings = allEarnings.reduce((sum, e) => sum + (e.amount || 0), 0);

  const last30Days = allEarnings.filter(e =>
    new Date(e.created_date) > new Date(Date.now() - 30 * 24 * 3600 * 1000)
  );
  const last30Total = last30Days.reduce((sum, e) => sum + (e.amount || 0), 0);

  // Weekly chart data: last 8 weeks
  const weeklyData = useMemo(() => {
    const weeks = [];
    for (let i = 7; i >= 0; i--) {
      const start = startOfWeek(subWeeks(new Date(), i + 1));
      const end = startOfWeek(subWeeks(new Date(), i));
      const weekEarnings = allEarnings
        .filter(e => isWithinInterval(new Date(e.created_date), { start, end }))
        .reduce((sum, e) => sum + (e.amount || 0), 0);
      weeks.push({ week: format(start, "MMM d"), amount: weekEarnings });
    }
    return weeks;
  }, [allEarnings]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="text-xs font-semibold text-green-700">Total Earned</span>
          </div>
          <p className="text-2xl font-black text-green-800">${totalEarnings.toFixed(2)}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-2xl p-4 border border-blue-100">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-semibold text-blue-700">Last 30 Days</span>
          </div>
          <p className="text-2xl font-black text-blue-800">${last30Total.toFixed(2)}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-4 border border-purple-100">
          <div className="flex items-center gap-2 mb-1">
            <Heart className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-semibold text-purple-700">Supporters</span>
          </div>
          <p className="text-2xl font-black text-purple-800">
            {new Set(allEarnings.map(e => e.sender_email || e.buyer_email)).size}
          </p>
        </div>
      </div>

      {/* Weekly bar chart */}
      {allEarnings.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">Earnings — Last 8 Weeks</p>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={weeklyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: "#9ca3af" }} />
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} />
              <Tooltip
                formatter={(val) => [`$${val.toFixed(2)}`, "Earnings"]}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Bar dataKey="amount" fill="#16a34a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent transactions */}
      {allEarnings.length === 0 ? (
        <div className="text-center py-8 text-gray-400 border border-dashed border-gray-200 rounded-2xl">
          <DollarSign className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm font-medium">No earnings yet</p>
          <p className="text-xs mt-1">Enable subscriptions or donations to start earning</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
          <p className="text-sm font-semibold text-gray-700 px-4 py-3">Recent Transactions</p>
          {allEarnings.slice(0, 10).map((e, idx) => (
            <div key={e.id || idx} className="flex items-center gap-3 px-4 py-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                e._type === "tip" ? "bg-pink-100" : "bg-blue-100"
              }`}>
                {e._type === "tip"
                  ? <Heart className="w-3.5 h-3.5 text-pink-600" />
                  : <Users className="w-3.5 h-3.5 text-blue-600" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {e._type === "tip" ? "Tip" : "Subscription"} from{" "}
                  <span className="text-gray-600">{e.sender_name || e.buyer_name || "Anonymous"}</span>
                </p>
                {e.message && <p className="text-xs text-gray-500 truncate">{e.message}</p>}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-black text-green-700">+${(e.amount || 0).toFixed(2)}</p>
                <p className="text-xs text-gray-400">{formatDistanceToNow(new Date(e.created_date), { addSuffix: true })}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
