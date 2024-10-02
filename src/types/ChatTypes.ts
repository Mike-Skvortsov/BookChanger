import { Message } from "./MessageTypes";
import { User } from "./UserTypes";

export interface Chat {
  id: number;
  userOneId: number;
  userTwoId: number;
  userOne: User;
  userTwo: User;
  messages: Message[];
}
