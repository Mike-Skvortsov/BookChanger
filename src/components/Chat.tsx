import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom"; // Додати для обробки search params
import Sidebar from "./Sidebar";
import ChatList from "./ChatList";
import MessageArea from "./MessageArea";
import "../styles/chatPage.css";
import { useUserContext } from "../contexts/UserContext";

const Chat: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const { userId } = useUserContext();

  useEffect(() => {
    const chatIdFromURL = parseInt(searchParams.get("chatId") || "", 10);
    if (chatIdFromURL) {
      setSelectedChatId(chatIdFromURL);
    }
  }, [searchParams]);

  return (
    <div className="chat-page">
      <Sidebar />
      <div className="chat-section">
        <ChatList onSelectChat={setSelectedChatId} currentUserId={userId} />
        <MessageArea chatId={selectedChatId} />
      </div>
    </div>
  );
};

export default Chat;
