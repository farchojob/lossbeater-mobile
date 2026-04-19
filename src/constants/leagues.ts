/**
 * League flag emojis keyed by league ID.
 * Backend returns league.country (BetsAPI cc code) but not a flag glyph,
 * so we keep this static lookup for the 6 top leagues.
 */
export const LEAGUE_FLAGS: Record<string, string> = {
  '22307': '\u{1F1FA}\u{1F1E6}', // Setka Cup — UA
  '29128': '\u{1F1F5}\u{1F1F1}', // TT Elite Series — PL
  '22742': '\u{1F1E8}\u{1F1FF}', // Czech Liga Pro — CZ
  '29097': '\u{1F1FA}\u{1F1E6}', // TT Cup — UA
  '22121': '\u{1F1FA}\u{1F1E6}', // Setka Women — UA
  '25065': '\u{1F310}', // Challenger Series TT — International
};

export const ALL_LEAGUES_ID = 'all';
