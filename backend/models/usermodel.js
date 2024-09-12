const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required."], // Name is required
    minlength: [3, "Name must be at least 3 characters long."], // Minimum length of 3 characters
    maxlength: [50, "Name cannot exceed 50 characters."] // Maximum length of 50 characters
  },
  email: {
    type: String,
    required: [true, "Email is required."], // Email is required
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      "Please enter a valid email address." // Validate email format
    ]
  },
  password: {
    type: String,
    required: [true, "Password is required."], // Password is required
    minlength: [6, "Password must be at least 6 characters long."], // Minimum length of 6 characters
  }
});


module.exports = mongoose.model("SignUp", userSchema);
