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
}

export interface BoardGame {
  data: string[][];
}

export interface GameRoom {
  _id: string;
  name: string;
  players: Player[];
  spectators: string[];
  createdAt: number;
  isStarted: boolean;
  turnOf: string;
  boardGame: BoardGame;
  timeOut: number;
  lastActionTime: number;
}
