import { GameRoom, Position } from '@/interfaces/game-rooms.interface';
import GameRoomStoreManager from '@/objects/game-room-store-manager.object';
import { logger } from '@/utils/logger';
import { Socket } from 'socket.io';
import BaseWorker from './base.worker';

class GameWorker extends BaseWorker {
  private static GAME_ROOM_STORE_MANAGER = new GameRoomStoreManager();
  private currentRoomId: string;
  private timer: null | NodeJS.Timer;

  constructor(socket: Socket) {
    super(socket);
    this.currentRoomId = '';
    this.init();
  }

  private init() {
    this.socket.on('game:acknowledgement:create-p4f-room', callback => this.createPlayForFunRoom(callback));
    this.socket.on('game:acknowledgement:join-p4f-room', (joinPlayForFunRoom, callback) => this.joinPlayForFunRoom(joinPlayForFunRoom, callback));
    this.socket.on('game:action:accept-running-game', (roomId, isReady) => this.acceptStartingGame(roomId, isReady));
    this.socket.on('game:request:get-p4f-room-data', roomId => this.sendPlayForFunRoomData(roomId));
    this.socket.on('game:action:leave-current-room', () => this.leavePlayForFunRoom());
    this.socket.on('game:action:play-game', (roomId, pos) => this.playGame(roomId, pos));
    this.socket.on('game:action:check-player-afk-and-switch-turn', roomId => this.checkPlayerAFKAndSwitchTurn(roomId));
    this.socket.on('disconnect', () => this.disconnect());

    this.socket.emit('game:inform:get-all-p4f-rooms', this.getAllRooms());
  }

  private checkPlayerAFKAndSwitchTurn(roomId: string): void {
    try {
      const gameRoom = GameWorker.GAME_ROOM_STORE_MANAGER.checkAndSwitchTurn(roomId);
      this.socket.emit('game:response:get-p4f-room-data', gameRoom);
    } catch (error) {
      logger.error(error);
    }
  }

  private playGame(roomId: string, pos: Position): void {
    const currentPlayerId = this.getCurrentUserId();
    GameWorker.GAME_ROOM_STORE_MANAGER.playGame(roomId, currentPlayerId, pos);
    this.sendPlayForFunRoomData(roomId);
  }

  private acceptStartingGame(roomId: string, isReady: boolean): void {
    const currentPlayerId = this.getCurrentUserId();
    const gameRoom = GameWorker.GAME_ROOM_STORE_MANAGER.acceptStartingGame(roomId, currentPlayerId, isReady);
    if (gameRoom.isStarted) {
      this.boastcastPlayForFunRooms();
    }
    this.sendPlayForFunRoomData(roomId);
  }

  private boastcastPlayForFunRooms() {
    const rooms = this.getAllRooms();
    this.socket.broadcast.emit('game:inform:get-all-p4f-rooms', rooms);
  }

  private sendPlayForFunRoomData(roomId: string) {
    try {
      const room = GameWorker.GAME_ROOM_STORE_MANAGER.getRoom(roomId);
      this.sendDataToAllUserInRoomOnGameSpace(roomId, 'game:response:get-p4f-room-data', room);
    } catch (error) {
      logger.error(error);
    }
  }

  private boastcastPlayForFunRoomData(roomId: string) {
    try {
      const room = GameWorker.GAME_ROOM_STORE_MANAGER.getRoom(roomId);
      this.socket.broadcast.to(roomId).emit('game:response:get-p4f-room-data', room);
    } catch (error) {
      logger.error(error);
    }
  }

  private joinPlayForFunRoom(roomId: string, callback: (data: GameRoom, error: Error) => void) {
    try {
      const currentPlayerId = this.getCurrentUserId();
      const gameRoom = GameWorker.GAME_ROOM_STORE_MANAGER.joinRoom(roomId, currentPlayerId);

      this.boastcastPlayForFunRooms();
      this.currentRoomId = roomId;
      this.socket.join(roomId);
      this.boastcastPlayForFunRoomData(roomId);
      callback(gameRoom, null);
    } catch (error) {
      callback(null, error);
    }
  }

  private leavePlayForFunRoom() {
    if (this.currentRoomId === '') return;

    const currentPlayerId = this.getCurrentUserId();
    GameWorker.GAME_ROOM_STORE_MANAGER.leaveRoom(this.currentRoomId, currentPlayerId);
    this.boastcastPlayForFunRoomData(this.currentRoomId);
    this.socket.leave(this.currentRoomId);
    this.boastcastPlayForFunRooms();
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
