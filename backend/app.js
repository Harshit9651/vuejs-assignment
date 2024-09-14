const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server);

// In-memory storage for room users
const usersInRoom = {};

io.on('connection', (socket) => {
  console.log('A user connected');

  // Store room name for each socket to prevent multiple joins
  let room = null;

  socket.on('joinRoom', (newRoom) => {
    if (room !== newRoom) {
      if (room) {
        socket.leave(room); // Leave the previous room, if any
        console.log(`User ${socket.id} left room: ${room}`);
      }

      room = newRoom;
      socket.join(room);
      socket.room = room; // Update the socket object with the new room name
      console.log(`User ${socket.id} joined room: ${room}`);

      if (!usersInRoom[room]) {
        usersInRoom[room] = [];
      }
      usersInRoom[room].push(socket.id);

      io.to(room).emit('usersInRoom', usersInRoom[room]); // Emit updated users in the room
    }
  });

  // When a message is sent, broadcast it only to the room the user is in
  socket.on('chatMessage', (msg) => {
    if (room) {
      console.log(`Message received in room ${room}: ${msg.text}`);
      io.to(room).emit('chatMessage', { sender: socket.id, text: msg.text }); // Send message to the room
    }
  });

  // On disconnect, remove the user from the room
  socket.on('disconnect', () => {
    if (room && usersInRoom[room]) {
      usersInRoom[room] = usersInRoom[room].filter((id) => id !== socket.id);
      console.log(`User ${socket.id} disconnected from room: ${room}`);
      io.to(room).emit('usersInRoom', usersInRoom[room]); // Emit updated users in the room
    }
  });
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
