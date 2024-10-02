import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";
import Button from "../components/Button";
import { useUserContext } from "../contexts/UserContext";
import axios from "../utils/axios";

interface LoginProps {
  onLogin?: (token: string, userId: string) => void;
  onNext?: () => void;
  isLogin?: boolean;
}

const LoginForm: React.FC<LoginProps> = ({
  onLogin,
  onNext,
  isLogin = true,
}) => {
  const { setUserId, setToken } = useUserContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();

  const validateForm = () => {
    let isValid = true;
    setEmailError("");
    setPasswordError("");

    if (!email.match(/^\S+@\S+\.\S+$/)) {
      setEmailError("Формат пошти введено не правильно");
      isValid = false;
    }

    if (password.length < 6) {
      setPasswordError("Пароль повинен бути не менше 6 символів.");
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    if (isLogin) {
      try {
        const response = await axios.post("/Auth/login", { email, password });
        const { token, userId } = response.data;
        await Promise.all([
          localStorage.setItem("token", token),
          localStorage.setItem("userId", userId),
        ]);
        setToken(token);
        setUserId(userId);
        if (onLogin) onLogin(token, userId);
        navigate("/profile");
      } catch (err) {
        setError("Login failed");
      }
    } else {
      if (onNext) onNext();
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form" noValidate>
        <h1>{isLogin ? "Вхід" : "Реєстрація"}</h1>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`input ${emailError || error ? "error-input" : ""}`}
          required
          placeholder="Електронна пошта"
        />
        {emailError && <div className="error-message">{emailError}</div>}

        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`input ${passwordError || error ? "error-input" : ""}`}
          required
          placeholder="Пароль"
        />
        {passwordError && <div className="error-message">{passwordError}</div>}

        {error && <div className="error-message">{error}</div>}

        <div className="spacer"></div>

        {isLogin ? (
          <>
            <span>Ще немає акаунту?</span>
            <p className="sign-up" onClick={() => navigate("/register")}>
              Реєстрація
            </p>
          </>
        ) : (
          <p className="sign-up" onClick={() => navigate("/login")}>
            Уже маєш акаунт? Авторизація
          </p>
        )}

        <img
          className="fly-girl"
          src="/images/flyingGirl.png"
          alt="Flying Girl"
        />

        <div className="button-container">
          <Button type="button" onClick={() => navigate("/login")}>
            Назад
          </Button>
          <Button type="submit" className="next-button">
            {isLogin ? "Далі" : "Next"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
