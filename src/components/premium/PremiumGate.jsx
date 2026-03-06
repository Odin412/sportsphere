import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Sparkles, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { useAuth } from "@/lib/AuthContext";

/**
 * PremiumGate — renders children if user is premium, otherwise shows upsell.
 * Usage:
 *   <PremiumGate feature="AI Coach"><Coach /></PremiumGate>
 *   or standalone (no children) as a full-page block:
 *   <PremiumGate feature="AI Coach" />
 */
export default function PremiumGate({ feature = "AI features", children }) {
  const { user } = useAuth();

  const isPremium =
    user?.is_premium &&
    user?.premium_expires &&
    new Date(user.premium_expires) > new Date();

  // If user is premium, render children (or nothing if used standalone)
  if (isPremium) {
    return children ? <>{children}</> : null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
      <Card className="max-w-2xl bg-slate-900/60 backdrop-blur-xl border-amber-500/30">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-amber-500/50 animate-pulse">
            <Crown className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-3xl font-black bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent mb-3">
            Premium Feature
          </h1>

          <p className="text-slate-400 text-lg mb-8">
            Upgrade to Premium to unlock <span className="text-white font-semibold">{feature}</span> and supercharge your sports journey
          </p>

          <div className="bg-slate-800/60 rounded-2xl p-6 mb-8">
            <h3 className="text-white font-bold mb-4 flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Premium Benefits
            </h3>
            <div className="space-y-3 text-left">
              {[
                "AI-powered coaching and training advice",
                "Personalized content recommendations",
                "Advanced analytics and insights",
                "AI content creator assistant",
                "Expert advice from top athletes",
                "Priority support"
              ].map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-amber-400" />
                  </div>
                  <span className="text-slate-300 text-sm">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Link to={createPageUrl("Premium")}>
              <Button className="w-full bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 hover:from-amber-500 hover:via-orange-500 hover:to-amber-500 text-white text-lg py-6 shadow-xl shadow-amber-500/50">
                <Crown className="w-5 h-5 mr-2" />
                Upgrade to Premium — $9.99/month
              </Button>
            </Link>
            <Link to={createPageUrl("Feed")}>
              <Button variant="outline" className="w-full border-slate-700 text-slate-400">
                Back to Feed
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
