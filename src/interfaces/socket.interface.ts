import { User, UserStates } from './users.interface';

export interface ServerToClientEvents {
  'chat:inform:joined-room': (data: string) => void;
  'chat:inform:leaved-room': (data: string) => void;
  'chat:inform:users-online-status': (data: string) => void;
  'chat:response:get-all-users-status': (data: UserStates[]) => void;
}

export interface ClientToServerEvents {
  'chat:action:join-room': (roomId: string) => void;
  'chat:action:leave-room': (roomId: string) => void;
  'chat:action:send-private-messages': (roomId: string, message: string) => void;
  'chat:action:send-global-messages': (roomId: string, message: string) => void;
  'chat:request:get-all-users-status': () => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  user: User;
}
