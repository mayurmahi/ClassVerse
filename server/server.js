// require("dotenv").config();

// const express = require("express");
// const cors = require("cors");
// const http = require("http");
// const { Server } = require("socket.io");
// const connectDB = require("./config/db");
// const path = require("path");

// const app = express();

// // Create HTTP server
// const server = http.createServer(app);

// // Initialize Socket.io
// const io = new Server(server, {
//   cors: {
//     origin: process.env.CLIENT_URL,
//     methods: ["GET", "POST"],
//   },
// });

// // Socket handler
// const socketHandler = require("./socket/socketHandler");
// socketHandler(io);

// // Middleware
// app.use(express.json());
// app.use(cors({ origin: process.env.CLIENT_URL }));
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// // Connect DB
// connectDB();

// // Routes
// app.use("/api/auth", require("./routes/authRoutes"));
// app.use("/api/classroom", require("./routes/classroomRoutes"));
// app.use("/api/materials", require("./routes/materialRoutes"));
// app.use("/api/assignments", require("./routes/assignmentRoutes"));
// app.use("/api/admin", require("./routes/adminRoutes"));
// app.use("/api/summarize", require("./routes/summarizeRoutes"));
// app.use("/api/chat", require("./routes/chatRoutes"));
// app.use("/api/download", require("./routes/downloadRoute"));
// app.use("/api/quiz", require("./routes/quizRoutes")); // ← ADDED

// // Start server
// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => {
//   console.log("Server running on port " + PORT);
// });

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const path = require("path");

const app = express();

// --- CHANGE 1: Allowed Origins ka array banao ---
const allowedOrigins = [
  process.env.CLIENT_URL,          // Tera Vercel wala link
  "http://localhost:5173",         // Tera local development link
  "http://localhost:5174"          // Kabhi kabhi vite 5174 pe bhi chalta hai
];

// Create HTTP server
const server = http.createServer(app);

// --- CHANGE 2: Socket.io mein array pass karo ---
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  },
});

// Socket handler
const socketHandler = require("./socket/socketHandler");
socketHandler(io);

// Middleware
app.use(express.json());

// --- CHANGE 3: Express CORS middleware update karo ---
app.use(cors({ 
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true 
}));

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
app.use("/api/quiz", require("./routes/quizRoutes"));

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});