<template>
    <div class="landing-container">
      <h1>Welcome to Collaborative Drawing</h1>
      <div class="button-container">
        <router-link to="/signup">
          <button class="landing-button">Sign Up</button>
        </router-link>
        <router-link to="/signin">
          <button class="landing-button">Sign In</button>
        </router-link>
        <router-link to="/drawing">
          <button class="landing-button">Start Drawing</button>
        </router-link>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'LandingPage',
  };
  </script>
  
  <style scoped>
  .landing-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f0f0f0;
    text-align: center;
  }
  
  h1 {
    margin-bottom: 50px;
    font-size: 3rem;
    color: #333;
  }
  
  .button-container {
    display: flex;
    justify-content: center;
    gap: 20px;
  }
  
  .landing-button {
    padding: 15px 30px;
    font-size: 1.5rem;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  
  .landing-button:hover {
    background-color: #0056b3;
  }
  </style>
  