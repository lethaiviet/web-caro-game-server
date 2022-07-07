import ChatWorker from '@/socket-workers/chat.worker';
import { Socket } from 'socket.io';

class ChatSpace {
  initConnection(socket: Socket) {
    try {
      console.log('INIT ChatWorker - ' + socket.id);
      new ChatWorker(socket);
    } catch (error) {
      socket.emit('error', error);
    }
  }
}

export default new ChatSpace();
