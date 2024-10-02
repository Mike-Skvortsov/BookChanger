import React, { useState, useEffect, useCallback } from "react";
import axios from "../utils/axios";
import "../styles/lookBooks.css";
import { Book } from "../types/BookTypes";
import { Genre } from "../types/GenreTypes";
import { useNavigate } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";

const BooksComponent = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAscending, setIsAscending] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [showAllGenres, setShowAllGenres] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 8;

  const navigate = useNavigate();

  useEffect(() => {
    fetchGenres();
    fetchBooks();
  }, [selectedGenres, currentPage, minPrice, maxPrice, searchTerm]);

  const fetchGenres = async () => {
    try {
      const response = await axios.get("/genre");
      setGenres(response.data);
    } catch (error) {
      console.error("Error fetching genres", error);
    }
  };

  const fetchBooks = async () => {
    const queryParams = new URLSearchParams({
      pageNumber: currentPage.toString(),
      pageSize: pageSize.toString(),
      titleQuery: searchTerm || "", // Ensure titleQuery is always included
      sortPrice: isAscending ? "asc" : "desc",
      minPrice: minPrice || "",
      maxPrice: maxPrice || "",
    });

    if (selectedGenres.length > 0) {
      queryParams.set("genreIds", selectedGenres.join(","));
    }

    try {
      const endpoint = `/book?${queryParams.toString()}`;
      const response = await axios.get(endpoint);
      if (response.data) {
        setBooks(response.data);
        setFilteredBooks(response.data);
        const totalPages = response.headers["x-total-pages"];
        setTotalPages(parseInt(totalPages, 10));
      } else {
        setBooks([]);
        setFilteredBooks([]);
        setTotalPages(0);
      }
    } catch (error) {
      console.error("Error fetching books:", error);
      setBooks([]);
      setFilteredBooks([]);
      setTotalPages(0);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages && filteredBooks.length === pageSize) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const toggleShowMoreGenres = () => {
    setShowAllGenres(!showAllGenres);
  };

  const applyFilters = useCallback(() => {
    let result = books;

    if (minPrice)
      result = result.filter(
        (book) => book.announcedPrice >= parseFloat(minPrice)
      );
    if (maxPrice)
      result = result.filter(
        (book) => book.announcedPrice <= parseFloat(maxPrice)
      );

    if (searchTerm)
      result = result.filter((book) =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase())
      );

    setFilteredBooks(result);
  }, [books, minPrice, maxPrice, searchTerm]);

  const handleGenreChange = useCallback((genreId: string) => {
    setSelectedGenres((prev) => {
      if (prev.includes(genreId)) {
        return prev.filter((id) => id !== genreId);
      } else {
        return [...prev, genreId];
      }
    });
  }, []);

  const handleSearch = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value.toLowerCase();
      setSearchTerm(value);
      setIsTyping(value.length > 0);

      if (value.length === 0) {
        setFilteredBooks(books);
      } else {
        const filtered = books.filter((book) =>
          book.title.toLowerCase().includes(value)
        );
        setFilteredBooks(filtered);
      }
    },
    [books]
  );

  const handleSortClick = useCallback(() => {
    setIsAscending((prev) => !prev);
    const sortedBooks = [...filteredBooks].sort((a, b) => {
      const priceA = a.announcedPrice;
      const priceB = b.announcedPrice;
      return isAscending ? priceB - priceA : priceA - priceB;
    });
    setFilteredBooks(sortedBooks);
  }, [isAscending, filteredBooks]);

  const handleFocus = () => {
    setIsTyping(true);
  };

  const handleBlur = () => {
    if (searchTerm === "") {
      setIsTyping(false);
    }
  };
  const handleBookClick = (bookId: String) => {
    if (bookId) {
      navigate(`/books/${bookId}`);
    } else {
      console.error("Book ID is undefined");
    }
  };

  return (
    <div className="all">
      <div className="search-sort-bar">
        <div className="search-wrapper">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className="search-input"
          />
          {!isTyping && (
            <span className="material-icons search-icon">search</span>
          )}
        </div>

        <button onClick={handleSortClick} className="sort-button">
          <span className="material-symbols-outlined swap">swap_vert</span>
          {isAscending
            ? "Від дешевших до дорожчих"
            : "Від дорожчих до дешевших"}
        </button>
      </div>
      <div className="books-container">
        <div className="filters-section">
          <div className="price-title-container">
            <span className="material-symbols-outlined price">payments</span>
            <span className="text-price">Ціна</span>
          </div>
          <div className="price-filter">
            <span className="from-price">від</span>
            <input
              type="text"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="price-input"
            />
            <span className="to-price">до</span>
            <input
              type="text"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="price-input"
            />
          </div>
          {/* <button className="button apply" onClick={applyFilters}>
            Фільтрувати
          </button> */}

          <div className="genre-filter">
            <h3>Жанри</h3>
            <ul className="genre-list">
              {genres
                .slice(0, showAllGenres ? genres.length : 8)
                .map((genre, index) => (
                  <li key={index} className="genre-item">
                    <input
                      type="checkbox"
                      id={`genre-${genre.id}`}
                      onChange={() => handleGenreChange(genre.id.toString())}
                    />
                    <label htmlFor={`genre-${genre.id}`}>{genre.name}</label>
                  </li>
                ))}
              {genres.length > 5 && (
                <button
                  onClick={toggleShowMoreGenres}
                  className="genre-show-more"
                >
                  {showAllGenres ? "Показати менше" : "Показати більше"}
                </button>
              )}
            </ul>
          </div>
        </div>
        <div className="books-section">
          {filteredBooks && filteredBooks.length > 0 ? (
            filteredBooks.map((book) => (
              <div
                key={book.id}
                className="book-card-on-looks-books"
                onClick={() => handleBookClick(book.id.toString())}
              >
                <LazyLoadImage
                  src={
                    book.image
                      ? `data:image/jpeg;base64,${book.image}`
                      : "/images/noImage.png"
                  }
                  alt={book.title}
                  className="book-image"
                  effect="blur"
                />
                <div className="book-content">
                  <h3 className="book-title">{book.title}</h3>
                  <p className="book-author">
                    {book.authorNames || "Unknown Author"}
                  </p>
                  <hr />
                  <p className="book-price">{book.announcedPrice} €</p>
                </div>
                <div className="book-owner-info">
                  <img
                    src={
                      book.owner?.image
                        ? `data:image/jpeg;base64,${book.owner.image}`
                        : "/images/noImage.png"
                    }
                    alt="Owner"
                    className="owner-image"
                  />
                  <p className="owner-name">
                    {book.owner?.userName || "Owner Name"}
                  </p>
                  <div className="owner-rating">
                    {book.owner?.rating?.toFixed(1) ?? "N/A"}
                    <span
                      className="star-icon"
                      style={{
                        backgroundImage:
                          book.owner?.rating !== undefined
                            ? `linear-gradient(to right, #ffac33 ${
                                (book.owner.rating / 5) * 100
                              }%, grey ${(book.owner.rating / 5) * 100}%)`
                            : "linear-gradient(to right, grey, grey)",
                      }}
                    >
                      ★
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-books-found">
              <img
                className="noBooks"
                loading="lazy"
                src="/images/noBook.png"
                alt="No books found"
              />
            </div>
          )}
        </div>
        <div className="sky">
          <img className="sky" src="/images/sky.png" alt="No books found" />
        </div>
      </div>
      <div className="pagination-controls">
        <button onClick={handlePreviousPage} disabled={currentPage === 1}>
          Попередня
        </button>
        <button
          onClick={handleNextPage}
          disabled={
            currentPage === totalPages || filteredBooks.length < pageSize
          }
        >
          Наступна
        </button>
      </div>
    </div>
  );
};

export default BooksComponent;
