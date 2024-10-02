import { Book } from "./BookTypes";

export interface Genre {
  id: number;
  name: string;
  books?: Book[];
}
