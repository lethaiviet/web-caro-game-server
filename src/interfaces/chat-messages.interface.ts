export interface ChatMessager {
  _id: string;
  senderId: string;
  senderName: string;
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

export interface AllMessagesInRoom {
  roomName: string;
  messages: DetailMessage[];
}
