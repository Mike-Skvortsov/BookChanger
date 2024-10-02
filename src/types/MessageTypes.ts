export interface Message {
  id: string | number;
  content: string;
  senderId: number;
  receiverId?: number;
  chatId: number;
  timestamp?: Date;
}
