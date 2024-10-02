// components/Button.tsx
import React, { useState } from "react";
import "../styles/button.css"; // Переконайтеся, що шлях до файлу стилів вірний

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit" | "reset";
  onMouseDown?: () => void;
  onMouseUp?: () => void;
  onMouseLeave?: () => void; // Додавання типу для onMouseLeave
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  className = "",
  type = "button",
  onMouseDown,
  onMouseUp,
}) => {
  const [isPressed, setIsPressed] = useState(false);

  // Оновлення обробників для встановлення та скидання isPressed
  const handleMouseDown = () => {
    setIsPressed(true);
    if (onMouseDown) onMouseDown();
  };

  const handleMouseUp = () => {
    setIsPressed(false);
    if (onMouseUp) onMouseUp();
  };

  const handleMouseLeave = () => {
    setIsPressed(false);
  };

  return (
    <button
      type={type}
      onClick={onClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      className={`button ${isPressed ? "pressed" : ""} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
