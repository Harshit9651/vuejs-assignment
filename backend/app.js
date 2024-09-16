const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const UserRoute = require('./routes/userroutes');
const ChatRoute = require('./routes/chatroutes');
const bodyparser = require('body-parser');
const session = require('express-session');
require('./connections/connection');
const cors = require('cors');
const Message = require('./models/chatmodel'); 

dotenv.config();

const app = express();
app.use(cors({
  origin: 'http://localhost:8080',
  methods: ['GET', 'POST', 'PUT', 'DELETE'], 
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'], 
}));
const sessionMiddleware = session({
  secret: 'yourSecretKey',  // Replace with your actual secret key
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Make sure this is false in development (true for HTTPS in production)
});
app.use(sessionMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/User', UserRoute);
app.use('/Chat', ChatRoute);

const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

const usersInRoom = {};
const userCursorPositions = {};
io.use((socket, next) => {
  sessionMiddleware(socket.request, socket.request.res || {}, next);
});
io.on('connection', (socket) => {
  console.log('A user connected', socket.id);

  // Access session data from Socket.IO
  const session = socket.request.session;


  if (session && session.userName && session.userId) {
    socket.userName = session.userName;
    socket.userId = session.userId;
    console.log(`User authenticated: ${socket.userName}`);
  } else {
    console.log('No session found for this user');
  }
  // Handle user authentication
  socket.on('authenticate', (userData) => {
    socket.userName = userData.userName;
    socket.userId = userData.userId;
  });

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
    io.to(room).emit('usersInRoom', { users: usersInRoom[room], userName: socket.userName });
  });

  // Handle mouse movement
  socket.on('mouseMove', (data) => {
    if (data.room) {
      userCursorPositions[socket.userId] = { x: data.x, y: data.y, userName: socket.userName };
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
  // 
  socket.on('chatMessage', async (messageData) => {
    if (socket.room) {
      try {
        // Assuming messageData contains userId and userName from the frontend
        const message = new Message({
          text: messageData.text,
          room: socket.room,
          userName: messageData.userName,  // Extracting userName from messageData
          userId: messageData.userId       // Extracting userId from messageData
        });
  
        console.log(await message.save());
  
        // Emit the message to the room with userName and userId
        io.to(socket.room).emit('chatMessage', {
          sender: messageData.userId,      // Sending userId as the sender
          text: messageData.text, 
          userName: messageData.userName   // Sending userName along with the message
        });
      } catch (error) {
        console.error('Error saving message:', error);
      }
    }
  });
  
  // Handle chat start requests
  socket.on('chatStart', (chatData) => {
    if (chatData.chatWith && chatData.userId && chatData.userName) {
      // Send the chat start event with the userId and userName
      io.to(chatData.chatWith).emit('chatStart', {
        userId: chatData.userId,         // Sending userId
        userName:chatData.userId ,     // Sending userName
        chatWith: chatData.chatWith      // Target chat recipient
      });
    }
  });
  

  // Handle user disconnection
  socket.on('disconnect', () => {
    if (socket.room) {
      usersInRoom[socket.room] = usersInRoom[socket.room].filter(id => id !== socket.id);
      io.to(socket.room).emit('usersInRoom', { users: usersInRoom[socket.room], userName: socket.userName });

      // Clean up user cursor position
      delete userCursorPositions[socket.userId];
      io.to(socket.room).emit('mouseMove', { users: userCursorPositions });
    }
    console.log('Client disconnected', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  
});