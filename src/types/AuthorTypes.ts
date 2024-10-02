import { Book } from "./BookTypes";

export interface Author {
  id: number;
  name: string;
  description?: string;
  image?: string;
  bDay: Date;
  dayOfDeath?: Date | null;
  books?: Book[];
}
