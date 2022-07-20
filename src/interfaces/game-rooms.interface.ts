export interface GameRoom {
  _id: string;
  name: string;
  players: string[];
  spectators: string[];
  createdAt: number;
  isStarted: boolean;
}
