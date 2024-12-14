import React, {
  useEffect,
  useRef,
  useState,
  FormEvent,
  ChangeEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import { Book } from "../types/BookTypes";
import "../styles/addBook.css";
import { Author } from "../types/AuthorTypes";
import { Genre } from "../types/GenreTypes";
import { useUserContext } from "../contexts/UserContext";

const AddBookForm = () => {
  const [bookData, setBookData] = useState<Book>({
    id: 0,
    title: "",
    authorNames: "",
    announcedPrice: 0,
    image: "",
    description: "",
    pageCount: 0,
    conditionOfTheBook: "",
    language: "",
    authors: [],
    genres: [],
  });

  const { user, userId } = useUserContext();
  const [authors, setAuthors] = useState<Author[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [imagePreview, setImagePreview] = useState<string | ArrayBuffer | null>(
    ""
  );
  const [imageError, setImageError] = useState<string | null>(null);
  const [authorsError, setAuthorsError] = useState<string | null>(null);
  const [genresError, setGenresError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setBookData((prev) => ({ ...prev, ownerId: user.id }));
    }
    fetchAuthors();
    fetchGenres();
  }, [user]);

  const fetchAuthors = async () => {
    try {
      const response = await fetch(
        "https://bookchangerbackend.onrender.com/api/Author/all"
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAuthors(data);
    } catch (error) {
      console.error("Failed to fetch authors:", error);
    }
  };

  const fetchGenres = async () => {
    try {
      const response = await fetch(
        "https://bookchangerbackend.onrender.com/api/Genre"
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setGenres(data);
    } catch (error) {
      console.error("Failed to  fetch genres:", error);
    }
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (e.target.type === "number") {
      const numberValue = value === "" ? 0 : Number(value);
      setBookData({ ...bookData, [name]: numberValue });
    } else {
      setBookData({ ...bookData, [name]: value });
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "authors") {
      if (value === "") {
        return;
      }
      const selectedAuthor = authors.find(
        (author) => author.id.toString() === value
      );
      if (
        selectedAuthor &&
        !bookData.authors?.some((author) => author.id === selectedAuthor.id)
      ) {
        setBookData((prev) => ({
          ...prev,
          authors: [...(prev.authors || []), selectedAuthor],
        }));
        if (authorsError) {
          setAuthorsError(null); // Скидаємо помилку, якщо користувач виправив
        }
      }
    } else if (name === "genres") {
      if (value === "") {
        return;
      }
      const selectedGenre = genres.find(
        (genre) => genre.id.toString() === value
      );
      if (
        selectedGenre &&
        !bookData.genres?.some((genre) => genre.id === selectedGenre.id)
      ) {
        setBookData((prev) => ({
          ...prev,
          genres: [...(prev.genres || []), selectedGenre],
        }));
        if (genresError) {
          setGenresError(null); // Скидаємо помилку, якщо користувач виправив
        }
      }
    }
  };

  const removeAuthor = (id: number) => {
    setBookData((prev) => ({
      ...prev,
      authors: prev.authors?.filter((author) => author.id !== id) || [],
    }));
    if (!bookData.authors || bookData.authors.length <= 1) {
      setAuthorsError("Виберіть хоча б 1 автора.");
    }
  };

  const removeGenre = (id: number) => {
    setBookData((prev) => ({
      ...prev,
      genres: prev.genres?.filter((genre) => genre.id !== id) || [],
    }));
    if (!bookData.genres || bookData.genres.length <= 1) {
      setGenresError("Виберіть хоча б 1 жанр.");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validImageTypes = ["image/jpeg", "image/png"];
      if (!validImageTypes.includes(file.type)) {
        setImageError("Допускаються лише формати JPEG та PNG");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target && e.target.result) {
          setImagePreview(e.target.result.toString());
          setBookData({
            ...bookData,
            image: e.target.result.toString().split(",")[1],
          });
          setImageError(null);
        }
      };
      reader.readAsDataURL(file);
    } else {
      setImageError("Завантажте зображення книги");
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!bookData.authors || bookData.authors.length === 0) {
      setAuthorsError("Please select at least one author.");
      return;
    } else {
      setAuthorsError(null);
    }

    if (!bookData.genres || bookData.genres.length === 0) {
      setGenresError("Please select at least one genre.");
      return;
    } else {
      setGenresError(null);
    }
    if (!imagePreview) {
      setImageError("Завантажте зображення книги");
      return;
    }
    const bookPayload = {
      title: bookData.title,
      description: bookData.description,
      pageCount: bookData.pageCount,
      announcedPrice: bookData.announcedPrice,
      image: bookData.image,
      ownerId: userId,
      language: bookData.language || "",
      conditionOfTheBook: bookData.conditionOfTheBook,
      authorIds: bookData.authors ? bookData.authors.map((a) => a.id) : [],
      genreIds: bookData.genres ? bookData.genres.map((g) => g.id) : [],
    };

    try {
      console.log(bookPayload);
      const response = await fetch("https://localhost:44389/api/Book/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(bookPayload),
      });

      if (!response.ok) {
        throw response;
      }
      alert("Book created successfully!");
      navigate("/myBooks");
    } catch (error) {
      console.error("Error creating the book:", error);
      alert("Failed to create the book. Please try again.");
    }
  };

  return (
    <div className="add-book-form-container">
      <div className="book-form-header">
        <h2>Додайте книгу, яку ви хочете обміняти або продати</h2>
      </div>
      <div className="image-upload-container">
        {imagePreview ? (
          <img
            src={imagePreview as string}
            alt="Book preview"
            className="book-image-preview"
            onClick={() => fileInputRef.current?.click()}
          />
        ) : (
          <label htmlFor="image" className="image-upload-label">
            <svg
              className="edit-icon"
              xmlns="http://www.w3.org/2000/svg"
              height="24"
              viewBox="0 0 24 24"
              width="24"
            >
              <path d="M0 0h24v24H0V0z" fill="none" />
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
            </svg>
          </label>
        )}
        <input
          ref={fileInputRef}
          id="image"
          name="image"
          type="file"
          onChange={handleImageChange}
          required
          accept="image/jpeg,image/png"
          style={{ display: "none" }}
        />
        {imageError && <div className="error-message image">{imageError}</div>}
      </div>
      <div className="form-content">
        <form onSubmit={handleSubmit} className="add-book-form">
          {/* Title Input */}
          <label htmlFor="title" className="field">
            Назва книги
          </label>
          <input
            id="title"
            name="title"
            type="text"
            placeholder="Старий та море"
            value={bookData.title}
            required
            title="This field is required"
            onChange={handleInputChange}
          />
          {/* Author Select */}
          <label htmlFor="authors" className="field">
            Автор
          </label>
          <select
            className="select-container"
            id="authors"
            name="authors"
            value={""} // Ensures no selection is made by default
            onChange={handleSelectChange}
          >
            <option value="">Вибрати автора</option>
            {authors.map((author) => (
              <option key={author.id} value={author.id.toString()}>
                {author.name}
              </option>
            ))}
          </select>
          {authorsError && <div className="error-message">{authorsError}</div>}
          <div className="selected-authors">
            {bookData.authors!.map((author) => (
              <div key={author.id} className="selected-item">
                {author.name}
                <span
                  className="remove-item"
                  onClick={() => removeAuthor(author.id)}
                >
                  ×
                </span>
              </div>
            ))}
          </div>
          <p className="author-help-text">
            Не знайшли автора своєї книги? Створіть його самі та познайомте
            своїх читачів з новим обличчям. Це займе всього кілька хвилин.
          </p>
          <button
            type="button"
            className="author-add-button"
            onClick={() => navigate("/add-author")}
          >
            Створити автора
          </button>
          {/* Genre Select */}
          <label htmlFor="genres" className="field">
            Жанри
          </label>
          <select
            className="select-container"
            id="genres"
            name="genres"
            value=""
            onChange={handleSelectChange}
          >
            <option value="">Вибрати жанр</option>
            {genres.map((genre) => (
              <option key={genre.id} value={genre.id.toString()}>
                {genre.name}
              </option>
            ))}
          </select>
          <div className="selected-genres">
            {bookData.genres!.map((genre) => (
              <div key={genre.id} className="selected-item">
                {genre.name}
                <span
                  className="remove-item"
                  onClick={() => removeGenre(genre.id)}
                >
                  ×
                </span>
              </div>
            ))}
          </div>
          {genresError && <div className="error-message">{genresError}</div>}
          {/* Language Input */}
          <label htmlFor="language" className="field">
            Мова
          </label>
          <input
            id="language"
            name="language"
            placeholder="Українська"
            type="text"
            required
            title="This field is required"
            onChange={handleInputChange}
            value={bookData.language || ""}
          ></input>
          {/* Price Input */}
          <div className="price-page-count-container">
            <div>
              <div className="label-container">
                <label htmlFor="price" className="field">
                  Ціна
                </label>
                <div className="info-icon-container">
                  <span className="info-icon">
                    ⓘ
                    <span className="tooltip">
                      Вкажіть ціну, за яку ви бажаєте продати книгу
                    </span>
                  </span>
                </div>
              </div>
              <input
                id="announcedPrice"
                name="announcedPrice"
                type="number"
                placeholder="97"
                required
                title="This field is required"
                value={
                  bookData.announcedPrice
                    ? bookData.announcedPrice.toString()
                    : ""
                }
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label htmlFor="pageCount" className="field">
                Кількість сторінок
              </label>
              <input
                id="pageCount"
                name="pageCount"
                type="number"
                placeholder="234"
                required
                title="This field is required"
                value={bookData.pageCount ? bookData.pageCount.toString() : ""}
                onChange={handleInputChange}
              />
            </div>
          </div>
          {/* Condition Input */}
          <div className="condition">
            <label htmlFor="condition" className="field">
              Стан книги
            </label>
            <span className="info-icon condition">
              ⓘ
              <span className="tooltip">
                Вкажіть стан книги, якщо є якісь дефекти, обов'язково опишіть їх
              </span>
            </span>
          </div>
          <input
            id="condition"
            name="conditionOfTheBook"
            type="text"
            placeholder="New"
            required
            title="This field is required"
            value={bookData.conditionOfTheBook}
            onChange={handleInputChange}
          />
          {/* Description Textarea */}
          <label htmlFor="description" className="field">
            Короткий опис книги
          </label>
          <textarea
            id="description"
            name="description"
            placeholder=" «Стари́й і мо́ре» — повість американського письменника Ернеста Гемінґвея, видана у 1952 році. В основі роману розповідь про кубинського рибалку Сантьяго, його боротьбу з гігантською рибиною, що стала найбільшою здобиччю в його житті."
            value={bookData.description}
            required
            title="This field is required"
            onChange={handleInputChange}
          />
          {/* Submit Button */}
          <div className="form-buttons">
            <button
              type="button"
              className="back-button button"
              onClick={() => navigate(-1)}
            >
              Назад
            </button>
            <button type="submit" className="next-button button">
              Зберегти книгу
            </button>
          </div>
        </form>
        <img
          src="/images/girl-read-on-floor.png"
          className="girl-read-on-floor"
        ></img>
        <img src="/images/book-house.png" className="book-house"></img>
      </div>
    </div>
  );
};

export default AddBookForm;
