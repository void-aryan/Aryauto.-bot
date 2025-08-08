const axios = require("axios");
const endpoint = "https://simsimi-api-pro.onrender.com/sim?query=";
const key = "a650beda66094d58b3e5c84b664420e8f2e65edd";

module.exports.config = {
    name: "sim",
    version: "1.0.4",
    hasPermission: 0,
    credits: "Ari",
    description: "Start a Simsimi chat mode (reply-only)",
    commandCategory: "fun",
    usages: "[message]",
    cooldowns: 1
};

// Function to send Simsimi reply
async function sendSimSimi(api, event, text, author) {
    try {
        const { data: result } = await axios.get(`${endpoint}${encodeURIComponent(text)}&apikey=${key}`);
        return api.sendMessage(result.respond, event.threadID, (err, info) => {
            global.GoatBot.onReply.set(info.messageID, {
                commandName: module.exports.config.name,
                author: author
            });
        }, event.messageID);
    } catch (e) {
        console.error(e);
        return api.sendMessage("❌ Error fetching Simsimi's response.", event.threadID, event.messageID);
    }
}

module.exports.run = async function ({ api, event, args }) {
    const q = args.join(" ");
    if (!q) return api.sendMessage("Ano?", event.threadID, event.messageID);
    return sendSimSimi(api, event, q, event.senderID);
};

// Trigger only if user replies directly to bot
module.exports.handleReply = async function ({ api, event, handleReply }) {
    if (event.senderID !== handleReply.author) return;
    return sendSimSimi(api, event, event.body, handleReply.author);
};

// Removed handleEvent completely to stop spam
