import React, { useState } from "react";
import { db } from "@/api/db";
import { useAuth } from "@/lib/AuthContext";
import useSubscriptionTier from "@/hooks/useSubscriptionTier";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Zap, Check, X, AlertTriangle, Loader2, Star } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const TIERS = [
  {
    slug: "free",
    name: "Free",
    price: 0,
    period: "",
    tagline: "Everything you need to get started",
    icon: Star,
    color: "gray",
    gradient: "from-gray-600 to-gray-700",
    borderClass: "border-gray-700",
    features: [
      { text: "Social feed, posts & reels", included: true },
      { text: "Live streaming & chat", included: true },
      { text: "Groups, forums & events", included: true },
      { text: "Basic Scout Card", included: true },
      { text: "Performance logging", included: true },
      { text: "The Vault (5 videos)", included: true },
      { text: "AI highlight reels", included: false },
      { text: "Advanced recruiting exposure", included: false },
      { text: "Detailed scout analytics", included: false },
      { text: "AI Coach", included: false },
    ],
  },
  {
    slug: "pro_scout",
    name: "Pro Scout",
    price: 9.99,
    period: "/month",
    tagline: "For athletes serious about getting recruited",
    icon: Crown,
    color: "amber",
    gradient: "from-amber-600 via-orange-600 to-amber-600",
    borderClass: "border-amber-500/40",
    popular: true,
    features: [
      { text: "Everything in Free", included: true },
      { text: "AI-powered highlight reels", included: true },
      { text: "Priority placement in discovery", included: true },
      { text: "Detailed Who's Scouting analytics", included: true },
      { text: "Scout Card PDF download", included: true },
      { text: "AI Coach access", included: true },
      { text: "Advanced recruiting exposure", included: true },
      { text: "Unlimited vault storage", included: false },
      { text: "AI trend predictions", included: false },
    ],
  },
  {
    slug: "elite",
    name: "Elite",
    price: 24.99,
    period: "/month",
    tagline: "Maximum exposure and unlimited tools",
    icon: Zap,
    color: "purple",
    gradient: "from-purple-600 via-indigo-600 to-purple-600",
    borderClass: "border-purple-500/40",
    features: [
      { text: "Everything in Pro Scout", included: true },
      { text: "Unlimited video vault storage", included: true },
      { text: "Priority AI game recaps", included: true },
      { text: "Advanced stat trend predictions", included: true },
      { text: "Priority support", included: true },
    ],
  },
];

export default function Premium() {
  const { user, checkAppState } = useAuth();
  const { tier, expiresAt, isExpired } = useSubscriptionTier();
  const [loading, setLoading] = useState(null); // slug of tier being processed
  const navigate = useNavigate();

  const handleSubscribe = async (tierSlug) => {
    if (!user) {
      toast.error("Please sign in first");
      return;
    }
    setLoading(tierSlug);
    try {
      if (import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
        // Production: create Stripe Checkout session
        const { data } = await db.functions.invoke("create-checkout", {
          tier: tierSlug,
          success_url: `${window.location.origin}/Premium?success=true`,
          cancel_url: `${window.location.origin}/Premium`,
        });
        if (data?.url) {
          // Native: open in in-app browser to avoid losing app context
          const { isNative: native } = await import('@/lib/platform');
          if (native) {
            const { Browser } = await import('@capacitor/browser');
            await Browser.open({ url: data.url });
          } else {
            window.location.href = data.url;
          }
          return;
        }
      }

      // Dev mode: activate directly
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 1);
      await db.auth.updateMe({
        subscription_tier: tierSlug,
        subscription_expires_at: expiryDate.toISOString(),
        // Keep legacy fields in sync
        is_premium: true,
        premium_expires: expiryDate.toISOString(),
      });
      toast.success(`${tierSlug === "elite" ? "Elite" : "Pro Scout"} activated!`);
      await checkAppState();
    } catch (error) {
      console.error("Subscribe error:", error);
      toast.error("Failed to subscribe");
    } finally {
      setLoading(null);
    }
  };

  const handleCancel = async () => {
    setLoading("cancel");
    try {
      await db.auth.updateMe({
        subscription_tier: "free",
        subscription_expires_at: null,
        is_premium: false,
        premium_expires: null,
      });
      toast.success("Subscription cancelled");
      await checkAppState();
    } catch (error) {
      toast.error("Failed to cancel");
    } finally {
      setLoading(null);
    }
  };

  // Check for Stripe success redirect
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      toast.success("Subscription activated! Welcome aboard.");
      window.history.replaceState({}, "", "/Premium");
      checkAppState();
    }
  }, []);

  const isCurrentTier = (slug) => tier === slug;
  const hasStripe = !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3">
            Choose Your Plan
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            The only app where the play that wins the game becomes the post that wins the scholarship.
          </p>
        </div>

        {/* Active Subscription Banner */}
        {tier !== "free" && !isExpired && (
          <Card className="bg-gradient-to-r from-amber-900/40 via-orange-900/40 to-amber-900/40 border-amber-500/30 mb-8 max-w-2xl mx-auto">
            <CardContent className="p-5">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <Crown className="w-7 h-7 text-amber-400" />
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      {tier === "elite" ? "Elite" : "Pro Scout"} Active
                    </h2>
                    {expiresAt && (
                      <p className="text-slate-400 text-sm">
                        Renews {expiresAt.toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  onClick={handleCancel}
                  disabled={loading === "cancel"}
                  variant="outline"
                  size="sm"
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  {loading === "cancel" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cancel"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dev Mode Notice */}
        {!hasStripe && (
          <div className="flex items-start gap-2 bg-amber-900/30 border border-amber-500/30 rounded-xl px-4 py-3 max-w-2xl mx-auto mb-8">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-amber-300 text-xs">
              <span className="font-semibold">Dev mode:</span> Subscriptions activate without payment.
              Add <code className="bg-amber-900/50 px-1 rounded">VITE_STRIPE_PUBLISHABLE_KEY</code> to enable Stripe.
            </p>
          </div>
        )}

        {/* Tier Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {TIERS.map((t) => {
            const Icon = t.icon;
            const current = isCurrentTier(t.slug);
            return (
              <Card
                key={t.slug}
                className={`relative bg-slate-900/60 backdrop-blur-xl ${t.borderClass} ${
                  t.popular ? "ring-2 ring-amber-500/50 scale-[1.02]" : ""
                } transition-all`}
              >
                {t.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                )}
                <CardContent className="p-6 flex flex-col h-full">
                  {/* Tier header */}
                  <div className={`w-12 h-12 bg-gradient-to-br ${t.gradient} rounded-2xl flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">{t.name}</h3>
                  <p className="text-slate-400 text-sm mb-4">{t.tagline}</p>

                  {/* Price */}
                  <div className="mb-6">
                    {t.price === 0 ? (
                      <span className="text-4xl font-black text-white">Free</span>
                    ) : (
                      <>
                        <span className="text-4xl font-black text-white">${t.price}</span>
                        <span className="text-slate-400 text-sm">{t.period}</span>
                      </>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-3 flex-1 mb-6">
                    {t.features.map((f, idx) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        {f.included ? (
                          <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 text-${t.color === "gray" ? "green" : t.color}-400`} />
                        ) : (
                          <X className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-600" />
                        )}
                        <span className={`text-sm ${f.included ? "text-slate-300" : "text-slate-600"}`}>
                          {f.text}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  {t.slug === "free" ? (
                    <Button
                      variant="outline"
                      className="w-full border-slate-700 text-slate-400"
                      disabled
                    >
                      {current ? "Current Plan" : "Free Forever"}
                    </Button>
                  ) : current ? (
                    <Button
                      variant="outline"
                      className={`w-full border-${t.color}-500/50 text-${t.color}-400`}
                      disabled
                    >
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleSubscribe(t.slug)}
                      disabled={!!loading}
                      className={`w-full bg-gradient-to-r ${t.gradient} hover:opacity-90 text-white shadow-lg`}
                    >
                      {loading === t.slug ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Icon className="w-4 h-4 mr-2" />
                      )}
                      {loading === t.slug ? "Processing..." : `Upgrade to ${t.name}`}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Free features notice */}
        <Card className="bg-slate-900/40 border-slate-700 max-w-3xl mx-auto">
          <CardContent className="p-6 text-center">
            <p className="text-slate-400">
              <span className="font-bold text-white">Social features are always free.</span>{" "}
              Posts, reels, groups, events, live streaming, messaging, and scheduling — all included at no cost.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
