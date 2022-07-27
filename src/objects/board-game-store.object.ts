import { BoardGame, Position, Symbol } from '@/interfaces/game-rooms.interface';
import { count } from 'console';
import _ from 'lodash';

const Direction: Record<string, Position> = {
  RIGHT: { c: 1, r: 0 },
  LEFT: { c: -1, r: 0 },

  UP: { c: 0, r: -1 },
  DOWN: { c: 0, r: 1 },

  UP_RIGHT: { c: 1, r: -1 },
  DOWN_LEFT: { c: -1, r: 1 },

  UP_LEFT: { c: -1, r: -1 },
  DOWN_RIGHT: { c: 1, r: 1 },
};

class BoardGameStore implements BoardGame {
  nRow: number;
  nCol: number;
  data: string[][];
  winnerPositions: Position[];

  constructor(nCol: number, nRow: number) {
    this.nCol = nCol;
    this.nRow = nRow;
    this.data = [];
    this.winnerPositions = [];
    for (let r = 0; r < nRow; r++) {
      const rowData = _.fill(Array(nCol), Symbol.UNDEFINED);
      this.data[r] = rowData;
    }
  }

  public markSymbol(pos: Position, symbol: Symbol) {
    if (this.isFinished() || !this.isPositionValid(pos)) return;

    this.data[pos.r][pos.c] = symbol;
  }

  public isWinOnDirection(start: Position, symbol: Symbol, direction1: Position, direction2: Position) {
    const NUM_SYMBOL_WIN = 5;
    const { count: nDirection1, positions: positions1 } = this.countNumberSymbolsByDirection(start, symbol, direction1);
    const { count: nDirection2, positions: positions2 } = this.countNumberSymbolsByDirection(start, symbol, direction2);
    const isWin = nDirection1 + nDirection2 - 1 >= NUM_SYMBOL_WIN;

    if (isWin) {
      this.winnerPositions = _.uniqWith(_.concat(positions1, positions2), _.isEqual);
    }

    return isWin;
  }

  public checkWin(pos: Position, symbol: Symbol): boolean {
    const isWinOnHorizontal = this.isWinOnDirection(pos, symbol, Direction.RIGHT, Direction.LEFT);
    if (isWinOnHorizontal) return true;

    const isWinOnVerticall = this.isWinOnDirection(pos, symbol, Direction.UP, Direction.DOWN);
    if (isWinOnVerticall) return true;

    const isWinOnRightDiagonal = this.isWinOnDirection(pos, symbol, Direction.UP_RIGHT, Direction.DOWN_LEFT);
    if (isWinOnRightDiagonal) return true;

    const isWinOnLeftDiagonal = this.isWinOnDirection(pos, symbol, Direction.UP_LEFT, Direction.DOWN_RIGHT);
    if (isWinOnLeftDiagonal) return true;

    return false;
  }

  private isFinished(): boolean {
    return this.winnerPositions.length > 0;
  }

  private isValidPosRow(r: number): boolean {
    return _.inRange(r, this.nRow - 1);
  }

  private isValidPosCol(c: number): boolean {
    return _.inRange(c, this.nCol - 1);
  }

  private isValidPosition(pos: Position): boolean {
    const { r, c } = pos;
    return this.isValidPosRow(r) && this.isValidPosCol(c);
  }

  private isSymbolAt(pos: Position, symbol: Symbol): boolean {
    const { r, c } = pos;
    return this.isValidPosition(pos) && this.data[r][c] === symbol;
  }

  private getPositionByDirection(start: Position, direction: Position) {
    const { r: rStart, c: cStart } = start;
    const { r: rDirection, c: cDirection } = direction;
    const newPos = {
      r: rStart + rDirection,
      c: cStart + cDirection,
    };
    return newPos;
  }

  private countNumberSymbolsByDirection(start: Position, symbol: Symbol, direction: Position): { count: number; positions: Position[] } {
    let pos = start;
    let count = 0;
    const positions: Position[] = [];
    while (this.isSymbolAt(pos, symbol)) {
      count++;
      positions.push(pos);
      pos = this.getPositionByDirection(pos, direction);
    }
    return { count, positions };
  }

  private isPositionValid(pos: Position) {
    return _.inRange(pos.r, this.nRow) && _.inRange(pos.c, this.nCol);
  }
}

export default BoardGameStore;
