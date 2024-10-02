import { Author } from "./AuthorTypes";
import { Genre } from "./GenreTypes";
import { User } from "./UserTypes";

export interface Book {
  id: number;
  title: string;
  authorNames?: string;
  announcedPrice: number;
  image: string;
  description?: string;
  pageCount?: number;
  language?: string;
  conditionOfTheBook?: string;
  authors?: Author[];
  genres?: Genre[];
  ownerId?: number;
  owner?: User;
}
