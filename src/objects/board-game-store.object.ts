import { BoardGame, Position, Symbol } from '@/interfaces/game-rooms.interface';
import _ from 'lodash';

class BoardGameStore implements BoardGame {
  nRow: number;
  nCol: number;
  data: string[][];

  constructor(nCol: number, nRow: number) {
    this.nCol = nCol;
    this.nRow = nRow;
    this.data = [];
    for (let r = 0; r < nRow; r++) {
      const rowData = _.fill(Array(nCol), Symbol.UNDEFINED);
      this.data[r] = rowData;
    }
  }

  private isPositionValid(pos: Position) {
    return _.inRange(pos.r, this.nRow) && _.inRange(pos.c, this.nCol);
  }

  public markSymbol(pos: Position, symbol: Symbol) {
    if (!this.isPositionValid(pos)) return;

    this.data[pos.r][pos.c] = symbol;
  }
}

export default BoardGameStore;
