export interface Player {
  _id: string;
  isReady: boolean;
}

export interface GameRoom {
  _id: string;
  name: string;
  players: Player[];
  spectators: string[];
  createdAt: number;
  isStarted: boolean;
}
