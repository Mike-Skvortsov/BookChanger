import React, { useState, ChangeEvent, FormEvent, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Author } from "../types/AuthorTypes";
import "../styles/addAuthor.css";

const AddAuthorForm = () => {
  const [authorData, setAuthorData] = useState<Author>({
    id: 0,
    name: "",
    description: "",
    image: "",
    bDay: new Date(),
    dayOfDeath: null,
    books: [],
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | ArrayBuffer | null>(
    ""
  );
  const [authorStatus, setAuthorStatus] = useState("alive"); // Можливі варіанти: 'alive', 'deceased', 'unknown'
  const navigate = useNavigate();
  const [imageError, setImageError] = useState<string | null>(null);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (e.target.type === "date") {
      const dateValue = value ? new Date(value) : null;
      setAuthorData({ ...authorData, [name]: dateValue });
    } else {
      setAuthorData({ ...authorData, [name]: value });
    }
  };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target && e.target.result) {
          setImagePreview(e.target.result);
          setAuthorData({
            ...authorData,
            image: e.target.result.toString().split(",")[1],
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      !authorData.name ||
      !authorData.description ||
      !authorData.bDay ||
      !authorData.image
    ) {
      console.error("All fields must be filled out");
      return;
    }

    const authorPayload = {
      name: authorData.name,
      description: authorData.description,
      image: authorData.image,
      bDay: authorData.bDay
        ? authorData.bDay.toISOString().substring(0, 10)
        : null,
      dayOfDeath:
        authorStatus === "deceased" && authorData.dayOfDeath
          ? authorData.dayOfDeath.toISOString().substring(0, 10)
          : null,
    };
    console.log(authorPayload);

    try {
      const response = await fetch(
        "https://book-changer.vercel.app//api/author/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(authorPayload),
        }
      );

      const responseData = await response.json();
      console.log(response);
      if (!response.ok) {
        throw new Error(
          `Failed to create author: ${JSON.stringify(responseData)}`
        );
      }

      console.log("Author created successfully!");
      navigate("/add-book");
    } catch (error) {
      console.error("Network error when submitting author data:", error);
    }
  };

  return (
    <div className="add-author-form-container">
      <div className="author-form-header">
        <h2>Додати нового автора</h2>
      </div>
      <div className="image-upload-container">
        {imagePreview ? (
          <img
            src={imagePreview as string}
            alt="Author preview"
            className="author-image-preview"
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
          required
          accept=".jpg, .jpeg, .png"
          onChange={handleImageChange}
          style={{ display: "none" }}
        />
        {imageError && <div className="error-message">{imageError}</div>}
      </div>

      <div className="form-content">
        <form onSubmit={handleSubmit} className="add-author-form">
          <label htmlFor="name" className="field">
            Ім'я автора
          </label>
          <input
            id="name"
            name="name"
            placeholder="Ann in green gables"
            type="text"
            value={authorData.name}
            onChange={handleInputChange}
            required
          />
          <div className="important-days">
            <div>
              <label htmlFor="bDay" className="field">
                День народження
              </label>
              <input
                id="bDay"
                name="bDay"
                type="date"
                value={
                  authorData.bDay
                    ? authorData.bDay.toISOString().substring(0, 10)
                    : ""
                }
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <label htmlFor="authorStatus" className="field status">
                Статус автора
              </label>
              <select
                id="authorStatus"
                name="authorStatus"
                className="authorStatus"
                value={authorStatus}
                onChange={(e) => {
                  setAuthorStatus(e.target.value);
                  if (e.target.value !== "deceased") {
                    setAuthorData({ ...authorData, dayOfDeath: null });
                  }
                }}
                required
              >
                <option value="alive">Живий</option>
                <option value="deceased">Помер</option>
                <option value="unknown">Не відомо</option>
              </select>
            </div>

            {authorStatus === "deceased" && (
              <div>
                <label htmlFor="dayOfDeath" className="field">
                  День смерті
                </label>
                <input
                  id="dayOfDeath"
                  name="dayOfDeath"
                  type="date"
                  value={
                    authorData.dayOfDeath
                      ? authorData.dayOfDeath.toISOString().substring(0, 10)
                      : ""
                  }
                  onChange={handleInputChange}
                />
              </div>
            )}
          </div>

          <label htmlFor="description" className="field">
            Коротка характеристика автора
          </label>
          <textarea
            id="description"
            name="description"
            placeholder="Tempora et eos excepturi. Cum tempora molestias ut illo quos. Vero qui necessitatibus et quisquam voluptates commodi. Harum culpa error ad ut. Reiciendis laboriosam nulla et non quis ut et. Et rerum at eum itaque animi veritatis blanditiis."
            value={authorData.description}
            onChange={handleInputChange}
            minLength={50}
            maxLength={500}
            required
          />

          <div className="form-buttons">
            <button
              type="button"
              className="back-button button"
              onClick={() => navigate(-1)}
            >
              Назад
            </button>
            <button type="submit" className="next-button button">
              Далі
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAuthorForm;
