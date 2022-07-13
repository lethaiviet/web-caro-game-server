import { AllMessagesInRoom, DetailMessage, SimpleMessage } from './chat-messages.interface';
import { User, UserStates } from './users.interface';

export interface SocketServerEvents {
  'chat:inform:get-all-users-status': (data: UserStates[]) => void;
  'chat:response:send-private-message': (detailMessage: DetailMessage) => void;
  'chat:response:get-all-private-messages-in-room': (allMessagesInRoom: AllMessagesInRoom) => void;
  'chat:response:get-all-private-messages-in-all-rooms': (allMessages: AllMessagesInRoom[]) => void;
}

export interface SocketClientEvents {
  'chat:acknowledgement:get-all-users-status': (callback: (data: UserStates[]) => void) => void;
  'chat:request:send-private-message': (simpleMsg: SimpleMessage) => void;
  'chat:request:get-all-private-messages-in-room': (anotherUserId: string) => void;
  'chat:request:get-all-private-messages-in-all-rooms': () => void;
  'chat:action:mark-as-read-all-private-messages-in-room': (anotherUserId: string) => void;
}

export type SocketServerEventsName = keyof SocketServerEvents;

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  user: User;
}
