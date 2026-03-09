/**
 * Preloaded team color templates organized by league.
 * Athletes pick a team → card auto-applies colors + team name.
 *
 * Each entry: { id, name, abbr, primary, secondary, border }
 *   primary   → card background / dark area
 *   secondary → accent color (text highlights, buttons)
 *   border    → card border / metallic frame
 */

export const TEAM_TEMPLATES = {
  // ─── MLB (30 teams) ────────────────────────────────────────────────────────
  MLB: [
    { id: "ari", name: "Arizona Diamondbacks", abbr: "ARI", primary: "#A71930", secondary: "#E3D4AD", border: "#A71930" },
    { id: "atl", name: "Atlanta Braves", abbr: "ATL", primary: "#CE1141", secondary: "#13274F", border: "#EAAA00" },
    { id: "bal", name: "Baltimore Orioles", abbr: "BAL", primary: "#DF4601", secondary: "#27251F", border: "#DF4601" },
    { id: "bos", name: "Boston Red Sox", abbr: "BOS", primary: "#BD3039", secondary: "#0C2340", border: "#BD3039" },
    { id: "chc", name: "Chicago Cubs", abbr: "CHC", primary: "#0E3386", secondary: "#CC3433", border: "#0E3386" },
    { id: "cws", name: "Chicago White Sox", abbr: "CWS", primary: "#27251F", secondary: "#C4CED4", border: "#27251F" },
    { id: "cin", name: "Cincinnati Reds", abbr: "CIN", primary: "#C6011F", secondary: "#000000", border: "#C6011F" },
    { id: "cle", name: "Cleveland Guardians", abbr: "CLE", primary: "#00385D", secondary: "#E50022", border: "#00385D" },
    { id: "col", name: "Colorado Rockies", abbr: "COL", primary: "#33006F", secondary: "#C4CED4", border: "#33006F" },
    { id: "det", name: "Detroit Tigers", abbr: "DET", primary: "#0C2340", secondary: "#FA4616", border: "#0C2340" },
    { id: "hou", name: "Houston Astros", abbr: "HOU", primary: "#002D62", secondary: "#EB6E1F", border: "#F4911E" },
    { id: "kc", name: "Kansas City Royals", abbr: "KC", primary: "#004687", secondary: "#BD9B60", border: "#004687" },
    { id: "laa", name: "Los Angeles Angels", abbr: "LAA", primary: "#BA0021", secondary: "#003263", border: "#BA0021" },
    { id: "lad", name: "Los Angeles Dodgers", abbr: "LAD", primary: "#005A9C", secondary: "#EF3E42", border: "#A5ACAF" },
    { id: "mia", name: "Miami Marlins", abbr: "MIA", primary: "#00A3E0", secondary: "#EF3340", border: "#41748D" },
    { id: "mil", name: "Milwaukee Brewers", abbr: "MIL", primary: "#12284B", secondary: "#FFC52F", border: "#12284B" },
    { id: "min", name: "Minnesota Twins", abbr: "MIN", primary: "#002B5C", secondary: "#D31145", border: "#002B5C" },
    { id: "nym", name: "New York Mets", abbr: "NYM", primary: "#002D72", secondary: "#FF5910", border: "#002D72" },
    { id: "nyy", name: "New York Yankees", abbr: "NYY", primary: "#003087", secondary: "#E4002B", border: "#C4CED4" },
    { id: "oak", name: "Oakland Athletics", abbr: "OAK", primary: "#003831", secondary: "#EFB21E", border: "#003831" },
    { id: "phi", name: "Philadelphia Phillies", abbr: "PHI", primary: "#E81828", secondary: "#002D72", border: "#E81828" },
    { id: "pit", name: "Pittsburgh Pirates", abbr: "PIT", primary: "#27251F", secondary: "#FDB827", border: "#FDB827" },
    { id: "sd", name: "San Diego Padres", abbr: "SD", primary: "#2F241D", secondary: "#FFC425", border: "#2F241D" },
    { id: "sf", name: "San Francisco Giants", abbr: "SF", primary: "#FD5A1E", secondary: "#27251F", border: "#EFD19F" },
    { id: "sea", name: "Seattle Mariners", abbr: "SEA", primary: "#0C2C56", secondary: "#005C5C", border: "#0C2C56" },
    { id: "stl", name: "St. Louis Cardinals", abbr: "STL", primary: "#C41E3A", secondary: "#0C2340", border: "#FEDB00" },
    { id: "tb", name: "Tampa Bay Rays", abbr: "TB", primary: "#092C5C", secondary: "#8FBCE6", border: "#F5D130" },
    { id: "tex", name: "Texas Rangers", abbr: "TEX", primary: "#003278", secondary: "#C0111F", border: "#003278" },
    { id: "tor", name: "Toronto Blue Jays", abbr: "TOR", primary: "#134A8E", secondary: "#E8291C", border: "#1D2D5C" },
    { id: "wsh", name: "Washington Nationals", abbr: "WSH", primary: "#AB0003", secondary: "#14225A", border: "#AB0003" },
  ],

  // ─── NBA (30 teams) ────────────────────────────────────────────────────────
  NBA: [
    { id: "atl_h", name: "Atlanta Hawks", abbr: "ATL", primary: "#E03A3E", secondary: "#C1D32F", border: "#E03A3E" },
    { id: "bos_c", name: "Boston Celtics", abbr: "BOS", primary: "#007A33", secondary: "#BA9653", border: "#007A33" },
    { id: "bkn", name: "Brooklyn Nets", abbr: "BKN", primary: "#000000", secondary: "#FFFFFF", border: "#FFFFFF" },
    { id: "cha", name: "Charlotte Hornets", abbr: "CHA", primary: "#1D1160", secondary: "#00788C", border: "#A1A1A4" },
    { id: "chi", name: "Chicago Bulls", abbr: "CHI", primary: "#CE1141", secondary: "#000000", border: "#CE1141" },
    { id: "cle_c", name: "Cleveland Cavaliers", abbr: "CLE", primary: "#860038", secondary: "#FDBB30", border: "#041E42" },
    { id: "dal", name: "Dallas Mavericks", abbr: "DAL", primary: "#00538C", secondary: "#002B5E", border: "#B8C4CA" },
    { id: "den", name: "Denver Nuggets", abbr: "DEN", primary: "#0E2240", secondary: "#FEC524", border: "#8B2131" },
    { id: "det_p", name: "Detroit Pistons", abbr: "DET", primary: "#C8102E", secondary: "#1D42BA", border: "#BEC0C2" },
    { id: "gsw", name: "Golden State Warriors", abbr: "GSW", primary: "#1D428A", secondary: "#FFC72C", border: "#1D428A" },
    { id: "hou_r", name: "Houston Rockets", abbr: "HOU", primary: "#CE1141", secondary: "#000000", border: "#C4CED4" },
    { id: "ind", name: "Indiana Pacers", abbr: "IND", primary: "#002D62", secondary: "#FDBB30", border: "#BEC0C2" },
    { id: "lac", name: "LA Clippers", abbr: "LAC", primary: "#C8102E", secondary: "#1D428A", border: "#BEC0C2" },
    { id: "lal", name: "LA Lakers", abbr: "LAL", primary: "#552583", secondary: "#FDB927", border: "#FDB927" },
    { id: "mem", name: "Memphis Grizzlies", abbr: "MEM", primary: "#5D76A9", secondary: "#12173F", border: "#F5B112" },
    { id: "mia_h", name: "Miami Heat", abbr: "MIA", primary: "#98002E", secondary: "#F9A01B", border: "#000000" },
    { id: "mil_b", name: "Milwaukee Bucks", abbr: "MIL", primary: "#00471B", secondary: "#EEE1C6", border: "#00471B" },
    { id: "min_t", name: "Minnesota Timberwolves", abbr: "MIN", primary: "#0C2340", secondary: "#236192", border: "#78BE20" },
    { id: "nop", name: "New Orleans Pelicans", abbr: "NOP", primary: "#0C2340", secondary: "#C8102E", border: "#85714D" },
    { id: "nyk", name: "New York Knicks", abbr: "NYK", primary: "#006BB6", secondary: "#F58426", border: "#BEC0C2" },
    { id: "okc", name: "Oklahoma City Thunder", abbr: "OKC", primary: "#007AC1", secondary: "#EF6100", border: "#002D62" },
    { id: "orl", name: "Orlando Magic", abbr: "ORL", primary: "#0077C0", secondary: "#C4CED4", border: "#000000" },
    { id: "phi_s", name: "Philadelphia 76ers", abbr: "PHI", primary: "#006BB6", secondary: "#ED174C", border: "#002B5C" },
    { id: "phx", name: "Phoenix Suns", abbr: "PHX", primary: "#1D1160", secondary: "#E56020", border: "#63727A" },
    { id: "por", name: "Portland Trail Blazers", abbr: "POR", primary: "#E03A3E", secondary: "#000000", border: "#E03A3E" },
    { id: "sac", name: "Sacramento Kings", abbr: "SAC", primary: "#5A2D81", secondary: "#63727A", border: "#5A2D81" },
    { id: "sas", name: "San Antonio Spurs", abbr: "SAS", primary: "#C4CED4", secondary: "#000000", border: "#C4CED4" },
    { id: "tor_r", name: "Toronto Raptors", abbr: "TOR", primary: "#CE1141", secondary: "#000000", border: "#A1A1A4" },
    { id: "uta", name: "Utah Jazz", abbr: "UTA", primary: "#002B5C", secondary: "#00471B", border: "#F9A01B" },
    { id: "was", name: "Washington Wizards", abbr: "WAS", primary: "#002B5C", secondary: "#E31837", border: "#C4CED4" },
  ],

  // ─── NFL (32 teams) ────────────────────────────────────────────────────────
  NFL: [
    { id: "ari_c", name: "Arizona Cardinals", abbr: "ARI", primary: "#97233F", secondary: "#000000", border: "#FFB612" },
    { id: "atl_f", name: "Atlanta Falcons", abbr: "ATL", primary: "#A71930", secondary: "#000000", border: "#A5ACAF" },
    { id: "bal_r", name: "Baltimore Ravens", abbr: "BAL", primary: "#241773", secondary: "#000000", border: "#9E7C0C" },
    { id: "buf", name: "Buffalo Bills", abbr: "BUF", primary: "#00338D", secondary: "#C60C30", border: "#00338D" },
    { id: "car", name: "Carolina Panthers", abbr: "CAR", primary: "#0085CA", secondary: "#101820", border: "#BFC0BF" },
    { id: "chi_b", name: "Chicago Bears", abbr: "CHI", primary: "#0B162A", secondary: "#C83803", border: "#0B162A" },
    { id: "cin_b", name: "Cincinnati Bengals", abbr: "CIN", primary: "#FB4F14", secondary: "#000000", border: "#FB4F14" },
    { id: "cle_b", name: "Cleveland Browns", abbr: "CLE", primary: "#311D00", secondary: "#FF3C00", border: "#FF3C00" },
    { id: "dal_c", name: "Dallas Cowboys", abbr: "DAL", primary: "#003594", secondary: "#869397", border: "#869397" },
    { id: "den_b", name: "Denver Broncos", abbr: "DEN", primary: "#FB4F14", secondary: "#002244", border: "#FB4F14" },
    { id: "det_l", name: "Detroit Lions", abbr: "DET", primary: "#0076B6", secondary: "#B0B7BC", border: "#0076B6" },
    { id: "gb", name: "Green Bay Packers", abbr: "GB", primary: "#203731", secondary: "#FFB612", border: "#203731" },
    { id: "hou_t", name: "Houston Texans", abbr: "HOU", primary: "#03202F", secondary: "#A71930", border: "#03202F" },
    { id: "ind_c", name: "Indianapolis Colts", abbr: "IND", primary: "#002C5F", secondary: "#A2AAAD", border: "#002C5F" },
    { id: "jax", name: "Jacksonville Jaguars", abbr: "JAX", primary: "#006778", secondary: "#9F792C", border: "#101820" },
    { id: "kc_c", name: "Kansas City Chiefs", abbr: "KC", primary: "#E31837", secondary: "#FFB81C", border: "#E31837" },
    { id: "lv", name: "Las Vegas Raiders", abbr: "LV", primary: "#000000", secondary: "#A5ACAF", border: "#A5ACAF" },
    { id: "lac_c", name: "Los Angeles Chargers", abbr: "LAC", primary: "#0080C6", secondary: "#FFC20E", border: "#0080C6" },
    { id: "lar", name: "Los Angeles Rams", abbr: "LAR", primary: "#003594", secondary: "#FFA300", border: "#FFD100" },
    { id: "mia_d", name: "Miami Dolphins", abbr: "MIA", primary: "#008E97", secondary: "#FC4C02", border: "#008E97" },
    { id: "min_v", name: "Minnesota Vikings", abbr: "MIN", primary: "#4F2683", secondary: "#FFC62F", border: "#4F2683" },
    { id: "ne", name: "New England Patriots", abbr: "NE", primary: "#002244", secondary: "#C60C30", border: "#B0B7BC" },
    { id: "no", name: "New Orleans Saints", abbr: "NO", primary: "#D3BC8D", secondary: "#101820", border: "#D3BC8D" },
    { id: "nyg", name: "New York Giants", abbr: "NYG", primary: "#0B2265", secondary: "#A71930", border: "#A5ACAF" },
    { id: "nyj", name: "New York Jets", abbr: "NYJ", primary: "#125740", secondary: "#000000", border: "#FFFFFF" },
    { id: "phi_e", name: "Philadelphia Eagles", abbr: "PHI", primary: "#004C54", secondary: "#A5ACAF", border: "#ACC0C6" },
    { id: "pit_s", name: "Pittsburgh Steelers", abbr: "PIT", primary: "#FFB612", secondary: "#101820", border: "#003087" },
    { id: "sf_n", name: "San Francisco 49ers", abbr: "SF", primary: "#AA0000", secondary: "#B3995D", border: "#AA0000" },
    { id: "sea_s", name: "Seattle Seahawks", abbr: "SEA", primary: "#002244", secondary: "#69BE28", border: "#A5ACAF" },
    { id: "tb_b", name: "Tampa Bay Buccaneers", abbr: "TB", primary: "#D50A0A", secondary: "#FF7900", border: "#34302B" },
    { id: "ten", name: "Tennessee Titans", abbr: "TEN", primary: "#0C2340", secondary: "#4B92DB", border: "#C8102E" },
    { id: "was_c", name: "Washington Commanders", abbr: "WAS", primary: "#5A1414", secondary: "#FFB612", border: "#5A1414" },
  ],

  // ─── MLS (29 teams) + top international clubs ──────────────────────────────
  Soccer: [
    { id: "atl_u", name: "Atlanta United", abbr: "ATL", primary: "#80000A", secondary: "#A19060", border: "#80000A" },
    { id: "aus", name: "Austin FC", abbr: "ATX", primary: "#00B140", secondary: "#000000", border: "#00B140" },
    { id: "cha_f", name: "Charlotte FC", abbr: "CLT", primary: "#1A85C8", secondary: "#000000", border: "#1A85C8" },
    { id: "chif", name: "Chicago Fire", abbr: "CHI", primary: "#AF2626", secondary: "#0A174A", border: "#AF2626" },
    { id: "cin_f", name: "FC Cincinnati", abbr: "CIN", primary: "#F05323", secondary: "#263B80", border: "#F05323" },
    { id: "col_r", name: "Colorado Rapids", abbr: "COL", primary: "#960A2C", secondary: "#9CC2EA", border: "#960A2C" },
    { id: "clb", name: "Columbus Crew", abbr: "CLB", primary: "#FEDD00", secondary: "#000000", border: "#FEDD00" },
    { id: "dal_f", name: "FC Dallas", abbr: "DAL", primary: "#BF0D3E", secondary: "#002A5C", border: "#BF0D3E" },
    { id: "dcu", name: "D.C. United", abbr: "DC", primary: "#000000", secondary: "#EF3E42", border: "#000000" },
    { id: "hou_d", name: "Houston Dynamo", abbr: "HOU", primary: "#F36600", secondary: "#101820", border: "#F36600" },
    { id: "skc", name: "Sporting KC", abbr: "SKC", primary: "#002F65", secondary: "#91B0D5", border: "#002F65" },
    { id: "lag", name: "LA Galaxy", abbr: "LA", primary: "#00245D", secondary: "#FFD200", border: "#00245D" },
    { id: "lafc", name: "LAFC", abbr: "LAFC", primary: "#C39E6D", secondary: "#000000", border: "#C39E6D" },
    { id: "mia_i", name: "Inter Miami", abbr: "MIA", primary: "#F7B5CD", secondary: "#231F20", border: "#F7B5CD" },
    { id: "min_u", name: "Minnesota United", abbr: "MIN", primary: "#E4E5E6", secondary: "#8CD2F4", border: "#231F20" },
    { id: "mtl", name: "CF Montreal", abbr: "MTL", primary: "#0033A1", secondary: "#000000", border: "#0033A1" },
    { id: "nsh", name: "Nashville SC", abbr: "NSH", primary: "#ECE83A", secondary: "#1F1646", border: "#ECE83A" },
    { id: "ne_r", name: "New England Revolution", abbr: "NE", primary: "#0A2240", secondary: "#CE0E2D", border: "#0A2240" },
    { id: "nyrb", name: "New York Red Bulls", abbr: "NY", primary: "#ED1E36", secondary: "#23326A", border: "#ED1E36" },
    { id: "nyc", name: "New York City FC", abbr: "NYC", primary: "#6CACE4", secondary: "#F15524", border: "#041E42" },
    { id: "orl_c", name: "Orlando City", abbr: "ORL", primary: "#633492", secondary: "#FDE192", border: "#633492" },
    { id: "phi_u", name: "Philadelphia Union", abbr: "PHI", primary: "#071B2C", secondary: "#B08D57", border: "#071B2C" },
    { id: "por_t", name: "Portland Timbers", abbr: "POR", primary: "#004812", secondary: "#D6A62C", border: "#004812" },
    { id: "rsl", name: "Real Salt Lake", abbr: "RSL", primary: "#B30838", secondary: "#013A81", border: "#F1D312" },
    { id: "sj", name: "San Jose Earthquakes", abbr: "SJ", primary: "#0067B1", secondary: "#000000", border: "#0067B1" },
    { id: "sea_s2", name: "Seattle Sounders", abbr: "SEA", primary: "#005695", secondary: "#658D1B", border: "#005695" },
    { id: "stl_c", name: "St. Louis City SC", abbr: "STL", primary: "#D22630", secondary: "#0A1E2C", border: "#D22630" },
    { id: "tor_f", name: "Toronto FC", abbr: "TOR", primary: "#B81137", secondary: "#455560", border: "#B81137" },
    { id: "van", name: "Vancouver Whitecaps", abbr: "VAN", primary: "#00245E", secondary: "#9DC2EA", border: "#00245E" },
    // Top international clubs
    { id: "barca", name: "FC Barcelona", abbr: "BAR", primary: "#A50044", secondary: "#004D98", border: "#EDBB00" },
    { id: "real", name: "Real Madrid", abbr: "RMA", primary: "#FEBE10", secondary: "#00529F", border: "#FFFFFF" },
    { id: "man_u", name: "Manchester United", abbr: "MUN", primary: "#DA291C", secondary: "#FBE122", border: "#000000" },
    { id: "man_c", name: "Manchester City", abbr: "MCI", primary: "#6CABDD", secondary: "#1C2C5B", border: "#6CABDD" },
    { id: "liv", name: "Liverpool FC", abbr: "LIV", primary: "#C8102E", secondary: "#00B2A9", border: "#C8102E" },
    { id: "psg", name: "Paris Saint-Germain", abbr: "PSG", primary: "#004170", secondary: "#DA291C", border: "#004170" },
    { id: "bay", name: "Bayern Munich", abbr: "BAY", primary: "#DC052D", secondary: "#0066B2", border: "#DC052D" },
    { id: "juv", name: "Juventus", abbr: "JUV", primary: "#000000", secondary: "#FFFFFF", border: "#D4AF37" },
  ],
};

/**
 * Map sport names to their league key in TEAM_TEMPLATES.
 * Falls back to null if no league matches.
 */
export const SPORT_TO_LEAGUE = {
  Baseball: "MLB",
  Softball: "MLB",
  Basketball: "NBA",
  Football: "NFL",
  Soccer: "Soccer",
};

/**
 * Find a team by its ID across all leagues.
 */
export function findTeamById(id) {
  if (!id) return null;
  for (const teams of Object.values(TEAM_TEMPLATES)) {
    const team = teams.find(t => t.id === id);
    if (team) return team;
  }
  return null;
}
