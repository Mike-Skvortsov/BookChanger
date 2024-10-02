import React, { useState, useEffect } from "react";
import "../styles/lookAuthors.css";
import axios from "../utils/axios";
import { useNavigate } from "react-router-dom";
import { Author } from "../types/AuthorTypes";

const AuthorsComponent = () => {
  const [allAuthors, setAllAuthors] = useState<Author[]>([]);
  const [displayedAuthors, setDisplayedAuthors] = useState<Author[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const pageSize = 8;
  const [isAscending, setIsAscending] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const response = await axios.get(
          `/author/paginated?pageNumber=1&pageSize=1000`
        ); // Load a larger set or implement server-side search
        setAllAuthors(response.data.authors);
        setDisplayedAuthors(response.data.authors.slice(0, pageSize));
        setTotalPages(Math.ceil(response.data.totalAuthors / pageSize));
      } catch (error) {
        console.error("Error fetching authors", error);
      }
    };

    fetchAuthors();
  }, []);

  useEffect(() => {
    setDisplayedAuthors(
      allAuthors.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    );
  }, [currentPage, allAuthors]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);
    setIsTyping(value.length > 0);
    const filteredAuthors = allAuthors.filter((author) =>
      author.name.toLowerCase().includes(value)
    );
    setDisplayedAuthors(filteredAuthors.slice(0, pageSize));
    setTotalPages(Math.ceil(filteredAuthors.length / pageSize));
    setCurrentPage(1); // Reset to first page
  };

  const handleAuthorClick = (authorId: number) => {
    navigate(`/author/${authorId}`);
  };

  const handleSort = (ascending: boolean) => {
    const sortedAuthors = [...allAuthors].sort((a, b) =>
      ascending ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    );
    setAllAuthors(sortedAuthors);
    setDisplayedAuthors(
      sortedAuthors.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    );
  };

  const handleSortClick = () => {
    setIsAscending((prevIsAscending) => {
      const newIsAscending = !prevIsAscending;
      handleSort(newIsAscending);
      return newIsAscending;
    });
  };
  const handleFocus = () => {
    setIsTyping(true);
  };

  const handleBlur = () => {
    if (searchTerm === "") {
      setIsTyping(false);
    }
  };
  const getImageSrc = (image: string | null) => {
    if (!image || typeof image !== "string") {
      return "/images/noImage.png";
    }
    if (image.startsWith("data:image")) {
      return image;
    }
    return `data:image/jpeg;base64,${image}`;
  };

  return (
    <div>
      <div className="search-sort-bar">
        <div className="search-wrapper">
          <input
            type="text"
            value={searchTerm}
            placeholder=""
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

          {isAscending ? "Від A до Я" : "Від Я до A"}
        </button>
      </div>
      <div className="author-grid">
        {displayedAuthors.map((author) => {
          return (
            <div
              key={author.id}
              className="author-card"
              onClick={() => handleAuthorClick(author.id)}
              role="button"
              tabIndex={0}
            >
              <img
                src={getImageSrc(author.image || null)}
                alt={author.name}
                className="author-image"
              />
              <h3>{author.name}</h3>
            </div>
          );
        })}
      </div>
      <div className="pagination-controls">
        <button onClick={handlePreviousPage} disabled={currentPage === 1}>
          Попередня
        </button>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages || displayedAuthors.length === 0}
        >
          Наступна
        </button>
      </div>
    </div>
  );
};

export default AuthorsComponent;
