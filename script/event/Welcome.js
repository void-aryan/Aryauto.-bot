const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { createCanvas, loadImage, registerFont } = require('canvas');

module.exports.config = {
  name: "welcome", 
  version: "1.0.0",
  role: 0,
  hasPermission: 0,
  eventType: ["log:subscribe"],
  hasEvent: true,
  credits: "ARI",
  description: "Welcome image generator for new members"
};

async function getAvatar(userID) {
  try {
    const res = await axios.get(
      `https://graph.facebook.com/${userID}/picture?type=large&width=1024&height=1024`,
      { responseType: 'arraybuffer' }
    );
    return Buffer.from(res.data);
  } catch {
    return null;
  }
}

async function createWelcomeCard({ name, avatarBuffer, groupName }) {
  const WIDTH = 1200;
  const HEIGHT = 500;
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  gradient.addColorStop(0, "#0f2027");
  gradient.addColorStop(0.5, "#203a43");
  gradient.addColorStop(1, "#2c5364");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Circular avatar
  if (avatarBuffer) {
    const avatar = await loadImage(avatarBuffer);
    const size = 300;
    ctx.save();
    ctx.beginPath();
    ctx.arc(WIDTH / 2, HEIGHT / 2 - 50, size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(
      avatar,
      WIDTH / 2 - size / 2,
      HEIGHT / 2 - size / 2 - 50,
      size,
      size
    );
    ctx.restore();
  }

  // Texts
  ctx.font = 'bold 80px Arial';
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.fillText("WELCOME", WIDTH / 2, HEIGHT / 2 + 200);

  ctx.font = 'bold 60px Arial';
  ctx.fillStyle = "#FFD700";
  ctx.fillText(name, WIDTH / 2, HEIGHT / 2 + 260);

  ctx.font = '30px Arial';
  ctx.fillStyle = "#fff";
  ctx.fillText(`to ${groupName}`, WIDTH / 2, HEIGHT / 2 + 300);

  return canvas.toBuffer();
}

module.exports.onEvent = async function ({ api, event }) {
  if (event.logMessageType !== "log:subscribe") return;

  try {
    const threadID = event.threadID;
    const threadInfo = await api.getThreadInfo(threadID);
    const groupName = threadInfo?.name || "our group";

    const added = event.logMessageData?.addedParticipants || [];
    for (const user of added) {
      const userID = user.userFbId || user.userID || user.id;
      const name = user.fullName || "New Member";

      const avatarBuffer = await getAvatar(userID);
      const cardBuffer = await createWelcomeCard({ name, avatarBuffer, groupName });

      const fileName = path.join(__dirname, `welcome_${userID}.png`);
      fs.writeFileSync(fileName, cardBuffer);

      await api.sendMessage(
        {
          body: `🎉 Welcome to ${groupName}, ${name}! Enjoy and stay!`,
          mentions: [{ tag: name, id: userID }],
          attachment: fs.createReadStream(fileName)
        },
        threadID
      );

      fs.unlinkSync(fileName);
    }
  } catch (err) {
    console.error("Error in welcome event:", err);
  }
};
