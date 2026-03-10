/**
 * Sport-specific scoring configuration for V1 sports.
 * Defines periods, score events, stat categories, and display settings.
 */

export const SPORT_SCORING = {
  baseball: {
    key: "baseball",
    label: "Baseball",
    periods: {
      count: 9,
      name: "Inning",
      nameShort: "INN",
      subPeriods: ["Top", "Bottom"],
      shortLabels: (i) => `${i}`,
    },
    scoreEvents: [
      { key: "run", label: "Run", points: 1, highlight: true },
      { key: "hit", label: "Hit", points: 0 },
      { key: "error", label: "Error", points: 0 },
      { key: "walk", label: "Walk", points: 0 },
      { key: "strikeout", label: "Strikeout", points: 0 },
      { key: "home_run", label: "Home Run", points: 1, highlight: true },
      { key: "double", label: "Double", points: 0 },
      { key: "triple", label: "Triple", points: 0 },
      { key: "rbi", label: "RBI", points: 0 },
      { key: "stolen_base", label: "Stolen Base", points: 0 },
    ],
    statCategories: ["R", "H", "E"],
    boxScoreLayout: "innings-grid",
    defaultConfig: {
      periods: 9,
      period_type: "inning",
      trackBalls: true,
      trackStrikes: true,
      trackOuts: true,
      trackBases: true,
    },
  },

  basketball: {
    key: "basketball",
    label: "Basketball",
    periods: {
      count: 4,
      name: "Quarter",
      nameShort: "QTR",
      overtime: true,
      shortLabels: (i) => `Q${i}`,
    },
    scoreEvents: [
      { key: "2pt", label: "2PT Made", points: 2, highlight: false },
      { key: "3pt", label: "3PT Made", points: 3, highlight: true },
      { key: "ft", label: "Free Throw", points: 1 },
      { key: "foul", label: "Foul", points: 0 },
      { key: "timeout", label: "Timeout", points: 0 },
      { key: "turnover", label: "Turnover", points: 0 },
      { key: "block", label: "Block", points: 0 },
      { key: "steal", label: "Steal", points: 0 },
      { key: "rebound", label: "Rebound", points: 0 },
    ],
    statCategories: ["PTS", "FLS", "TO"],
    boxScoreLayout: "quarters-grid",
    defaultConfig: {
      periods: 4,
      period_type: "quarter",
      trackClock: true,
      quarterMinutes: 8,
    },
  },

  soccer: {
    key: "soccer",
    label: "Soccer",
    periods: {
      count: 2,
      name: "Half",
      nameShort: "HLF",
      overtime: true,
      extraTime: true,
      shortLabels: (i) => `H${i}`,
    },
    scoreEvents: [
      { key: "goal", label: "Goal", points: 1, highlight: true },
      { key: "assist", label: "Assist", points: 0 },
      { key: "yellow_card", label: "Yellow Card", points: 0 },
      { key: "red_card", label: "Red Card", points: 0, highlight: true },
      { key: "substitution", label: "Substitution", points: 0 },
      { key: "corner", label: "Corner", points: 0 },
      { key: "penalty", label: "Penalty", points: 0, highlight: true },
      { key: "offside", label: "Offside", points: 0 },
      { key: "save", label: "Save", points: 0 },
    ],
    statCategories: ["G", "YC", "RC"],
    boxScoreLayout: "goals-timeline",
    defaultConfig: {
      periods: 2,
      period_type: "half",
      trackClock: true,
      halfMinutes: 45,
    },
  },

  softball: {
    key: "softball",
    label: "Softball",
    periods: {
      count: 7,
      name: "Inning",
      nameShort: "INN",
      subPeriods: ["Top", "Bottom"],
      shortLabels: (i) => `${i}`,
    },
    scoreEvents: [
      { key: "run", label: "Run", points: 1, highlight: true },
      { key: "hit", label: "Hit", points: 0 },
      { key: "error", label: "Error", points: 0 },
      { key: "walk", label: "Walk", points: 0 },
      { key: "strikeout", label: "Strikeout", points: 0 },
      { key: "home_run", label: "Home Run", points: 1, highlight: true },
      { key: "double", label: "Double", points: 0 },
      { key: "triple", label: "Triple", points: 0 },
      { key: "rbi", label: "RBI", points: 0 },
      { key: "stolen_base", label: "Stolen Base", points: 0 },
    ],
    statCategories: ["R", "H", "E"],
    boxScoreLayout: "innings-grid",
    defaultConfig: {
      periods: 7,
      period_type: "inning",
      trackBalls: true,
      trackStrikes: true,
      trackOuts: true,
      trackBases: true,
    },
  },

  football: {
    key: "football",
    label: "Football",
    periods: {
      count: 4,
      name: "Quarter",
      nameShort: "QTR",
      overtime: true,
      shortLabels: (i) => `Q${i}`,
    },
    scoreEvents: [
      { key: "touchdown", label: "Touchdown", points: 6, highlight: true },
      { key: "field_goal", label: "Field Goal", points: 3, highlight: true },
      { key: "extra_point", label: "Extra Point", points: 1 },
      { key: "two_point", label: "2PT Conversion", points: 2 },
      { key: "safety", label: "Safety", points: 2, highlight: true },
      { key: "penalty", label: "Penalty", points: 0 },
      { key: "timeout", label: "Timeout", points: 0 },
      { key: "interception", label: "Interception", points: 0, highlight: true },
      { key: "fumble", label: "Fumble", points: 0, highlight: true },
    ],
    statCategories: ["TD", "FG", "PEN"],
    boxScoreLayout: "quarters-grid",
    defaultConfig: {
      periods: 4,
      period_type: "quarter",
      trackClock: true,
      trackDowns: true,
      quarterMinutes: 12,
    },
  },
};

/**
 * Get the scoring config for a sport (case-insensitive).
 * Returns null if sport not supported.
 */
export function getSportConfig(sport) {
  if (!sport) return null;
  return SPORT_SCORING[sport.toLowerCase()] || null;
}

/**
 * Get all supported V1 sport keys.
 */
export function getSupportedSports() {
  return Object.keys(SPORT_SCORING);
}

/**
 * Format a period label for display.
 * e.g., "T3" → "Top 3rd", "Q2" → "2nd Quarter"
 */
export function formatPeriodLabel(period, sport) {
  const config = getSportConfig(sport);
  if (!config || !period) return period || "";

  if (sport.toLowerCase() === "baseball" || sport.toLowerCase() === "softball") {
    const match = period.match(/^(T|B)(\d+)$/);
    if (match) {
      const half = match[1] === "T" ? "Top" : "Bottom";
      const num = parseInt(match[2]);
      const suffix = num === 1 ? "st" : num === 2 ? "nd" : num === 3 ? "rd" : "th";
      return `${half} ${num}${suffix}`;
    }
  }

  if (period === "OT") return "Overtime";
  if (period === "ET") return "Extra Time";
  if (period.startsWith("Q")) return `${period.slice(1)}${ordinal(period.slice(1))} Quarter`;
  if (period.startsWith("H")) return `${period.slice(1)}${ordinal(period.slice(1))} Half`;

  return period;
}

function ordinal(n) {
  const num = parseInt(n);
  if (num === 1) return "st";
  if (num === 2) return "nd";
  if (num === 3) return "rd";
  return "th";
}
