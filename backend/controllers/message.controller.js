import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
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

  // this will run in parallel
  await Promise.all([conversation.save(), newMessage.save()]);

    // SOCKET IO FUNCTIONALITY WILL GO HERE
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      // io.to(<socket_id>).emit() used to send events to specific client
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

  res.status(201).json(newMessage);

  } catch (error) {
    console.log("Error in sending message: ", error.message);
    req.status(500).json({error: "Internal Server Error"});
  }  
};

/**
 * Gets all the messages for a conversation between two users
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Promise} A promise that resolves to a json response with the messages
 */
export const getMessages = async(req, res) => {
  try {
    const {id:userToChatId} = req.params;
    const senderId = req.user._id;

    const conversation = await Conversation.findOne({
        participants: {$all: [senderId, userToChatId]},
    }).populate("messages");

    if(!conversation) return res.status(200).json([]);

    const messages = conversation.messages;

    res.status(200).json(messages);

  } catch (error) {
      console.log("Error in getting messages: ", error.message);
      req.status(500).json({error: "Internal Server Error"});
  }
};