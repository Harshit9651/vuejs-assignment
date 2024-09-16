<template>
  <div class="form-container">
    <h2>Sign Up</h2>
    <form @submit.prevent="submitForm" method="post">
      <div class="form-group">
        <label for="name">Name</label>
        <input type="text" id="name" v-model="User.name" required />
      </div>
      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" v-model="User.email" required />
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input type="password" id="password" v-model="User.password" required />
      </div>
      <button type="submit">Sign Up</button>
    </form>
    <!-- Flash message -->
    <div v-if="flashMessage" :class="{'flash-message': true, 'success': isSuccess, 'error': !isSuccess}">
      {{ flashMessage }}
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'SignUpForm',
  data() {
    return {
      User: {
        name: '',
        email: '',
        password: '',
      },
      flashMessage: null,
      isSuccess: false,
    };
  },
  methods: {
    async submitForm() {
      try {
        const response = await axios.post('http://localhost:3000/User/SignUp', this.User);
        this.flashMessage = 'User signed up successfully!';
        this.isSuccess = true;
        // Clear input fields after successful signup
        this.User.name = '';
        this.User.email = '';
        this.User.password = '';
        console.log(response);
      } catch (error) {
        if (error.response) {
          this.flashMessage = `There was an error signing up: ${error.response.data.message || 'Unknown error'}`;
          this.isSuccess = false;
        } else if (error.request) {
          this.flashMessage = 'No response received from the server.';
          this.isSuccess = false;
        } else {
          this.flashMessage = `Error setting up the request: ${error.message}`;
          this.isSuccess = false;
        }
      }
      // Clear the message after 5 seconds
      setTimeout(() => {
        this.flashMessage = null;
      }, 5000);
    }
  },
};
import '../assets/css/signuppage.css'
</script>

