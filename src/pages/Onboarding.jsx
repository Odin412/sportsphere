import React, { useState, useEffect } from "react";
import { db } from "@/api/db";
import { createPageUrl } from "@/utils";
import { ArrowRight, ArrowLeft, Loader2, Check, Sparkles, Trophy, MapPin, Target, Dumbbell, UserCheck, Building2, Heart, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const SPORTS = ["Basketball", "Soccer", "Football", "Baseball", "Tennis", "Swimming", "Track & Field", "Volleyball", "Wrestling", "Gymnastics", "Hockey", "Golf", "MMA", "Boxing", "Cycling", "Softball", "Lacrosse", "Rugby", "Other"];
const LEVELS = ["Beginner", "Intermediate", "Advanced", "Elite / Competitive"];
const ORG_TYPES = ["League", "Club / Team", "School / University", "Academy", "Other"];

// ── Shared helpers ────────────────────────────────────────────────────────────

function SportPills({ selected, onToggle, single = false }) {
  return (
    <div className="flex flex-wrap gap-2">
      {SPORTS.map(s => (
        <button
          key={s}
          type="button"
          onClick={() => onToggle(s)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
            (single ? selected === s : selected.includes(s))
              ? "bg-red-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {s}
        </button>
      ))}
    </div>
  );
}

function FieldRow({ label, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-semibold text-gray-700">{label}</Label>
      {children}
    </div>
  );
}

function StepCard({ children }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
      {children}
    </div>
  );
}

// ── Role-specific step renderers ──────────────────────────────────────────────

function AthleteSteps({ step, data, setData }) {
  if (step === 1) return (
    <StepCard>
      <FieldRow label="Primary Sport *">
        <SportPills
          selected={data.sport}
          onToggle={(s) => setData(d => ({ ...d, sport: d.sport === s ? "" : s }))}
          single
        />
      </FieldRow>
      <FieldRow label="Position / Event">
        <Input
          value={data.position}
          onChange={e => setData(d => ({ ...d, position: e.target.value }))}
          placeholder="e.g. Point Guard, 100m Sprinter"
          className="rounded-xl"
        />
      </FieldRow>
      <FieldRow label="Skill Level">
        <div className="grid grid-cols-2 gap-2">
          {LEVELS.map(l => (
            <button
              key={l}
              type="button"
              onClick={() => setData(d => ({ ...d, level: l }))}
              className={`px-3 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                data.level === l ? "border-red-500 bg-red-50 text-red-700" : "border-gray-200 hover:border-gray-300 text-gray-600"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </FieldRow>
    </StepCard>
  );

  if (step === 2) return (
    <StepCard>
      <FieldRow label="Short Bio">
        <Textarea
          value={data.bio}
          onChange={e => setData(d => ({ ...d, bio: e.target.value }))}
          placeholder="Tell people about yourself — your background, style of play, what drives you..."
          className="rounded-xl resize-none"
          rows={3}
        />
      </FieldRow>
      <FieldRow label="City, State">
        <Input
          value={data.location}
          onChange={e => setData(d => ({ ...d, location: e.target.value }))}
          placeholder="e.g. Atlanta, GA"
          className="rounded-xl"
        />
      </FieldRow>
      <FieldRow label="School or Team (optional)">
        <Input
          value={data.school}
          onChange={e => setData(d => ({ ...d, school: e.target.value }))}
          placeholder="e.g. Jefferson High School, City Hoops Club"
          className="rounded-xl"
        />
      </FieldRow>
    </StepCard>
  );

  if (step === 3) {
    const updateAchievement = (i, val) => {
      const a = [...(data.achievements || ["", "", ""])];
      a[i] = val;
      setData(d => ({ ...d, achievements: a }));
    };
    const achievements = data.achievements || ["", "", ""];
    return (
      <StepCard>
        <FieldRow label="Top Achievements (up to 3)">
          <div className="space-y-2">
            {achievements.map((a, i) => (
              <Input
                key={i}
                value={a}
                onChange={e => updateAchievement(i, e.target.value)}
                placeholder={`Achievement ${i + 1} — e.g. State Champion 2024`}
                className="rounded-xl"
              />
            ))}
          </div>
        </FieldRow>
        <FieldRow label="Current Season Goal">
          <Input
            value={data.goal}
            onChange={e => setData(d => ({ ...d, goal: e.target.value }))}
            placeholder="e.g. Make varsity, improve vertical by 3 inches"
            className="rounded-xl"
          />
        </FieldRow>
      </StepCard>
    );
  }
  return null;
}

function CoachSteps({ step, data, setData }) {
  const toggleSport = (s) => {
    setData(d => {
      const sports = d.sports || [];
      return { ...d, sports: sports.includes(s) ? sports.filter(x => x !== s) : [...sports, s] };
    });
  };

  if (step === 1) return (
    <StepCard>
      <FieldRow label="Sport(s) You Coach">
        <SportPills selected={data.sports || []} onToggle={toggleSport} />
      </FieldRow>
      <FieldRow label="Specialty / Focus Area">
        <Input
          value={data.specialty}
          onChange={e => setData(d => ({ ...d, specialty: e.target.value }))}
          placeholder="e.g. Strength & Conditioning, Skill Development, Youth Coaching"
          className="rounded-xl"
        />
      </FieldRow>
      <FieldRow label="Years of Coaching Experience">
        <Input
          type="number"
          min="0"
          max="50"
          value={data.years_experience}
          onChange={e => setData(d => ({ ...d, years_experience: e.target.value }))}
          placeholder="e.g. 5"
          className="rounded-xl"
        />
      </FieldRow>
    </StepCard>
  );

  if (step === 2) return (
    <StepCard>
      <FieldRow label="Certifications (optional)">
        <Textarea
          value={data.certifications}
          onChange={e => setData(d => ({ ...d, certifications: e.target.value }))}
          placeholder="e.g. NSCA-CSCS, USA Basketball Level 2, NASM-CPT..."
          className="rounded-xl resize-none"
          rows={3}
        />
      </FieldRow>
      <FieldRow label="Current Team / Club (optional)">
        <Input
          value={data.current_team}
          onChange={e => setData(d => ({ ...d, current_team: e.target.value }))}
          placeholder="e.g. Riverside Athletic Club"
          className="rounded-xl"
        />
      </FieldRow>
      <FieldRow label="City, State">
        <Input
          value={data.location}
          onChange={e => setData(d => ({ ...d, location: e.target.value }))}
          placeholder="e.g. Chicago, IL"
          className="rounded-xl"
        />
      </FieldRow>
    </StepCard>
  );

  if (step === 3) return (
    <StepCard>
      <p className="text-sm font-semibold text-gray-700">Do you want to create a team on Sportsphere now?</p>
      <p className="text-xs text-gray-500">You can always do this later from your dashboard.</p>
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setData(d => ({ ...d, createTeam: true }))}
          className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${data.createTeam === true ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}
        >
          <Plus className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <div>
            <p className="font-bold text-sm text-gray-900">Create a team now</p>
            <p className="text-xs text-gray-500">Set up your team and start inviting athletes</p>
          </div>
        </button>
        <button
          type="button"
          onClick={() => setData(d => ({ ...d, createTeam: false, teamName: "", teamSport: "" }))}
          className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${data.createTeam === false ? "border-gray-400 bg-gray-50" : "border-gray-200 hover:border-gray-300"}`}
        >
          <X className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <div>
            <p className="font-bold text-sm text-gray-900">I'll do this later</p>
            <p className="text-xs text-gray-500">Jump in and explore the app first</p>
          </div>
        </button>
      </div>

      {data.createTeam === true && (
        <div className="space-y-3 pt-2 border-t border-gray-100">
          <FieldRow label="Team Name *">
            <Input
              value={data.teamName || ""}
              onChange={e => setData(d => ({ ...d, teamName: e.target.value }))}
              placeholder="e.g. City Hoops Academy"
              className="rounded-xl"
            />
          </FieldRow>
          <FieldRow label="Team Sport">
            <SportPills
              selected={data.teamSport || ""}
              onToggle={(s) => setData(d => ({ ...d, teamSport: d.teamSport === s ? "" : s }))}
              single
            />
          </FieldRow>
        </div>
      )}
    </StepCard>
  );
  return null;
}

function OrgSteps({ step, data, setData }) {
  const toggleSport = (s) => {
    setData(d => {
      const sports = d.sports || [];
      return { ...d, sports: sports.includes(s) ? sports.filter(x => x !== s) : [...sports, s] };
    });
  };

  if (step === 1) return (
    <StepCard>
      <FieldRow label="Organization Name *">
        <Input
          value={data.name}
          onChange={e => setData(d => ({ ...d, name: e.target.value }))}
          placeholder="e.g. Eagles Basketball League"
          className="rounded-xl"
        />
      </FieldRow>
      <FieldRow label="Organization Type">
        <div className="grid grid-cols-2 gap-2">
          {ORG_TYPES.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setData(d => ({ ...d, type: t }))}
              className={`px-3 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                data.type === t ? "border-purple-500 bg-purple-50 text-purple-700" : "border-gray-200 hover:border-gray-300 text-gray-600"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </FieldRow>
      <FieldRow label="Sport(s)">
        <SportPills selected={data.sports || []} onToggle={toggleSport} />
      </FieldRow>
    </StepCard>
  );

  if (step === 2) return (
    <StepCard>
      <FieldRow label="City, State *">
        <Input
          value={data.location}
          onChange={e => setData(d => ({ ...d, location: e.target.value }))}
          placeholder="e.g. Miami, FL"
          className="rounded-xl"
        />
      </FieldRow>
      <FieldRow label="Website (optional)">
        <Input
          value={data.website}
          onChange={e => setData(d => ({ ...d, website: e.target.value }))}
          placeholder="https://yourorg.com"
          className="rounded-xl"
        />
      </FieldRow>
      <FieldRow label="Contact Email">
        <Input
          type="email"
          value={data.contact_email}
          onChange={e => setData(d => ({ ...d, contact_email: e.target.value }))}
          placeholder="contact@yourorg.com"
          className="rounded-xl"
        />
      </FieldRow>
    </StepCard>
  );

  if (step === 3) return (
    <StepCard>
      <FieldRow label="About Your Organization">
        <Textarea
          value={data.description}
          onChange={e => setData(d => ({ ...d, description: e.target.value }))}
          placeholder="Tell athletes and coaches what your organization is about..."
          className="rounded-xl resize-none"
          rows={3}
        />
      </FieldRow>
      <FieldRow label="What are you looking for?">
        <div className="flex flex-wrap gap-2">
          {["Recruiting Athletes", "Hosting Events", "Partnering with Coaches", "Live Streaming Games", "Community Building"].map(o => (
            <button
              key={o}
              type="button"
              onClick={() => {
                setData(d => {
                  const goals = d.goals || [];
                  return { ...d, goals: goals.includes(o) ? goals.filter(x => x !== o) : [...goals, o] };
                });
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                (data.goals || []).includes(o) ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {o}
            </button>
          ))}
        </div>
      </FieldRow>
    </StepCard>
  );
  return null;
}

function ParentSteps({ step, data, setData, userEmail }) {
  const toggleSport = (s) => {
    setData(d => {
      const sports = d.sports || [];
      return { ...d, sports: sports.includes(s) ? sports.filter(x => x !== s) : [...sports, s] };
    });
  };

  if (step === 1) return (
    <StepCard>
      <FieldRow label="Your City, State">
        <Input
          value={data.location}
          onChange={e => setData(d => ({ ...d, location: e.target.value }))}
          placeholder="e.g. Dallas, TX"
          className="rounded-xl"
        />
      </FieldRow>
      <p className="text-xs text-gray-400">Your email: <strong>{userEmail}</strong></p>
    </StepCard>
  );

  if (step === 2) return (
    <StepCard>
      <FieldRow label="Sport(s) your child plays">
        <SportPills selected={data.sports || []} onToggle={toggleSport} />
      </FieldRow>
      <FieldRow label="Approximate Skill Level">
        <div className="grid grid-cols-2 gap-2">
          {LEVELS.map(l => (
            <button
              key={l}
              type="button"
              onClick={() => setData(d => ({ ...d, child_level: l }))}
              className={`px-3 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                data.child_level === l ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 hover:border-gray-300 text-gray-600"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </FieldRow>
    </StepCard>
  );
  return null;
}

// ── Role config ───────────────────────────────────────────────────────────────

const ROLE_CONFIG = {
  athlete: {
    label: "Athlete",
    icon: Dumbbell,
    color: "text-red-600",
    steps: 3,
    stepTitles: [
      { title: "Your sport", subtitle: "Let's start with what you play" },
      { title: "About you", subtitle: "Help others know who you are" },
      { title: "Achievements & goals", subtitle: "Show what you've accomplished" },
    ],
    welcomeTitle: "You're ready to compete!",
    welcomeBody: "Your athlete profile is set up. Get discovered by coaches, share your journey, and connect with your sports community.",
    welcomeCTA: "Explore Sportsphere",
    welcomeUrl: "Feed",
  },
  coach: {
    label: "Coach",
    icon: UserCheck,
    color: "text-blue-600",
    steps: 3,
    stepTitles: [
      { title: "Your coaching profile", subtitle: "Tell athletes about your expertise" },
      { title: "Credentials & team", subtitle: "Build credibility with your background" },
      { title: "Team setup", subtitle: "Optional — you can do this anytime" },
    ],
    welcomeTitle: "Welcome, Coach!",
    welcomeBody: "Your coaching profile is live. Start connecting with athletes, share your knowledge, and build your coaching brand.",
    welcomeCTA: "Go to Creator Hub",
    welcomeUrl: "CreatorHub",
  },
  admin: {
    label: "Organization",
    icon: Building2,
    color: "text-purple-600",
    steps: 3,
    stepTitles: [
      { title: "Your organization", subtitle: "Tell us about your league or club" },
      { title: "Location & contact", subtitle: "Help people find and reach you" },
      { title: "Your goals", subtitle: "What are you looking to do on Sportsphere?" },
    ],
    welcomeTitle: "Your org is ready!",
    welcomeBody: "Start building your community, recruit athletes, and host events on Sportsphere.",
    welcomeCTA: "Set Up Your Org",
    welcomeUrl: "OrgMessages",
  },
  parent: {
    label: "Parent",
    icon: Heart,
    color: "text-green-600",
    steps: 2,
    stepTitles: [
      { title: "About you", subtitle: "Tell us a bit about yourself" },
      { title: "Your child's sport", subtitle: "Personalize your feed" },
    ],
    welcomeTitle: "Welcome to Sportsphere!",
    welcomeBody: "Follow athletes, cheer on your child's team, and stay connected to the sports world.",
    welcomeCTA: "Browse Athletes",
    welcomeUrl: "GetNoticed",
  },
};

// ── Main component ────────────────────────────────────────────────────────────

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [stepData, setStepData] = useState({});

  useEffect(() => {
    db.auth.me().then(u => {
      setUser(u);
    }).catch(() => {});
  }, []);

  const role = user?.role || "athlete";
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.athlete;
  const totalSteps = config.steps;

  const canContinue = () => {
    if (role === "athlete") {
      if (step === 1) return !!stepData.sport && !!stepData.level;
    }
    if (role === "admin") {
      if (step === 1) return !!stepData.name;
    }
    if (role === "coach") {
      if (step === 3 && stepData.createTeam === true) return !!(stepData.teamName);
    }
    return true;
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      const primarySport = stepData.sport || (stepData.sports || [])[0] || "";

      // Build profile update payload
      const profileUpdate = {
        onboarding_complete: true,
      };

      if (role === "athlete") {
        profileUpdate.preferred_sports = stepData.sport ? [stepData.sport] : [];
        profileUpdate.bio = stepData.bio || "";
        profileUpdate.location = stepData.location || "";
        // Create SportProfile for athlete
        await db.entities.SportProfile.create({
          user_email: user.email,
          user_name: user.full_name,
          avatar_url: user.avatar_url || "",
          sport: stepData.sport || "",
          position: stepData.position || "",
          level: stepData.level || "",
          bio: stepData.bio || "",
          location: stepData.location || "",
          school: stepData.school || "",
          achievements: (stepData.achievements || []).filter(Boolean).join("\n"),
          goals: stepData.goal || "",
        }).catch(() => {}); // don't block if sport profile fails
      }

      if (role === "coach") {
        profileUpdate.preferred_sports = stepData.sports || [];
        profileUpdate.bio = stepData.specialty || "";
        profileUpdate.location = stepData.location || "";
        // Create SportProfile for coach
        await db.entities.SportProfile.create({
          user_email: user.email,
          user_name: user.full_name,
          avatar_url: user.avatar_url || "",
          sport: (stepData.sports || [])[0] || "",
          level: "Coach",
          bio: [stepData.specialty, stepData.certifications].filter(Boolean).join(" | "),
          location: stepData.location || "",
        }).catch(() => {});
        // Create team if selected
        if (stepData.createTeam && stepData.teamName) {
          const createdOrg = await db.entities.Organization.create({
            name: stepData.teamName,
            sport: stepData.teamSport || primarySport,
            owner_email: user.email,
            subscription_plan: "free",
            subscription_status: "trialing",
            max_athletes: 10,
          });
          await db.entities.OrgMember.create({
            organization_id: createdOrg.id,
            user_email: user.email,
            user_name: user.full_name,
            role: "coach",
            status: "active",
            sport: stepData.teamSport || primarySport,
          });
        }
      }

      if (role === "admin") {
        profileUpdate.preferred_sports = stepData.sports || [];
        profileUpdate.location = stepData.location || "";
        const createdOrg = await db.entities.Organization.create({
          name: stepData.name,
          sport: (stepData.sports || [])[0] || "",
          location: stepData.location || "",
          description: stepData.description || "",
          website: stepData.website || "",
          owner_email: user.email,
          subscription_plan: "free",
          subscription_status: "trialing",
          max_athletes: 50,
        });
        await db.entities.OrgMember.create({
          organization_id: createdOrg.id,
          user_email: user.email,
          user_name: user.full_name,
          role: "admin",
          status: "active",
        });
      }

      if (role === "parent") {
        profileUpdate.preferred_sports = stepData.sports || [];
        profileUpdate.location = stepData.location || "";
      }

      await db.auth.updateMe(profileUpdate).catch(() => {});
      if (user?.id) localStorage.setItem(`ob_${user.id}`, "1");
      localStorage.setItem("user_role", role);
    } catch (err) {
      console.error("Onboarding finish error:", err);
    }
    setLoading(false);
    setDone(true);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
      </div>
    );
  }

  // Welcome / done screen
  if (done) {
    const RoleIcon = config.icon;
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-sm">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <div>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 ${config.color} mb-3`}>
              <RoleIcon className="w-3.5 h-3.5" />
              {config.label}
            </div>
            <h2 className="text-2xl font-black text-gray-900">{config.welcomeTitle}</h2>
            <p className="text-gray-500 mt-2 text-sm leading-relaxed">{config.welcomeBody}</p>
          </div>

          {/* Quick summary of what was set up */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 text-left space-y-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Profile Summary</p>
            <p className="text-sm font-semibold text-gray-900">{user.full_name || user.email}</p>
            {(role === "athlete") && stepData.sport && (
              <p className="text-xs text-gray-500 flex items-center gap-1"><Dumbbell className="w-3 h-3" /> {stepData.sport} · {stepData.level}</p>
            )}
            {(role === "coach") && (stepData.sports || []).length > 0 && (
              <p className="text-xs text-gray-500 flex items-center gap-1"><UserCheck className="w-3 h-3" /> Coach · {(stepData.sports || []).join(", ")}</p>
            )}
            {(role === "admin") && stepData.name && (
              <p className="text-xs text-gray-500 flex items-center gap-1"><Building2 className="w-3 h-3" /> {stepData.name}</p>
            )}
            {stepData.location && (
              <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {stepData.location}</p>
            )}
          </div>

          <Button
            onClick={() => {
              localStorage.setItem("tutorial_pending", "1");
              window.location.href = createPageUrl(config.welcomeUrl);
            }}
            className="w-full bg-gradient-to-r from-red-900 to-red-700 text-white rounded-xl px-8 font-bold"
          >
            <Sparkles className="w-4 h-4 mr-2" /> {config.welcomeCTA} <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <button
            onClick={() => window.location.href = createPageUrl("Feed")}
            className="block w-full text-center text-sm text-gray-400 hover:text-gray-600 py-2 transition-colors"
          >
            Go to Feed
          </button>
        </div>
      </div>
    );
  }

  const stepInfo = config.stepTitles[step - 1] || { title: "Setup", subtitle: "" };
  const RoleIcon = config.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-5">

        {/* Role pill */}
        <div className="flex items-center justify-between">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white border border-gray-200 ${config.color}`}>
            <RoleIcon className="w-3.5 h-3.5" />
            {config.label} Onboarding
          </div>
          <span className="text-xs text-gray-400 font-medium">Step {step} of {totalSteps}</span>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all ${i < step ? "bg-red-700" : "bg-gray-200"}`}
            />
          ))}
        </div>

        {/* Step header */}
        <div>
          <h1 className="text-2xl font-black text-gray-900">{stepInfo.title}</h1>
          <p className="text-gray-500 text-sm mt-0.5">{stepInfo.subtitle}</p>
        </div>

        {/* Step content */}
        {role === "athlete" && <AthleteSteps step={step} data={stepData} setData={setStepData} />}
        {role === "coach" && <CoachSteps step={step} data={stepData} setData={setStepData} />}
        {role === "admin" && <OrgSteps step={step} data={stepData} setData={setStepData} />}
        {role === "parent" && <ParentSteps step={step} data={stepData} setData={setStepData} userEmail={user?.email} />}

        {/* Navigation */}
        <div className="flex gap-3">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={() => setStep(s => s - 1)}
              className="rounded-xl flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          )}

          {step < totalSteps ? (
            <Button
              onClick={() => setStep(s => s + 1)}
              disabled={!canContinue()}
              className="bg-gradient-to-r from-red-900 to-red-700 text-white rounded-xl font-bold flex-1"
            >
              Continue <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleFinish}
              disabled={loading || !canContinue()}
              className="bg-gradient-to-r from-red-900 to-red-700 text-white rounded-xl font-bold flex-1"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
              Finish Setup
            </Button>
          )}
        </div>

        {/* Skip */}
        <button
          onClick={handleFinish}
          className="w-full text-center text-xs text-gray-400 hover:text-gray-600 py-1 transition-colors"
        >
          Skip for now — I'll complete this later
        </button>
      </div>
    </div>
  );
}
