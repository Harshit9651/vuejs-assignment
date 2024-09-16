<template>
  <div class="whiteboard-container">
    <div class="toolbar">
      <input v-model="room" class="room-input" placeholder="Enter room name" />
      <button class="toolbar-button" @click="joinRoom">Join Room</button>
      <button class="toolbar-button" @click="setDrawingMode('pencil')">Pencil</button>
      <button class="toolbar-button" @click="setDrawingMode('rectangle')">Rectangle</button>
      <button class="toolbar-button" @click="setDrawingMode('circle')">Circle</button>
      <button class="toolbar-button" @click="setDrawingMode('line')">Line</button>
      <button class="toolbar-button" @click="setDrawingMode('text')">Text</button>
      <button class="toolbar-button" @click="undo">Undo</button>
      <button class="toolbar-button" @click="redo">Redo</button>
      <button class="toolbar-button" @click="downloadCanvas">Download Canvas</button>
      <input type="file" ref="fileInput" @change="handleFileUpload" style="display: none;" />
    </div>

    <div class="content">
      <canvas id="canvas"></canvas>
      <div class="chat-container">
        <div class="chat-header">Chat Room</div>
        <div class="chat-messages">
          <div
            v-for="message in chatMessages"
            :key="message.id"
            :class="{'chat-message sender': message.sender === userId, 'chat-message receiver': message.sender !== userId}"
          >
            <strong>{{ message.userName }}:</strong> {{ message.text }}
          </div>
        </div>
        <div class="chat-input">
          <input v-model="chatMessage" placeholder="Type a message..." @keyup.enter="sendMessage" />
          <button @click="sendMessage">Send</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { io } from 'socket.io-client';
import * as fabric from 'fabric';

export default {
  name: 'WhiteBoard',
  data() {
    return {
      socket: null,
      canvas: null,
      room: '',
      strokeColor: '#000000',
      drawingMode: 'pencil',
      history: [],
      historyIndex: -1,
      chatMessage: '',
      chatMessages: [],
      userId: 'User_' + Math.random().toString(36).substr(2, 9),
      userName: 'User',
      users: {},
    };
  },
  mounted() {
    const userNameInput = prompt("Please enter your name:", "User");
  if (userNameInput) {
    this.userName = userNameInput;
  }
  this.socket = io('http://localhost:3000', {
    transports: ['websocket', 'polling'],
  });

  this.socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err);
  });

  // Authenticate the user
  this.socket.emit('authenticate', { userId: this.userId, userName: this.userName });

  this.canvas = new fabric.Canvas('canvas', {
    width: 800,
    height: 500,
    backgroundColor: 'white',
    isDrawingMode: true,
  });

  this.canvas.freeDrawingBrush = new fabric.PencilBrush(this.canvas);
  this.canvas.freeDrawingBrush.color = this.strokeColor;
  this.canvas.freeDrawingBrush.width = 2;


  this.socket.on('drawing', (data) => {
    if (data && data.type && data.object) {
      fabric.util.enlivenObjects([data.object], (objects) => {
        objects.forEach((obj) => {
          if (data.type === 'object:added') {
            this.canvas.add(obj);
          } else if (data.type === 'object:modified') {
            const existingObj = this.canvas.getObjects().find(o => o.id === data.object.id);
            if (existingObj) {
              existingObj.set(obj);
            }
          }
          this.canvas.renderAll();
        });
      });
    }
  });


  this.socket.on('mouseMove', (data) => {
    if (data.userId !== this.userId) {
      this.users[data.userId] = {
        x: data.x,
        y: data.y,
        userName: data.userName,
      };
      this.renderUsers();
    }
  });

  this.socket.on('chatMessage', (message) => {
    this.chatMessages.push(message);
  });

 
  this.socket.on('usersInRoom', (data) => {
    this.users = data.users.reduce((acc, user) => {
      acc[user.userId] = { userName: user.userName };
      return acc;
    }, {});
  });


  this.canvas.on('object:modified', (e) => this.sendCanvasData('object:modified', e));
  this.canvas.on('object:added', (e) => this.sendCanvasData('object:added', e));

  // Track mouse movement and broadcast
  this.canvas.on('mouse:move', (e) => {
    if (e.pointer) {
      this.socket.emit('mouseMove', {
        x: e.pointer.x,
        y: e.pointer.y,
        userId: this.userId,
        userName: this.userName,
        room: this.room,
      });
    }
  });

  // Save initial state
  this.saveState();
}
,
  methods: {
    joinRoom() {
      if (this.room) {
        this.socket.emit('joinRoom', this.room);
        alert(`You have successfully joined the room: ${this.room}`);
      }else{
        alert(`some error happend when you joined this room`)
      }
    },
    setDrawingMode(mode) {
      this.drawingMode = mode;
      if (mode === 'pencil') {
        this.canvas.isDrawingMode = true;
        this.canvas.selection = false;
        this.canvas.forEachObject((o) => (o.selectable = false));
      } else if (mode === 'text') {
        this.canvas.isDrawingMode = false;
        this.addText();
      } else {
        this.canvas.isDrawingMode = false;
        this.addShape(mode);
      }
      this.saveState();
    },
    addShape(shape) {
      let obj;
      switch (shape) {
        case 'rectangle':
          obj = new fabric.Rect({
            left: 100,
            top: 100,
            fill: 'transparent',
            stroke: this.strokeColor,
            strokeWidth: 2,
            width: 100,
            height: 100,
            id: `rect_${Date.now()}`,
          });
          break;
        case 'circle':
          obj = new fabric.Circle({
            left: 100,
            top: 100,
            radius: 50,
            fill: 'transparent',
            stroke: this.strokeColor,
            strokeWidth: 2,
            id: `circ_${Date.now()}`,
          });
          break;
        case 'line':
          obj = new fabric.Line([50, 50, 200, 200], {
            stroke: this.strokeColor,
            strokeWidth: 2,
            id: `line_${Date.now()}`,
          });
          break;
      }
      if (obj) {
        this.canvas.add(obj);
        this.canvas.setActiveObject(obj);
        this.canvas.renderAll();
        this.saveState();
        this.sendCanvasData('object:added', { object: obj });
      }
    },
    addText() {
      const text = new fabric.Textbox('', {
        left: 100,
        top: 100,
        fontSize: 20,
        fill: this.strokeColor,
        editable: true,
        id: `text_${Date.now()}`,
      });

      this.canvas.add(text);
      this.canvas.setActiveObject(text);
      this.canvas.renderAll();

      text.enterEditing();
      text.hiddenTextarea.focus();

      this.saveState();
      this.sendCanvasData('object:added', { object: text });
    },
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imgElement = document.createElement('img');
          imgElement.src = e.target.result;
          imgElement.onload = () => {
            const imgInstance = new fabric.Image(imgElement);
            this.canvas.add(imgInstance);
            this.canvas.renderAll();
          };
        };
        reader.readAsDataURL(file);
      }
    },
    downloadCanvas() {
      const dataURL = this.canvas.toDataURL({
        format: 'png',
        multiplier: 2,
      });
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = 'canvas.png';
      link.click();
    },
    sendCanvasData(type, e) {
      const obj = e.target ? e.target.toObject(['id']) : null;
      if (obj) {
        this.socket.emit('drawing', {
          type,
          object: obj,
          room: this.room,
        });
      } else {
        console.error('Object is not defined');
      }
    },
    saveState() {
      const json = JSON.stringify(this.canvas.toDatalessJSON());
      if (this.historyIndex === this.history.length - 1) {
        this.history.push(json);
        this.historyIndex++;
      } else {
        this.history = this.history.slice(0, this.historyIndex + 1);
        this.history.push(json);
        this.historyIndex++;
      }
    },
    undo() {
      if (this.historyIndex > 0) {
        this.historyIndex--;
        this.loadState(this.history[this.historyIndex]);
      }
    },
    redo() {
      if (this.historyIndex < this.history.length - 1) {
        this.historyIndex++;
        this.loadState(this.history[this.historyIndex]);
      }
    },
    loadState(json) {
      this.canvas.loadFromJSON(json, this.canvas.renderAll.bind(this.canvas));
    },
    sendMessage() {
      if (this.chatMessage.trim()) {
        const message = {
          id: Date.now(),
          text: this.chatMessage,
          userId: this.userId,
          userName: this.userName,
        };
        this.socket.emit('chatMessage', message);
        this.chatMessage = '';
      }
    },
  
    renderUsers() {
    const colors = ['red', 'blue', 'green', 'orange', 'purple', 'yellow', 'pink', 'cyan', 'magenta', 'lime'];

    // Remove previous cursor indicators and user names
    this.canvas.getObjects().forEach(obj => {
      if (obj.isCursor || obj.isUserName) {
        this.canvas.remove(obj);
      }
    });

    // Track cursor indicators
    this.cursorIndicators = {}; // Initialize the cursorIndicators object

    Object.keys(this.users).forEach((userId, index) => {
      const { x, y, userName = 'Unnamed User' } = this.users[userId];
      const cursorColor = colors[index % colors.length];

      if (typeof x === 'undefined' || typeof y === 'undefined') {
        console.warn(`User ${userId} does not have valid cursor coordinates.`);
        return;
      }

      // Check if cursor indicator already exists for this user
      let cursor = this.cursorIndicators[userId]?.cursor;
      let userNameText = this.cursorIndicators[userId]?.userNameText;

      if (!cursor) {
        // Create new cursor and user name text if they don't exist
        cursor = new fabric.Circle({
          left: x,
          top: y,
          radius: 5,
          fill: cursorColor,
          stroke: 'black',
          strokeWidth: 1,
          selectable: false,
          isCursor: true,
        });

        userNameText = new fabric.Text(userName, {
          left: x - 20,
          top: y - 20,
          fontSize: 14,
          fill: cursorColor,
          selectable: false,
          isUserName: true,
          strokeWidth: 1,
        });

        this.canvas.add(cursor);
        this.canvas.add(userNameText);

        // Save to cursorIndicators object
        this.cursorIndicators[userId] = { cursor, userNameText };
      } else {
        // Update existing cursor and user name text
        cursor.set({ left: x, top: y });
        userNameText.set({ left: x - 20, top: y - 20 });
      }
    });

    this.canvas.renderAll();
  },

    
  }}

  import '../assets/css/drawingstyle.css';
</script>

<style>

</style>

<style scoped>
</style>