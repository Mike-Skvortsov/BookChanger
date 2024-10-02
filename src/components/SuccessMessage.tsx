import React from "react";
import "../styles/successMessage.css";

interface SuccessMessageProps {
  isVisible: boolean;
  onClose: () => void;
  message: string;
  imageSrc?: string;
  type?: string;
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({
  isVisible,
  onClose,
  message,
  imageSrc,
  type,
}) => {
  if (!isVisible) return null;

  const messageClass = `delete-success ${type}`;

  const handleClose = () => {
    onClose();
  };

  return (
    <div
      className={`success-message-backdrop ${messageClass}`}
      onClick={onClose}
    >
      <div className={`success-message ${messageClass}`}>
        <p>{message}</p>
        {imageSrc && <img src={imageSrc} alt="Success" />}
      </div>
    </div>
  );
};

export default SuccessMessage;
