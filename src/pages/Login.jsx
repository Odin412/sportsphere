import React, { useState } from "react";
import { supabase } from "@/api/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, Lock, Zap, Users, Video, Trophy, TrendingUp, Shield, Eye, EyeOff, ChevronLeft, Dumbbell, UserCheck, Building2, Heart } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

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

const ROLE_CARDS = [
  {
    id: "athlete",
    label: "Athlete",
    icon: Dumbbell,
    desc: "Track performance, get scouted, build your brand",
    bg: "bg-red-50 border-red-200 hover:border-red-400",
    iconBg: "bg-red-100 text-red-600",
    role: "athlete",
    hasSub: false,
  },
  {
    id: "coach",
    label: "Coach",
    icon: UserCheck,
    desc: "Manage athletes, share content, grow your coaching practice",
    bg: "bg-blue-50 border-blue-200 hover:border-blue-400",
    iconBg: "bg-blue-100 text-blue-600",
    role: "coach",
    hasSub: true,
  },
  {
    id: "org",
    label: "Organization",
    icon: Building2,
    desc: "Leagues, clubs, schools — manage teams and events",
    bg: "bg-purple-50 border-purple-200 hover:border-purple-400",
    iconBg: "bg-purple-100 text-purple-600",
    role: "admin",
    hasSub: true,
  },
  {
    id: "parent",
    label: "Parent",
    icon: Heart,
    desc: "Follow your child's sport journey and stay connected",
    bg: "bg-green-50 border-green-200 hover:border-green-400",
    iconBg: "bg-green-100 text-green-600",
    role: "parent",
    hasSub: false,
  },
];

const COACH_SUB = [
  { id: "independent", label: "Independent Coach", desc: "Work with individual athletes or small groups" },
  { id: "team", label: "Team / Club Coach", desc: "Coach a team within a club or school" },
];

const ORG_SUB = [
  { id: "league", label: "League" },
  { id: "club", label: "Club / Team" },
  { id: "school", label: "School / University" },
  { id: "other", label: "Other Organization" },
];

// HeroPanel lives outside Login so it never remounts on Login state changes
function HeroPanel() {
  return (
    <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-slate-900 via-slate-800 to-red-950 p-12 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-5"
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
}

export default function Login() {
  const [tab, setTab] = useState("signin");
  const [signupStep, setSignupStep] = useState("role-select");
  const [selectedRoleCard, setSelectedRoleCard] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [childName, setChildName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const switchToSignup = () => {
    setTab("signup");
    setSignupStep("role-select");
    setSelectedRoleCard(null);
    setSelectedRole("");
    setChildName("");
  };

  const switchToSignin = () => {
    setTab("signin");
    setSignupStep("role-select");
    setSelectedRoleCard(null);
    setSelectedRole("");
    setChildName("");
  };

  const handleRoleCardClick = (card) => {
    setSelectedRoleCard(card);
    if (card.hasSub) {
      setSignupStep("role-sub");
    } else {
      setSelectedRole(card.role);
      setSignupStep("form");
    }
  };

  const handleSubChoice = () => {
    setSelectedRole(selectedRoleCard.role);
    setSignupStep("form");
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message === "Invalid login credentials"
        ? "Incorrect email or password."
        : error.message);
    }
    setLoading(false);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    const isParent = selectedRoleCard?.id === "parent";
    if (!email || !password || !fullName || !selectedRole) return;
    if (isParent && !childName) return;
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role: selectedRole, ...(isParent ? { child_name: childName } : {}) } },
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Account created! Setting up your profile...");
    }
    setLoading(false);
  };

  const isCoach = selectedRoleCard?.id === "coach";
  const subItems = isCoach ? COACH_SUB : ORG_SUB;
  const RoleIcon = selectedRoleCard?.icon;

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      <HeroPanel />

      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-950 lg:bg-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm space-y-6"
        >
          {/* Mobile logo */}
          <div className="flex flex-col items-center gap-3 lg:hidden">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698f6f4f4e61dd2806b88ed2/15137601c_392DC896-FFC0-4491-BCB6-20C0C160BF03.png"
              alt="Sportsphere"
              className="w-14 h-14 object-contain"
            />
            <span className="text-2xl font-black text-white lg:text-slate-900">Sportsphere</span>
          </div>

          {/* Tab switcher — hidden during sub-steps */}
          {(tab === "signin" || signupStep === "role-select") && (
            <div className="flex rounded-xl bg-gray-800 lg:bg-slate-100 p-1">
              <button
                onClick={switchToSignin}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                  tab === "signin"
                    ? "bg-gray-700 lg:bg-white shadow text-white lg:text-slate-900"
                    : "text-slate-400 lg:text-slate-500 hover:text-white lg:hover:text-slate-700"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={switchToSignup}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                  tab === "signup"
                    ? "bg-gray-700 lg:bg-white shadow text-white lg:text-slate-900"
                    : "text-slate-400 lg:text-slate-500 hover:text-white lg:hover:text-slate-700"
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* ── Sign In ── */}
          {tab === "signin" && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-semibold text-slate-300 lg:text-slate-700">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="pl-9 rounded-xl h-12 border-gray-700 lg:border-slate-200 bg-gray-900 lg:bg-white text-white lg:text-slate-900"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-semibold text-slate-300 lg:text-slate-700">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-9 pr-10 rounded-xl h-12 border-gray-700 lg:border-slate-200 bg-gray-900 lg:bg-white text-white lg:text-slate-900"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 lg:hover:text-slate-600"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-red-900 to-red-700 hover:from-red-950 hover:to-red-800 text-white font-bold text-sm"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
              </Button>
              <p className="text-center text-xs text-slate-400">
                Don't have an account?{" "}
                <button type="button" onClick={switchToSignup} className="text-red-600 font-semibold hover:underline">
                  Create one
                </button>
              </p>
            </form>
          )}

          {/* ── Sign Up: Role Select ── */}
          {tab === "signup" && (
            <AnimatePresence mode="wait">
              {signupStep === "role-select" && (
                <motion.div
                  key="role-select"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="text-center">
                    <h2 className="text-lg font-black text-white lg:text-slate-900">I am joining as a...</h2>
                    <p className="text-xs text-slate-400 mt-1">Choose the option that best describes you</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {ROLE_CARDS.map((card) => {
                      const Icon = card.icon;
                      return (
                        <button
                          key={card.id}
                          onClick={() => handleRoleCardClick(card)}
                          className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all text-left bg-white ${card.bg}`}
                        >
                          <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.iconBg}`}>
                            <Icon className="w-5 h-5" />
                          </span>
                          <div className="text-center">
                            <p className="font-bold text-sm text-slate-900">{card.label}</p>
                            <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{card.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-center text-xs text-slate-400">
                    Already have an account?{" "}
                    <button onClick={switchToSignin} className="text-red-600 font-semibold hover:underline">
                      Sign in
                    </button>
                  </p>
                </motion.div>
              )}

              {signupStep === "role-sub" && (
                <motion.div
                  key="role-sub"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSignupStep("role-select")}
                      className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-base font-black text-white lg:text-slate-900">
                      {isCoach ? "What type of coach are you?" : "What type of organization?"}
                    </h2>
                  </div>
                  <div className="space-y-2">
                    {subItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={handleSubChoice}
                        className="w-full flex items-start gap-3 p-3.5 rounded-xl border-2 border-slate-200 hover:border-slate-400 bg-white hover:bg-slate-50 transition-all text-left"
                      >
                        <div>
                          <p className="font-bold text-sm text-slate-900">{item.label}</p>
                          {item.desc && <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>}
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {signupStep === "form" && (
                <motion.div
                  key="signup-form"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {/* Role badge + back */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSignupStep(selectedRoleCard?.hasSub ? "role-sub" : "role-select")}
                      className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    {selectedRoleCard && RoleIcon && (
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${selectedRoleCard.iconBg}`}>
                        <RoleIcon className="w-3.5 h-3.5" />
                        {selectedRoleCard.label}
                      </span>
                    )}
                    <span className="text-sm font-bold text-white lg:text-slate-900">Create your account</span>
                  </div>

                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="fullName" className="text-sm font-semibold text-slate-300 lg:text-slate-700">
                        {selectedRoleCard?.id === "parent" ? "Your Name (Parent)" : "Full Name"}
                      </Label>
                      <Input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={selectedRoleCard?.id === "parent" ? "Parent's full name" : "Your name"}
                        className="rounded-xl h-12 border-gray-700 lg:border-slate-200 bg-gray-900 lg:bg-white text-white lg:text-slate-900"
                        required
                      />
                    </div>
                    {selectedRoleCard?.id === "parent" && (
                      <div className="space-y-1.5">
                        <Label htmlFor="childName" className="text-sm font-semibold text-slate-300 lg:text-slate-700">Child's Name</Label>
                        <Input
                          id="childName"
                          type="text"
                          value={childName}
                          onChange={(e) => setChildName(e.target.value)}
                          placeholder="Athlete's full name"
                          className="rounded-xl h-12 border-gray-700 lg:border-slate-200 bg-gray-900 lg:bg-white text-white lg:text-slate-900"
                          required
                        />
                      </div>
                    )}
                    <div className="space-y-1.5">
                      <Label htmlFor="emailSignup" className="text-sm font-semibold text-slate-300 lg:text-slate-700">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          id="emailSignup"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="pl-9 rounded-xl h-12 border-gray-700 lg:border-slate-200 bg-gray-900 lg:bg-white text-white lg:text-slate-900"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="passwordSignup" className="text-sm font-semibold text-slate-300 lg:text-slate-700">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          id="passwordSignup"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Min. 6 characters"
                          className="pl-9 pr-10 rounded-xl h-12 border-gray-700 lg:border-slate-200 bg-gray-900 lg:bg-white text-white lg:text-slate-900"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 lg:hover:text-slate-600"
                          aria-label="Toggle password visibility"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      disabled={loading || !email || !password || !fullName || (selectedRoleCard?.id === "parent" && !childName)}
                      className="w-full h-12 rounded-xl bg-gradient-to-r from-red-900 to-red-700 hover:from-red-950 hover:to-red-800 text-white font-bold text-sm"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
                    </Button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          )}

          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
            <Shield className="w-3 h-3" />
            <span>Secure authentication</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
