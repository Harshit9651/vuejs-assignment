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
</script>

<style scoped>
/* Your existing CSS */
.form-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh; 
  background-color:  #ffffff;
}

form {
  max-width: 500px; 
  width: 100%;
  padding: 40px; 
  border-radius: 15px; 
  background-color: #ffffff;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333; 
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 10px;
  font-weight: bold; 
  color: #555; 
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 16px;
}

button {
  width: 100%;
  padding: 15px;
  font-size: 18px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #0056b3;
}

/* Flash message styles */
.flash-message {
  position: fixed;
  top: 10px;
  right: 10px;
  padding: 10px 20px;
  border-radius: 5px;
  color: white;
  font-size: 16px;
  z-index: 1000;
}

.flash-message.success {
  background-color: #28a745; /* Green */
}

.flash-message.error {
  background-color: #dc3545; /* Red */
}
</style>
