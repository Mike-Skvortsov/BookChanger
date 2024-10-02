import React, { useState, useEffect, useRef } from "react";
import { Book } from "../types/BookTypes"; // Adjust the import path as needed

interface BookActionsProps {
  book: Book;
  updateBook: (bookId: number) => void;
  deleteBook: (bookId: number) => void;
}

const BookActions: React.FC<BookActionsProps> = ({
  book,
  updateBook,
  deleteBook,
}) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setMenuVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  return (
    <div className="book-item-actions" ref={menuRef}>
      <div className="book-menu-trigger" ref={triggerRef} onClick={toggleMenu}>
        &#x22EE; {/* Three vertical dots */}
      </div>
      {menuVisible && (
        <div className="book-menu">
          <div onClick={() => updateBook(book.id)}>Редагувати книгу</div>
          <div onClick={() => deleteBook(book.id)}>Видалити книгу</div>
        </div>
      )}
    </div>
  );
};

export default BookActions;
