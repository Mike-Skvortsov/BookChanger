import React from "react";
import "../styles/confirmDialog.css";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  message: string;
  className?: string;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  message,
  className,
}) => {
  if (!isOpen) return null;

  const dialogClass = `delete-confirmation ${className}`;

  return (
    <div className={`confirmation-dialog-backdrop ${dialogClass}`}>
      <div className={`confirmation-dialog ${dialogClass}`}>
        <p className="message">{message}</p>
        <div className="yes-no">
          <button className="button button-yes-no" onClick={onCancel}>
            Ні
          </button>
          <button
            className="next-button button button-yes-no"
            onClick={onConfirm}
          >
            Так
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
