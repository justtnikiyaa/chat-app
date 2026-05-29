import express from 'express';
import "dotenv/config";
import cors from 'cors';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './lib/db.js';
import userRouter from './routes/userRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import { Server } from 'socket.io';

//create express app and http server
const app = express();
const server = http.createServer(app);

//initialize socket.io server
export const io = new Server(server, {
    cors : {origin: "*"}
})

//store online users
export const userSocketMap = {}; // {userId: socketId}

//Socket.io connection handling
io.on("connection", (socket) => { 
    const userId = socket.handshake.query.userId;
    console.log("User connected", userId);
    if(userId) userSocketMap[userId] = socket.id;
    
    //emit online users to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
        console.log("User disconnected", userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
})

//middlewares setup
app.use(cors());
app.use(express.json({limit: '4mb'}));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//Routes setup
app.use("/api/status", (req, res) => res.send("Server is running"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client front-end/dist')));

    app.get('*all', (req, res) => {
        res.sendFile(path.join(__dirname, '../client front-end/dist/index.html'));
    });
}

//connect to MongoDB
await connectDB()


if (!process.env.VERCEL) {
    const PORT = process.env.PORT || 5001;
    server.listen(PORT, () => console.log("Server is running on PORT: " + PORT));
}
// Export serever for vercel 
export default server;