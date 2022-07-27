import { GameRoomType } from './game-rooms.interface';

export interface Match {
  _id: string;
  type: GameRoomType;
  name: string;
  players: string[];
  winner: string;
  totalTime: number;
  actions: string[];
  created_at: string;
}
