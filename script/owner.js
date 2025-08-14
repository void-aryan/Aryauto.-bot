const { createCanvas, loadImage, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');

module.exports.config = {
  name: "owner",
  version: "2.1.0",
  role: 0,
  description: "owner info",
  cooldown: 5,
  aliases: ["ownerinfo", "botowner"]
};

module.exports.run = async ({ api, event }) => {
  try {
    const outPath = path.join(__dirname, 'temp_owner.png');

    // Try to load fonts, but fallback if missing
    const fontsPath = path.join(__dirname, 'fonts');
    const safeFontLoad = (file, family) => {
      try {
        const fontPath = path.join(fontsPath, file);
        if (fs.existsSync(fontPath)) {
          registerFont(fontPath, { family });
        }
      } catch (e) {}
    };
    safeFontLoad('BebasNeue-Regular.ttf', 'Bebas');
    safeFontLoad('Poppins-Bold.ttf', 'Poppins');
    safeFontLoad('Lobster-Regular.ttf', 'Lobster');

    const owner = {
      name: "ARI",
      title: "Autobot Owner",
      bio: "💻 Coder • 🎨 Creator • ⚡ Always Online",
      avatarUrl: "https://i.imgur.com/HvNZezn.png"
    };

    const width = 1200;
    const height = 675;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#0f2027');
    grad.addColorStop(0.5, '#203a43');
    grad.addColorStop(1, '#2c5364');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Star effect
    ctx.globalAlpha = 0.05;
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 600; i++) {
      ctx.fillRect(Math.random() * width, Math.random() * height, 1, 1);
    }
    ctx.globalAlpha = 1;

    // Frame
    ctx.save();
    ctx.shadowColor = 'rgba(0, 255, 200, 0.3)';
    ctx.shadowBlur = 25;
    roundRect(ctx, 30, 30, width - 60, height - 60, 25);
    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.fill();
    ctx.restore();

    // Avatar
    const avatarSize = 230;
    const avatarX = 80;
    const avatarY = 80;

    try {
      const avatarImg = await loadImage(owner.avatarUrl);
      ctx.save();
      ctx.beginPath();
      ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatarImg, avatarX, avatarY, avatarSize, avatarSize);
      ctx.restore();
    } catch (e) {
      // Fallback avatar circle
      ctx.fillStyle = '#00ffc6';
      ctx.beginPath();
      ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#00322b';
      ctx.font = 'bold 60px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(owner.name.charAt(0), avatarX + avatarSize / 2, avatarY + avatarSize / 2);
    }

    // Avatar neon border
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#00ffc6';
    ctx.shadowColor = '#00ffc6';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Name & Title
    const textX = avatarX + avatarSize + 60;
    ctx.fillStyle = '#ffffff';
    ctx.font = '70px Bebas, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(owner.name, textX, avatarY + 80);

    ctx.fillStyle = '#00ffc6';
    ctx.font = '28px Poppins, sans-serif';
    ctx.fillText(owner.title, textX, avatarY + 120);

    // Bio
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = '22px Poppins, sans-serif';
    wrapText(ctx, owner.bio, textX, avatarY + 170, 500, 30);

    // Glow bar
    const glowGrad = ctx.createLinearGradient(0, height - 10, width, height);
    glowGrad.addColorStop(0, 'transparent');
    glowGrad.addColorStop(0.5, 'rgba(0,255,198,0.5)');
    glowGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, height - 20, width, 20);

    // Save image
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outPath, buffer);

    await api.sendMessage({
      body: `👑 ${owner.name}\n${owner.title}`,
      attachment: fs.createReadStream(outPath)
    }, event.threadID);

    setTimeout(() => { try { fs.unlinkSync(outPath); } catch (e) {} }, 5000);

  } catch (err) {
    console.error(err);
    await api.sendMessage("❌ Error generating owner card (check console log).", event.threadID);
  }
};

// Rounded rectangle
function roundRect(ctx, x, y, w, h, r) {
  const minr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + minr, y);
  ctx.arcTo(x + w, y, x + w, y + h, minr);
  ctx.arcTo(x + w, y + h, x, y + h, minr);
  ctx.arcTo(x, y + h, x, y, minr);
  ctx.arcTo(x, y, x + w, y, minr);
  ctx.closePath();
}

// Text wrap helper
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
