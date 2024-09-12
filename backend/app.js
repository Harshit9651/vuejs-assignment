const express= require("express");
const dotenv = require('dotenv'); 
dotenv.config();
const app = express();
const port = process.env.PORT ||3000;
const path = require("path");
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server);

const session = require("express-session")
const cors = require('cors');
app.use(cors());
const bodyParser = require('body-parser');
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));

require('./connections/connection')

const UserRoute = require('./routes/userroutes')


io.on('connection', (socket) => {
    console.log('a user connected');
    
    socket.on('drawing', (data) => {
        socket.broadcast.emit('drawing', data);
    });

    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});
server.listen(port,()=>{
    console.log(`app listen on port number ${port}`)
})
app.use('/User',UserRoute);


app.use(express.json());
app.use(express.urlencoded({extended:true}))


app.post('/user',(req,res)=>{
    const { name, email, password } = req.body; 
    console.log('Received data:', name, email, password);
})