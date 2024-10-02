import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
} from "react";
import { User } from "../types/UserTypes";
import axios from "../utils/axios";

interface UserContextType {
  user: User | null;
  userId: string;
  setUserId: (id: string) => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  token: string | null;
  setToken: (token: string | null) => void;
  image: string | null;
  setImage: React.Dispatch<React.SetStateAction<string | null>>;
  logout: () => void;
  deleteProfile: () => Promise<boolean>;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<boolean>;
  profileDeleted: boolean;
  setProfileDeleted: React.Dispatch<React.SetStateAction<boolean>>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserContextProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [userId, setUserId] = useState<string>(
    localStorage.getItem("userId") || ""
  );
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [profileDeleted, setProfileDeleted] = useState(false);
  const [user, setUser] = useState<User | null>(() => {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  });
  const [image, setImage] = useState<string | null>(null);

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      try {
        const response = await axios.post(
          `/user/changePassword`,
          {
            userId,
            currentPassword,
            newPassword,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.status === 200) {
          return true;
        }
        return false;
      } catch (error) {
        console.error("Failed to change password:", error);
        return false;
      }
    },
    [userId]
  );

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUserId = localStorage.getItem("userId");

    if (storedToken && storedUserId) {
      setToken(storedToken);
      setUserId(storedUserId);

      axios
        .get<User>(`/user/${storedUserId}`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        })
        .then((response) => setUser(response.data))
        .catch(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
          setUserId("");
          setToken(null);
        });
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setUserId("");
    setImage(null);
    setUser(null);
    setToken(null);
    setProfileDeleted(false);
  }, []);

  const deleteProfile = useCallback(async () => {
    try {
      const url = `/user/delete/${userId}`;
      const response = await axios.delete(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (response.status === 204 || response.status === 200) {
        logout();
        setProfileDeleted(true);
        return true;
      } else {
        console.error("Deletion was unsuccessful:", response.status);
        return false;
      }
    } catch (error) {
      console.error("Failed to delete profile:", error);
      return false;
    }
  }, [userId, logout]);

  const value = {
    userId,
    setUserId,
    token,
    setToken,
    user,
    setUser,
    image,
    setImage,
    profileDeleted,
    setProfileDeleted,
    logout,
    deleteProfile,
    changePassword,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};
