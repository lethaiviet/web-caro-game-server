export interface ChatMessager {
  _id: string;
  sender: string;
  content: string;
}

export interface SimpleMessage {
  to: string;
  content: string;
}

export interface CommonMessage extends SimpleMessage {
  from: string;
}

export interface DetailMessage extends ChatMessager {
  created_at: string;
}

export interface AllMessageInRoom {
  roomName: string;
  messages: DetailMessage[];
}
