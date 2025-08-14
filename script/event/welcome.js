const fs = require('fs');
const axios = require('axios');
const { createCanvas, loadImage } = require('canvas');
const GIFEncoder = require('gifencoder');
const path = require('path');

module.exports.config = {
    name: "welcome",
    version: "2.0.0",
    role: 0,
    description: "Welcome new members with animated GIF",
    credits: "ARI",
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

module.exports.handleEvent = async function ({ api, event }) {
    if (event.logMessageType !== "log:subscribe") return;

    const addedParticipants = event.logMessageData.addedParticipants;
    const senderID = addedParticipants[0].userFbId;
    let name = await api.getUserInfo(senderID).then(info => info[senderID].name);

    const groupInfo = await api.getThreadInfo(event.threadID);
    const groupName = groupInfo.threadName || "this group";

    const avatarBuffer = await getAvatar(senderID);

    const width = 800, height = 400;
    const encoder = new GIFEncoder(width, height);
    const gifPath = path.join(__dirname, 'cache', 'welcome.gif');
    if (!fs.existsSync(path.join(__dirname, 'cache'))) fs.mkdirSync(path.join(__dirname, 'cache'));

    const stream = encoder.createReadStream().pipe(fs.createWriteStream(gifPath));
    encoder.start();
    encoder.setRepeat(0); 
    encoder.setDelay(50); 
    encoder.setQuality(10);

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const avatarImg = await loadImage(avatarBuffer);

    for (let frame = 0; frame < 30; frame++) {
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, `hsl(${(frame * 10) % 360}, 70%, 30%)`);
        gradient.addColorStop(1, `hsl(${(frame * 10 + 120) % 360}, 70%, 30%)`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        for (let i = 0; i < 20; i++) {
            ctx.fillStyle = `rgba(255,255,255,${Math.random()})`;
            ctx.beginPath();
            ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        const glowSize = 150 + Math.sin(frame / 3) * 10;
        ctx.save();
        ctx.shadowColor = `hsl(${(frame * 10) % 360}, 100%, 60%)`;
        ctx.shadowBlur = 30;
        ctx.beginPath();
        ctx.arc(width / 2, height / 2 - 30, glowSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.beginPath();
        ctx.arc(width / 2, height / 2 - 30, 70, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatarImg, width / 2 - 70, height / 2 - 100, 140, 140);
        ctx.restore();

        ctx.fillStyle = "white";
        ctx.font = "bold 40px Sans-serif";
        ctx.textAlign = "center";
        ctx.globalAlpha = Math.min(1, frame / 10);
        ctx.fillText(`Welcome, ${name}!`, width / 2, height - 100);

        ctx.font = "28px Sans-serif";
        ctx.globalAlpha = Math.min(1, (frame - 5) / 10);
        ctx.fillText(`to ${groupName}`, width / 2, height - 60);
        ctx.globalAlpha = 1;

        encoder.addFrame(ctx);
    }

    encoder.finish();

    stream.on('finish', () => {
        api.sendMessage({
            body: `🎉 Everyone welcome ${name} to ${groupName}!`,
            attachment: fs.createReadStream(gifPath)
        }, event.threadID, () => fs.unlinkSync(gifPath));
    });
};
