import React, { useState, useEffect } from "react";
import axios from "../utils/axios";
import Sidebar from "./Sidebar";
import { useUserContext } from "../contexts/UserContext";
import { Book } from "../types/BookTypes";
import "../styles/bookcase.css";
import BookActions from "./BookActions";
import ConfirmationDialog from "./ConfirmationDialog";
import SuccessMessage from "./SuccessMessage";
import { useNavigate } from "react-router-dom";

const BookCase = () => {
  const { userId } = useUserContext();
  const [books, setBooks] = useState<Book[]>([]);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] =
    useState(false);
  const [bookIdToDelete, setBookIdToDelete] = useState<number | null>(null);
  const [successMessageInfo, setSuccessMessageInfo] = useState({
    isVisible: false,
    message: "",
    imageSrc: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      if (!userId) return;
      try {
        const response = await axios.get<Book[]>(`/Book/myBooks`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setBooks(response.data);
      } catch (error) {
        console.error("Failed to fetch books", error);
      }
    };

    fetchBooks();
  }, [userId]);
  const goToBookAddPage = () => navigate("/add-book");
  const isEmptyBookcase = books.length === 0;

  const updateBook = async (bookId: number) => {
    console.log(`Updating book with ID: ${bookId}`);
  };
  const requestDeleteBook = (bookId: number) => {
    setBookIdToDelete(bookId);
    setIsConfirmationDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (bookIdToDelete !== null) {
      try {
        await axios.delete(`/Book/delete/${bookIdToDelete}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setBooks(books.filter((book) => book.id !== bookIdToDelete));
        setSuccessMessageInfo({
          isVisible: true,
          message: "Ця книга була успішно видалена!",
          imageSrc: "/images/delete.png",
        });
      } catch (error) {
        console.error("Failed to delete book", error);
      } finally {
        setIsConfirmationDialogOpen(false);
        setBookIdToDelete(null);
      }
    }
  };

  const handleCancelDelete = () => {
    setIsConfirmationDialogOpen(false);
    setBookIdToDelete(null);
  };

  if (!userId) return <div>Please log in to view your bookcase.</div>;

  return (
    <div className="all-content">
      <Sidebar />
      <img className="note" src="/images/note.png" alt="note" />
      <div className="bookcase">
        <h2 className="my-bookcase">
          Книжкова шафа
          <span className="add-book-icon" onClick={goToBookAddPage}>
            <span className="material-symbols-outlined library-add">
              library_add
            </span>
          </span>
        </h2>
        {isEmptyBookcase ? (
          <>
            <img className="glass" src="/images/glass-on-book.png" alt="note" />
            <div className="empty-bookcase">
              <p className="empty-book-case-text">
                Ваша книжкова шафа порожня. Але це легко виправити: натисніть +
                і додайте книги, якими ви готові поділитися
              </p>
            </div>
          </>
        ) : (
          <div className="books-list">
            {books.map((book) => (
              <div key={book.id} className="book-item">
                <BookActions
                  book={book}
                  updateBook={updateBook}
                  deleteBook={requestDeleteBook}
                />
                <img
                  src={
                    book.image
                      ? `data:image/jpeg;base64,${book.image}`
                      : "/images/noImage.png"
                  }
                  onClick={() => navigate(`/books/${book.id}`)}
                  alt={book.title || "No title available"}
                />
                <h3 className="title">{book.title}</h3>
                <p className="author">{book.authorNames || "Unknown Author"}</p>
                <hr />
                <p className="announcedPrice">{`${book.announcedPrice} $`}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <ConfirmationDialog
        isOpen={isConfirmationDialogOpen}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        message="Ви впевнені що хочете видалити цю книгу?"
      />
      <SuccessMessage
        isVisible={successMessageInfo.isVisible}
        message={successMessageInfo.message}
        imageSrc={successMessageInfo.imageSrc}
        onClose={() =>
          setSuccessMessageInfo({ ...successMessageInfo, isVisible: false })
        }
      />
    </div>
  );
};

export default BookCase;
