import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import { Book } from "../types/BookTypes";
import "../styles/bookDetails.css";
import { useUserContext } from "../contexts/UserContext";

const BookDetails = () => {
  const { bookId } = useParams();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { userId } = useUserContext();
  const navigate = useNavigate();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const { token } = useUserContext();

  useEffect(() => {
    const fetchBookDetails = async () => {
      setLoading(true);
      try {
        const bookResponse = await axios.get(`/book/${bookId}`);
        setBook(bookResponse.data);

        if (token) {
          // Check if the user is authenticated
          const wishlistResponse = await axios.get(
            `/wishlist/check/${bookId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setIsInWishlist(wishlistResponse.data.isInWishlist);
        }
      } catch (err) {
        console.error("Failed to fetch book details or wishlist status:", err);
        setError("Failed to fetch data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (bookId) {
      fetchBookDetails();
    } else {
      setError("No book ID provided.");
      setLoading(false);
    }
  }, [bookId, token]);

  const toggleWishlist = async () => {
    if (!token) {
      console.error("User not authenticated");
      return;
    }

    if (isInWishlist) {
      // Attempt to remove the book from the wishlist
      const response = await axios.delete(`/wishlist/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        setIsInWishlist(false);
      } else {
        console.error("Failed to remove from wishlist");
      }
    } else {
      const response = await axios.post(
        "/wishlist",
        { bookId: bookId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 200) {
        setIsInWishlist(true);
      } else {
        console.error("Failed to add to wishlist");
      }
    }
  };

  const handleOwnerClick = () => {
    if (book && book.owner) {
      navigate(`/user/${book.owner.id}`);
    } else {
      console.error("Book or owner data is missing.");
    }
  };

  const handleWriteToOwner = async () => {
    if (!book || !book.owner?.id) {
      console.error("Owner data is not available or owner ID is missing.");
      return;
    }

    try {
      const response = await axios.post("/chat/create", {
        userTwoId: book.owner.id,
      });
      const newChatId = response.data.id;
      navigate(`/chat?chatId=${newChatId}`);
    } catch (error) {
      console.error("Failed to create chat", error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!book) return <div>No book found.</div>;

  return (
    <div className="all-book-container">
      <div className="top-book">
        <div className="top-book-image">
          <img
            src={
              book?.image
                ? `data:image/jpeg;base64,${book.image}`
                : "/images/noImage.png"
            }
            alt={book?.title}
            className="book-details-image"
          />
          {token && (
            <div className="wishlist-icon" onClick={toggleWishlist}>
              {isInWishlist ? (
                <img src="/images/full-heart.png" alt="Remove from Wishlist" />
              ) : (
                <img src="/images/empty-heart.png" alt="Add to Wishlist" />
              )}
            </div>
          )}
        </div>

        <div className="top-book-right">
          <h1 className="book-details-title">{book.title}</h1>
          <div className="book-details-author">
            {book.authors?.map((author) => author.name).join(", ")}
          </div>
          <div className="book-details-genres">
            {book.genres?.map((genre) => (
              <span key={genre.id} className="genre-badge">
                {genre.name}
              </span>
            ))}
          </div>

          <div className="book-details-specs">
            <span className="book-info">Мова: {book.language}</span>
            <span className="book-info">{book.pageCount} ст.</span>
            <span className="book-info">{book.conditionOfTheBook}</span>
          </div>
          <p className="book-details-description">{book.description}</p>
        </div>
      </div>
      <div className="bottom">
        <div className="bottom-left">
          <img
            src={
              book.owner?.image
                ? `data:image/jpeg;base64,${book.owner.image}`
                : "/images/default-user.png"
            }
            alt="Owner"
            className="book-details-owner-image"
            onClick={handleOwnerClick} // Додайте обробник тут
          />
          <div className="book-details-owner-details">
            <p className="book-details-owner-name">{book.owner?.userName}</p>
            <p className="owner-last-visit">
              Останній візит:{" "}
              {book.owner?.onlineTime
                ? new Date(book.owner.onlineTime).toLocaleDateString("uk-UA", {
                    day: "2-digit",
                    month: "2-digit",
                  })
                : "Late"}
            </p>
          </div>
        </div>
        <div className="book-details-owner-rating">
          {book.owner?.rating?.toFixed(1) ?? "N/A"}
          <span
            className="star-icon"
            style={{
              backgroundImage: `linear-gradient(to right, #ffac33 ${
                book.owner?.rating ? (book.owner.rating / 5) * 100 : 0
              }%, grey ${
                book.owner?.rating ? (book.owner.rating / 5) * 100 : 0
              }%)`,
            }}
          >
            ★
          </span>
        </div>
        <span className="book-info price"> {book.announcedPrice} €</span>

        <div className="bottom-right">
          {/* Перевіряємо, чи користувач є власником книги */}
          {book.owner?.id.toString() !== userId && (
            <button
              className="book-details-button button"
              onClick={handleWriteToOwner}
            >
              Написати власнику
            </button>
          )}
        </div>
      </div>
      <img className="woman-reading" src="/images/Woman-reading.png" />
      <hr />
    </div>
  );
};

export default BookDetails;
