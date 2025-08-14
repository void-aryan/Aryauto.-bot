const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { createCanvas, loadImage, registerFont } = require('canvas');

module.exports.config = {
    name: "welcome",
    version: "1.2.0",
    hasEvent: true,
    eventType: ["log:subscribe"],
    credits: "ARI",
    description: "Welcome image with built-in professional background"
};

async function getAvatar(userID) {
    try {
        const res = await axios.get(
            `https://graph.facebook.com/${userID}/picture?type=large&width=512&height=512`,
            { responseType: 'arraybuffer' }
        );
        return Buffer.from(res.data);
    } catch {
        return null;
    }
}

async function createWelcomeCard({ name, avatarBuffer, groupName, memberCount }) {
    const WIDTH = 1200;
    const HEIGHT = 500;
    const canvas = createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
    gradient.addColorStop(0, "#0f2027");
    gradient.addColorStop(0.5, "#203a43");
    gradient.addColorStop(1, "#2c5364");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.globalAlpha = 0.15;
    for (let i = 0; i < WIDTH; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(0, i);
        ctx.strokeStyle = "#ffffff";
        ctx.stroke();
    }
    ctx.globalAlpha = 1;

    ctx.lineWidth = 10;
    ctx.strokeStyle = "#FFD700";
    ctx.strokeRect(0, 0, WIDTH, HEIGHT);

    ctx.beginPath();
    ctx.arc(WIDTH / 2, HEIGHT / 2 - 50, 160, 0, Math.PI * 2);
    ctx.shadowColor = "#FFD700";
    ctx.shadowBlur = 40;
    ctx.fillStyle = "rgba(255, 215, 0, 0.2)";
    ctx.fill();
    ctx.shadowBlur = 0;

    if (avatarBuffer) {
        const avatar = await loadImage(avatarBuffer);
        const size = 300;
        ctx.save();
        ctx.beginPath();
        ctx.arc(WIDTH / 2, HEIGHT / 2 - 50, size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, WIDTH / 2 - size / 2, HEIGHT / 2 - size / 2 - 50, size, size);
        ctx.restore();
    }

    function drawShadowText(text, x, y, font, color, shadowColor) {
        ctx.font = font;
        ctx.fillStyle = shadowColor;
        ctx.fillText(text, x + 3, y + 3);
        ctx.fillStyle = color;
        ctx.fillText(text, x, y);
    }

    ctx.textAlign = "center";

    drawShadowText("WELCOME", WIDTH / 2, HEIGHT / 2 + 180, 'bold 80px Arial', "#ffffff", "#000000");

    drawShadowText(name, WIDTH / 2, HEIGHT / 2 + 240, 'bold 60px Arial', "#FFD700", "#000000");

    drawShadowText(`to ${groupName} • Member #${memberCount}`, WIDTH / 2, HEIGHT / 2 + 280, '30px Arial', "#ffffff", "#000000");

    return canvas.toBuffer();
}

module.exports.handleEvent = async function ({ api, event }) {
    if (event.logMessageType !== "log:subscribe") return;

    try {
        const addedParticipants = event.logMessageData.addedParticipants;
        const senderID = addedParticipants[0].userFbId;

        let name = await api.getUserInfo(senderID).then(info => info[senderID].name);
        if (name.length > 15) {
            name = name.substring(0, 12) + '...';
        }

        const groupInfo = await api.getThreadInfo(event.threadID);
        const groupName = groupInfo.threadName || "this group";
        const memberCount = groupInfo.participantIDs.length;

        const avatarBuffer = await getAvatar(senderID);

        const cardBuffer = await createWelcomeCard({ name, avatarBuffer, groupName, memberCount });

        const cacheDir = path.join(__dirname, 'cache');
        if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir, { recursive: true });
        }
        const fileName = path.join(cacheDir, `welcome_${senderID}.png`);
        fs.writeFileSync(fileName, cardBuffer);

        api.sendMessage({
            body: `🎉 Everyone welcome ${name} to ${groupName}!`,
            attachment: fs.createReadStream(fileName)
        }, event.threadID, () => {
            fs.unlinkSync(fileName);
        });

    } catch (err) {
        console.error("Error in welcome event:", err);
    }
};
