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
      <input type="color" v-model="strokeColor" class="color-picker" />
      <button class="toolbar-button" @click="uploadImage">Upload Image</button>
      <button class="toolbar-button" @click="undo">Undo</button>
      <button class="toolbar-button" @click="redo">Redo</button>
      <input type="color" v-model="backgroundColor" class="color-picker" />
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
            :class="{'chat-message sender': message.user === 'User', 'chat-message receiver': message.user !== 'User'}"
          >
            <strong>{{ message.user }}:</strong> {{ message.text }}
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
      room: '', // This should be a string representing the room name
      strokeColor: '#000000',
      drawingMode: 'pencil',
      backgroundColor: '#ffffff',
      history: [],
      historyIndex: -1,
      chatMessage: '',
      chatMessages: [],
      userId: 'User_' + Math.random().toString(36).substr(2, 9), // Random user ID
      userName: 'User',
      users: {}, // Store other users' cursors and names
    };
  },
  mounted() {
    this.socket = io('http://localhost:3000', {
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    this.canvas = new fabric.Canvas('canvas', {
      width: 800,
      height: 500,
      backgroundColor: 'white',
      isDrawingMode: true,
    });

    this.canvas.freeDrawingBrush = new fabric.PencilBrush(this.canvas);
    this.canvas.freeDrawingBrush.color = this.strokeColor;
    this.canvas.freeDrawingBrush.width = 2;

    // Listen for other users' drawing movements
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

    // Listen for cursor movements of other users
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

    // Receive chat messages
    this.socket.on('chatMessage', (messageData) => {
      this.chatMessages.push(messageData);
    });

    // Emit drawing data when object is modified or added
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

    this.saveState();
  },
  methods: {
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
    uploadImage() {
      this.$refs.fileInput.click();
    },
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataURL = e.target.result;
          fabric.Image.fromURL(dataURL, (img) => {
            this.canvas.setBackgroundImage(
              img,
              this.canvas.renderAll.bind(this.canvas),
              {
                scaleX: this.canvas.width / img.width,
                scaleY: this.canvas.height / img.height,
              }
            );
            this.saveState();
          });
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
    joinRoom() {
      if (typeof this.room === 'string') {
        this.socket.emit('joinRoom', this.room); // Emit the room name directly as a string
      } else {
        console.error('Invalid room name');
      }
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
}
,
    saveState() {
      const json = JSON.stringify(this.canvas.toDatalessJSON());
      if (this.historyIndex === this.history.length - 1) {
        this.history.push(json);
        this.historyIndex++;
      }
    },
    undo() {
      if (this.historyIndex > 0) {
        this.historyIndex--;
        this.canvas.loadFromJSON(this.history[this.historyIndex], () => {
          this.canvas.renderAll();
        });
      }
    },
    redo() {
      if (this.historyIndex < this.history.length - 1) {
        this.historyIndex++;
        this.canvas.loadFromJSON(this.history[this.historyIndex], () => {
          this.canvas.renderAll();
        });
      }
    },
    renderUsers() {
    // Clear the top context where we will render user cursors
    this.canvas.clearContext(this.canvas.contextTop);

    // Iterate over users and update their cursor positions
    for (const userId in this.users) {
      const user = this.users[userId];
      
      // Check if the user already has a cursor indicator
      let cursor = this.canvas.getObjects().find(o => o.type === 'circle' && o.userId === userId);
      if (!cursor) {
        // Create a new cursor if it doesn't exist
        cursor = new fabric.Circle({
          left: user.x,
          top: user.y,
          radius: 5,
          fill: 'blue',
          originX: 'center',
          originY: 'center',
          userId: userId, // Custom property to track userId
        });
        this.canvas.add(cursor);
      } else {
        // Update the position of the existing cursor
        cursor.set({
          left: user.x,
          top: user.y,
        });
      }

      // Check if the user's name text exists
      let nameText = this.canvas.getObjects().find(o => o.type === 'text' && o.userId === userId);
      if (!nameText) {
        // Create new text if it doesn't exist
        nameText = new fabric.Text(user.userName, {
          left: user.x + 10,
          top: user.y - 10,
          fontSize: 12,
          fill: 'black',
          userId: userId, // Custom property to track userId
        });
        this.canvas.add(nameText);
      } else {
        // Update the position of the existing text
        nameText.set({
          left: user.x + 10,
          top: user.y - 10,
          text: user.userName,
        });
      }
    }

    // Render all the objects on the canvas
    this.canvas.renderAll();
  },
    sendMessage() {
      if (this.chatMessage.trim() !== '') {
        const messageData = {
          text: this.chatMessage,
          user: this.userName,
          room: this.room,
        };
        this.socket.emit('chatMessage', messageData);
        this.chatMessages.push(messageData);
        this.chatMessage = '';
      }
    },
  },
};
</script>


<style scoped>
.whiteboard-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.toolbar {
  margin-bottom: 10px;
  display: flex;
  justify-content: space-around;
  width: 100%;
  background-color: #f4f4f4;
  padding: 10px;
  border-radius: 10px;
}

.toolbar-button {
  margin: 0 5px;
  padding: 8px 15px;
  background-color: #4CAF50;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.3s;
}

.toolbar-button:hover {
  background-color: #45a049;
}

.color-picker {
  margin-left: 5px;
}

.content {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
}

#canvas {
  border: 1px solid #ddd;
  margin-right: 20px;
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}

.chat-container {
  width: 350px;
  max-height: 600px;
  border: 1px solid #ddd;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.chat-header {
  background-color: #4CAF50;
  color: white;
  padding: 15px;
  text-align: center;
  font-weight: bold;
  border-radius: 20px 20px 0 0;
  font-size: 18px;
}

.chat-messages {
  flex-grow: 1;
  overflow-y: auto;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.chat-message {
  max-width: 80%;
  padding: 10px 15px;
  border-radius: 20px;
  font-size: 14px;
  word-wrap: break-word;
  position: relative;
  line-height: 1.5;
}

.chat-message::before {
  content: '';
  position: absolute;
  top: 50%;
  width: 0;
  height: 0;
  border-style: solid;
}

.chat-message.sender {
  align-self: flex-end;
  background-color: #dcf8c6;
  color: #333;
  border-radius: 20px 20px 0 20px;
}

.chat-message.sender::before {
  border-width: 10px 10px 0 0;
  border-color: #dcf8c6 transparent transparent transparent;
  right: -10px;
  top: 10px;
}

.chat-message.receiver {
  align-self: flex-start;
  background-color: #f1f0f0;
  color: #333;
  border-radius: 20px 20px 20px 0;
}

.chat-message.receiver::before {
  border-width: 10px 0 0 10px;
  border-color: #f1f0f0 transparent transparent transparent;
  left: -10px;
  top: 10px;
}

.chat-input {
  display: flex;
  padding: 10px;
  background-color: #f4f4f4;
  border-radius: 0 0 20px 20px;
}

.chat-input input {
  flex-grow: 1;
  padding: 10px;
  font-size: 14px;
  border-radius: 20px;
  border: 1px solid #ddd;
  outline: none;
  margin-right: 10px;
}

.chat-input button {
  padding: 10px 15px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.chat-input button:hover {
  background-color: #45a049;
}
</style>