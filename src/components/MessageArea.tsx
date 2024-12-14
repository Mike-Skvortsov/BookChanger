import React, { useState, useEffect } from "react";
import axios from "../utils/axios";
import { Message } from "../types/MessageTypes";
import { Chat } from "../types/ChatTypes";
import { useUserContext } from "../contexts/UserContext";
import {
  HubConnectionBuilder,
  LogLevel,
  HubConnectionState,
} from "@microsoft/signalr";

interface MessageAreaProps {
  chatId: number | null;
}

const MessageArea: React.FC<MessageAreaProps> = ({ chatId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatDetails, setChatDetails] = useState<Chat | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const { userId } = useUserContext();
  const [connection, setConnection] = useState<any>(null);

  // Створення нового підключення до SignalR
  useEffect(() => {
    const newConnection = new HubConnectionBuilder()
      .withUrl("https://bookchangerbackend.onrender.com/chathub", {
        accessTokenFactory: () => localStorage.getItem("token") || "",
      })
      .configureLogging(LogLevel.Information)
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);

    return () => {
      if (connection) {
        connection.stop();
      }
    };
  }, []);

  // Підключення та підписка на події при зміні chatId або стану підключення
  useEffect(() => {
    if (connection && chatId) {
      const startConnection = async () => {
        try {
          if (connection.state !== HubConnectionState.Connected) {
            await connection.start();
            console.log("Connected!");
          }

          await connection.invoke("AddToGroup", chatId.toString());
          connection.on(
            "ReceiveMessage",
            (user: string, message: string, messageId: string) => {
              const newMsg: Message = {
                id: messageId,
                content: message,
                senderId: parseInt(user),
                chatId: chatId as number,
                timestamp: new Date(),
              };
              setMessages((prevMessages) => [...prevMessages, newMsg]);
            }
          );
        } catch (e) {
          console.log("Connection failed: ", e);
        }
      };
      startConnection();

      return () => {
        if (connection) {
          connection.off("ReceiveMessage");
          connection
            .invoke("RemoveFromGroup", chatId.toString())
            .catch((error: any) =>
              console.error("Failed to leave group", error)
            );
        }
      };
    }
  }, [connection, chatId]);

  // Завантаження деталей чату при зміні chatId
  useEffect(() => {
    const fetchChatDetails = async () => {
      if (chatId) {
        try {
          const response = await axios.get<Chat>(`/Chat/${chatId}`);
          setChatDetails(response.data);
          setMessages(response.data.messages);
        } catch (error) {
          console.error("Failed to fetch chat details", error);
        }
      } else {
        setChatDetails(null);
        setMessages([]);
      }
    };

    fetchChatDetails();
  }, [chatId]);

  // Надсилання повідомлення
  const sendMessage = async () => {
    if (chatId && newMessage.trim()) {
      console.log("Sending message...");
      try {
        const receiverId =
          chatDetails?.userOne.id.toString() === userId.toString()
            ? chatDetails.userTwo.id
            : chatDetails?.userOne.id;

        const response = await axios.post<Message>("/Message/send", {
          content: newMessage,
          chatId,
          senderId: parseInt(userId), // Перетворення userId на число
          receiverId: receiverId,
          isRead: false,
        });

        if (connection.state === HubConnectionState.Connected) {
          connection
            .invoke(
              "SendMessageToGroup",
              chatId.toString(),
              userId.toString(),
              newMessage,
              response.data.id
            )
            .catch((err: any) => console.error("SignalR invoke error: ", err));
        }
        setNewMessage("");
      } catch (error) {
        console.error("Failed to send message", error);
      }
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const getLastSeenText = (lastOnlineTime: Date) => {
    const now = new Date();
    const difference = now.getTime() - lastOnlineTime.getTime();
    const hours = Math.floor(difference / (1000 * 60 * 60));

    if (hours < 24) {
      return `Online ${hours} hour(s) ago`;
    } else {
      return `Останній візит: ${lastOnlineTime.toLocaleDateString()}`;
    }
  };

  const otherUser =
    chatDetails?.userOne.id.toString() === userId.toString()
      ? chatDetails?.userTwo
      : chatDetails?.userOne;

  return (
    <div className="message-area">
      {chatDetails && otherUser && (
        <div className="message-sender-info">
          <img
            src={`data:image/jpeg;base64,${otherUser.image}`}
            alt={otherUser.userName}
            className="sender-image"
          />
          <div className="sender-name">{otherUser.userName}</div>
          <div className="sender-details">
            <div className="last-seen">
              {otherUser.onlineTime
                ? getLastSeenText(new Date(otherUser.onlineTime))
                : "Unknown"}
            </div>
          </div>
        </div>
      )}
      <div className="chat-messages">
        {chatId ? (
          messages.length > 0 ? (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`message-on-chat ${
                  msg.senderId.toString() === userId.toString()
                    ? "sender-message"
                    : "receiver-message"
                }`}
              >
                {msg.content}
              </div>
            ))
          ) : (
            <div className="no-messages">Немає повідомлень в цьому чаті</div>
          )
        ) : (
          <div className="no-chat-selected">Виберіть необхідний чат</div>
        )}
        <img
          src="/images/Book-in-chats.png"
          alt="Book in chats"
          className="chat-book-image"
        />
      </div>
      <div className="message-input">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Написати"
          onKeyPress={handleKeyPress}
          disabled={!chatId}
        />
        <button
          onClick={sendMessage}
          disabled={!chatId || !newMessage.trim()}
          style={{ background: "none", border: "none" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="white"
            width="36px"
            height="36px"
          >
            <path d="M0 0h24v24H0z" fill="none" />
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default MessageArea;
