import React, { useState } from "react";
import { supabase } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, ArrowLeft, Zap, Users, Video, Trophy, TrendingUp, Shield } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const features = [
  { icon: Video, text: "Live streaming for athletes & coaches" },
  { icon: Users, text: "Build your sports community" },
  { icon: Zap, text: "AI-powered coaching & analysis" },
  { icon: Trophy, text: "Challenges, badges & leaderboards" },
  { icon: TrendingUp, text: "Monetize your content & skills" },
];

const stats = [
  { label: "Active Athletes", value: "12K+" },
  { label: "Live Streams", value: "340" },
  { label: "Coaches", value: "890+" },
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("email"); // "email" | "code"

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    if (error) {
      toast.error(error.message);
    } else {
      setStep("code");
    }
    setLoading(false);
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!code || code.length < 6) return;
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code.trim(),
      type: "email",
    });
    if (error) {
      toast.error("Invalid or expired code. Check your email and try again.");
      setCode("");
    }
    setLoading(false);
  };

  const handleOAuth = async (provider) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      if (error.message?.includes("provider is not enabled") || error.status === 400) {
        toast.error(`${provider.charAt(0).toUpperCase() + provider.slice(1)} sign-in isn't configured yet. Use the email code instead.`);
      } else {
        toast.error(error.message);
      }
    }
  };

  const HeroPanel = () => (
    <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-slate-900 via-slate-800 to-red-950 p-12 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: "radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3 relative z-10"
      >
        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698f6f4f4e61dd2806b88ed2/15137601c_392DC896-FFC0-4491-BCB6-20C0C160BF03.png"
          alt="Sportsphere"
          className="w-10 h-10 object-contain"
        />
        <span className="text-white text-xl font-black tracking-tight">Sportsphere</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="relative z-10 space-y-8"
      >
        <div className="space-y-4">
          <h1 className="text-5xl font-black text-white leading-tight">
            The Sports Community<br />
            <span className="text-red-400">Built for Athletes</span>
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed max-w-sm">
            Connect with coaches, stream your game, grow your audience, and unlock your full potential.
          </p>
        </div>
        <ul className="space-y-3">
          {features.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-slate-200">
              <span className="w-8 h-8 rounded-xl bg-red-800/50 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-red-300" />
              </span>
              <span className="text-sm">{text}</span>
            </li>
          ))}
        </ul>
        <div className="flex gap-6">
          {stats.map(({ label, value }) => (
            <div key={label} className="space-y-0.5">
              <div className="text-2xl font-black text-white">{value}</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider">{label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        className="absolute bottom-16 right-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-white text-sm max-w-[180px] z-10"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-slate-300 font-medium">Live now</span>
        </div>
        <p className="font-bold text-sm leading-tight">NBA Pre-season Training Analysis</p>
        <p className="text-slate-400 text-xs mt-1">2.4K watching</p>
      </motion.div>
    </div>
  );

  if (step === "code") {
    return (
      <div className="min-h-screen lg:grid lg:grid-cols-2">
        <HeroPanel />
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-sm space-y-8"
          >
            <div className="flex flex-col items-center gap-3 lg:hidden">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698f6f4f4e61dd2806b88ed2/15137601c_392DC896-FFC0-4491-BCB6-20C0C160BF03.png"
                alt="Sportsphere"
                className="w-14 h-14 object-contain"
              />
              <span className="text-2xl font-black text-slate-900">Sportsphere</span>
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-black text-slate-900">Check your email</h2>
              <p className="text-slate-500 text-sm">
                We sent a 6-digit code to <span className="font-semibold text-slate-800">{email}</span>
              </p>
            </div>

            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="code" className="text-sm font-semibold text-slate-700">6-digit code</Label>
                <Input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  className="rounded-xl h-14 border-slate-200 focus:border-red-900 focus:ring-red-900 text-center text-2xl font-mono tracking-widest"
                  required
                  autoFocus
                />
              </div>

              <Button
                type="submit"
                disabled={loading || code.length < 6}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-red-900 to-red-700 hover:from-red-950 hover:to-red-800 text-white font-bold text-sm"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Sign In"}
              </Button>
            </form>

            <button
              onClick={() => { setStep("email"); setCode(""); }}
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors mx-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              Use a different email
            </button>

            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
              <Shield className="w-3 h-3" />
              <span>Secure passwordless authentication</span>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      <HeroPanel />

      {/* Right panel — form */}
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm space-y-8"
        >
          {/* Mobile logo */}
          <div className="flex flex-col items-center gap-3 lg:hidden">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698f6f4f4e61dd2806b88ed2/15137601c_392DC896-FFC0-4491-BCB6-20C0C160BF03.png"
              alt="Sportsphere"
              className="w-14 h-14 object-contain"
            />
            <span className="text-2xl font-black text-slate-900">Sportsphere</span>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900">Welcome back</h2>
            <p className="text-slate-500 text-sm">Sign in to continue to Sportsphere</p>
          </div>

          <form onSubmit={handleSendCode} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-semibold text-slate-700">Email address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="rounded-xl h-12 border-slate-200 focus:border-red-900 focus:ring-red-900"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading || !email}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-red-900 to-red-700 hover:from-red-950 hover:to-red-800 text-white font-bold gap-2 text-sm"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  Send Code
                </>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-slate-400 font-medium">or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => handleOAuth("google")}
            className="w-full rounded-xl h-11 font-medium border-slate-200 hover:bg-slate-50"
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </Button>

          <p className="text-center text-xs text-slate-400">
            By signing in, you agree to our{" "}
            <a href="/Terms" className="text-red-800 hover:underline font-medium">Terms of Service</a>
            {" "}and{" "}
            <a href="/Guidelines" className="text-red-800 hover:underline font-medium">Community Guidelines</a>.
          </p>

          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
            <Shield className="w-3 h-3" />
            <span>Secure passwordless authentication</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
