const fs = require('fs');
const axios = require('axios');
const { createCanvas, loadImage } = require('canvas');
const path = require('path');

module.exports.config = {
    name: "welcome",
    version: "2.2.0",
    role: 0,
    description: "Welcome new members with dynamic random design",
    credits: "ARI",
    hasEvent: true
};

async function getAvatar(userID) {
    const defaultAvatar = "https://i.ibb.co/4snb3Rk/default-avatar.png";
    try {
        const res = await axios.get(
            `https://graph.facebook.com/${userID}/picture?type=large&width=512&height=512`,
            { responseType: 'arraybuffer', maxRedirects: 5 }
        );
        return Buffer.from(res.data);
    } catch (err) {
        console.error("Failed to fetch avatar:", err.message);
        const fallback = await axios.get(defaultAvatar, { responseType: 'arraybuffer' });
        return Buffer.from(fallback.data);
    }
}

function randomHSL(hueOffset = 0) {
    return `hsl(${(Math.random() * 360 + hueOffset) % 360}, ${60 + Math.random() * 20}%, ${30 + Math.random() * 20}%)`;
}

module.exports.handleEvent = async function ({ api, event }) {
    if (event.logMessageType !== "log:subscribe") return;

    const addedParticipants = event.logMessageData.addedParticipants;
    if (!addedParticipants || addedParticipants.length === 0) return;

    const senderID = addedParticipants[0].userFbId || addedParticipants[0].userId;
    if (!senderID) return;

    const userInfo = await api.getUserInfo(senderID);
    const name = userInfo[senderID]?.name || "New Member";

    const groupInfo = await api.getThreadInfo(event.threadID);
    const groupName = groupInfo.threadName || "this group";

    const avatarBuffer = await getAvatar(senderID);

    // Ensure cache folder exists
    const cacheDir = path.join(__dirname, 'cache');
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    const width = 800, height = 400;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    const avatarImg = await loadImage(avatarBuffer);

    // Dynamic background gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, randomHSL());
    gradient.addColorStop(1, randomHSL(120));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Random sparkles
    for (let i = 0; i < 25; i++) {
        ctx.fillStyle = `rgba(255,255,255,${Math.random()})`;
        ctx.beginPath();
        ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 3, 0, Math.PI * 2);
        ctx.fill();
    }

    // Avatar glow
    ctx.save();
    ctx.shadowColor = randomHSL();
    ctx.shadowBlur = 35;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2 - 30, 75, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Avatar circle crop
    ctx.save();
    ctx.beginPath();
    ctx.arc(width / 2, height / 2 - 30, 70, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(avatarImg, width / 2 - 70, height / 2 - 100, 140, 140);
    ctx.restore();

    // Welcome text
    ctx.fillStyle = "white";
    ctx.font = "bold 42px Sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`Welcome, ${name}!`, width / 2, height - 100);

    ctx.font = "28px Sans-serif";
    ctx.fillText(`to ${groupName}`, width / 2, height - 60);

    // Save image
    const imagePath = path.join(cacheDir, `welcome_${Date.now()}.png`);
    const out = fs.createWriteStream(imagePath);
    const stream = canvas.createPNGStream();
    stream.pipe(out);

    out.on('finish', () => {
        api.sendMessage({
            body: `🎉 Everyone welcome ${name} to ${groupName}!`,
            attachment: fs.createReadStream(imagePath)
        }, event.threadID, () => fs.unlinkSync(imagePath));
    });
};
