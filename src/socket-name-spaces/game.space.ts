import GameWorker from '@/socket-workers/game.worker';
import { Socket } from 'socket.io';

class GameSpace {
  initConnection(socket: Socket) {
    try {
      new GameWorker(socket);
    } catch (error) {
      socket.emit('error', error);
    }
  }
}

export default new GameSpace();
