<!-- <template>
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
   -->
   <template>
    <div class="landing-container">
      <!-- Hero Section -->
      <div class="landing-hero">
        <h1>Unleash Your Creativity</h1>
        <p>Collaborate with friends, share ideas, and create amazing art together!</p>
        <div class="hero-buttons">
          <router-link to="/signup">
            <button class="landing-button primary">Sign Up</button>
          </router-link>
          <router-link to="/signin">
            <button class="landing-button secondary">Sign In</button>
          </router-link>
        </div>
      </div>
  
      <!-- Features Section -->
      <section class="features-section">
        <h2>Features</h2>
        <div class="features-container">
          <div class="feature">
            <div class="icon">&#x1F58C;&#xFE0F;</div>
            <h3>Real-Time Collaboration</h3>
            <p>Draw with friends in real-time, no matter where they are!</p>
          </div>
          <div class="feature">
            <div class="icon">&#x1F4AC;</div>
            <h3>Chat While You Draw</h3>
            <p>Discuss ideas and give feedback through the built-in chat system.</p>
          </div>
          <div class="feature">
            <div class="icon">&#x1F58D;&#xFE0F;</div>
            <h3>Customizable Canvas</h3>
            <p>Enjoy a variety of tools to create the art you envision.</p>
          </div>
        </div>
      </section>
  
      <!-- Testimonials Section -->
      <section class="testimonials-section">
        <h2>What Our Users Say</h2>
        <div class="testimonials-container">
          <div class="testimonial">
            <p>"This platform is amazing! I love how easy it is to collaborate with my friends."</p>
            <span>- Alex J.</span>
          </div>
          <div class="testimonial">
            <p>"The drawing tools are fantastic, and the chat feature makes it even better."</p>
            <span>- Priya S.</span>
          </div>
        </div>
      </section>
  
      <!-- Call to Action (Buttons) -->
      <div class="cta-section">
        <router-link to="/drawing">
          <button class="landing-button primary">Start Drawing</button>
        </router-link>
      </div>
  
      <!-- Footer Section -->
      <footer class="footer">
        <p>&copy; 2024 Collaborative Drawing. All rights reserved.</p>
        <div class="footer-links">
          <router-link to="/terms">Terms of Service</router-link>
          <router-link to="/privacy">Privacy Policy</router-link>
        </div>
      </footer>
    </div>
  </template>
  
  <script>
  export default {
    name: 'LandingPage',
  };
  </script>
  
  <style scoped>
  /* General Styles */
  .landing-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('https://images.unsplash.com/photo-1496377930500-9a742665a0d5');
    background-size: cover;
    background-position: center;
    color: white;
    padding: 0 20px;
    text-align: center;
    font-family: 'Poppins', sans-serif;
  }
  
  /* Hero Section */
  .landing-hero {
    padding: 80px 20px;
    max-width: 800px;
  }
  
  h1 {
    margin-bottom: 20px;
    font-size: 3.5rem;
    font-weight: 700;
    text-shadow: 3px 3px 5px rgba(0, 0, 0, 0.5);
  }
  
  p {
    font-size: 1.5rem;
    margin-bottom: 40px;
    color: #f0f0f0;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  }
  
  .hero-buttons {
    display: flex;
    justify-content: center;
    gap: 20px;
  }
  
  .landing-button {
    padding: 15px 40px;
    font-size: 1.3rem;
    border-radius: 30px;
    border: none;
    cursor: pointer;
    transition: transform 0.3s ease, background-color 0.3s ease;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  }
  
  .primary {
    background-color: #ff6363;
    color: white;
  }
  
  .secondary {
    background-color: #63a4ff;
    color: white;
  }
  
  .landing-button:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  }
  
  /* Features Section */
  .features-section {
    background-color: rgba(255, 255, 255, 0.05);
    padding: 50px 20px;
    margin-bottom: 50px;
    width: 100%;
    text-align: center;
  }
  
  .features-section h2 {
    font-size: 2.5rem;
    margin-bottom: 40px;
    color: #ffda79;
  }
  
  .features-container {
    display: flex;
    justify-content: space-around;
    gap: 20px;
    flex-wrap: wrap;
  }
  
  .feature {
    background: rgba(255, 255, 255, 0.15);
    color: white;
    padding: 20px;
    border-radius: 20px;
    max-width: 300px;
    text-align: center;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  }
  
  .feature:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
  }
  
  .icon {
    font-size: 3rem;
    margin-bottom: 10px;
    color: #ffda79;
  }
  
  /* Testimonials Section */
  .testimonials-section {
    background-color: rgba(255, 255, 255, 0.9);
    padding: 50px 20px;
    margin-bottom: 50px;
    width: 100%;
    text-align: center;
    color: #333;
  }
  
  .testimonials-section h2 {
    font-size: 2.5rem;
    margin-bottom: 30px;
  }
  
  .testimonials-container {
    display: flex;
    justify-content: space-around;
    gap: 20px;
    flex-wrap: wrap;
  }
  
  .testimonial {
    background: #f9f9f9;
    padding: 20px;
    border-radius: 15px;
    max-width: 300px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;
  }
  
  .testimonial:hover {
    transform: scale(1.05);
  }
  
  .testimonial p {
    font-style: italic;
  }
  
  .testimonial span {
    display: block;
    margin-top: 10px;
    font-weight: bold;
  }
  
  /* CTA Section */
  .cta-section {
    margin-bottom: 50px;
  }
  
  /* Footer Section */
  .footer {
    background-color: rgba(0, 0, 0, 0.8);
    padding: 20px;
    text-align: center;
    width: 100%;
  }
  
  .footer p {
    margin: 0;
    color: white;
  }
  
  .footer-links {
    margin-top: 10px;
  }
  
  .footer-links a {
    margin: 0 10px;
    color: white;
    text-decoration: none;
  }
  
  .footer-links a:hover {
    text-decoration: underline;
  }
  
  /* Media Queries for Responsiveness */
  @media (max-width: 768px) {
    h1 {
      font-size: 2.5rem;
    }
  
    p {
      font-size: 1.2rem;
    }
  
    .landing-button {
      font-size: 1.2rem;
    }
  
    .features-container, .testimonials-container {
      flex-direction: column;
    }
  }
  </style>
  