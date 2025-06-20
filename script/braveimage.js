const axios = require("axios");
const { sendMessage } = require("../handles/sendMessage");

module.exports = {
  name: "braveimage",
  description: "Search images using Brave API",
  author: "Vern",
  usage: "braveimage <search term> - <limit (optional)>",
  cooldown: 5,

  async execute(senderId, args, pageAccessToken) {
    try {
      if (!args || args.length === 0) {
        return sendMessage(senderId, {
          text: "🖼️ Please provide a search term.\n\nExample:\nbraveimage cat - 5"
        }, pageAccessToken);
      }

      const query = args.join(" ");
      const [searchTerm, countInput] = query.split(" - ");
      const limit = parseInt(countInput) || 5;

      if (limit < 1 || limit > 20) {
        return sendMessage(senderId, {
          text: "❌ Limit must be between 1 and 20 images."
        }, pageAccessToken);
      }

      const apiUrl = `https://kaiz-apis.gleeze.com/api/brave-image?search=${encodeURIComponent(searchTerm)}&limit=${limit}&apikey=4fe7e522-70b7-420b-a746-d7a23db49ee5`;
      const { data } = await axios.get(apiUrl);

      const imageList = data?.data;
      if (!imageList || imageList.length === 0) {
        return sendMessage(senderId, {
          text: `❌ No images found for "${searchTerm}".`
        }, pageAccessToken);
      }

      for (const url of imageList.slice(0, limit)) {
        await sendMessage(senderId, {
          attachment: {
            type: "image",
            payload: { url }
          }
        }, pageAccessToken);
      }

    } catch (error) {
      console.error("❌ Error in braveimage command:", error.message || error);
      return sendMessage(senderId, {
        text: `❌ Failed to fetch images.\nReason: ${error.message || "Unknown error"}`
      }, pageAccessToken);
    }
  }
};
