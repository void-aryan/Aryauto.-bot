const axios = require("axios");
const { sendMessage } = require("../handles/sendMessage");

module.exports = {
  name: "crushimg",
  description: "Generate anime-style image from text prompt",
  author: "Vern",
  usage: "crushimg <prompt> -style <style> (optional)",
  cooldown: 5,

  async execute(senderId, args, pageAccessToken) {
    // Default values
    let style = "anime";
    let prompt = args.join(" ");

    // Support " -style cyberpunk" format
    const styleIndex = args.findIndex(arg => arg === "-style");
    if (styleIndex !== -1 && args[styleIndex + 1]) {
      style = args[styleIndex + 1];
      prompt = args.slice(0, styleIndex).join(" ");
    }

    if (!prompt) {
      return sendMessage(senderId, {
        text: "❌ 𝗣𝗹𝗲𝗮𝘀𝗲 𝗲𝗻𝘁𝗲𝗿 𝗮 𝗽𝗿𝗼𝗺𝗽𝘁.\n\nExample:\n`crushimg cat in city -style anime`"
      }, pageAccessToken);
    }

    try {
      await sendMessage(senderId, {
        text: "🎨 𝗚𝗲𝗻𝗲𝗿𝗮𝘁𝗶𝗻𝗴 𝗶𝗺𝗮𝗴𝗲, 𝗽𝗹𝗲𝗮𝘀𝗲 𝘄𝗮𝗶𝘁..."
      }, pageAccessToken);

      const apiUrl = `https://haji-mix.up.railway.app/api/crushimg?prompt=${encodeURIComponent(prompt)}&style=${encodeURIComponent(style)}&negative_prompt=&api_key=48eb5b9082471e96afe7b11ea62e6c32bd595fbad9ca43092d900ae8fe547da8`;

      const response = await axios.get(apiUrl);
      const imageUrl = response.data?.image || response.data?.result || response.data?.url;

      if (!imageUrl) {
        return sendMessage(senderId, {
          text: "❌ 𝗙𝗮𝗶𝗹𝗲𝗱 𝘁𝗼 𝗴𝗲𝗻𝗲𝗿𝗮𝘁𝗲 𝗶𝗺𝗮𝗴𝗲. 𝗧𝗿𝘆 𝗮𝗴𝗮𝗶𝗻 𝗹𝗮𝘁𝗲𝗿."
        }, pageAccessToken);
      }

      await sendMessage(senderId, {
        attachment: {
          type: "image",
          payload: { url: imageUrl }
        }
      }, pageAccessToken);

    } catch (error) {
      console.error("❌ Error in crushimg command:", error.message);
      await sendMessage(senderId, {
        text: `❌ 𝗘𝗿𝗿𝗼𝗿 𝗴𝗲𝗻𝗲𝗿𝗮𝘁𝗶𝗻𝗴 𝗶𝗺𝗮𝗴𝗲: ${error.message || "Unknown error"}`
      }, pageAccessToken);
    }
  }
};
