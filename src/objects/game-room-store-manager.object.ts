import { GameRoom, Position } from '@/interfaces/game-rooms.interface';
import GameRoomStore from './game-room-store.object';

class GameRoomStoreManager {
  private rooms: GameRoomStore[] = [];

  public createRoom(name: string): GameRoom {
    const newRoom = new GameRoomStore(name);
    this.publicRoom(newRoom);
    return newRoom;
  }

  public joinRoom(roomId: string, userId: string): GameRoom {
    const findRoomIdx = this.getRoomIdx(roomId);
    if (findRoomIdx < 0) throw Error(`Cannot join this room - ${roomId}, it isn't exsist`);

    this.rooms[findRoomIdx].joinRoom(userId);
    return this.rooms[findRoomIdx];
  }

  public leaveRoom(roomId: string, userId: string) {
    const findRoomIdx = this.getRoomIdx(roomId);
    if (findRoomIdx < 0) return;

    this.rooms[findRoomIdx].leaveRoom(userId);

    if (this.rooms[findRoomIdx].isEmptyRoom()) {
      this.removeRoom(roomId);
    }
  }

  public playGame(roomId: string, userId: string, pos: Position): { isTurnOfPlayer: boolean; gameRoom: GameRoom } {
    const findRoom = this.getRoom(roomId);
    const isTurnOfPlayer = findRoom.isTurnOf(userId);

    if (isTurnOfPlayer) {
      findRoom.playGame(userId, pos);
    }
    return { isTurnOfPlayer, gameRoom: findRoom };
  }

  public acceptStartingGame(roomId: string, userId: string, isReady: boolean): GameRoom {
    const findRoom = this.getRoom(roomId);
    findRoom.acceptStartingGame(userId, isReady);
    return findRoom;
  }

  public getRoomIdx(roomId: string) {
    return this.rooms.findIndex(room => room._id === roomId);
  }

  public removeExpiredRooms() {
    this.rooms = this.rooms.filter(room => !room.isExpired());
  }

  public getAllRooms(): GameRoom[] {
    this.removeExpiredRooms();
    const rooms = this.rooms.map(x => this.getCloneRoomWithoutBoardGame(x));
    return rooms;
  }

  public getRoom(roomId: string) {
    const findRoomIdx = this.getRoomIdx(roomId);
    if (findRoomIdx < 0) throw Error("The room isn't exsist");
    return this.rooms[findRoomIdx];
  }

  public checkAndSwitchTurn(roomId: string): GameRoom {
    const findRoom = this.getRoom(roomId);
    findRoom.forceSwitchTurnWhenPlayerAFK();
    return findRoom;
  }

  private publicRoom(gameRoomStore: GameRoomStore) {
    this.rooms.push(gameRoomStore);
  }

  private removeRoom(roomId: string) {
    this.rooms = this.rooms.filter(room => room._id !== roomId);
  }

  private getCloneRoomWithoutBoardGame(gameRoom: GameRoomStore): GameRoom {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { boardGame, ...room } = gameRoom;
    return { ...room, boardGame: { data: [], winnerPositions: [] } };
  }
}

export default GameRoomStoreManager;
