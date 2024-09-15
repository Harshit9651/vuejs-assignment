const express = require('express');
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const UserRoute = require('./routes/userroutes');
const bodyparser = require('body-parser')
require('./connections/connection')
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:8080',
  methods: ['GET', 'POST', 'PUT', 'DELETE'], 
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'], 
}));

dotenv.config();

app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use('/User',UserRoute);
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;


const usersInRoom = {};
const userCursorPositions = {};

io.on('connection', (socket) => {
  console.log('A user connected', socket.id);

  // Handle joining a room
  socket.on('joinRoom', (room) => {
    if (typeof room !== 'string') {
      console.error(`Invalid room name received: ${room}`);
      return;
    }

    // Handle room change
    if (socket.room && socket.room !== room) {
      socket.leave(socket.room);
      console.log(`User ${socket.id} left room: ${socket.room}`);
    }

    socket.room = room;
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);

    // Update and emit users in the room
    usersInRoom[room] = usersInRoom[room] || [];
    if (!usersInRoom[room].includes(socket.id)) {
      usersInRoom[room].push(socket.id);
    }
    io.to(room).emit('usersInRoom', usersInRoom[room]);
  });

  // Handle mouse movement
  socket.on('mouseMove', (data) => {
    if (data.room) {
      userCursorPositions[data.userId] = { x: data.x, y: data.y, userName: data.userName };
      io.to(data.room).emit('mouseMove', { ...data, users: userCursorPositions });
    }
  });

  // Handle drawing events
  socket.on('drawing', (data) => {
    if (data.room) {
      io.to(data.room).emit('drawing', data);
    }
  });

  // Handle chat messages
  socket.on('chatMessage', (msg) => {
    if (socket.room) {
      io.to(socket.room).emit('chatMessage', { sender: socket.id, text: msg.text });
    }
  });

  // Handle chat start requests
  socket.on('chatStart', (chatData) => {
    if (chatData.chatWith) {
      io.to(chatData.chatWith).emit('chatStart', { userId: socket.id, chatWith: chatData.chatWith });
    }
  });

  // Handle user disconnection
  socket.on('disconnect', () => {
    if (socket.room) {
      usersInRoom[socket.room] = usersInRoom[socket.room].filter(id => id !== socket.id);
      io.to(socket.room).emit('usersInRoom', usersInRoom[socket.room]);

      // Clean up user cursor position
      delete userCursorPositions[socket.id];
      io.to(socket.room).emit('mouseMove', { users: userCursorPositions });
    }
    console.log('Client disconnected', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
