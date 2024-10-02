import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/homePage.css";
import axios from "../utils/axios";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Book } from "../types/BookTypes"; // Make sure this path is correct

const HomePage: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const navigate = useNavigate();
  const handleBookClick = (bookId: String) => {
    navigate(`/books/${bookId}`);
  };
  useEffect(() => {
    const fetchTopBooks = async () => {
      try {
        const response = await axios.get("/book/topBooks?count=4");
        if (response.data) {
          setBooks(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch top books", error);
      }
    };

    fetchTopBooks();
  }, []);

  return (
    <div>
      <div className="homePage">
        <h4>Ласкаво просимо до BookSwap!</h4>
        <p>
          BookSwap — це унікальна спільнота для любителів книг, що дозволяє вам
          обмінюватись прочитаними книгами з іншими читачами по всій країні.
          Наша платформа створена, щоб зробити процес обміну книгами простим,
          зручним і надихаючим.
        </p>
        <p>Що ви отримаєте з BookSwap?</p>
        <ul>
          <li>
            Обмін книгами: Відкрийте для себе нові твори, обмінюючись книгами з
            іншими.
          </li>
          <li>
            Зручність: Ви можете обирати книги для обміну, створювати списки
            бажань.
          </li>
          <li>
            Спільнота: Приєднуйтесь до спільноти однодумців, які підтримують
            культуру читання.
          </li>
          <li>
            Екологічність: Знижуйте відходи, обираючи обмін книгами замість
            купівлі нових.
          </li>
        </ul>
      </div>
      <h3 className="home-page-h3">Як це працює?</h3>
      <img src="/images/homePage.png" className="image-home-page" alt="" />
      <p className="home-page-h3">
        Приєднуйтесь до нас сьогодні і станьте частиною революції у світі
        читання з BookSwap!
      </p>
      <div className="books-section homePage">
        {books.map((book, index) => (
          <div key={index} className="book-card-on-looks-books">
            <LazyLoadImage
              src={
                book.image
                  ? `data:image/jpeg;base64,${book.image}`
                  : "/images/noImage.png"
              }
              alt={book.title}
              className="book-image"
              onClick={() => handleBookClick(book.id.toString())}
              effect="blur"
            />
            <div className="book-content">
              <h3 className="book-title">{book.title}</h3>
              <p className="book-author">
                {book.authorNames || "Unknown Author"}
              </p>
              <hr />
              <p className="book-price">{`${book.announcedPrice} €`}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
