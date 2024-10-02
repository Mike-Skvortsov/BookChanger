import React, { useEffect, useState } from "react";
import { Chat } from "../types/ChatTypes";
import axios from "../utils/axios";

interface ChatListProps {
  onSelectChat: (chatId: number) => void;
  currentUserId: string | number;
}

const ChatList: React.FC<ChatListProps> = ({ onSelectChat, currentUserId }) => {
  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await axios.get<Chat[]>("/chat/mychats");
        setChats(response.data);
      } catch (error) {
        console.error("Failed to load chats", error);
      }
    };
    fetchChats();
  }, []);

  return (
    <div className="chat-list">
      {chats.map((chat) => {
        if (
          chat.userOne.id === currentUserId &&
          chat.userTwo.id === currentUserId
        ) {
          return null;
        }

        const otherUser =
          chat.userOne.id == currentUserId ? chat.userTwo : chat.userOne;

        return (
          <div
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className="chat-item"
          >
            <img
              src={`data:image/jpeg;base64,${otherUser.image}`}
              alt={otherUser.userName}
              className="chat-user-image"
            />
            <div className="chat-user-name">{otherUser.userName}</div>
          </div>
        );
      })}
    </div>
  );
};

export default ChatList;
