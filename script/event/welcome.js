const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { createCanvas, loadImage, registerFont } = require('canvas');

module.exports.config = {
    name: "welcome",
    version: "3.3.0",
    role: 0,
    description: "Welcome new members",
    credits: "ARI",
    hasEvent: true
};

try {
    registerFont(path.join(__dirname, "fonts", "Poppins-Bold.ttf"), { family: "Poppins" });
} catch { /* ignore if missing */ }

async function getAvatar(userID, api) {
    const defaultAvatar = "https://i.imgur.com/tfHIYHO.jpeg";
    try {
        const info = await api.getUserInfo(userID); 
        const url = info[userID]?.profilePic || `https://graph.facebook.com/${userID}/picture?type=large&width=512&height=512`;
        const res = await axios.get(url, { responseType: 'arraybuffer', maxRedirects: 5 });
        return Buffer.from(res.data);
    } catch {
        const fallback = await axios.get(defaultAvatar, { responseType: 'arraybuffer' });
        return Buffer.from(fallback.data);
    }
}

function neonColor() {
    const colors = ["#00ffea", "#ff00ff", "#ff0066", "#00ffff", "#8a00ff"];
    return colors[Math.floor(Math.random() * colors.length)];
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
    gradient.addColorStop(0, "#0d0d0d");
    gradient.addColorStop(1, "#1a1a1a");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Cyber neon particles
    for (let i = 0; i < 50; i++) {
        ctx.beginPath();
        ctx.fillStyle = neonColor() + Math.floor(Math.random() * 80).toString(16);
        ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 3, 0, Math.PI * 2);
        ctx.fill();
    }

    // Draw avatars with neon outline
    const avatarSize = 85;
    const avatarSpacing = 20;
    const totalWidth = addedParticipants.length * (avatarSize * 2 + avatarSpacing) - avatarSpacing;
    let startX = width / 2 - totalWidth / 2;

    // Fetch user info for all participants at once
    const userIDs = addedParticipants.map(p => p.userFbId || p.userId || p.id);
    const usersInfo = await api.getUserInfo(userIDs);

    const names = [];

    for (const participant of addedParticipants) {
        const userID = participant.userFbId || participant.userId || participant.id;
        if (!userID) continue;

        const name = usersInfo[userID]?.name || "New Member";
        names.push(name);

        const avatarBuffer = await getAvatar(userID, api);
        const avatarImg = await loadImage(avatarBuffer);

        ctx.save();
        ctx.beginPath();
        ctx.arc(startX + avatarSize, height / 2 - 40, avatarSize, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(avatarImg, startX, height / 2 - 125, avatarSize * 2, avatarSize * 2);
        ctx.restore();

        // Neon outline
        ctx.strokeStyle = neonColor();
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(startX + avatarSize, height / 2 - 40, avatarSize, 0, Math.PI * 2);
        ctx.stroke();

        startX += avatarSize * 2 + avatarSpacing;
    }

    // Neon-glow text
    ctx.fillStyle = "#00fff7";
    ctx.textAlign = "center";
    ctx.shadowColor = "#00fff7";
    ctx.shadowBlur = 15;

    ctx.font = "bold 52px Poppins, Sans-serif";
    ctx.fillText(`Welcome, ${names.join(", ")}!`, width / 2, height - 140);

    ctx.font = "32px Poppins, Sans-serif";
    ctx.fillText(`to ${groupName}`, width / 2, height - 90);

    ctx.font = "22px Poppins, Sans-serif";
    ctx.fillText("We’re glad you joined us", width / 2, height - 50);

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
