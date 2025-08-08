const axios = require("axios");
const endpoint = "https://simsimi-api-pro.onrender.com/sim?query=";
const key = "a650beda66094d58b3e5c84b664420e8f2e65edd";

// Store active sessions for each thread
let activeSessions = {};

module.exports.config = {
    name: "sim",
    version: "1.0.2",
    hasPermission: 0,
    credits: "Ari",
    description: "Start a Simsimi chat mode",
    commandCategory: "fun",
    usages: "[message]",
    cooldowns: 1
};

// Function to send Simsimi request & continue conversation
async function sendSimSimi(api, event, text, author) {
    try {
        const { data: result } = await axios.get(`${endpoint}${encodeURIComponent(text)}&apikey=${key}`);
        return api.sendMessage(result.respond, event.threadID, (err, info) => {
            // Keep session active by saving last author
            activeSessions[event.threadID] = author;
            global.GoatBot.onReply.set(info.messageID, {
                commandName: module.exports.config.name,
                author: author,
                type: "chat"
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

// Handle replies to keep the chat going without using "sim" command again
module.exports.handleReply = async function ({ api, event, handleReply }) {
    // Only the original starter can continue
    if (event.senderID !== handleReply.author) return;

    const q = event.body;
    return sendSimSimi(api, event, q, handleReply.author);
};

module.exports.handleEvent = async function ({ api, event }) {
    if (activeSessions[event.threadID] && event.senderID === activeSessions[event.threadID]) {
        const q = event.body;
        return sendSimSimi(api, event, q, event.senderID);
    }
};
