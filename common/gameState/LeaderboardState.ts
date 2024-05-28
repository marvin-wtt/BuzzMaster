export interface LeaderboardState {
  game: 'leaderboard';
  name: string;
  entries: LeaderboardEntry[];
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  value: number;
  position: number;
}
