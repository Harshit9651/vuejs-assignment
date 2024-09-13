const express = require("express");
const dotenv = require('dotenv'); 
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
const path = require("path");
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server);

const session = require("express-session")
const cors = require('cors');
app.use(cors({
    origin: 'http://localhost:8080', // Update this with the correct front-end URL
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
}));

const bodyParser = require('body-parser');
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));

require('./connections/connection');

const UserRoute = require('./routes/userroutes');
app.use('/User', UserRoute);

app.post('/user', (req, res) => {
    const { name, email, password } = req.body; 
    console.log('Received data:', name, email, password);
});
io.on('connection', (socket) => {
    console.log('A user connected');
  
    socket.on('joinRoom', (room) => {
      socket.join(room);
      console.log(`User joined room: ${room}`);
  
      // Broadcast to the room
      socket.on('drawing', (data) => {
        socket.to(room).emit('drawing', data);
      });
  
      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('A user disconnected');
      });
    });
  });
  
  server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
  });