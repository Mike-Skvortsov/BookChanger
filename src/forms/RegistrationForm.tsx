import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/register.css";
import Button from "../components/Button";
import { useUserContext } from "../contexts/UserContext";
import axios from "../utils/axios";

const RegisterForm: React.FC = () => {
  const { setUserId, setToken, setUser } = useUserContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [locationError, setLocationError] = useState("");
  const [imageError, setImageError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const validateForm = (step: number): boolean => {
    let isValid = true;

    if (step === 1) {
      setEmailError("");
      setPasswordError("");

      if (!email.match(/^\S+@\S+\.\S+$/)) {
        setEmailError("The email format is incorrect.");
        isValid = false;
      }
      if (password.length < 6) {
        setPasswordError("Password must contain at least 6 characters.");
        isValid = false;
      }
    } else if (step === 2) {
      setNameError("");
      setPhoneError("");
      setLocationError("");
      setImageError("");
      setDescriptionError("");

      if (!name.trim()) {
        setNameError("Ім'я обов'язкове.");
        isValid = false;
      }
      if (!phone.trim()) {
        setPhoneError("номер телефону обов'язковий.");
        isValid = false;
      }
      if (!location.trim()) {
        setLocationError("Місце знаходження обов'язкове.");
        isValid = false;
      }
      if (!image) {
        setImageError("Фото обов'язкове.");
        isValid = false;
      }
      if (!description.trim()) {
        setDescriptionError("Опис обов'язковий.");
        isValid = false;
      }
    }

    return isValid;
  };

  const handleNext = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (validateForm(1)) {
      setStep(2);
    }
  };

  const handleRegister = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    if (!validateForm(2)) return;

    const registerData = {
      email,
      password,
      userName: name,
      phoneNumber: phone,
      location,
      description,
      image: image ? image.split(",")[1] : null,
    };

    try {
      const response = await axios.post("/Auth/register", registerData, {
        headers: { "Content-Type": "application/json" },
      });

      const { token, userId } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId);
      setToken(token);
      setUserId(userId);

      const userResponse = await axios.get(`/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(userResponse.data);

      navigate("/profile");
    } catch (err) {
      setEmailError("Registration failed. Please try again.");
      console.error(err);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { value } = e.target;
    if (/^\d*$/.test(value)) {
      setPhone(value);
    }
  };

  return (
    <div className="register-container">
      <form
        onSubmit={step === 1 ? handleNext : handleRegister}
        className={step === 1 ? "login-form" : "register-form"}
        noValidate
      >
        <h1 className={step === 1 ? "" : "sign-up-title"}>
          {step === 1 ? "Реєстрація" : "Реєстрація"}
        </h1>

        {step === 1 && (
          <>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`input ${emailError ? "error-input" : ""}`}
              required
              placeholder="Електронна пошта"
            />
            {emailError && <div className="error-message">{emailError}</div>}
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`input ${passwordError ? "error-input" : ""}`}
              required
              placeholder="Пароль"
            />
            {passwordError && (
              <div className="error-message">{passwordError}</div>
            )}
            <div className="spacer"></div>

            <span>Уже маєш акаунт?</span>
            <p className="sign-up" onClick={() => navigate("/login")}>
              Увійти
            </p>
            <img
              className="fly-girl"
              src="/images/flyingGirl.png"
              alt="Flying Girl"
            />
            <div className="button-container">
              <Button onClick={() => navigate("/login")}>Назад</Button>
              <Button type="submit" className="next-button">
                Далі
              </Button>
            </div>
          </>
        )}

        {step === 2 && (
          <div className="add-user-form-container">
            <div className="form-content">
              <div className="first">
                <div className="image-upload-container">
                  <label htmlFor="image" className="image-upload-label">
                    <img
                      src={image ? image : "/images/noImage.png"}
                      className={`user-image-preview ${
                        imageError ? "error-input" : ""
                      }`}
                    />
                    <input
                      id="image"
                      type="file"
                      onChange={handleImageChange}
                      accept=".jpg, .jpeg, .png" // Specify the file types
                      className="image-input"
                    />
                  </label>
                  {imageError && (
                    <div className="error-message image-error">
                      {imageError}
                    </div>
                  )}
                </div>
                <div className="name-input-container">
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Ім'я"
                    className={`input ${nameError ? "error-input" : ""}`}
                  />
                  {nameError && (
                    <div className="error-message name-error">{nameError}</div>
                  )}
                </div>
              </div>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                required
                placeholder="Номер телефону"
                className={`input ${phoneError ? "error-input" : ""}`}
              />
              {phoneError && <div className="error-message">{phoneError}</div>}
              <input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                placeholder="Місце знаходження"
                className={`input ${locationError ? "error-input" : ""}`}
              />
              {locationError && (
                <div className="error-message">{locationError}</div>
              )}
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                placeholder="Про тебе"
                className={`input descriprion ${
                  descriptionError ? "error-input" : ""
                }`}
              />
              {descriptionError && (
                <div className="error-message">{descriptionError}</div>
              )}
              <div className="button-container">
                <Button onClick={() => setStep(step - 1)}>Назад</Button>
                <Button type="submit" className="next-button">
                  Далі
                </Button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default RegisterForm;
