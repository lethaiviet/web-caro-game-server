import { GameRoom, Player } from '@/interfaces/game-rooms.interface';
import { v4 as uuidv4 } from 'uuid';

class GameRoomStore implements GameRoom {
  _id: string;
  name: string;
  players: Player[];
  spectators: string[];
  createdAt: number;
  isStarted: boolean;

  constructor(name: string) {
    this._id = uuidv4().split('-')[0];
    this.name = name;
    this.players = [];
    this.spectators = [];
    this.isStarted = false;
    this.createdAt = Date.now();
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
      this.leavePlayerRoom(userId);
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

    this.isStarted = this.players.every(player => player.isReady);
  }

  public isEmptyRoom(): boolean {
    return this.players.length === 0;
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
    const player: Player = { _id: userId, isReady: false };
    this.players.push(player);
  }
}

export default GameRoomStore;
