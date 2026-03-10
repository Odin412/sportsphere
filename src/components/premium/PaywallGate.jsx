import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Zap, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import useSubscriptionTier from "@/hooks/useSubscriptionTier";

const TIER_INFO = {
  pro_scout: {
    name: "Pro Scout",
    price: "$9.99/mo",
    icon: Crown,
    color: "amber",
    gradient: "from-amber-600 via-orange-600 to-amber-600",
  },
  elite: {
    name: "Elite",
    price: "$24.99/mo",
    icon: Zap,
    color: "purple",
    gradient: "from-purple-600 via-indigo-600 to-purple-600",
  },
};

const TIER_BENEFITS = {
  pro_scout: [
    "AI-powered highlight reels",
    "Advanced recruiting exposure",
    "Detailed scout analytics",
    "Scout Card PDF download",
    "AI Coach access",
    "Priority placement in discovery",
  ],
  elite: [
    "Everything in Pro Scout",
    "Unlimited video vault storage",
    "Priority AI game recaps",
    "Advanced stat trend predictions",
    "Priority support",
  ],
};

/**
 * PaywallGate — tier-aware feature gate.
 *
 * Usage:
 *   <PaywallGate requiredTier="pro_scout" feature="AI Highlights">
 *     <ProtectedContent />
 *   </PaywallGate>
 *
 * Props:
 *   requiredTier - "pro_scout" | "elite"
 *   feature      - human-readable feature name for the upsell message
 *   inline       - if true, renders a compact inline card instead of full-page block
 *   children     - content to render if user has access
 */
export default function PaywallGate({ requiredTier = "pro_scout", feature = "this feature", inline = false, children }) {
  const { tier, isPro, isElite } = useSubscriptionTier();

  const hasAccess =
    requiredTier === "pro_scout" ? isPro :
    requiredTier === "elite" ? isElite :
    true;

  if (hasAccess) {
    return children ? <>{children}</> : null;
  }

  const info = TIER_INFO[requiredTier] || TIER_INFO.pro_scout;
  const benefits = TIER_BENEFITS[requiredTier] || TIER_BENEFITS.pro_scout;
  const Icon = info.icon;

  if (inline) {
    return (
      <Card className={`bg-slate-900/60 border-${info.color}-500/30`}>
        <CardContent className="p-4 flex items-center gap-4">
          <div className={`w-10 h-10 bg-gradient-to-br ${info.gradient} rounded-xl flex items-center justify-center flex-shrink-0`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white font-semibold">
              {info.name} required
            </p>
            <p className="text-xs text-slate-400 truncate">
              Upgrade to unlock {feature}
            </p>
          </div>
          <Link to={createPageUrl("Premium")}>
            <Button size="sm" className={`bg-gradient-to-r ${info.gradient} text-white text-xs`}>
              Upgrade
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
      <Card className={`max-w-2xl bg-slate-900/60 backdrop-blur-xl border-${info.color}-500/30`}>
        <CardContent className="p-8 text-center">
          <div className={`w-20 h-20 bg-gradient-to-br ${info.gradient} rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-${info.color}-500/50`}>
            <Icon className="w-10 h-10 text-white" />
          </div>

          <h1 className={`text-3xl font-black bg-gradient-to-r from-${info.color}-400 via-orange-400 to-${info.color}-500 bg-clip-text text-transparent mb-3`}>
            {info.name} Feature
          </h1>

          <p className="text-slate-400 text-lg mb-8">
            Upgrade to {info.name} to unlock <span className="text-white font-semibold">{feature}</span>
          </p>

          <div className="bg-slate-800/60 rounded-2xl p-6 mb-8">
            <h3 className="text-white font-bold mb-4 flex items-center justify-center gap-2">
              <Icon className={`w-5 h-5 text-${info.color}-400`} />
              {info.name} Benefits
            </h3>
            <div className="space-y-3 text-left">
              {benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full bg-${info.color}-500/20 flex items-center justify-center flex-shrink-0`}>
                    <Check className={`w-3 h-3 text-${info.color}-400`} />
                  </div>
                  <span className="text-slate-300 text-sm">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Link to={createPageUrl("Premium")}>
              <Button className={`w-full bg-gradient-to-r ${info.gradient} hover:opacity-90 text-white text-lg py-6 shadow-xl shadow-${info.color}-500/50`}>
                <Icon className="w-5 h-5 mr-2" />
                Upgrade to {info.name} — {info.price}
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
