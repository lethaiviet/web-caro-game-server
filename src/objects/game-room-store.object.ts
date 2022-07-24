import { BoardGame, GameRoom, Player, Position, Symbol } from '@/interfaces/game-rooms.interface';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import BoardGameStore from './board-game-store.object';

class GameRoomStore implements GameRoom {
  _id: string;
  name: string;
  players: Player[];
  spectators: string[];
  createdAt: number;
  startedAt: number;
  isStarted: boolean;
  turnOf: string;
  chosenPlayerIdx: number;
  boardGame: BoardGameStore;
  timeOut: number;
  lastActionTime: number;
  expireTime: number;

  constructor(name: string) {
    this._id = uuidv4().split('-')[0];
    this.name = name;
    this.players = [];
    this.spectators = [];
    this.isStarted = false;
    this.createdAt = Date.now();
    this.timeOut = 15;
    this.expireTime = 3600;
    this.lastActionTime = 0;
    this.startedAt = 0;
  }

  public joinRoom(userId: string): void {
    if (this.isJoinedRoom(userId)) return;

    if (this.isPlayerRoomFull()) {
      this.joinRoomAsSpectator(userId);
    } else {
      this.joinRoomAsPlayer(userId);
    }
  }

  public leaveRoom(userId: string): void {
    if (!this.isJoinedRoom(userId)) return;
    if (this.isInPlayerRoom(userId)) {
      if (!this.isStarted) this.leavePlayerRoom(userId);
    } else {
      this.leaveSpectatorRoom(userId);
    }
  }

  public leaveSpectatorRoom(userId: string): void {
    this.spectators = this.spectators.filter(id => id !== userId);
  }

  public leavePlayerRoom(userId: string): void {
    this.players = this.players.filter(player => player._id !== userId);
  }

  public acceptStartingGame(userId: string, isReady: boolean): void {
    this.players = this.players.map(player => {
      if (player._id === userId) {
        player.isReady = isReady;
      }
      return player;
    });

    this.isStarted = this.isPlayerRoomFull() && this.players.every(player => player.isReady);
    this.initMatch();
  }

  public isEmptyRoom(): boolean {
    return this.players.length === 0;
  }

  public playGame(playerId: string, pos: Position) {
    if (playerId != this.turnOf) return;

    const symbol = this.getSymbolInCurrentTurn();
    this.boardGame.markSymbol(pos, symbol);
    this.switchTurn();
  }

  public forceSwitchTurnWhenPlayerAFK() {
    if (this.isPlayerAFK()) {
      this.switchTurn();
    }
  }

  public isExpired(): boolean {
    if (!this.isStarted) return false;

    return this.diffWithCurrentTimeInSeconds(this.startedAt) >= this.expireTime;
  }

  private diffWithCurrentTimeInSeconds(time: number): number {
    return _.floor((_.now() - time) / 1000);
  }

  private isPlayerAFK() {
    if (this.lastActionTime === 0) return false;

    return this.diffWithCurrentTimeInSeconds(this.lastActionTime) >= this.timeOut;
  }

  private updateLastActionTime() {
    this.lastActionTime = Date.now();
  }

  private getSymbolInCurrentTurn(): Symbol {
    return this.players[this.chosenPlayerIdx].symbol;
  }

  private generateRandomSymbolForPlayers(): void {
    const symbols = [Symbol.X, Symbol.O];
    this.chosenPlayerIdx = _.random(0, 1);
    const remainingPlayerIdx = this.chosenPlayerIdx ^ 1;

    this.turnOf = this.players[this.chosenPlayerIdx]._id;
    this.players[this.chosenPlayerIdx].symbol = symbols[this.chosenPlayerIdx];
    this.players[remainingPlayerIdx].symbol = symbols[remainingPlayerIdx];
  }

  private switchTurn(): void {
    this.updateLastActionTime();
    this.chosenPlayerIdx = this.chosenPlayerIdx ^ 1;
    this.turnOf = this.players[this.chosenPlayerIdx]._id;
  }

  private initMatch(): void {
    if (!this.isStarted) return;
    this.generateRandomSymbolForPlayers();

    const NUM_COL = 30;
    const NUM_ROW = 15;
    this.boardGame = new BoardGameStore(NUM_COL, NUM_ROW);

    this.startedAt = _.now();
  }

  private isPlayerRoomFull(): boolean {
    const MAX = 2;
    return this.players.length >= MAX;
  }

  private isInPlayerRoom(userId: string): boolean {
    return this.players.some(player => player._id === userId);
  }

  private isInSpectatorRoom(userId: string): boolean {
    return this.spectators.includes(userId);
  }

  private isJoinedRoom(userId: string): boolean {
    return this.isInPlayerRoom(userId) || this.isInSpectatorRoom(userId);
  }

  private joinRoomAsSpectator(userId: string): void {
    this.spectators.push(userId);
  }

  private joinRoomAsPlayer(userId: string): void {
    const player: Player = { _id: userId, isReady: false, symbol: Symbol.UNDEFINED };
    this.players.push(player);
  }
}

export default GameRoomStore;
