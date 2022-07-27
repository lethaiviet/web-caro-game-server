export enum Symbol {
  X = 'X',
  O = 'O',
  UNDEFINED = '',
}

export interface Position {
  r: number;
  c: number;
}

export interface Player {
  _id: string;
  isReady: boolean;
  symbol: Symbol;
  isWinner: boolean;
}

export interface BoardGame {
  data: string[][];
  winnerPositions: Position[];
}

export type GameRoomType = 'Rank' | 'PlayForFun';

export interface GameRoom {
  _id: string;
  name: string;
  type: GameRoomType;
  players: Player[];
  spectators: string[];
  createdAt: number;
  isStarted: boolean;
  turnOf: string;
  boardGame: BoardGame;
  timeOut: number;
  lastActionTime: number;
}
