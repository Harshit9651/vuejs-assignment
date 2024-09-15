
const Message = require('../models/chatmodel');

exports.SaveMessages =  async (req, res) => {
  try {
    const message = new Message(req.body);
    await message.save();
    res.status(201).send(message);
  } catch (error) {
    res.status(400).send(error);
  }
};


exports.FatchMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.params.userId },
        { receiver: req.params.userId },
      ],
    }).sort({ timestamp: 1 });
    res.send(messages);
  } catch (error) {
    res.status(400).send(error);
  }
}

