import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Crown, Check, AlertTriangle } from "lucide-react";

const STRIPE_CONFIGURED = !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
import { toast } from "sonner";

export default function SubscribeButton({ creatorEmail, creatorName, price, currentUser }) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    base44.entities.CreatorSubscription.filter({
      subscriber_email: currentUser.email,
      creator_email: creatorEmail,
      status: "active"
    }).then(subs => setIsSubscribed(subs.length > 0));
  }, [currentUser, creatorEmail]);

  const handleSubscribe = async () => {
    if (!currentUser) {
      toast.error("Please login to subscribe");
      return;
    }

    setLoading(true);
    
    try {
      // Create subscription
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      await base44.entities.CreatorSubscription.create({
        subscriber_email: currentUser.email,
        creator_email: creatorEmail,
        amount: price,
        status: "active",
        current_period_end: endDate.toISOString(),
      });

      // Create transaction record
      await base44.entities.Transaction.create({
        from_email: currentUser.email,
        to_email: creatorEmail,
        type: "subscription",
        amount: price,
        status: "completed",
      });

      // Send notification
      await base44.entities.Notification.create({
        recipient_email: creatorEmail,
        actor_email: currentUser.email,
        actor_name: currentUser.full_name,
        actor_avatar: currentUser.avatar_url,
        type: "subscription",
        message: `subscribed to your premium content ($${price}/month)`,
      });

      setIsSubscribed(true);
      toast.success(`Subscribed to ${creatorName} for $${price}/month!`);
    } catch (error) {
      toast.error("Subscription failed. Please try again.");
    }
    
    setLoading(false);
  };

  if (isSubscribed) {
    return (
      <Button disabled className="rounded-xl gap-2 bg-green-100 text-green-700 hover:bg-green-100">
        <Check className="w-4 h-4" />
        Subscribed
      </Button>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleSubscribe}
        disabled={loading}
        className="rounded-xl gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg"
      >
        <Crown className="w-4 h-4" />
        {loading ? "Processing..." : `Subscribe $${price}/mo`}
      </Button>
      {!STRIPE_CONFIGURED && (
        <div className="flex items-center gap-1.5 text-[11px] text-amber-400/80">
          <AlertTriangle className="w-3 h-3 flex-shrink-0" />
          <span>Dev mode — no charge. Add Stripe keys to enable payments.</span>
        </div>
      )}
    </div>
  );
}