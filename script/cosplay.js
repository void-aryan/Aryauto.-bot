const axios = require("axios");
const { sendMessage } = require("../handles/sendMessage");

module.exports = {
  name: "cosplay",
  description: "Random cosplay girl photo",
  author: "Vern",
  usage: "cosplay",
  cooldown: 5,

  async execute(senderId, args, pageAccessToken) {
    try {
      const apiUrl = "https://haji-mix.up.railway.app/api/cosplayv2?api_key=48eb5b9082471e96afe7b11ea62e6c32bd595fbad9ca43092d900ae8fe547da8";

      const res = await axios.get(apiUrl);
      const imageUrl = res.data?.url || res.data?.result;

      if (!imageUrl) {
        return sendMessage(senderId, {
          text: "❌ Failed to fetch cosplay image. Please try again later."
        }, pageAccessToken);
      }

      await sendMessage(senderId, {
        attachment: {
          type: "image",
          payload: {
            url: imageUrl
          }
        }
      }, pageAccessToken);

    } catch (error) {
      console.error("❌ Error in cosplay command:", error.message);
      await sendMessage(senderId, {
        text: `❌ Error fetching cosplay image: ${error.message || "Unknown error"}`
      }, pageAccessToken);
    }
  }
};
