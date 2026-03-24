require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const path = require("path");

const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
  },
});

// Socket handler
const socketHandler = require("./socket/socketHandler");
socketHandler(io);

// Middleware
app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Connect DB
connectDB();

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/classroom", require("./routes/classroomRoutes"));
app.use("/api/materials", require("./routes/materialRoutes"));
app.use("/api/assignments", require("./routes/assignmentRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/summarize", require("./routes/summarizeRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));
app.use("/api/download", require("./routes/downloadRoute"));
app.use("/api/quiz", require("./routes/quizRoutes")); // ← ADDED

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});