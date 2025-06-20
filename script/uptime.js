const axios = require("axios");
const { sendMessage } = require("../handles/sendMessage");

module.exports = {
  name: "uptime",
  description: "Shows the bot's current uptime status",
  author: "Vern",
  usage: "uptime",
  cooldown: 3,

  async execute(senderId, args, pageAccessToken) {
    try {
      // Optional: Customize these parameters or fetch from config
      const apiUrl = `https://kaiz-apis.gleeze.com/api/uptime?instag=vernesg&ghub=https%3A%2F%2Fgithub.com%2Fvernesg&fb=https%3A%2F%2Fwww.facebook.com%2Fvern.23x&hours=24&minutes=60&seconds=60&botname=vernx&apikey=4fe7e522-70b7-420b-a746-d7a23db49ee5`;

      const { data } = await axios.get(apiUrl);

      if (!data || !data.result) {
        return sendMessage(senderId, {
          text: `❌ Unable to fetch uptime info.`
        }, pageAccessToken);
      }

      const message = `🟢 𝗩𝗲𝗿𝗻𝘅 𝗕𝗼𝘁 𝗨𝗽𝘁𝗶𝗺𝗲\n───────────────\n${data.result}`;
      await sendMessage(senderId, { text: message }, pageAccessToken);

    } catch (error) {
      console.error("❌ Error in uptime command:", error.message);
      return sendMessage(senderId, {
        text: `❌ Failed to retrieve uptime.\nReason: ${error.message || "Unknown error"}`
      }, pageAccessToken);
    }
  }
};
