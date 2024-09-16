
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

  import '../assets/css/landingpage.css'
  </script>
  
  
  