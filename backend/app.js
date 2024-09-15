// const express = require('express');
// const app = express();

// const http = require('http');
// const { Server } = require('socket.io');
// const dotenv = require('dotenv');
// const UserRoute = require('./routes/userroutes');
// const ChatRoute = require('./routes/chatroutes');
// const bodyparser = require('body-parser');
// const session = require('express-session');
// app.use(session({
//   secret: 'yourSecretKey',
//   resave: false,
//   saveUninitialized: true,
//   cookie: { secure: false } // Set to true if using HTTPS
// }));
// require('./connections/connection');
// const cors = require('cors');
// const Message = require('./models/chatmodel'); 


// dotenv.config();

// app.use(cors({
//   origin: 'http://localhost:8080',
//   methods: ['GET', 'POST', 'PUT', 'DELETE'], 
//   credentials: true,
//   allowedHeaders: ['Content-Type', 'Authorization'], 
// }));

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use('/User', UserRoute);
// app.use('/Chat', ChatRoute);

// const server = http.createServer(app);
// const io = new Server(server);

// const PORT = process.env.PORT || 3000;

// const usersInRoom = {};
// const userCursorPositions = {};

// io.on('connection', (socket) => {
//   console.log('A user connected', socket.id);

//   // Handle user authentication
//   socket.on('authenticate', (userData) => {
//     socket.userName = userData.userName;
//     socket.userId = userData.userId;
//   });

//   // Handle joining a room
//   socket.on('joinRoom', (room) => {
//     if (typeof room !== 'string') {
//       console.error(`Invalid room name received: ${room}`);
//       return;
//     }

//     // Handle room change
//     if (socket.room && socket.room !== room) {
//       socket.leave(socket.room);
//       console.log(`User ${socket.id} left room: ${socket.room}`);
//     }

//     socket.room = room;
//     socket.join(room);
//     console.log(`User ${socket.id} joined room: ${room}`);

//     // Update and emit users in the room
//     usersInRoom[room] = usersInRoom[room] || [];
//     if (!usersInRoom[room].includes(socket.id)) {
//       usersInRoom[room].push(socket.id);
//     }
//     io.to(room).emit('usersInRoom', { users: usersInRoom[room], userName: socket.userName });

//     // Emit existing users' cursor positions to the newly joined user
//     socket.emit('mouseMove', { users: userCursorPositions });
//   });

//   // Handle mouse movement
//   socket.on('mouseMove', (data) => {
//     if (data.room) {
//       userCursorPositions[socket.userId] = { x: data.x, y: data.y, userName: socket.userName };
//       // Broadcast to all users in the room except the sender
//       socket.broadcast.to(data.room).emit('mouseMove', { x: data.x, y: data.y, userId: socket.userId, userName: socket.userName });
//     }
//   });

//   // Handle drawing events
//   socket.on('drawing', (data) => {
//     if (data.room) {
//       io.to(data.room).emit('drawing', data);
//     }
//   });

//   // Handle chat messages
//   socket.on('chatMessage', async (messageData) => {
//     if (socket.room) {
//       try {
//         const message = new Message({ ...messageData, userName: socket.userName });
//         console.log(await message.save());

//         io.to(socket.room).emit('chatMessage', { sender: socket.userId, text: messageData.text, userName: socket.userName });
//       } catch (error) {
//         console.error('Error saving message:', error);
//       }
//     }
//   });

//   // Handle user disconnection
//   socket.on('disconnect', () => {
//     if (socket.room) {
//       usersInRoom[socket.room] = usersInRoom[socket.room].filter(id => id !== socket.id);
//       io.to(socket.room).emit('usersInRoom', { users: usersInRoom[socket.room], userName: socket.userName });

//       // Clean up user cursor position
//       delete userCursorPositions[socket.userId];
//       io.to(socket.room).emit('mouseMove', { users: userCursorPositions });
//     }
//     console.log('Client disconnected', socket.id);
//   });
// });

// server.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
  
// });
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const UserRoute = require('./routes/userroutes');
const ChatRoute = require('./routes/chatroutes');
const bodyparser = require('body-parser');
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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/User', UserRoute);
app.use('/Chat', ChatRoute);

const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

const usersInRoom = {};
const userCursorPositions = {};

io.on('connection', (socket) => {
  console.log('A user connected', socket.id);

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
  socket.on('chatMessage', async (messageData) => {
    if (socket.room) {
      try {
        const message = new Message({ ...messageData, userName: socket.userName });
        console.log(await message.save());

        io.to(socket.room).emit('chatMessage', { sender: socket.userId, text: messageData.text, userName: socket.userName });
      } catch (error) {
        console.error('Error saving message:', error);
      }
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