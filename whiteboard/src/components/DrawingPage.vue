<template>
  <div class="whiteboard-container">
    <div class="toolbar">
      <input v-model="room" class="room-input" placeholder="Enter room name" />
      <button class="toolbar-button" @click="joinRoom">Join Room</button>
      <button class="toolbar-button" @click="setDrawingMode('pencil')">Pencil</button>
      <button class="toolbar-button" @click="setDrawingMode('rectangle')">Rectangle</button>
      <button class="toolbar-button" @click="setDrawingMode('circle')">Circle</button>
      <button class="toolbar-button" @click="setDrawingMode('line')">Line</button>
      <input type="color" v-model="strokeColor" class="color-picker" />
      <button class="toolbar-button" @click="uploadImage">Upload Image</button>
      <button class="toolbar-button" @click="downloadCanvas">Download Canvas</button>
      <input type="file" ref="fileInput" @change="handleFileUpload" style="display: none;" />
    </div>
    <canvas id="canvas"></canvas>
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
      room: '', // To store the room name
      strokeColor: '#000000', // Default stroke color
      drawingMode: 'pencil', // Default drawing mode
    };
  },
  mounted() {
    // Initialize socket connection
    this.socket = io('http://localhost:3000', {
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    // Initialize fabric.js canvas
    this.canvas = new fabric.Canvas('canvas', {
      width: 800,
      height: 500,
      backgroundColor: 'white',
      isDrawingMode: true,
    });

    // Set up free drawing brush properties
    this.canvas.freeDrawingBrush = new fabric.PencilBrush(this.canvas);
    this.canvas.freeDrawingBrush.color = this.strokeColor;
    this.canvas.freeDrawingBrush.width = 2;

    // Listen for drawing data from other users
    this.socket.on('drawing', (data) => {
      fabric.util.enlivenObjects([data], (objects) => {
        objects.forEach((obj) => {
          this.canvas.add(obj);
        });
        this.canvas.renderAll();
      });
    });

    // Synchronize canvas changes across all clients in the same room
    this.canvas.on('object:modified', this.sendCanvasData);
    this.canvas.on('object:added', this.sendCanvasData);
  },
  watch: {
    strokeColor(newColor) {
      if (this.canvas.freeDrawingBrush) {
        this.canvas.freeDrawingBrush.color = newColor;
      }
    },
  },
  methods: {
    joinRoom() {
      if (this.room.trim()) {
        this.socket.emit('joinRoom', this.room);
        alert(`Joined room: ${this.room}`);
      } else {
        alert('Please enter a room name.');
      }
    },
    setDrawingMode(mode) {
      this.drawingMode = mode;

      if (mode === 'pencil') {
        this.canvas.isDrawingMode = true;
        this.canvas.selection = false;
        this.canvas.forEachObject((o) => (o.selectable = false));
      } else {
        this.canvas.isDrawingMode = false;
        this.addShape(mode);
      }
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
          });
          break;
        case 'line':
          obj = new fabric.Line([50, 50, 200, 200], {
            stroke: this.strokeColor,
            strokeWidth: 2,
          });
          break;
      }
      if (obj) {
        this.canvas.add(obj);
        this.canvas.setActiveObject(obj);
        this.canvas.renderAll();
        this.sendCanvasData();
      }
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
            this.canvas.setBackgroundImage(img, this.canvas.renderAll.bind(this.canvas), {
              scaleX: this.canvas.width / img.width,
              scaleY: this.canvas.height / img.height,
            });
          });
        };
        reader.readAsDataURL(file);
      }
    },
    downloadCanvas() {
      const dataURL = this.canvas.toDataURL({
        format: 'png',
        quality: 1.0,
      });
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = 'canvas.png';
      link.click();
    },
    sendCanvasData() {
      const obj = this.canvas.getObjects().slice(-1)[0].toObject();
      this.socket.emit('drawing', obj);
    },
  },
};
</script>

<style scoped>
.whiteboard-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.room-input {
  padding: 8px;
  border: 2px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
  width: 200px;
}

.toolbar-button {
  padding: 8px 12px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.toolbar-button:hover {
  background-color: #45a049;
}

.color-picker {
  padding: 4px;
  border-radius: 4px;
  border: 2px solid #ccc;
  cursor: pointer;
}

#canvas {
  width: 100%;
  height: 500px;
  border: 2px solid #4caf50;
  background-color: white;
  border-radius: 4px;
}
</style>
