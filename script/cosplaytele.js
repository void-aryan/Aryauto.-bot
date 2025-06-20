const axios = require("axios");
const { sendMessage } = require("../handles/sendMessage");

module.exports = {
  name: "cosplaytele",
  description: "Send multiple cosplay images based on search term",
  author: "Vern",
  usage: "cosplaytele <search_term>",
  cooldown: 5,

  async execute(senderId, args, pageAccessToken) {
    const query = args.join(" ").trim() || "hentai"; // default fallback

    try {
      await sendMessage(senderId, {
        text: `📥 𝗙𝗲𝘁𝗰𝗵𝗶𝗻𝗴 𝗰𝗼𝘀𝗽𝗹𝗮𝘆 𝗶𝗺𝗮𝗴𝗲𝘀 𝗳𝗼𝗿: "${query}"...`
      }, pageAccessToken);

      const apiUrl = `https://haji-mix.up.railway.app/api/cosplaytele?search=${encodeURIComponent(query)}&stream=true&limit=10&api_key=48eb5b9082471e96afe7b11ea62e6c32bd595fbad9ca43092d900ae8fe547da8`;

      const response = await axios.get(apiUrl);
      const results = response.data?.data || response.data?.result || [];

      if (!results.length) {
        return sendMessage(senderId, {
          text: `❌ 𝗡𝗼 𝗰𝗼𝘀𝗽𝗹𝗮𝘆 𝗿𝗲𝘀𝘂𝗹𝘁𝘀 𝗳𝗼𝘂𝗻𝗱 𝗳𝗼𝗿 "${query}".`
        }, pageAccessToken);
      }

      for (const url of results) {
        await sendMessage(senderId, {
          attachment: {
            type: "image",
            payload: {
              url: url
            }
          }
        }, pageAccessToken);

        // Optional: Add small delay between sends to avoid rate limit
        await new Promise(res => setTimeout(res, 400));
      }

    } catch (error) {
      console.error("❌ Error in cosplaytele command:", error.message);
      return sendMessage(senderId, {
        text: `❌ 𝗘𝗿𝗿𝗼𝗿 𝗳𝗲𝘁𝗰𝗵𝗶𝗻𝗴 𝗰𝗼𝘀𝗽𝗹𝗮𝘆 𝗶𝗺𝗮𝗴𝗲𝘀:\n${error.message || "Unknown error"}`
      }, pageAccessToken);
    }
  }
};
