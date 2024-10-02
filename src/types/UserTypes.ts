import { Book } from "./BookTypes";

export interface User {
  id: number;
  userName?: string;
  location?: string;
  description?: string;
  phoneNumber: string;
  rating: number;
  numberOfExchanges: number;
  onlineTime?: Date;
  email?: string;
  image?: string;
  roleId: number;
  books?: Book[];
}
