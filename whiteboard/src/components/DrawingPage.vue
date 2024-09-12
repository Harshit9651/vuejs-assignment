<template>
  <div class="whiteboard-container">
    <canvas id="whiteboard"></canvas>
    <div class="chat-container">
      <ul>
        <li v-for="msg in messages" :key="msg">{{ msg }}</li>
      </ul>
      <input v-model="message" @keyup.enter="sendMessage" placeholder="Type a message..." />
    </div>
  </div>
</template>

<script>
import { io } from 'socket.io-client';
import { fabric } from 'fabric';

export default {
  name: 'WhiteBoard',
  data() {
    return {
      socket: null,
      canvas: null,
      messages: [],
      message: '',
    };
  },
  mounted() {
    this.socket = io('http://localhost:3000');

    this.canvas = new fabric.Canvas('whiteboard', {
      isDrawingMode: true,
    });

    this.socket.on('drawing', (data) => {
      if (data) {
        fabric.util.enlivenObjects([data], (objects) => {
          objects.forEach((obj) => {
            this.canvas.add(obj);
          });
        });
      }
    });

    this.socket.on('chat message', (msg) => {
      this.messages.push(msg);
    });

    this.canvas.on('mouse:up', () => {
      const objects = this.canvas.getObjects();
      if (objects.length > 0) {
        const drawing = objects[objects.length - 1].toObject();
        this.socket.emit('drawing', drawing);
      }
    });
  },
  methods: {
    sendMessage() {
      if (this.message.trim() !== '') {
        this.socket.emit('chat message', this.message);
        this.message = '';
      }
    },
  },
};
</script>

<style scoped>
.whiteboard-container {
  display: flex;
  height: 100vh;
}

canvas {
  border: 1px solid #000;
  flex: 3;
}

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 10px;
  background-color: #f8f8f8;
  border-left: 1px solid #ddd;
}

ul {
  list-style-type: none;
  padding: 0;
  overflow-y: auto;
  flex: 1;
}

input {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  outline: none;
}
</style>
