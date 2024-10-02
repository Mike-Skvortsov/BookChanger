import React, { useState } from "react";
import "../styles/changePasswordModal.css";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (currentPassword: string, newPassword: string) => Promise<boolean>; // Modify onSubmit to return a boolean indicating success or failure
  errorMessage: string;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  errorMessage,
}) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState(""); // Add state to handle error message

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Reset error state on submit attempt
    const success = await onSubmit(currentPassword, newPassword);
    if (success) {
      onClose(); // Close modal on successful password change
    } else {
      setError("Поточний пароль введено не вірно"); // Set error message if password change fails
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-content">
          <img
            className="password-change-image"
            src="/images/forgot-password.png"
            alt="Change Password"
          />
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-group">
              <p>Поточний пароль</p>
              <input
                className="pass"
                id="currentPassword"
                type="password"
                placeholder="Поточний пароль"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              {errorMessage && <div className="error-text">{errorMessage}</div>}
            </div>
            <div className="form-group">
              <p>Новий пароль</p>
              <input
                className="pass"
                id="newPassword"
                type="password"
                placeholder="Новий пароль"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="cancel-btn button"
                onClick={onClose}
              >
                Назад
              </button>
              <button type="submit" className="submit-btn next-button button">
                Зберегти
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
