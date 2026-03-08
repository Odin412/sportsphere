import {
  Home, Search, Flame, ShieldCheck, Radio, MessageCircle, User, Plus,
  Eye, Lock, BarChart2, Crosshair, Video, Crown, Activity, ShieldAlert,
  Users, Heart,
} from "lucide-react";

// ── Shared steps (all roles) ─────────────────────────────────────────────────

const SHARED_STEPS = [
  {
    id: "feed",
    target: "[data-tour='nav-feed']",
    mobileTarget: "[data-tour='mobile-feed']",
    title: "Your Feed",
    description: "Your home base. See posts, highlights, and updates from the community.",
    placement: "right",
    mobilePlacement: "top",
    icon: Home,
  },
  {
    id: "search",
    target: "[data-tour='nav-search']",
    mobileTarget: "[data-tour='mobile-search']",
    title: "Search",
    description: "Find athletes, coaches, teams, and content across the platform.",
    placement: "right",
    mobilePlacement: "top",
    icon: Search,
  },
  {
    id: "reels",
    target: "[data-tour='nav-reels']",
    mobileTarget: "[data-tour='mobile-reels']",
    title: "Reels",
    description: "Watch and share short-form sports clips — highlights, skills, and training moments.",
    placement: "right",
    mobilePlacement: "top",
    icon: Flame,
  },
  {
    id: "messages",
    target: "[data-tour='nav-messages']",
    title: "Messages",
    description: "Direct message coaches, athletes, and other members of the community.",
    placement: "right",
    mobilePlacement: "top",
    icon: MessageCircle,
  },
  {
    id: "profile",
    target: "[data-tour='nav-profile']",
    mobileTarget: "[data-tour='mobile-profile']",
    title: "Your Profile",
    description: "View and edit your profile, stats, followers, and activity.",
    placement: "right",
    mobilePlacement: "top",
    icon: User,
  },
  {
    id: "create",
    target: "[data-tour='nav-create']",
    mobileTarget: "[data-tour='mobile-create']",
    title: "Create Post",
    description: "Share updates, photos, videos, and highlights with the community.",
    placement: "right",
    mobilePlacement: "top",
    icon: Plus,
  },
];

// ── Athlete-specific steps ───────────────────────────────────────────────────

const ATHLETE_STEPS = [
  {
    id: "propath",
    target: "[data-tour='nav-propathhub']",
    title: "ProPath",
    description: "Your athlete development hub — build your Scout Card, track stats, and get noticed by coaches and recruiters.",
    placement: "right",
    icon: ShieldCheck,
  },
  {
    id: "getnoticed",
    target: "[data-tour='nav-getnoticed']",
    title: "Get Noticed",
    description: "Showcase your talent in the athlete directory where coaches and scouts can discover you.",
    placement: "right",
    icon: Eye,
    requiresMoreMenu: true,
  },
  {
    id: "vault",
    target: "[data-tour='nav-thevault']",
    title: "The Vault",
    description: "Your private video storage. Upload game film and training clips for coach review and markup.",
    placement: "right",
    icon: Lock,
    requiresMoreMenu: true,
  },
  {
    id: "performance",
    target: "[data-tour='nav-performancehub']",
    title: "Performance Hub",
    description: "Track your training stats, personal records, and performance trends over time.",
    placement: "right",
    icon: BarChart2,
    requiresMoreMenu: true,
  },
];

// ── Coach/Admin-specific steps ───────────────────────────────────────────────

const COACH_STEPS = [
  {
    id: "propath",
    target: "[data-tour='nav-propathhub']",
    title: "ProPath",
    description: "Review athlete profiles and Scout Cards. Tip: This is where your athletes build their recruiting profiles.",
    placement: "right",
    icon: ShieldCheck,
  },
  {
    id: "scouting",
    target: "[data-tour='nav-scoutinghub']",
    title: "Scouting Hub",
    description: "Search, filter, and track athletes by sport, level, and location. Tip: Use shortlists to organize prospects.",
    placement: "right",
    icon: Crosshair,
    requiresMoreMenu: true,
  },
  {
    id: "getnoticed",
    target: "[data-tour='nav-getnoticed']",
    title: "Get Noticed",
    description: "Browse the athlete showcase directory. Tip: Athletes you invite will appear here once they set up their profiles.",
    placement: "right",
    icon: Eye,
    requiresMoreMenu: true,
  },
  {
    id: "livecoaching",
    target: "[data-tour='nav-livecoaching']",
    title: "Live Coaching",
    description: "Host live coaching sessions with your athletes. Tip: Schedule sessions and athletes get notified automatically.",
    placement: "right",
    icon: Video,
    requiresMoreMenu: true,
  },
  {
    id: "vault",
    target: "[data-tour='nav-thevault']",
    title: "The Vault",
    description: "Review athlete game film and add telestration markup. Tip: Athletes upload videos here for your feedback.",
    placement: "right",
    icon: Lock,
    requiresMoreMenu: true,
  },
  {
    id: "performance",
    target: "[data-tour='nav-performancehub']",
    title: "Performance Hub",
    description: "Track athlete performance data and trends. Tip: Invite athletes to your org from the dashboard to see their stats here.",
    placement: "right",
    icon: BarChart2,
    requiresMoreMenu: true,
  },
];

// ── Admin-specific steps (on top of coach steps) ─────────────────────────────

const ADMIN_EXTRA_STEPS = [
  {
    id: "moderation",
    target: "[data-tour='nav-moderationqueue']",
    title: "Moderation Queue",
    description: "Review flagged content and manage community safety. Tip: Check this regularly to keep your community safe.",
    placement: "right",
    icon: ShieldAlert,
    requiresMoreMenu: true,
  },
];

// ── Parent-specific steps ────────────────────────────────────────────────────
// Parents get ALL athlete features (they manage their child's profile) + parent tips

const PARENT_STEPS = [
  {
    id: "propath",
    target: "[data-tour='nav-propathhub']",
    title: "ProPath",
    description: "Your child's athlete development hub. Tip: Use this to build their Scout Card and showcase their talent to coaches and recruiters.",
    placement: "right",
    icon: ShieldCheck,
  },
  {
    id: "getnoticed",
    target: "[data-tour='nav-getnoticed']",
    title: "Get Noticed",
    description: "The athlete showcase directory. Tip: Once your child's profile is set up, coaches and scouts can discover them here.",
    placement: "right",
    icon: Eye,
    requiresMoreMenu: true,
  },
  {
    id: "vault",
    target: "[data-tour='nav-thevault']",
    title: "The Vault",
    description: "Private video storage for game film and training clips. Tip: Upload your child's game film here for their coach to review and markup.",
    placement: "right",
    icon: Lock,
    requiresMoreMenu: true,
  },
  {
    id: "performance",
    target: "[data-tour='nav-performancehub']",
    title: "Performance Hub",
    description: "Track training stats and personal records. Tip: Log your child's achievements here to build their performance history for scouts.",
    placement: "right",
    icon: BarChart2,
    requiresMoreMenu: true,
  },
  {
    id: "scouting",
    target: "[data-tour='nav-scoutinghub']",
    title: "Scouting Hub",
    description: "See which coaches and scouts are viewing athletes. Tip: Check here to see who's looking at your child's profile.",
    placement: "right",
    icon: Crosshair,
    requiresMoreMenu: true,
  },
  {
    id: "live",
    target: "[data-tour='nav-live']",
    title: "Live Streams",
    description: "Watch live coaching sessions and events. Tip: Your child's coach may broadcast training sessions here.",
    placement: "right",
    icon: Radio,
  },
];

// ── Creator-specific steps ───────────────────────────────────────────────────

const CREATOR_STEPS = [
  {
    id: "creatorhub",
    target: "[data-tour='nav-creatorhub']",
    title: "Creator Hub",
    description: "Your monetization dashboard — manage subscriptions, tips, and product sales.",
    placement: "right",
    icon: Crown,
    requiresMoreMenu: true,
  },
  {
    id: "analytics",
    target: "[data-tour='nav-analytics']",
    title: "Analytics",
    description: "Track your content performance, engagement metrics, and revenue over time.",
    placement: "right",
    icon: Activity,
    requiresMoreMenu: true,
  },
];

// ── Main export ──────────────────────────────────────────────────────────────

export function getTourSteps(role) {
  const isMobile = window.innerWidth < 1024;

  let roleSteps;
  switch (role) {
    case "parent":
      roleSteps = PARENT_STEPS;
      break;
    case "admin":
      roleSteps = [...COACH_STEPS, ...ADMIN_EXTRA_STEPS];
      break;
    case "coach":
      roleSteps = COACH_STEPS;
      break;
    case "creator":
      roleSteps = [...ATHLETE_STEPS, ...CREATOR_STEPS];
      break;
    case "athlete":
    default:
      roleSteps = ATHLETE_STEPS;
      break;
  }

  // On mobile, only show steps that have a mobile target (bottom nav items)
  // Plus a summary step explaining where to find everything else
  if (isMobile) {
    const mobileSteps = SHARED_STEPS.filter(s => s.mobileTarget);
    mobileSteps.push({
      id: "more-features",
      target: null, // centered modal, no spotlight
      title: "More Features",
      description: role === "parent"
        ? "Tap your Profile to access ProPath, The Vault, Performance Hub, and all the tools you need to manage your child's athletic journey."
        : role === "coach" || role === "admin"
        ? "Tap your Profile to access Scouting Hub, Live Coaching, The Vault, and all your coaching and org management tools."
        : "Tap your Profile to access ProPath, The Vault, Performance Hub, and all your athlete tools from the desktop sidebar.",
      placement: "center",
      mobilePlacement: "center",
      icon: Users,
    });
    return mobileSteps;
  }

  // Desktop: shared steps first, then role-specific
  return [...SHARED_STEPS, ...roleSteps];
}
