<template>
  <div>
    <div>
      <!-- Buttons for adding shapes and changing background -->
      <button @click="addCircle">Add Circle</button>
      <button @click="addTriangle">Add Triangle</button>
      <button @click="addLine">Add Line</button>
      <button @click="uploadImage">Upload Image</button>
      <button @click="downloadCanvas">Download Canvas</button>
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
    };
  },
  mounted() {
    // Initialize socket connection
    this.socket = io('http://localhost:3000', {
      transports: ['websocket', 'polling'],
    });

    // Handle socket connection errors
    this.socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    // Initialize Fabric.js canvas
    this.canvas = new fabric.Canvas('canvas', {
      width: 500,
      height: 500,
      backgroundColor: '',
    });

    // Load a default image and make it draggable
    fabric.Image.fromURL('https://images.pexels.com/photos/21369699/pexels-photo-21369699/free-photo-of-newspaper-on-a-table-in-a-ferry.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load', (img) => {
      img.set({
        left: 100,
        top: 100,
        angle: 0,
        editable: true,
      });
      img.scaleToWidth(150);
      this.canvas.add(img);
      this.canvas.renderAll();
    });
  },
  methods: {
    addCircle() {
      const circle = new fabric.Circle({
        radius: 50,
        fill: 'blue',
        left: 100,
        top: 100,
        selectable: true,
      });
      this.canvas.add(circle);
    },
    addTriangle() {
      const triangle = new fabric.Triangle({
        width: 100,
        height: 100,
        fill: 'green',
        left: 150,
        top: 150,
        selectable: true,
      });
      this.canvas.add(triangle);
    },
    addLine() {
      const line = new fabric.Line([50, 50, 200, 200], {
        stroke: 'black',
        strokeWidth: 5,
        selectable: true,
      });
      this.canvas.add(line);
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
  },
};
</script>

<style scoped>
#canvas {
  width: 100%;
  height: 500px;
  border: 1px solid #000; /* Optional: Add border for better visibility */
}
</style>
