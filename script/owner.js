const { createCanvas, loadImage, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');

module.exports.config = {
  name: "owner",
  version: "3.0.0",
  role: 0,
  description: "Owner info (Futuristic Design)",
  cooldown: 5,
  aliases: ["ownerinfo", "botowner"]
};

module.exports.run = async ({ api, event }) => {
  try {
    const outPath = path.join(__dirname, 'temp_owner.png');

    // Load fonts if available
    const fontsPath = path.join(__dirname, 'fonts');
    const safeFontLoad = (file, family) => {
      try {
        const fontPath = path.join(fontsPath, file);
        if (fs.existsSync(fontPath)) {
          registerFont(fontPath, { family });
        }
      } catch {}
    };
    safeFontLoad('BebasNeue-Regular.ttf', 'Bebas');
    safeFontLoad('Poppins-Bold.ttf', 'Poppins');

    const owner = {
      name: "ARI",
      title: "Autobot Owner",
      bio: "💻 Coder • 🎨 Creator • ⚡ Always Online",
      avatarUrl: "https://i.imgur.com/HvNZezn.png"
    };

    const width = 1200, height = 675;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Background - Cyberpunk gradient
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#0a0f1c');
    grad.addColorStop(0.5, '#1a0933');
    grad.addColorStop(1, '#051937');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Light streaks
    ctx.globalAlpha = 0.15;
    for (let i = 0; i < 5; i++) {
      const streakGrad = ctx.createLinearGradient(0, 0, width, 0);
      streakGrad.addColorStop(0, 'transparent');
      streakGrad.addColorStop(0.5, i % 2 ? '#ff00ff' : '#00fff2');
      streakGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = streakGrad;
      ctx.fillRect(0, Math.random() * height, width, 3);
    }
    ctx.globalAlpha = 1;

    // Neon HUD corners
    ctx.strokeStyle = '#00fff2';
    ctx.shadowColor = '#00fff2';
    ctx.shadowBlur = 15;
    ctx.lineWidth = 4;

    // Top-left
    ctx.beginPath();
    ctx.moveTo(40, 40); ctx.lineTo(140, 40);
    ctx.moveTo(40, 40); ctx.lineTo(40, 140);
    ctx.stroke();

    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(width - 40, height - 40); ctx.lineTo(width - 140, height - 40);
    ctx.moveTo(width - 40, height - 40); ctx.lineTo(width - 40, height - 140);
    ctx.stroke();

    ctx.shadowBlur = 0;

    // Avatar
    const avatarSize = 240;
    const avatarX = 80, avatarY = 100;
    try {
      const avatarImg = await loadImage(owner.avatarUrl);
      ctx.save();
      ctx.beginPath();
      ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(avatarImg, avatarX, avatarY, avatarSize, avatarSize);
      ctx.restore();
    } catch {
      ctx.fillStyle = '#00fff2';
      ctx.beginPath();
      ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Multi-layer neon ring
    const rings = ['#00fff2', '#ff00ff', '#00fff2'];
    rings.forEach((color, i) => {
      ctx.beginPath();
      ctx.lineWidth = 4;
      ctx.strokeStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 15;
      ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 6 + (i * 6), 0, Math.PI * 2);
      ctx.stroke();
    });
    ctx.shadowBlur = 0;

    // Owner name
    const textX = avatarX + avatarSize + 60;
    ctx.fillStyle = '#ffffff';
    ctx.font = '80px Bebas, sans-serif';
    ctx.textAlign = 'left';
    ctx.shadowColor = '#00fff2';
    ctx.shadowBlur = 10;
    ctx.fillText(owner.name, textX, avatarY + 80);

    // Title
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ff00ff';
    ctx.font = '30px Poppins, sans-serif';
    ctx.fillText(owner.title, textX, avatarY + 120);

    // Bio
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = '24px Poppins, sans-serif';
    wrapText(ctx, owner.bio, textX, avatarY + 170, 500, 32);

    // Save
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outPath, buffer);
    await api.sendMessage({
      body: `👑 ${owner.name}\n${owner.title}`,
      attachment: fs.createReadStream(outPath)
    }, event.threadID);

    setTimeout(() => { try { fs.unlinkSync(outPath); } catch {} }, 5000);

  } catch (err) {
    console.error(err);
    await api.sendMessage("❌ Error generating owner card.", event.threadID);
  }
};

// Wrap text helper
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    if (ctx.measureText(testLine).width > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}