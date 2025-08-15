const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage, registerFont } = require('canvas');

module.exports.config = {
    name: "welcome",
    version: "3.8.0",
    role: 0,
    description: "Welcome new members with cyber design and male/female avatars",
    credits: "ARI",
    hasEvent: true
};

// Register custom font
try {
    registerFont(path.join(__dirname, "fonts", "Poppins-Bold.ttf"), { family: "Poppins" });
} catch {}

// Cyber grid effect
function drawCyberGrid(ctx, width, height) {
    ctx.strokeStyle = 'rgba(0,255,255,0.2)';
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
    }
    for (let j = 0; j < height; j += 50) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(width, j);
        ctx.stroke();
    }
}

const genderAvatars = {
    male: [
        "https://i.imgur.com/vA3Vkm7.png",
        "https://i.imgur.com/37acK9E.png",
        "https://i.imgur.com/UMSp2Do.png"
        ],
    female: [
        "https://i.imgur.com/YmM7jZZ.png",
        "https://i.imgur.com/Tlwqbu6.png",
        "https://i.imgur.com/PN3g18j.png"
        ]
};

async function getUserGender(api, userID) {
    try {
        const info = await api.getUserInfo(userID);
        const user = info[userID];
        if (!user || !user.gender) return Math.random() > 0.5 ? 'male' : 'female';
        const gender = user.gender;
        if (gender === 'male') return 'male';
        if (gender === 'female') return 'female';
        return Math.random() > 0.5 ? 'male' : 'female';
    } catch {
        return Math.random() > 0.5 ? 'male' : 'female';
    }
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
    gradient.addColorStop(0, '#0ff');
    gradient.addColorStop(1, '#08f');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < 50; i++) {
        ctx.beginPath();
        ctx.fillStyle = `rgba(0,255,255,${Math.random() * 0.4})`;
        ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 5, 0, Math.PI * 2);
        ctx.fill();
    }

    drawCyberGrid(ctx, width, height);

    const avatarSize = 85;
    const avatarSpacing = 20;
    const totalWidth = addedParticipants.length * (avatarSize * 2 + avatarSpacing) - avatarSpacing;
    let startX = width / 2 - totalWidth / 2;

    const names = [];
    for (const participant of addedParticipants) {
        const userID = participant.userFbId || participant.userId || participant.id;
        if (!userID) continue;

        const gender = await getUserGender(api, userID);
        const avatarURL = genderAvatars[gender];

        const avatarImg = await loadImage(avatarURL);

        ctx.save();
        ctx.beginPath();
        ctx.arc(startX + avatarSize, height / 2 - 40, avatarSize, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(avatarImg, startX, height / 2 - 125, avatarSize * 2, avatarSize * 2);
        ctx.restore();

        ctx.strokeStyle = 'cyan';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(startX + avatarSize, height / 2 - 40, avatarSize + 4, 0, Math.PI * 2);
        ctx.stroke();

        startX += avatarSize * 2 + avatarSpacing;

        const info = await api.getUserInfo(userID);
        names.push(info[userID]?.name || "New Member");
    }

    ctx.fillStyle = '#0ff';
    ctx.textAlign = "center";
    ctx.font = "bold 50px Poppins, Sans-serif";
    ctx.fillText(`WELCOME, ${names.join(", ")}!`, width / 2, height - 130);

    ctx.font = "28px Poppins, Sans-serif";
    ctx.fillText(`to ${groupName}`, width / 2, height - 85);

    ctx.font = "20px Poppins, Sans-serif";
    ctx.fillText("We're glad you joined this group chat please interact us", width / 2, height - 50);

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
        
