const Message = require('./models/chatmodel');

const usersInRoom = {};
const userCursorPositions = {};

module.exports = (io, sessionMiddleware) => {
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
    socket.on('chatMessage', async (messageData) => {
      if (socket.room) {
        try {
          const message = new Message({
            text: messageData.text,
            room: socket.room,
            userName: messageData.userName,
            userId: messageData.userId,
          });

          console.log(await message.save());

          // Emit the message to the room with userName and userId
          io.to(socket.room).emit('chatMessage', {
            sender: messageData.userId,
            text: messageData.text,
            userName: messageData.userName,
          });
        } catch (error) {
          console.error('Error saving message:', error);
        }
      }
    });

    // Handle chat start requests
    socket.on('chatStart', (chatData) => {
      if (chatData.chatWith && chatData.userId && chatData.userName) {
        io.to(chatData.chatWith).emit('chatStart', {
          userId: chatData.userId,
          userName: chatData.userName,
          chatWith: chatData.chatWith,
        });
      }
    });

    // Handle user disconnection
    socket.on('disconnect', () => {
      if (socket.room) {
        usersInRoom[socket.room] = usersInRoom[socket.room].filter(id => id !== socket.id);
        io.to(socket.room).emit('usersInRoom', { users: usersInRoom[socket.room], userName: socket.userName });

        delete userCursorPositions[socket.userId];
        io.to(socket.room).emit('mouseMove', { users: userCursorPositions });
      }
      console.log('Client disconnected', socket.id);
    });
  });
};
