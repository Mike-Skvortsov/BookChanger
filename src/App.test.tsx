import React from "react";
import { render, screen } from "@testing-library/react";
import AddAuthor from "./components/AddAuthor";
import { UserContextProvider } from "./contexts/UserContext";

test("renders learn react link", () => {
  render(
    <UserContextProvider>
      <AddAuthor />{" "}
    </UserContextProvider>
  );
  const linkElement = screen.getByText(/Додати нового автора/i);
  expect(linkElement).toBeInTheDocument();
});
