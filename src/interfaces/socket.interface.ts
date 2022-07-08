import { AllMessagesInRoom, DetailMessage, SimpleMessage } from './chat-messages.interface';
import { User, UserStates } from './users.interface';

export interface ServerToClientEvents {
  'chat:inform:joined-room': (data: string) => void;
  'chat:inform:leaved-room': (data: string) => void;
  'chat:inform:users-online-status': (data: string) => void;
  'chat:inform:get-all-users-status': (data: UserStates[]) => void;
  'chat:response:get-all-users-status': (data: UserStates[]) => void;
  'chat:response:send-message-from-private-chat-room': (detailMessage: DetailMessage) => void;
  'chat:response:get-all-messages-from-private-chat-room': (allMessageInRoom: AllMessagesInRoom) => void;
}

export interface ClientToServerEvents {
  'chat:action:join-room': (roomId: string) => void;
  'chat:action:leave-room': (roomId: string) => void;
  'chat:action:send-private-messages': (roomId: string, message: string) => void;
  'chat:action:send-global-messages': (roomId: string, message: string) => void;
  'chat:action:join-private-room': (anotherUserId: string) => void;
  'chat:request:get-all-users-status': () => void;
  'chat:request:send-message-from-private-chat-room': (simpleMsg: SimpleMessage) => void;
  'chat:request:get-all-messages-from-private-chat-room': (anotherUserId: string) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  user: User;
}
