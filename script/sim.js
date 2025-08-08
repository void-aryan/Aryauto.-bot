const axios = require("axios");
const endpoint = "https://simsimi-api-pro.onrender.com/sim?query=";
const key = "a650beda66094d58b3e5c84b664420e8f2e65edd";

module.exports.config = {
    name: "sim",
    version: "1.0.7",
    hasPermission: 0,
    credits: "Ari + AJ Fixed Reply",
    description: "Simsimi chat mode (reply-only)",
    commandCategory: "fun",
    usages: "[message]",
    cooldowns: 1
};

async function sendSimSimi(api, event, text, author) {
    try {
        const { data } = await axios.get(`${endpoint}${encodeURIComponent(text)}&apikey=${key}`);
        api.sendMessage(data.respond, event.threadID, (err, info) => {
            if (err) return console.error(err);

            // Store reply data so handleReply can catch it
            global.GoatBot.onReply.set(info.messageID, {
                commandName: module.exports.config.name,
                author: author
            });
        }, event.messageID);
    } catch (e) {
        console.error(e);
        api.sendMessage("❌ Error fetching Simsimi's response.", event.threadID, event.messageID);
    }
}

// Start conversation
module.exports.run = async function ({ api, event, args }) {
    const q = args.join(" ");
    if (!q) return api.sendMessage("Ano?", event.threadID, event.messageID);
    return sendSimSimi(api, event, q, event.senderID);
};

// Continue only if user is the original author
module.exports.handleReply = async function ({ api, event, handleReply }) {
    if (event.senderID !== handleReply.author) return;
    return sendSimSimi(api, event, event.body, handleReply.author);
};
