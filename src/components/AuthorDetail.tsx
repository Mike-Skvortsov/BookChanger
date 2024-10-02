import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import "../styles/authorDetail.css";
import { Author } from "../types/AuthorTypes";

const AuthorDetail = () => {
  const { authorId } = useParams<{ authorId: string }>();
  const [author, setAuthor] = useState<Author | null>(null);
  const [currentSet, setCurrentSet] = useState(0);
  const booksPerPage = 4;
  const navigate = useNavigate();
  const nextSet = () => {
    setCurrentSet((prev) => prev + 1);
  };
  const prevSet = () => {
    setCurrentSet((prev) => (prev > 0 ? prev - 1 : 0));
  };

  useEffect(() => {
    const fetchAuthorDetails = async () => {
      try {
        const response = await axios.get(`/author/${authorId}`);
        setAuthor(response.data);
      } catch (error) {
        console.error("Error fetching author details", error);
      }
    };

    fetchAuthorDetails();
  }, [authorId]);

  const handleBookClick = (bookId: any) => {
    navigate(`/books/${bookId}`);
  };

  const booksLength = author?.books?.length ?? 0;
  const maxSet = Math.ceil((booksLength - 1) / booksPerPage);
  const hasMoreBooks = booksLength > booksPerPage;

  const formatDate = (dateInput: string | Date): string => {
    const date = new Date(dateInput);
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };
  const imageToShow =
    booksLength >= 3 && booksLength <= 4
      ? `/images/Literature-pana.png`
      : `/images/cuate.png`;
  const imageClass =
    booksLength < 3 ? "less-author-photo" : "more-author-photo";

  if (!author) {
    return <div>Loading...</div>;
  }

  return (
    <div className="author-detail">
      <div className="author-header"></div>
      <div className="author-content">
        <div className="author-image-container">
          <img
            src={`data:image/jpeg;base64,${author.image}`}
            alt={author.name}
            className="author-image"
          />
          <h1 className="author-name">{author.name}</h1>
          <p className="author-lifespan">
            {formatDate(author.bDay)} -{" "}
            {author.dayOfDeath ? formatDate(author.dayOfDeath) : "Present"}
          </p>
        </div>
        <div className="author-info">
          <p className="author-description">{author.description}</p>
          <img
            src={imageToShow}
            alt="Additional portrait of the author"
            className={`additional-author-photo ${imageClass}`}
          />
        </div>
      </div>
      <div className="author-books">
        <h2 className="available-books">Доступні книги</h2>
        <div className="book-navigation">
          {hasMoreBooks && (
            <button
              className={`button-nav ${currentSet === 0 ? "disabled" : ""}`}
              onClick={prevSet}
              disabled={currentSet === 0}
            >
              {"<"}
            </button>
          )}
          <div className="book-list">
            {author?.books
              ?.slice(
                currentSet * booksPerPage,
                (currentSet + 1) * booksPerPage
              )
              .map((book) => (
                <div key={book.id} className="book-card">
                  <img
                    src={
                      book.image
                        ? `data:image/jpeg;base64,${book.image}`
                        : `/images/noImage.png`
                    }
                    alt={book.title}
                    className="book-image"
                    onClick={() => handleBookClick(book.id)}
                  />
                  <p className="author-book-title">{book.title}</p>
                </div>
              ))}
          </div>{" "}
          {hasMoreBooks && (
            <button
              className={`button-nav ${
                currentSet === maxSet ? "disabled" : ""
              }`}
              onClick={nextSet}
              disabled={currentSet >= maxSet}
            >
              {">"}
            </button>
          )}
        </div>
        <div className="horizontal-bar"></div>
      </div>
    </div>
  );
};

export default AuthorDetail;
