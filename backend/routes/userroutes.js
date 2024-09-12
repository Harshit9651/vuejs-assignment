const express = require('express');
const router = express.Router();
const { validateUser } = require('../middleware/validator-checker'); 
const UserController = require("../controller/usercontroller")
router.post('/SignUp',validateUser,UserController.SignUp);
router.get('/SignIn',UserController.SignIn);

module.exports = router;
