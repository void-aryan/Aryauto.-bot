const { createCanvas, loadImage, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');

module.exports.config = {
  name: "owner",
  version: "1.0.0",
  role: 0,
  description: "Shows owner info with a cool font + frame overlay",
  cooldown: 5,
  aliases: ["ownerinfo", "botowner"],
  credit: "ARI + AJ"
};

module.exports.run = async ({ api, event, args }) => {
  try {
    // ========== CONFIG ==========
    const outPath = path.join(__dirname, 'temp_owner.png');

    registerFont(path.join(__dirname, 'fonts', 'BebasNeue-Regular.ttf'), { family: 'Bebas' });
    registerFont(path.join(__dirname, 'fonts', 'Poppins-Bold.ttf'), { family: 'Poppins' });
    registerFont(path.join(__dirname, 'fonts', 'Lobster-Regular.ttf'), { family: 'Lobster' });

    const owner = {
      name: "ARI",
      title: "Autobot Owner",
      bio: "Coder • Creator • Always online",
      contact: "Not shown", 
      avatarUrl: "https://files.catbox.moe/ajrxck.jpeg"
    };

    const width = 1200;
    const height = 675;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#0f172a'); 
    grad.addColorStop(1, '#0b8fb2'); 
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    ctx.globalAlpha = 0.06;
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 800; i++) {
      ctx.fillRect(Math.random() * width, Math.random() * height, 1, 1);
    }
    ctx.globalAlpha = 1;

    // ========== FRAME / BORDER ==========
    const pad = 24;
    const radius = 28;
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 30;
    roundRect(ctx, pad, pad, width - pad * 2, height - pad * 2, radius);
    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.fill();
    ctx.restore();

    ctx.lineWidth = 6;
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    roundRect(ctx, pad + 8, pad + 8, width - (pad + 8) * 2, height - (pad + 8) * 2, radius - 6);
    ctx.stroke();

    // ========== AVATAR ==========
    const avatarSize = 220;
    const avatarX = pad + 80;
    const avatarY = pad + 80;

    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fill();

    if (owner.avatarUrl) {
      try {
        const avatarImg = await loadImage(owner.avatarUrl);
        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatarImg, avatarX, avatarY, avatarSize, avatarSize);
        ctx.restore();
      } catch (err) {
        console.warn('Could not load avatar, fallback to initials.', err);
      }
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.beginPath();
      ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'white';
      ctx.font = '70px Poppins';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const initials = owner.name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase();
      ctx.fillText(initials, avatarX + avatarSize / 2, avatarY + avatarSize / 2);
    }

    ctx.fillStyle = '#00ffc6';
    roundRect(ctx, avatarX + avatarSize - 50, avatarY + avatarSize - 40, 100, 40, 12);
    ctx.fill();
    ctx.fillStyle = '#00322b';
    ctx.font = '16px Poppins';
    ctx.textAlign = 'center';
    ctx.fillText('OWNER', avatarX + avatarSize, avatarY + avatarSize - 18);

    // ========== NAME & TITLE ==========
    const textX = avatarX + avatarSize + 60;
    let yCursor = avatarY + 30;

    ctx.fillStyle = 'white';
    ctx.font = '64px Bebas';
    ctx.textAlign = 'left';
    ctx.fillText(owner.name, textX, yCursor + 60);

    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = '28px Poppins';
    ctx.fillText(owner.title, textX, yCursor + 110);

    ctx.strokeStyle = '#00ffc6';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(textX, yCursor + 125);
    ctx.lineTo(textX + 420, yCursor + 125);
    ctx.stroke();

    // ========== BIO ==========
    ctx.font = '20px Poppins';
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    wrapText(ctx, owner.bio, textX, yCursor + 160, 520, 28);

    // ========== CONTACT BOX (hidden/optional) ==========
    if (owner.contact && owner.contact !== 'Not shown' && owner.contact.trim() !== '-') {
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      roundRect(ctx, textX, yCursor + 230, 520, 70, 12);
      ctx.fill();

      ctx.fillStyle = 'white';
      ctx.font = '20px Poppins';
      ctx.fillText('Contact:', textX + 16, yCursor + 260);
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.fillText(owner.contact, textX + 120, yCursor + 260);
    }

    const overlayPath = path.join(__dirname, 'assets', 'frame_overlay.png');
    if (fs.existsSync(overlayPath)) {
      try {
        const overlayImg = await loadImage(overlayPath);
        ctx.drawImage(overlayImg, 0, 0, width, height);
      } catch (err) {
      }
    } else {
      ctx.globalCompositeOperation = 'multiply';
      const vign = ctx.createRadialGradient(width/2, height/2, width*0.1, width/2, height/2, width*0.9);
      vign.addColorStop(0, 'rgba(0,0,0,0)');
      vign.addColorStop(1, 'rgba(0,0,0,0.25)');
      ctx.fillStyle = vign;
      ctx.fillRect(0,0,width,height);
      ctx.globalCompositeOperation = 'source-over';
    }

    // ========== SAVE IMAGE ==========
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outPath, buffer);

    // ========== SEND IMAGE ==========
    const message = {
      body: `Owner — ${owner.name}\n\n${owner.title}`,
      attachment: fs.createReadStream(outPath)
    };
    if (api && typeof api.sendMessage === 'function') {
      await api.sendMessage(message, event.threadID || event.chatID);
    } else if (typeof api === 'function') {
      await api(message);
    } else {
      return outPath;
    }
    
    setTimeout(() => {
      try { fs.unlinkSync(outPath); } catch(e) {}
    }, 5_000);

    // helper functions
  } catch (err) {
    console.error(err);
    if (api && typeof api.sendMessage === 'function') {
      await api.sendMessage("Sorry, may error habang ginagawa ang owner image.", event.threadID || event.chatID);
    } else {
      throw err;
    }
  }
};

// small helper: rounded rectangle
function roundRect(ctx, x, y, w, h, r) {
  const minr = Math.min(r, w/2, h/2);
  ctx.beginPath();
  ctx.moveTo(x + minr, y);
  ctx.arcTo(x + w, y, x + w, y + h, minr);
  ctx.arcTo(x + w, y + h, x, y + h, minr);
  ctx.arcTo(x, y + h, x, y, minr);
  ctx.arcTo(x, y, x + w, y, minr);
  ctx.closePath();
}

// small helper: wrap text
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let curY = y;
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line, x, curY);
      line = words[n] + ' ';
      curY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line) ctx.fillText(line, x, curY);
}
