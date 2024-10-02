import React from "react";
import { Navigate, useLocation, RouteProps } from "react-router-dom";
import { useUserContext } from "../contexts/UserContext";

const PrivateRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { token, userId } = useUserContext();

  if (token === null) {
    return <Navigate to="/login" replace />;
  }
  if (userId === null) {
    return <div>Loading...</div>;
  }

  return children;
};

export default PrivateRoute;
