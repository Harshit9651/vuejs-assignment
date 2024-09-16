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
const socketEvents = require('./socketio');

dotenv.config();

const app = express();
app.use(cors({
  origin: 'http://localhost:8080',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

const sessionMiddleware = session({
  secret: process.env.SESSIONKEY ,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } 
});
app.use(sessionMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/User', UserRoute);
app.use('/Chat', ChatRoute);

const server = http.createServer(app);
const io = new Server(server);
socketEvents(io, sessionMiddleware); 

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
