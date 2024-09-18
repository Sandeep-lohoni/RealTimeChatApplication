import Conversation from "../models/conversation.model";

/**
 * Handles sending a message from one user to another
 * Creates a new conversation if one does not exist between the two users
 * Adds the message to the conversation
 * Saves the conversation and the message
 * Returns a success message and status code
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Promise} A promise that resolves to a json response with a success message
 */
export const sendMessage = async(req, res) => {
  try {
    const {message} = req.body;
    const {id: receiverId} = req.params;
    const senderId = req.user._id;

    let conversation = await Conversation.findOne({
        participants: {$all: [senderId, receiverId]},
  });

  if(!conversation){
    conversation = await Conversation.create({
        participants: [senderId, receiverId],
    })
  }
  const newMessage = new Message({
    senderId,
    receiverId,
    message,
  })

  if(newMessage){
    conversation.messages.push(newMessage._id);
  }

  await Promise.all([conversation.save(), newMessage.save()]);

  res.status(200).json({message: "Message sent successfully"});

  } catch (error) {
    console.log("Error in sending message: ", error);
    req.status(500).json({ message: error.message });
  }  
};

export const getMessages = async(req, res) => {
  try {
    const {id:userToChatId} = req.params;
    const senderId = req.user._id;

    const conversation = await Conversation.findOne({
        participants: {$all: [senderId, userToChatId]},
    }).populate("messages");

    if(!conversation) return res.status(200).json([]);
    const messages = conversation.messages;

    res.status(200).json({messages: conversation.messages});

  } catch (error) {
      console.log("Error in getting messages: ", error);
      req.status(500).json({ message: error.message });
  }
};