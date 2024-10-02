import React, { useContext, useEffect } from "react";
import { useUserContext } from "../contexts/UserContext";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { user, setUser } = useUserContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
    }
  }, [user]);
  const handleProfileClick = () => {
    navigate(`/profile`);
  };
  return (
    <header className="navbar">
      <h3>
        <Link to="/" className="nav-link">
          Головна сторінка
        </Link>
      </h3>
      <h3>
        <Link to="/books" className="nav-link">
          Книги
        </Link>
      </h3>
      <h3>
        <Link to="/authors" className="nav-link">
          Автори
        </Link>
      </h3>
      {user?.image && (
        <img
          src={`data:image/jpeg;base64,${user.image}`}
          alt="User"
          className="navbar-user-image"
          onClick={handleProfileClick}
        />
      )}
    </header>
  );
};

export default Navbar;
