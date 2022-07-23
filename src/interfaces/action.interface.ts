import { Position } from './game-rooms.interface';

export interface Action {
  _id: string;
  playerId: string;
  position: Position;
  created_at: string;
}
