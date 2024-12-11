import React from "react";
import { render, screen } from "@testing-library/react";
import BookActions from "./BookActions";
import { Book } from "../types/BookTypes";

const mockBook: Book = {
  id: 2,
  title: "Test Book",
  announcedPrice: 100,
  image: "test-image-url",
};

const mockUpdateBook = jest.fn();
const mockDeleteBook = jest.fn();

test("BookActions рендериться без помилок", () => {
  render(
    <BookActions
      book={mockBook}
      updateBook={mockUpdateBook}
      deleteBook={mockDeleteBook}
    />
  );

  // Перевіряємо, що тригер рендериться
  expect(screen.getByText("⋮")).toBeInTheDocument();
});
