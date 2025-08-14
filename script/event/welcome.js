const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports.config = {
  name: "welcome-kaiz",
  version: "1.0.1",
  role: 0,
  credits: "ARI",
  description: "Welcome new members",
  eventType: ["log:subscribe"], 
  hasEvent: true
};

const CACHE_DIR = path.join(__dirname, "cache");
const DEFAULT_BG = "https://i.imgur.com/iKekhCb.jpeg"; 

module.exports.onLoad = () => {
  if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
};

function buildKaizUrl({ background, username, groupName, memberCount, avatarUrl }) {
  const base = "https://kaiz-apis.gleeze.com/api/welcomecard";
  const q = new URLSearchParams({
    background: background || DEFAULT_BG,
    text1: username || "New Member",
    text2: groupName || "Our Group",
    text3: String(memberCount || 0),
    avatar: avatarUrl || ""
  });
  return `${base}?${q.toString()}`;
}

function fbAvatarUrl(uid) {
  return `https://graph.facebook.com/${encodeURIComponent(uid)}/picture?height=512&width=512`;
}

async function downloadImage(url, filePath) {
  const res = await axios.get(url, { responseType: "stream" });
  await new Promise((resolve, reject) => {
    const w = fs.createWriteStream(filePath);
    res.data.pipe(w);
    w.on("finish", resolve);
    w.on("error", reject);
  });
  return filePath;
}

module.exports.handleEvent = async function ({ api, event }) {
  try {
    if (event.logMessageType !== "log:subscribe") return;

    const threadID = event.threadID;
    const added = event.logMessageData?.addedParticipants || [];
    if (!added.length) return;

    const tInfo = await api.getThreadInfo(threadID);
    const groupName = tInfo?.name || "This Chat";
    const memberCount = Array.isArray(tInfo?.participantIDs) 
      ? tInfo.participantIDs.length 
      : (tInfo?.participantCount || 0);

    const firstUserId = added[0]?.userFbId || added[0]?.userId || added[0]?.userID || added[0]?.id;

    let firstUsername = "New Member";
    try {
      const info = await api.getUserInfo(firstUserId);
      firstUsername = info?.[firstUserId]?.name || firstUsername;
    } catch (_) {}

    const avatarUrl = fbAvatarUrl(firstUserId);

    const kaizUrl = buildKaizUrl({
      background: DEFAULT_BG,
      username: firstUsername,
      groupName,
      memberCount,
      avatarUrl
    });

    const outPath = path.join(CACHE_DIR, `welcome_${threadID}.jpg`);
    await downloadImage(kaizUrl, outPath);

    let mentionArray = [];
    let welcomeNames = [];

    for (const p of added) {
      const uid = p.userFbId || p.userId || p.userID || p.id;
      if (!uid) continue;
      const info = await api.getUserInfo(uid);
      const name = info?.[uid]?.name || "New Member";
      welcomeNames.push(name);
      mentionArray.push({
        id: uid,
        tag: name
      });
    }

    const msg = 
      `👋 Welcome ${welcomeNames.join(", ")}!\n` +
      `You’re now part of "${groupName}" 🎉\n` +
      `Member count: ${memberCount}`;

    await api.sendMessage(
      {
        body: msg,
        attachment: fs.createReadStream(outPath),
        mentions: mentionArray
      },
      threadID
    );

  } catch (err) {
    console.error("welcome-kaiz error:", err.message || err);
  }
};

// For compatibility
module.exports.run = async function () {};
