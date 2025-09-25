let config = {};
try {
    config = require("../config.json");
} catch (e) {
    config.botName = "BOT";
}

module.exports.config = {
    name: "nickname",
    version: "1.0.1",
    role: 0,
    description: "Automatically sets the bot's nickname when added to a group.",
    prefix: false,
    premium: false,
    credits: "Vern",
    cooldowns: 0,
    category: "system",
    handleEvent: true
};

module.exports.handleEvent = async function ({ api, event }) {
    try {
        if (
            event.logMessageType === "log:subscribe" &&
            event.logMessageData &&
            Array.isArray(event.logMessageData.addedParticipants) &&
            event.logMessageData.addedParticipants.some(user => user.userFbId === api.getCurrentUserID())
        ) {
            const botID = api.getCurrentUserID();
            const botName = config.botName || "𝑽𝑶𝑳𝑫𝑰𝑮𝑶 𝑩𝑶𝑻";

            api.changeNickname(botName, event.threadID, botID, (err) => {
                if (err) return console.error("❌ Failed to set nickname:", err);
                // Optionally, notify group
                // api.sendMessage(`🤖 My nickname has been set to '$
