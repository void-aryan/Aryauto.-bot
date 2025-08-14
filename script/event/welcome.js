const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
    name: "welcome",
    version: "3.1.0",
    role: 0,
    description: "Welcome new members with premium design",
    credits: "ARI",
    hasEvent: true
};

// Configuration
const API_BASE = "https://kaiz-apis.gleeze.com/api/welcomecard";

async function generateWelcomeCard({ background, name, text2, text3, avatar }) {
  try {
    const url = `${API_BASE}?background=${encodeURIComponent(background)}&text1=${encodeURIComponent(name)}&text2=${encodeURIComponent(text2)}&text3=${encodeURIComponent(text3)}&avatar=${encodeURIComponent(avatar)}`;
    
    const response = await axios.get(url, { responseType: "arraybuffer" });

    const fileName = `${name}_welcome.png`;
    const filePath = path.join(__dirname, fileName);
    fs.writeFileSync(filePath, response.data);

    console.log(`Welcome card saved: ${filePath}`);
    return filePath;
  } catch (err) {
    console.error("Error generating welcome card:", err.message);
    return null;
  }
}

async function onNewMemberJoin(member) {
  const background = "https://i.imgur.com/iKekhCb.jpeg"; 
  const name = member.name;
  const avatar = member.avatarURL || ""; 
  const text2 = "Welcome to the group!";
  const text3 = `Member ${member.count || "1"}`;

  const welcomeCardPath = await generateWelcomeCard({ background, name, text2, text3, avatar });

  return welcomeCardPath;
}

onNewMemberJoin({
  name: "Kaizenji",
  avatarURL: "https://avatars.githubusercontent.com/u/154584066",
  count: 99,
  channelID: "example-channel-id",
});
