<template>
  <canvas id="canvas"></canvas>
</template>

<script>
import { io } from 'socket.io-client';
import * as fabric from 'fabric'; // Correct import

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
    this.socket = io('http://localhost:3000', {
      transports: ['websocket', 'polling'],
    });

    this.canvas = new fabric.Canvas('canvas', {
      width: 500,
      height: 500,
      backgroundColor: 'red',
    });

    console.log('The canvas data is', this.canvas);
    this.canvas.requestRenderAll();
  },
};
</script>

<style scoped>
/* You can add your styles here */
</style>
