import React, {
  useContext,
  useRef,
  ChangeEvent,
  useState,
  useEffect,
} from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import "../styles/sidebar.css";
import { useUserContext } from "../contexts/UserContext";
import ChangePasswordModal from "./ChangePasswordModal";
import axios from "../utils/axios";
import SuccessMessage from "./SuccessMessage";
import ConfirmationDialog from "./ConfirmationDialog";
import "../styles/successMessage.css";

const Sidebar = () => {
  const { user, setImage, image, logout, deleteProfile } = useUserContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);
  const [error, setError] = useState("");
  const [successInfo, setSuccessInfo] = useState({
    isVisible: false,
    message: "",
    imageSrc: "",
    type: "",
  });
  const [dialog, setDialog] = useState({
    isOpen: false,
    type: "",
    message: "",
  });
  const openModal = (type: any) => {
    switch (type) {
      case "delete":
        setDialog({
          isOpen: true,
          type: "delete",
          message:
            "Ви дійсно бажаєте видалити профіль? Ця дія очистить всю інформацію про Вас.",
        });
        break;
      case "logout":
        setDialog({
          isOpen: true,
          type: "logout",
          message: "Ви дійсно бажаєте вийти?",
        });
        break;
    }
  };

  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isConfirmLogoutOpen, setIsConfirmLogoutOpen] = useState(false);

  const openChangePasswordModal = () => setIsChangePasswordModalOpen(true);
  const closeChangePasswordModal = () => setIsChangePasswordModalOpen(false);
  const openDeleteConfirmation = () => setIsConfirmDeleteOpen(true);
  const openLogoutConfirmation = () => setIsConfirmLogoutOpen(true);

  const handleLogout = () => {
    setIsConfirmLogoutOpen(false);
    logout();
    navigate("/login");
  };

  const handleConfirm = () => {
    setDialog({ ...dialog, isOpen: false }); // Close the dialog irrespective of the action result to enhance UI responsiveness.

    if (dialog.type === "delete") {
      deleteProfile()
        .then((deletionSuccess) => {
          if (deletionSuccess) {
            setSuccessInfo({
              isVisible: true,
              message: "Ваш профіль успішно видалено",
              imageSrc: "",
              type: "delete-success",
            });
            navigate("/login");
          } else {
            setError(
              "Не вдалося видалити профіль. Будь ласка, спробуйте пізніше."
            );
          }
        })
        .catch((error) => {
          console.error("Deletion failed:", error);
          setError(
            "Помилка при видаленні профілю. Будь ласка, перевірте мережеве з'єднання."
          );
        });
    } else if (dialog.type === "logout") {
      logout();
      navigate("/login");
    }
  };

  const handleCancel = () => {
    setDialog({ ...dialog, isOpen: false });
  };
  const handleChangePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> => {
    try {
      const response = await axios.post(
        "/user/changePassword",
        { currentPassword, newPassword },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (response.status === 200) {
        setSuccessInfo({
          isVisible: true,
          message: "Пароль успішно змінено!",
          imageSrc: "/images/success-icon.png",
          type: "change-password-success",
        });
        return true;
      } else {
        setError("Failed to change password. Please try again."); // Update error state instead of using alert
        return false;
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setError("Неправильний поточний пароль.");
      return false;
    }
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const base64Image = reader.result as string;
        setImage(base64Image); // Оновлення зображення у контексті
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <aside className="sidebar">
      <div className="photo-container">
        <img
          src={image || `data:image/jpeg;base64,${user?.image}`}
          alt="User"
          className="user-image"
        />
        {location.pathname === "/profile" && (
          <div
            className="overlay"
            onClick={() => fileInputRef.current?.click()}
          >
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
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          hidden
          accept="image/*"
          onChange={handleImageChange}
        />
      </div>
      <nav>
        <div className="navigation">
          <NavLink to={`/profile`}>Персональні дані</NavLink>
          <NavLink to={`/myBooks`}>Книжкова шафа</NavLink>
          <NavLink to="/wishlist">Список бажань</NavLink>
          <NavLink to="/chat">Чати</NavLink>
        </div>
        {location.pathname === "/profile" && (
          <>
            <hr></hr>
            <div className="dop-function">
              <div className="clickable-text" onClick={openChangePasswordModal}>
                Змінити пароль
              </div>
              <div
                className="clickable-text"
                onClick={() => openModal("delete")}
              >
                Видалити акаунт
              </div>
              <div
                className="clickable-text"
                onClick={() => openModal("logout")}
              >
                Вийти
              </div>
            </div>
          </>
        )}
        <ChangePasswordModal
          isOpen={isChangePasswordModalOpen}
          onClose={() => {
            closeChangePasswordModal();
            setError("");
          }}
          onSubmit={handleChangePassword}
          errorMessage={error}
        />
        <ConfirmationDialog
          isOpen={dialog.isOpen}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          message={dialog.message}
        />
        <SuccessMessage
          isVisible={successInfo.isVisible}
          onClose={() => {
            setSuccessInfo({ ...successInfo, isVisible: false });
            if (successInfo.type === "delete-success") {
              navigate("/login");
            }
          }}
          message={successInfo.message}
          imageSrc={successInfo.imageSrc}
          type={successInfo.type}
        />
      </nav>
    </aside>
  );
};

export default Sidebar;
