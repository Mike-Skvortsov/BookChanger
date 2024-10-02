import React, { useState, useEffect, useContext } from "react";
import Sidebar from "./Sidebar";
import "../styles/userProfile.css";
import { useUserContext } from "../contexts/UserContext";
import Button from "./Button";
import axios from "../utils/axios";
import SuccessMessage from "./SuccessMessage";
import { useNavigate } from "react-router-dom";

const UserProfile: React.FC = () => {
  const { userId, user, setUser, image, profileDeleted, setProfileDeleted } =
    useUserContext();
  const navigate = useNavigate();
  const [successInfo, setSuccessInfo] = useState({
    isVisible: false,
    message: "",
    imageSrc: "",
    type: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`/User/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setUser(response.data);
      } catch (error) {
        console.error("An unexpected error occurred", error);
      }
    };

    fetchUser();
  }, [userId, profileDeleted, navigate, setProfileDeleted, setUser]);

  const handleSave = async () => {
    if (!user) {
      console.error("No user data to save");
      return;
    }

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      };

      const updateUserInfo = {
        UserName: user.userName,
        Description: user.description,
        Image: image,
        Location: user.location,
        PhoneNumber: user.phoneNumber,
        Email: user.email,
      };
      const body = JSON.stringify(updateUserInfo);
      const response = await axios.put("/User/update", body, config);

      setSuccessInfo({
        isVisible: true,
        message: "Profile updated successfully!",
        imageSrc: "/images/success-icon.png",
        type: "update-success",
      });
    } catch (error) {
      console.error("An error occurred while updating the user", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  return (
    <>
      <div className="user-profile">
        <Sidebar />
        <div className="user-details">
          <h2 className="personal-data">Персональні дані</h2>
          <img src="/images/flyingBooks.png" className="flying-books"></img>
          <p className="user-profile-p">Ім'я</p>
          <input
            type="text"
            value={user ? user.userName : ""}
            onChange={(e) =>
              user && setUser({ ...user, userName: e.target.value })
            }
          />
          <p className="user-profile-p">Номер телефону</p>
          <input
            type="number"
            value={user ? user.phoneNumber : ""}
            onChange={(e) =>
              user && setUser({ ...user, phoneNumber: e.target.value })
            }
          />
          <p className="user-profile-p">Пошта</p>
          <input
            type="text"
            value={user ? user.email : ""}
            onChange={(e) =>
              user && setUser({ ...user, email: e.target.value })
            }
          />
          <p className="user-profile-p">Місце знаходження</p>
          <input
            type="text"
            value={user ? user.location : ""}
            onChange={(e) =>
              user && setUser({ ...user, location: e.target.value })
            }
          />
          <p className="user-profile-p">Про мене</p>
          <textarea
            className="user-profile-textarea"
            value={user ? user.description : ""}
            onChange={(e) =>
              user && setUser({ ...user, description: e.target.value })
            }
          />
          <Button onClick={handleSave} className="user-profile-save-button">
            Зберегти
          </Button>
        </div>
      </div>
      <img src="/images/ManReading.png" className="man-reading"></img>
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
    </>
  );
};

export default UserProfile;
