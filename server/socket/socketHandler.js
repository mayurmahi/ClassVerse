const ChatMessage = require("../models/ChatMessage");

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // User joins classroom room
    socket.on("join-room", (classroomId) => {
      socket.join(classroomId);
      console.log("User joined room:", classroomId);
    });

    // User sends message
    socket.on("send-message", async (data) => {
      try {
        const { classroomId, senderId, senderName, senderRole, text } = data;

        // Save message to MongoDB
        const message = new ChatMessage({
          classroomId,
          senderId,
          senderName,
          senderRole,
          text,
        });

        await message.save();

        // Broadcast to all users in room
        io.to(classroomId).emit("receive-message", {
          _id: message._id,
          classroomId,
          senderId,
          senderName,
          senderRole,
          text,
          createdAt: message.createdAt,
        });
      } catch (err) {
        console.error("Socket error:", err.message);
      }
    });

    // User leaves room
    socket.on("leave-room", (classroomId) => {
      socket.leave(classroomId);
      console.log("User left room:", classroomId);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};

module.exports = socketHandler;