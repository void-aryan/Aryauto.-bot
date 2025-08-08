const axios = require('axios');

const endpoint = "https://simsimi-api-pro.onrender.com/sim?query=";
const key = "a650beda66094d58b3e5c84b664420e8f2e65edd";

// Store active sessions to avoid multiple users in the same thread
let activeSessions = {};

module.exports.config = {
  name: "sim",
  version: "1.0.0",
  credits: " converted by ARI",
  description: "Talk to SimSimi AI",
  commandCategory: "chat",
  usages: "[message]",
  cooldowns: 0
};

// Function for reply chain
async function replyHandler({ api, event, message }) {
  const threadID = event.threadID;
  const authorID = activeSessions[threadID];

  // Only allow the same user in the session
  if (event.senderID !== authorID) {
    return api.sendMessage(`[!] This session is already occupied by another user.`, threadID, event.messageID);
  }

  const q = event.body;
  try {
    const { data: result } = await axios.get(`${endpoint}${encodeURIComponent(q)}&apikey=${key}`);
    return api.sendMessage(result.respond, threadID, (err, info) => {
      global.client.handleReply.push({
        name: module.exports.config.name,
        messageID: info.messageID,
        author: event.senderID
      });
    }, event.messageID);
  } catch (e) {
    console.error(e);
    return api.sendMessage("An error occurred while fetching the response.", threadID, event.messageID);
  }
}

module.exports.handleReply = async function ({ api, event }) {
  await replyHandler({ api, event });
};

module.exports.run = async function ({ api, event, args }) {
  const q = args.join(" ");
  if (!q) return api.sendMessage("Ano?", event.threadID, event.messageID);

  // Start new session
  activeSessions[event.threadID] = event.senderID;

  try {
    const { data: result } = await axios.get(`${endpoint}${encodeURIComponent(q)}&apikey=${key}`);
    return api.sendMessage(result.respond, event.threadID, (err, info) => {
      global.client.handleReply.push({
        name: module.exports.config.name,
        messageID: info.messageID,
        author: event.senderID
      });
    }, event.messageID);
  } catch (e) {
    console.error(e);
    return api.sendMessage("An error occurred while fetching the response.", event.threadID, event.messageID);
  }
};
