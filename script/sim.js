const axios = require('axios');

let simEnabled = false; // Toggle state (default: off)

const endpoint = "https://simsimi-api-pro.onrender.com/sim?query=";
const key = "a650beda66094d58b3e5c84b664420e8f2e65edd";

module.exports.config = {
  name: "sim",
  version: "1.0.0",
  role: 0,
  aliases: ["simi", "simsimi"],
  credits: "Converted by ari",
  cooldown: 3,
  description: "Chat with SimSimi AI. You can turn it on/off.",
  usage: "[on/off] or [your message]"
};

module.exports.run = async function ({ api, event, args }) {
  const command = args[0] ? args[0].toLowerCase() : "";

  // Toggle ON
  if (command === "on") {
    simEnabled = true;
    return api.sendMessage("✅ SimSimi is now ON. I will reply to messages.", event.threadID, event.messageID);
  }

  // Toggle OFF
  if (command === "off") {
    simEnabled = false;
    return api.sendMessage("❌ SimSimi is now OFF. I will stop replying.", event.threadID, event.messageID);
  }

  // If SimSimi is OFF
  if (!simEnabled) {
    return api.sendMessage("⚠ SimSimi is currently OFF. Type `sim on` to enable.", event.threadID, event.messageID);
  }

  // Process query
  const q = args.join(" ");
  if (!q) {
    return api.sendMessage("❓ Please provide a message to send to SimSimi.", event.threadID, event.messageID);
  }

  try {
    const { data: result } = await axios.get(`${endpoint}${encodeURIComponent(q)}&apikey=${key}`);
    return api.sendMessage(result.respond, event.threadID, event.messageID);
  } catch (err) {
    console.error(err);
    return api.sendMessage("❌ An error occurred while fetching the SimSimi response.", event.threadID, event.messageID);
  }
};

// Optional: Auto-reply to all messages if SimSimi is enabled
module.exports.handleEvent = async function ({ api, event }) {
  if (!simEnabled) return;
  if (event.body && !event.isGroup && event.senderID !== api.getCurrentUserID()) {
    try {
      const { data: result } = await axios.get(`${endpoint}${encodeURIComponent(event.body)}&apikey=${key}`);
      return api.sendMessage(result.respond, event.threadID, event.messageID);
    } catch (err) {
      console.error(err);
      return api.sendMessage("❌ Error fetching SimSimi response.", event.threadID, event.messageID);
    }
  }
};
