
module.exports.config = {
  name: "owner",
  version: "1.0.0",
  hasPermission: 0,
  credits: "ARI",
  description: "Show owner/developer info and contact links",
  cooldowns: 5
};

const OWNER = {
  name: "ARI",
  contact: "+63 936 566 3754",                           
  bio: "Developer of AutoBot — building neat chat tools and automation.",
  socials: {
    github: "https://github.com/mojin3348",
    facebook: "https://www.facebook.com/61577110900436"
  },
  avatar: "https://ibb.co/JWg5pHST.jpeg"
};

function formatSocials(s) {
  const lines = [];
  if (s.github) lines.push(`• GitHub: ${s.github}`);
  if (s.facebook) lines.push(`• Facebook: ${s.facebook}`);
  return lines.join("\n");
}

module.exports.run = async function({ api, event, args, message, Users, Threads }) {
  const uptimeSec = process.uptime();
  const uptime = new Date(uptimeSec * 1000).toISOString().substr(11, 8); 

  let textLines = [
    `👤 Owner Info`,
    `Name: ${OWNER.name}`,
    OWNER.contact ? `Contact: ${OWNER.contact}` : null,
    `Bio: ${OWNER.bio}`,
    "",
    `🔗 Socials:`,
    formatSocials(OWNER.socials),
    "",
    `🔧 Bot info`,
    `Uptime: ${uptime}`,
    `Version: ${module.exports.config.version}`
  ].filter(Boolean);

  const messageText = textLines.join("\n");

  try {
    if (OWNER.avatar && api && api.sendMessage) {
      await api.sendMessage({
        body: messageText,
        attachment: (await global.utils?.getStream?.(OWNER.avatar)) || OWNER.avatar
      }, event.threadID, event.messageID);
    } else if (message && typeof message.reply === "function") {
      return message.reply(messageText);
    } else if (api && api.sendMessage) {
      return api.sendMessage(messageText, event.threadID);
    } else {
      return;
    }
  } catch (err) {
    if (message && typeof message.reply === "function") return message.reply(messageText);
    if (api && api.sendMessage) return api.sendMessage(messageText, event.threadID);
    console.error("owner command error:", err);
  }
};
