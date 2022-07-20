import { GameRoom } from '@/interfaces/game-rooms.interface';
import GameRoomStoreManager from '@/objects/game-room-store-manager.object';
import { Socket } from 'socket.io';
import BaseWorker from './base.worker';

class GameWorker extends BaseWorker {
  private static GAME_ROOM_STORE_MANAGER = new GameRoomStoreManager();
  private currentRoomId: string;

  constructor(socket: Socket) {
    super(socket);
    this.currentRoomId = '';
    this.init();
  }

  private init() {
    this.socket.on('game:acknowledgement:create-p4f-room', callback => this.createPlayForFunRoom(callback));
    this.socket.on('game:acknowledgement:join-p4f-room', (joinPlayForFunRoom, callback) => this.joinPlayForFunRoom(joinPlayForFunRoom, callback));
    this.socket.on('disconnect', () => this.disconnect());

    this.sendDataToCurrentUserOnGameSpace('game:inform:get-all-p4f-rooms', this.getAllRooms());
  }

  private informPlayForFunRooms() {
    this.socket.emit('game:inform:get-all-p4f-rooms', this.getAllRooms());
  }

  private joinPlayForFunRoom(roomId: string, callback: (data: GameRoom, error: Error) => void) {
    try {
      const currentPlayerId = this.getCurrentUserId();
      const gameRoom = GameWorker.GAME_ROOM_STORE_MANAGER.joinRoom(roomId, currentPlayerId);

      this.informPlayForFunRooms();
      this.currentRoomId = roomId;
      this.socket.join(roomId);
      callback(gameRoom, null);
    } catch (error) {
      callback(null, error);
    }
  }

  private leavePlayForFunRoom() {
    const currentPlayerId = this.getCurrentUserId();
    GameWorker.GAME_ROOM_STORE_MANAGER.leaveRoom(this.currentRoomId, currentPlayerId);
  }

  private disconnect() {
    this.leavePlayForFunRoom();
    this.disconnectSocket();
  }

  private createPlayForFunRoom(callback: (data: GameRoom, error: Error) => void) {
    const currentPlayerName = this.getCurrentUserName();
    const gameRoom = GameWorker.GAME_ROOM_STORE_MANAGER.createRoom(currentPlayerName);
    this.joinPlayForFunRoom(gameRoom._id, callback);
  }

  private getAllRooms(): GameRoom[] {
    return GameWorker.GAME_ROOM_STORE_MANAGER.getAllRooms();
  }
}

export default GameWorker;
