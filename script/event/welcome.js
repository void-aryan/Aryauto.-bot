const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { createCanvas, loadImage, registerFont } = require('canvas');

module.exports.config = {
    name: "welcome",
    version: "3.1.0",
    role: 0,
    description: "Welcome new members with premium design",
    credits: "ARI",
    hasEvent: true
};

// Register custom font if available
try {
    registerFont(path.join(__dirname, "fonts", "Poppins-Bold.ttf"), { family: "Poppins" });
} catch { /* ignore if missing */ }

async function getAvatar(userID) {
    const defaultAvatar = "https://i.imgur.com/tfHIYHO.jpeg";
    try {
        const res = await axios.get(
            `https://graph.facebook.com/${userID}/picture?type=large&width=512&height=512&access_token=${process.env.FB_ACCESS_TOKEN || ""}`,
            { responseType: 'arraybuffer', maxRedirects: 5 }
        );
        return Buffer.from(res.data);
    } catch {
        const fallback = await axios.get(defaultAvatar, { responseType: 'arraybuffer' });
        return Buffer.from(fallback.data);
    }
}

function randomHSL(hueOffset = 0) {
    return `hsl(${(Math.random() * 360 + hueOffset) % 360}, ${60 + Math.random() * 20}%, ${35 + Math.random() * 20}%)`;
}

module.exports.handleEvent = async function ({ api, event }) {
    if (event.logMessageType !== "log:subscribe") return;
    const addedParticipants = event.logMessageData?.addedParticipants;
    if (!addedParticipants?.length) return;

    const groupInfo = await api.getThreadInfo(event.threadID);
    const groupName = groupInfo.threadName || "this group";

    const width = 900, height = 500;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, randomHSL());
    gradient.addColorStop(1, randomHSL(120));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < 35; i++) {
        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.3})`;
        ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 4, 0, Math.PI * 2);
        ctx.fill();
    }

    const avatarSize = 85;
    const avatarSpacing = 20;
    const totalWidth = addedParticipants.length * (avatarSize * 2 + avatarSpacing) - avatarSpacing;
    let startX = width / 2 - totalWidth / 2;

    for (const participant of addedParticipants) {
        const userID = participant.userFbId || participant.userId || participant.id;
        if (!userID) continue;

        const avatarBuffer = await getAvatar(userID);
        const avatarImg = await loadImage(avatarBuffer);

        ctx.save();
        ctx.beginPath();
        ctx.arc(startX + avatarSize, height / 2 - 40, avatarSize, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(avatarImg, startX, height / 2 - 125, avatarSize * 2, avatarSize * 2);
        ctx.restore();

        startX += avatarSize * 2 + avatarSpacing;
    }

    const names = await Promise.all(addedParticipants.map(async p => {
        const userID = p.userFbId || p.userId || p.id;
        if (!userID) return "New Member";
        const info = await api.getUserInfo(userID);
        return info[userID]?.name || "New Member";
    }));

    ctx.fillStyle = "white";
    ctx.textAlign = "center";

    ctx.font = "bold 50px Poppins, Sans-serif";
    ctx.fillText(`Welcome, ${names.join(", ")}!`, width / 2, height - 130);

    ctx.font = "28px Poppins, Sans-serif";
    ctx.fillText(`to ${groupName}`, width / 2, height - 85);

    ctx.font = "20px Poppins, Sans-serif";
    ctx.fillText("We’re glad you joined us 🎉", width / 2, height - 50);

    const cacheDir = path.join(__dirname, 'cache');
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
    const imagePath = path.join(cacheDir, `welcome_${Date.now()}.png`);
    fs.writeFileSync(imagePath, canvas.toBuffer("image/png"));

    await api.sendMessage({
        body: `🎉 Everyone welcome ${names.join(", ")} to ${groupName}!`,
        attachment: fs.createReadStream(imagePath)
    }, event.threadID);

    fs.unlinkSync(imagePath);
};
