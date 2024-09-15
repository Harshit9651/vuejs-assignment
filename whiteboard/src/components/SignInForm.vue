<template>
  <div class="auth-wrapper">
    <div class="auth-container">
      <h2>Sign In</h2>
      <form @submit.prevent="submitForm" method="post">
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            type="email" 
            id="email" 
            v-model="user.email" 
            @blur="validateEmail"
            required 
          />
          <span v-if="errors.email" class="error">{{ errors.email }}</span>
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input 
            type="password" 
            id="password" 
            v-model="user.password" 
            @blur="validatePassword"
            required 
          />
          <span v-if="errors.password" class="error">{{ errors.password }}</span>
        </div>
        <button type="submit">Sign In</button>
      </form>
    </div>
    <!-- Flash message -->
    <div v-if="flashMessage" :class="{'flash-message': true, 'error': !isSuccess, 'success': isSuccess}">
      {{ flashMessage }}
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'SignInForm',
  data() {
    return {
      user: {
        email: '',
        password: '',
      },
      errors: {
        email: null,
        password: null,
      },
      flashMessage: null,
      isSuccess: false,
    };
  },
  methods: {
    validateEmail() {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!this.user.email) {
        this.errors.email = "Email is required.";
      } else if (!emailPattern.test(this.user.email)) {
        this.errors.email = "Please enter a valid email.";
      } else {
        this.errors.email = null;
      }
    },
    validatePassword() {
      if (!this.user.password) {
        this.errors.password = "Password is required.";
      } else if (this.user.password.length < 6) {
        this.errors.password = "Password must be at least 6 characters.";
      } else {
        this.errors.password = null;
      }
    },
    async submitForm() {
      this.validateEmail();
      this.validatePassword();

      if (!this.errors.email && !this.errors.password) {
        try {
          const response = await axios.post('http://localhost:3000/User/SignIn', this.user);
          sessionStorage.setItem('authToken', response.data.token); 
          this.flashMessage = response.data.message || 'Sign-in successful!';
          this.isSuccess = true;
          this.$router.push('/drawing');
        } catch (error) {
          if (error.response) {
            this.flashMessage = error.response.data.message || 'Sign-in failed.';
            this.isSuccess = false;
          } else if (error.request) {
            this.flashMessage = 'No response received from the server.';
            this.isSuccess = false;
          } else {
            this.flashMessage = `Error setting up the request: ${error.message}`;
            this.isSuccess = false;
          }
        }
        // Clear flash message after 5 seconds
        setTimeout(() => {
          this.flashMessage = null;
        }, 5000);
      } else {
        console.warn("Form has validation errors.");
      }
    },
  },
};
</script>

<style scoped>
.auth-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #ffffff;
}

.auth-container {
  width: 100%;
  max-width: 500px;
  padding: 40px;
  border-radius: 15px;
  background-color: #fff;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.15);
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

.error {
  color: red;
  font-size: 14px;
  margin-top: 5px;
  display: block;
}

button {
  width: 100%;
  padding: 12px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 18px;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #218838;
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
