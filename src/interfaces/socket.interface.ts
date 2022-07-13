import { AllMessagesInRoom, DetailMessage, SimpleMessage } from './chat-messages.interface';
import { User, UserStates } from './users.interface';

export interface SocketServerEvents {
  'chat:inform:get-all-users-status': (data: UserStates[]) => void;
  'chat:inform:get-new-private-message': (detailMessage: DetailMessage) => void;
  'chat:response:get-all-private-messages-in-room': (allMessagesInRoom: AllMessagesInRoom) => void;
}

export interface SocketClientEvents {
  'chat:action:mark-as-read-all-private-messages-in-room': (anotherUserId: string) => void;
  'chat:action:send-private-message': (simpleMsg: SimpleMessage) => void;
  'chat:request:get-all-private-messages-in-room': (anotherUserId: string) => void;
  'chat:acknowledgement:get-all-users-status': (callback: (data: UserStates[]) => void) => void;
  'chat:acknowledgement:get-all-private-messages-in-all-rooms': (callback: (allMessages: AllMessagesInRoom[]) => void) => void;
}

export type SocketServerEventsName = keyof SocketServerEvents;

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  user: User;
}
