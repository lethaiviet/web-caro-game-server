import { GameRoom } from '@/interfaces/game-rooms.interface';
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
    if (findRoomIdx < 0) throw Error("Cannot join this room, it isn't exsist");

    this.rooms[findRoomIdx].joinRoom(userId);
    return this.rooms[findRoomIdx];
  }

  public leaveRoom(roomId: string, userId: string) {
    const findRoomIdx = this.getRoomIdx(roomId);
    if (findRoomIdx < 0) return;

    this.rooms[findRoomIdx].leaveRoom(userId);
    this.removeRoomIfEmpty(roomId);
  }

  public getRoomIdx(roomId: string) {
    return this.rooms.findIndex(room => room._id === roomId);
  }

  public getAllRooms(): GameRoom[] {
    return this.rooms;
  }

  private publicRoom(gameRoomStore: GameRoomStore) {
    this.rooms.push(gameRoomStore);
  }

  private removeRoomIfEmpty(roomId: string) {
    this.rooms = this.rooms.filter(room => room._id === roomId && room.isEmptyRoom());
  }
}

export default GameRoomStoreManager;
