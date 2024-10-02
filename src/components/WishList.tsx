import React, { useState, useEffect } from "react";
import axios from "../utils/axios";
import Sidebar from "./Sidebar";
import { useUserContext } from "../contexts/UserContext";
import { Book } from "../types/BookTypes";
import "../styles/bookcase.css"; // Assuming similar styling can be used
import ConfirmationDialog from "./ConfirmationDialog";
import SuccessMessage from "./SuccessMessage";
import { useNavigate } from "react-router-dom";
import emptyHeart from "../assets/empty-heart.png"; // Path to empty heart icon
import filledHeart from "../assets/filled-heart.png"; // Path to filled heart icon

const Wishlist = () => {
  const { userId, token } = useUserContext();
  const [books, setBooks] = useState<Book[]>([]);
  const [wishlistStatus, setWishlistStatus] = useState<{
    [key: number]: boolean;
  }>({});
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
    const fetchWishlistBooks = async () => {
      if (!userId) return;
      try {
        const response = await axios.get<Book[]>(`/wishlist/books`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBooks(response.data);
        const status = response.data.reduce((acc: any, book) => {
          acc[book.id] = true; // All books in the initial fetch are in the wishlist
          return acc;
        }, {});
        setWishlistStatus(status);
      } catch (error) {
        console.error("Failed to fetch wishlist books", error);
      }
    };

    fetchWishlistBooks();
  }, [userId, token]);

  const handleWishlistToggle = async (bookId: number) => {
    try {
      if (wishlistStatus[bookId]) {
        await axios.delete(`/wishlist/${bookId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWishlistStatus({ ...wishlistStatus, [bookId]: false });
        setBooks(books.filter((book) => book.id !== bookId));
        setSuccessMessageInfo({
          isVisible: true,
          message: "Книга видалена з вашого списку бажань!",
          imageSrc: "/images/delete.png",
        });
      } else {
        await axios.post(
          `/wishlist`,
          { bookId },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setWishlistStatus({ ...wishlistStatus, [bookId]: true });
        // Optionally, you can refetch the wishlist books here
      }
    } catch (error) {
      console.error("Failed to update wishlist", error);
    }
  };

  if (!userId) return <div>Please log in to view your wishlist.</div>;

  return (
    <div className="all-content">
      <Sidebar />
      <div className="bookcase">
        <h2 className="my-bookcase">Список бажань</h2>
        {books.length === 0 ? (
          <div className="empty-bookcase">
            <p className="empty-book-case-text">
              Ваш список бажань порожній. Додайте книги до нього!
            </p>
          </div>
        ) : (
          <div className="books-list">
            {books.map((book) => (
              <div key={book.id} className="book-item">
                <img
                  src={
                    book.image
                      ? `data:image/jpeg;base64,${book.image}`
                      : "/images/noImage.png"
                  }
                  onClick={() => navigate(`/books/${book.id}`)}
                  alt={book.title || "No title available"}
                />
                <div
                  className="wishlist-icon"
                  onClick={() => handleWishlistToggle(book.id)}
                >
                  {wishlistStatus[book.id] ? (
                    <img
                      src="/images/full-heart.png"
                      alt="Remove from Wishlist"
                    />
                  ) : (
                    <img src="/images/empty-heart.png" alt="Add to Wishlist" />
                  )}
                </div>
                <h3 className="title">{book.title}</h3>
                <p className="author">{book.authorNames || "Unknown Author"}</p>
                <hr />
              </div>
            ))}
          </div>
        )}
      </div>
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

export default Wishlist;
