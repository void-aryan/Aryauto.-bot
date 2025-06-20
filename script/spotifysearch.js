const axios = require("axios");
const { sendMessage } = require("../handles/sendMessage");

module.exports = {
  name: "spotifysearch",
  description: "Search for songs via Spotify",
  author: "Vern",
  usage: "spotifysearch [song name]",
  cooldown: 3,

  async execute(senderId, args, pageAccessToken) {
    const query = args.join(" ").trim();

    if (!query) {
      return sendMessage(senderId, {
        text: "🎵 Please enter a song title.\nExample: spotifysearch multo"
      }, pageAccessToken);
    }

    const apiUrl = `https://kaiz-apis.gleeze.com/api/spotify-search?q=${encodeURIComponent(query)}&apikey=4fe7e522-70b7-420b-a746-d7a23db49ee5`;

    try {
      const { data } = await axios.get(apiUrl);

      if (!data || !data.result || data.result.length === 0) {
        return sendMessage(senderId, {
          text: "❌ No results found."
        }, pageAccessToken);
      }

      const song = data.result[0];
      const message = `🎶 𝗦𝗣𝗢𝗧𝗜𝗙𝗬 𝗥𝗘𝗦𝗨𝗟𝗧 🎶\n─────────────\n📌 𝗧𝗶𝘁𝗹𝗲: ${song.title}\n🎤 𝗔𝗿𝘁𝗶𝘀𝘁: ${song.artists}\n📀 𝗔𝗹𝗯𝘂𝗺: ${song.album}\n🔗 ${song.url}\n─────────────`;

      await sendMessage(senderId, { text: message }, pageAccessToken);

      if (song.thumbnail) {
        await sendMessage(senderId, {
          attachment: {
            type: "image",
            payload: { url: song.thumbnail }
          }
        }, pageAccessToken);
      }

    } catch (error) {
      console.error("❌ Spotify Search Error:", error.message);
      return sendMessage(senderId, {
        text: `❌ An error occurred while searching.\nReason: ${error.message || "Unknown error"}`
      }, pageAccessToken);
    }
  }
};
