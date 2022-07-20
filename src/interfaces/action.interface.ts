export interface Position {
  x: number;
  y: number;
}

export interface Action {
  _id: string;
  playerId: string;
  position: Position;
  created_at: string;
}
