import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UserProfile from "./components/UserProfile";
import Navbar from "./components/Navbar";
import "./styles/navbar.css";
import BookCase from "./components/BookCase";
import { UserContextProvider, useUserContext } from "./contexts/UserContext";
import LoginForm from "./forms/LoginForm";
import PrivateRoute from "./components/PrivateRoute";
import AddBookForm from "./components/AddBook";
import AddAuthor from "./components/AddAuthor";
import AuthorsComponent from "./components/LookAuthors";
import AuthorDetail from "./components/AuthorDetail";
import BooksComponent from "./components/LookBooks";
import BookDetails from "./components/BookDetails";
import RegisterForm from "./forms/RegistrationForm";
import UserDetail from "./components/UserDetails";
import Chat from "./components/Chat";
import HomePage from "./components/HomePages";
import Wishlist from "./components/WishList";

const App: React.FC = () => {
  return (
    <UserContextProvider>
      <AppContent />
    </UserContextProvider>
  );
};

const AppContent: React.FC = () => {
  const { setUserId } = useUserContext();
  const onLogin = (token: string, userId: string) => {
    localStorage.setItem("token", token);
    localStorage.setItem("userId", userId);
    setUserId(userId);
  };

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <UserProfile />
            </PrivateRoute>
          }
        />
        <Route path="/" element={<HomePage />} />
        <Route path="/myBooks" element={<BookCase />} />
        <Route path="/authors" element={<AuthorsComponent />} />
        <Route path="/books" element={<BooksComponent />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/login" element={<LoginForm onLogin={onLogin} />} />
        <Route path="/author/:authorId" element={<AuthorDetail />} />
        <Route path="/books/:bookId" element={<BookDetails />} />
        <Route path="/add-author" element={<AddAuthor />} />
        <Route path="/add-book" element={<AddBookForm />} />
        <Route path="/user/:userId" element={<UserDetail />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </Router>
  );
};

export default App;
