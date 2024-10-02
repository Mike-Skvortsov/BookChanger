import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import "../styles/userDetails.css";
import { User } from "../types/UserTypes";
import { useUserContext } from "../contexts/UserContext"; // Переконайтеся, що ви імпортували це

const UserDetail = () => {
  const { userId: paramUserId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<User | null>(null);
  const { userId } = useUserContext(); // Ідентифікатор поточного користувача
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(`/user/${paramUserId}`);
        console.log("User details received:", response.data); // Логування отриманих даних
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user details", error);
      }
    };

    fetchUserDetails();
  }, [paramUserId]);

  const handleWriteToUser = async () => {
    if (user?.id === parseInt(userId, 10)) {
      console.error("Attempted to create a chat with oneself.");
      return;
    }

    try {
      const response = await axios.post("/chat/create", {
        userTwoId: user?.id,
      });
      const newChatId = response.data.id;
      navigate(`/chat?chatId=${newChatId}`);
    } catch (error) {
      console.error("Failed to create chat", error);
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="user-detail">
      <div className="user-header"></div>
      <div className="user-content">
        <div className="user-image-container">
          <img
            src={`data:image/jpeg;base64,${user.image}`}
            alt={user.userName}
            className="user-details-image"
          />
          <div className="name-rating">
            <h1 className="user-name">{user.userName}</h1>
            <div className="user-rating">
              {user.rating?.toFixed(1) ?? "N/A"}
              <span
                className="star-icon"
                style={{
                  backgroundImage:
                    user.rating !== undefined
                      ? `linear-gradient(to right, #ffac33 ${
                          (user.rating / 5) * 100
                        }%, grey ${(user.rating / 5) * 100}%)`
                      : "linear-gradient(to right, grey, grey)",
                }}
              >
                ★
              </span>
            </div>
          </div>
          <p className="user-location">
            <span className="material-symbols-outlined location">
              location_on
            </span>{" "}
            {user.location}
          </p>
          <p className="last-visit">
            Останній візит:{" "}
            {user.onlineTime
              ? new Date(user.onlineTime).toLocaleDateString("uk-UA", {
                  day: "2-digit",
                  month: "2-digit",
                })
              : "Late"}
          </p>
        </div>
        <div className="user-info">
          <p className="user-description">{user.description}</p>
          {userId !== paramUserId && user?.id && (
            <div className="bottom-right-user">
              <button
                className="book-details-button button"
                onClick={handleWriteToUser}
              >
                Написати власнику
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="user-books">
        <h2 className="available-books">Книги для обміну</h2>
        <div className="book-list">
          {user.books?.map((book) => (
            <div key={book.id} className="book-card user-details">
              <img
                src={
                  book.image
                    ? `data:image/jpeg;base64,${book.image}`
                    : `/images/noImage.png`
                }
                alt={book.title}
                className="book-image"
              />
              <p className="book-title">{book.title}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
