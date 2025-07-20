const axios = require('axios');
const path = require('path');
const fs = require('fs-extra');

module.exports.config = {
  name: "pinay",
  version: "1.0.0",
  role: 2,
  description: "Fetch a Pinay video using a specific page number.",
  hasPrefix: false,
  credits: "Ry",
  cooldowns: 10,
  category: "media",
  usages: "[page number]"
};

module.exports.run = async function ({ api, event, args }) {
  const threadID = event.threadID;
  const messageID = event.messageID;

  const page = parseInt(args[0]) || 1;

  try {
    api.sendMessage(`📥 Fetching Pinay video from page ${page}, please wait...`, threadID, messageID);

    const response = await axios.get(`https://betadash-api-swordslush-production.up.railway.app/pinayot?page=${page}`);
    const video = response.data?.result?.[0];

    if (!video || !video.videoUrl) {
      return api.sendMessage("❌ No video found on that page. Try a different one.", threadID, messageID);
    }

    const fileName = `${messageID}_pinayot.mp4`;
    const filePath = path.join(__dirname, fileName);

    const videoStream = await axios({
      method: 'GET',
      url: video.videoUrl,
      responseType: 'stream'
    });

    const writer = fs.createWriteStream(filePath);
    videoStream.data.pipe(writer);

    writer.on('finish', async () => {
      api.sendMessage({
        body: `🎥 ${video.description}\n📅 Uploaded: ${video.uploadDate}`,
        attachment: fs.createReadStream(filePath)
      }, threadID, () => {
        fs.unlinkSync(filePath);
      }, messageID);
    });

    writer.on('error', () => {
      api.sendMessage("🚫 Error saving the video. Try again later.", threadID, messageID);
    });

  } catch (error) {
    console.error("❌ Error:", error);
    api.sendMessage("🚫 Failed to fetch video. Please try again later.", threadID, messageID);
  }
};