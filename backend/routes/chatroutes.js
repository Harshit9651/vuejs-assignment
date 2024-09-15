const express = require('express');
const router = express.Router();

const ChatController = require("../controller/chatcontroller")
router.post('/messages',ChatController.SaveMessages)
router.get('/messages/:userId',ChatController.FatchMessages)

module.exports = router;
