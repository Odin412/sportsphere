/**
 * Sport-specific stat filters for the recruiting discovery feed.
 * Each sport defines which metrics can be filtered on, their ranges, and display format.
 */

export const SPORT_STAT_FILTERS = {
  Baseball: [
    { key: "batting_avg", label: "Batting Avg", min: 0, max: 1, step: 0.01, format: ".3f", unit: "" },
    { key: "era", label: "ERA", min: 0, max: 10, step: 0.1, lowerIsBetter: true, unit: "" },
    { key: "home_runs", label: "Home Runs", min: 0, max: 100, step: 1, unit: "" },
    { key: "rbi", label: "RBI", min: 0, max: 200, step: 1, unit: "" },
    { key: "stolen_bases", label: "Stolen Bases", min: 0, max: 100, step: 1, unit: "" },
  ],
  Basketball: [
    { key: "ppg", label: "PPG", min: 0, max: 50, step: 0.5, unit: "" },
    { key: "fg_pct", label: "FG%", min: 0, max: 100, step: 1, unit: "%" },
    { key: "three_pct", label: "3P%", min: 0, max: 100, step: 1, unit: "%" },
    { key: "rpg", label: "RPG", min: 0, max: 20, step: 0.5, unit: "" },
    { key: "apg", label: "APG", min: 0, max: 15, step: 0.5, unit: "" },
  ],
  Football: [
    { key: "passing_yards", label: "Pass Yards", min: 0, max: 5000, step: 100, unit: "yds" },
    { key: "rushing_yards", label: "Rush Yards", min: 0, max: 2500, step: 50, unit: "yds" },
    { key: "touchdowns", label: "Touchdowns", min: 0, max: 60, step: 1, unit: "" },
    { key: "tackles", label: "Tackles", min: 0, max: 200, step: 5, unit: "" },
    { key: "forty_yard", label: "40-Yard Dash", min: 4.0, max: 6.0, step: 0.05, lowerIsBetter: true, unit: "s" },
  ],
  Soccer: [
    { key: "goals", label: "Goals", min: 0, max: 50, step: 1, unit: "" },
    { key: "assists", label: "Assists", min: 0, max: 30, step: 1, unit: "" },
    { key: "goals_per_game", label: "Goals/Game", min: 0, max: 3, step: 0.1, unit: "" },
    { key: "clean_sheets", label: "Clean Sheets", min: 0, max: 30, step: 1, unit: "" },
  ],
  Tennis: [
    { key: "aces", label: "Aces/Match", min: 0, max: 30, step: 1, unit: "" },
    { key: "first_serve_pct", label: "1st Serve %", min: 0, max: 100, step: 1, unit: "%" },
    { key: "win_pct", label: "Win %", min: 0, max: 100, step: 1, unit: "%" },
  ],
  Swimming: [
    { key: "fifty_free", label: "50m Free", min: 20, max: 40, step: 0.5, lowerIsBetter: true, unit: "s" },
    { key: "hundred_free", label: "100m Free", min: 45, max: 90, step: 1, lowerIsBetter: true, unit: "s" },
    { key: "two_hundred_free", label: "200m Free", min: 100, max: 200, step: 1, lowerIsBetter: true, unit: "s" },
  ],
  Track: [
    { key: "hundred_m", label: "100m", min: 9.5, max: 15, step: 0.1, lowerIsBetter: true, unit: "s" },
    { key: "two_hundred_m", label: "200m", min: 19, max: 30, step: 0.1, lowerIsBetter: true, unit: "s" },
    { key: "four_hundred_m", label: "400m", min: 44, max: 70, step: 0.5, lowerIsBetter: true, unit: "s" },
    { key: "mile", label: "Mile", min: 3.5, max: 8, step: 0.1, lowerIsBetter: true, unit: "min" },
    { key: "long_jump", label: "Long Jump", min: 3, max: 9, step: 0.1, unit: "m" },
  ],
  Golf: [
    { key: "handicap", label: "Handicap", min: -5, max: 36, step: 1, lowerIsBetter: true, unit: "" },
    { key: "scoring_avg", label: "Scoring Avg", min: 65, max: 100, step: 0.5, lowerIsBetter: true, unit: "" },
    { key: "driving_distance", label: "Driving Dist", min: 200, max: 350, step: 5, unit: "yds" },
  ],
  Hockey: [
    { key: "goals", label: "Goals", min: 0, max: 60, step: 1, unit: "" },
    { key: "assists", label: "Assists", min: 0, max: 80, step: 1, unit: "" },
    { key: "plus_minus", label: "+/-", min: -30, max: 40, step: 1, unit: "" },
    { key: "save_pct", label: "Save %", min: 85, max: 100, step: 0.5, unit: "%" },
  ],
  Volleyball: [
    { key: "kills", label: "Kills/Set", min: 0, max: 10, step: 0.5, unit: "" },
    { key: "hitting_pct", label: "Hitting %", min: 0, max: 60, step: 1, unit: "%" },
    { key: "blocks", label: "Blocks/Set", min: 0, max: 5, step: 0.5, unit: "" },
    { key: "digs", label: "Digs/Set", min: 0, max: 8, step: 0.5, unit: "" },
  ],
  MMA: [
    { key: "win_pct", label: "Win %", min: 0, max: 100, step: 1, unit: "%" },
    { key: "ko_pct", label: "KO %", min: 0, max: 100, step: 1, unit: "%" },
    { key: "takedown_accuracy", label: "Takedown Acc", min: 0, max: 100, step: 1, unit: "%" },
  ],
  CrossFit: [
    { key: "fran_time", label: "Fran Time", min: 1, max: 15, step: 0.5, lowerIsBetter: true, unit: "min" },
    { key: "clean_and_jerk", label: "Clean & Jerk", min: 50, max: 200, step: 5, unit: "kg" },
    { key: "snatch", label: "Snatch", min: 40, max: 170, step: 5, unit: "kg" },
  ],
  Cycling: [
    { key: "ftp", label: "FTP", min: 100, max: 450, step: 10, unit: "W" },
    { key: "ftp_per_kg", label: "FTP/kg", min: 1, max: 7, step: 0.1, unit: "W/kg" },
    { key: "vo2max", label: "VO2 Max", min: 30, max: 90, step: 1, unit: "ml/kg" },
  ],
};

export const POSITIONS_BY_SPORT = {
  Baseball: ["Pitcher", "Catcher", "1st Base", "2nd Base", "Shortstop", "3rd Base", "Left Field", "Center Field", "Right Field", "DH"],
  Basketball: ["Point Guard", "Shooting Guard", "Small Forward", "Power Forward", "Center"],
  Football: ["Quarterback", "Running Back", "Wide Receiver", "Tight End", "Offensive Line", "Defensive Line", "Linebacker", "Cornerback", "Safety", "Kicker", "Punter"],
  Soccer: ["Goalkeeper", "Center Back", "Full Back", "Wing Back", "Defensive Mid", "Central Mid", "Attacking Mid", "Winger", "Striker"],
  Tennis: ["Singles", "Doubles"],
  Swimming: ["Freestyle", "Backstroke", "Breaststroke", "Butterfly", "IM"],
  Track: ["Sprinter", "Middle Distance", "Distance", "Jumper", "Thrower", "Multi-Event"],
  Golf: [],
  Hockey: ["Center", "Left Wing", "Right Wing", "Defenseman", "Goalie"],
  Volleyball: ["Setter", "Outside Hitter", "Middle Blocker", "Opposite", "Libero"],
  MMA: ["Flyweight", "Bantamweight", "Featherweight", "Lightweight", "Welterweight", "Middleweight", "Light Heavyweight", "Heavyweight"],
  CrossFit: [],
  Cycling: ["Road", "Track", "Mountain", "Cyclocross"],
};

export const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
];
