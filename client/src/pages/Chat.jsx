import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

// Connect to socket server
const socket = io("http://localhost:5000");

const Chat = ({ classroomId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    // Load previous messages
    fetchMessages();

    // Join classroom room
    socket.emit("join-room", classroomId);

    // Listen for new messages
    socket.on("receive-message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.emit("leave-room", classroomId);
      socket.off("receive-message");
    };
  }, [classroomId]);

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await api.get("/chat/" + classroomId);
      setMessages(res.data.messages);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    socket.emit("send-message", {
      classroomId,
      senderId: user._id,
      senderName: user.name,
      senderRole: user.role,
      text: text.trim(),
    });

    setText("");
  };

  const isMyMessage = (msg) => msg.senderId === user._id;

  return (
    <div className="flex flex-col h-[500px]">
      {/* Header */}
      <div className="bg-[#1F4E79] text-white px-4 py-3 rounded-t-lg">
        <h3 className="font-bold">Classroom Chat</h3>
        <p className="text-xs text-blue-200">
          Messages are visible to all classroom members
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-10">
            <p>No messages yet</p>
            <p className="text-sm">Be the first to say something!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg._id}
              className={
                "flex " + (isMyMessage(msg) ? "justify-end" : "justify-start")
              }
            >
              <div
                className={
                  "max-w-xs lg:max-w-md px-4 py-2 rounded-2xl " +
                  (isMyMessage(msg)
                    ? "bg-[#1F4E79] text-white rounded-br-none"
                    : "bg-white text-gray-800 shadow rounded-bl-none")
                }
              >
                {/* Sender name — only for others */}
                {!isMyMessage(msg) && (
                  <p className="text-xs font-bold text-[#2E75B6] mb-1">
                    {msg.senderName}
                    <span className="ml-1 text-gray-400 font-normal">
                      ({msg.senderRole})
                    </span>
                  </p>
                )}
                <p className="text-sm">{msg.text}</p>
                <p
                  className={
                    "text-xs mt-1 " +
                    (isMyMessage(msg) ? "text-blue-200" : "text-gray-400")
                  }
                >
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="flex gap-2 p-3 bg-white border-t rounded-b-lg"
      >
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E75B6]"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="bg-[#1F4E79] text-white px-5 py-2 rounded-full text-sm hover:bg-[#2E75B6] disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;