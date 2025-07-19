const axios = require('axios');

module.exports.config = {
  name: "pair",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  credits: "Vern",
  description: "Pairs two users and shows their match rate.",
  usages: "{p}pair",
  cooldown: 15,
};

let fontEnabled = true;

function formatFont(text) {
  const fontMapping = {
    a: "𝖺", b: "𝖻", c: "𝖼", d: "𝖽", e: "𝖾", f: "𝖿", g: "𝗀", h: "𝗁", i: "𝗂", j: "𝗃", k: "𝗄", l: "𝗅", m: "𝗆",
    n: "𝗇", o: "𝗈", p: "𝗉", q: "𝗊", r: "𝗋", s: "𝗌", t: "𝗍", u: "𝗎", v: "𝗏", w: "𝗐", x: "𝗑", y: "𝗒", z: "𝗓",
    A: "𝖠", B: "𝖡", C: "𝖢", D: "𝖣", E: "𝖤", F: "𝖥", G: "𝖦", H: "𝖧", I: "𝖨", J: "𝖩", K: "𝖪", L: "𝖫", M: "𝖬",
    N: "𝖭", O: "𝖮", P: "𝖯", Q: "𝖰", R: "𝖱", S: "𝖲", T: "𝖳", U: "𝖴", V: "𝖵", W: "𝖶", X: "𝖷", Y: "𝗒", Z: "𝖹"
  };

  let formattedText = "";
  for (const char of text) {
    if (fontEnabled && char in fontMapping) {
      formattedText += fontMapping[char];
    } else {
      formattedText += char;
    }
  }

  return formattedText;
}

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  var tl = ['21%', '67%', '19%', '37%', '17%', '96%', '52%', '62%', '76%', '83%', '100%', '99%', "0%", "48%"];
  var tle = tl[Math.floor(Math.random() * tl.length)];

  let dataa = await api.getUserInfo(event.senderID);
  let namee = await dataa[event.senderID].name;

  let loz = await api.getThreadInfo(event.threadID);
  var emoji = loz.participantIDs;
  var id = emoji[Math.floor(Math.random() * emoji.length)];

  let data = await api.getUserInfo(id);
  let name = await data[id].name;

  var arraytag = [];
  arraytag.push({ id: event.senderID, tag: namee });
  arraytag.push({ id: id, tag: name });

  var sex = await data[id].gender;
  var gender = sex == 2 ? "Male🧑" : sex == 1 ? "Female👩‍" : "Gay";

  let messageBody = formatFont(`Congrats ${namee} has been paired with ${name}\nThe Match rate is: ${tle}`);

  let url = `https://api.popcat.xyz/ship?user1=https://api-canvass.vercel.app/profile?uid=${event.senderID}&user2=https://api-canvass.vercel.app/profile?uid=${id}`;
  let response = await axios.get(url, { responseType: 'stream' });

  api.sendMessage({
    body: messageBody,
    mentions: arraytag,
    attachment: response.data
  }, threadID, messageID);
};