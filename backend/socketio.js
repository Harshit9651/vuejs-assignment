const Message = require('./models/chatmodel'); 

// Store users and their cursor positions globally
const usersInRoom = {};
const userCursorPositions = {};

// Function to initialize socket handlers
const initializeSockets = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    const session = socket.request.session;

    if (session && session.userName && session.userId) {
      socket.userName = session.userName;
      socket.userId = session.userId;
      console.log(`Authenticated user: ${socket.userName}`);
    } else {
      console.log('No session found for this user.');
    }

    // Event: User joins a room
    socket.on('joinRoom', (room) => handleJoinRoom(socket, io, room));

    // Event: Mouse movement
    socket.on('mouseMove', (data) => handleMouseMove(socket, io, data));

    // Event: Chat message
    socket.on('chatMessage', (messageData) => handleChatMessage(socket, io, messageData));

    // Event: Chat start
    socket.on('chatStart', (chatData) => handleChatStart(socket, io, chatData));

    // Handle user disconnection
    socket.on('disconnect', () => handleDisconnect(socket, io));
  });
};

// Function: Handle room joining
const handleJoinRoom = (socket, io, room) => {
  if (typeof room !== 'string') {
    console.error(`Invalid room name: ${room}`);
    return;
  }

  if (socket.room && socket.room !== room) {
    socket.leave(socket.room);
    console.log(`User ${socket.id} left room: ${socket.room}`);
  }

  socket.room = room;
  socket.join(room);
  console.log(`User ${socket.id} joined room: ${room}`);

  usersInRoom[room] = usersInRoom[room] || [];
  if (!usersInRoom[room].includes(socket.id)) {
    usersInRoom[room].push(socket.id);
  }

  io.to(room).emit('usersInRoom', { users: usersInRoom[room], userName: socket.userName });
};

// Function: Handle mouse movement
const handleMouseMove = (socket, io, data) => {
  if (data.room) {
    userCursorPositions[socket.userId] = { x: data.x, y: data.y, userName: socket.userName };
    io.to(data.room).emit('mouseMove', { ...data, users: userCursorPositions });
  }
};

// Function: Handle chat messages
const handleChatMessage = async (socket, io, messageData) => {
  if (!socket.room) return;

  try {
    const message = new Message({
      text: messageData.text,
      room: socket.room,
      userName: messageData.userName,
      userId: messageData.userId
    });

    await message.save();
    io.to(socket.room).emit('chatMessage', {
      sender: messageData.userId,
      text: messageData.text,
      userName: messageData.userName
    });
  } catch (error) {
    console.error('Error saving message:', error);
  }
};

// Function: Handle chat start
const handleChatStart = (socket, io, chatData) => {
  if (chatData.chatWith && chatData.userId && chatData.userName) {
    io.to(chatData.chatWith).emit('chatStart', {
      userId: chatData.userId,
      userName: chatData.userName,
      chatWith: chatData.chatWith
    });
  }
};

// Function: Handle user disconnection
const handleDisconnect = (socket, io) => {
  if (socket.room) {
    usersInRoom[socket.room] = usersInRoom[socket.room].filter(id => id !== socket.id);
    io.to(socket.room).emit('usersInRoom', { users: usersInRoom[socket.room], userName: socket.userName });
    
    delete userCursorPositions[socket.userId];
    io.to(socket.room).emit('mouseMove', { users: userCursorPositions });
  }
  console.log('User disconnected:', socket.id);
};

module.exports = { initializeSockets };
