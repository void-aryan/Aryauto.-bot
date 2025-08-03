const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "redroom",
  version: "1.0.0",
  permission: 0,
  credits: "AJ/ARI",
  description: "Sends a Red Room aesthetic video",
  category: "aesthetic",
  usages: "",
  cooldowns: 5,
};

module.exports.run = async function ({ api, event }) {
  const message = `🎥 𝗥𝗘𝗗 𝗥𝗢𝗢𝗠 

🔴 You are now entering the RED ROOM...
✨ Enjoy and silence.`;

  const videoUrl = [
    "https://files.catbox.moe/c039x7.mp4",
    "https://files.catbox.moe/cyzs91.mp4",
    "https://files.catbox.moe/gpjmmw.mp4",
    "https://files.catbox.moe/gpjmmw.mp4",
    "https://files.catbox.moe/svisxu.mp4",
    "https://files.catbox.moe/qm3mdq.mp4",
    "https://files.catbox.moe/nfpc2v.mp4",
    "https://files.catbox.moe/hp0av4.mp4",
    "https://files.catbox.moe/itw6ix.mp4",
    "https://files.catbox.moe/9ouwzd.mp4",
    "https://files.catbox.moe/0vw7wh.mp4",
    "https://files.catbox.moe/d2h7nz.mp4",
    "https://files.catbox.moe/44jsle.mp4",
    "https://files.catbox.moe/qqse4t.mp4",
    "https://files.catbox.moe/g9qcr1.mp4",
    "https://files.catbox.moe/kqge9z.mp4",
    "https://files.catbox.moe/0ic5f9.mp4"
    ];
  try {
    const res = await axios.get(videoUrl, { responseType: "arraybuffer" });
    const filePath = path.join(__dirname, "/cache/redroomvideo.mp4");

    fs.writeFileSync(filePath, Buffer.from(res.data, "binary"));

    api.sendMessage(
      {
        body: message,
        attachment: fs.createReadStream(filePath),
      }, 
      event.threadID,
      () => fs.unlinkSync(filePath),
      event.messageID
    );
  } catch (err) {
    console.error(err);
    return api.sendMessage("❌ Failed to load the Red Room video.", event.threadID, event.messageID);
  }
};
