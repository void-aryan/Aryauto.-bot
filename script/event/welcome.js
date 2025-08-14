const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { createCanvas, loadImage, registerFont } = require('canvas');

module.exports.config = {
    name: "welcome",
    version: "1.0.0",
    hasEvent: true,
    eventType: ["log:subscribe"],
    credits: "ARI",
    description: "Welcome image using local Canvas"
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

    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
    gradient.addColorStop(0, "#1a2a6c");
    gradient.addColorStop(0.5, "#b21f1f");
    gradient.addColorStop(1, "#fdbb2d");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Avatar circle
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

    ctx.font = 'bold 80px Arial';
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText("WELCOME", WIDTH / 2, HEIGHT / 2 + 180);

    ctx.font = 'bold 60px Arial';
    ctx.fillStyle = "#FFD700";
    ctx.fillText(name, WIDTH / 2, HEIGHT / 2 + 240);

    ctx.font = '30px Arial';
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`to ${groupName} • Member #${memberCount}`, WIDTH / 2, HEIGHT / 2 + 280);

    return canvas.toBuffer();
}

module.exports.handleEvent = async function ({ api, event }) {
    if (event.logMessageType !== "log:subscribe") return;

    try {
        const addedParticipants = event.logMessageData.addedParticipants;
        const senderID = addedParticipants[0].userFbId;

        // Get user info
        let name = await api.getUserInfo(senderID).then(info => info[senderID].name);
        if (name.length > 15) {
            name = name.substring(0, 12) + '...';
        }

        // Get group info
        const groupInfo = await api.getThreadInfo(event.threadID);
        const groupName = groupInfo.threadName || "this group";
        const memberCount = groupInfo.participantIDs.length;

        // Get avatar
        const avatarBuffer = await getAvatar(senderID);

        // Create welcome card
        const cardBuffer = await createWelcomeCard({ name, avatarBuffer, groupName, memberCount });

        // Save file temporarily
        const fileName = path.join(__dirname, 'cache', `welcome_${senderID}.png`);
        if (!fs.existsSync(path.dirname(fileName))) {
            fs.mkdirSync(path.dirname(fileName), { recursive: true });
        }
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
