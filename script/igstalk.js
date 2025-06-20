const axios = require("axios");
const { sendMessage } = require("../handles/sendMessage");

module.exports = {
  name: "igstalk",
  description: "Stalk Instagram user profile",
  author: "Vern",
  usage: "igstalk <username>",
  cooldown: 3,

  async execute(senderId, args, pageAccessToken) {
    const username = args[0];

    if (!username) {
      return sendMessage(senderId, {
        text: "📸 Please provide an Instagram username.\n\nUsage: igstalk vernesg"
      }, pageAccessToken);
    }

    try {
      const apiUrl = `https://api.ferdev.my.id/stalker/instagram?username=${encodeURIComponent(username)}`;
      const { data } = await axios.get(apiUrl);

      if (!data || !data.status || !data.result) {
        return sendMessage(senderId, {
          text: `❌ Could not retrieve profile for "${username}". Please check the username and try again.`
        }, pageAccessToken);
      }

      const user = data.result;

      const info = `📸 𝗜𝗡𝗦𝗧𝗔𝗚𝗥𝗔𝗠 𝗣𝗥𝗢𝗙𝗜𝗟𝗘\n━━━━━━━━━━━━━━━
👤 𝗡𝗮𝗺𝗲: ${user.fullname}
🔖 𝗨𝘀𝗲𝗿𝗻𝗮𝗺𝗲: @${user.username}
📷 𝗣𝗼𝘀𝘁𝘀: ${user.posts}
👥 𝗙𝗼𝗹𝗹𝗼𝘄𝗲𝗿𝘀: ${user.followers}
👤 𝗙𝗼𝗹𝗹𝗼𝘄𝗶𝗻𝗴: ${user.following}
🔐 𝗣𝗿𝗶𝘃𝗮𝘁𝗲: ${user.private ? "Yes 🔒" : "No 🔓"}
📄 𝗕𝗶𝗼: ${user.bio || "None"}
🔗 𝗣𝗿𝗼𝗳𝗶𝗹𝗲: ${user.profile_link}
━━━━━━━━━━━━━━━`;

      // Send profile info
      await sendMessage(senderId, { text: info }, pageAccessToken);

      // Send profile picture
      if (user.profile_pic) {
        await sendMessage(senderId, {
          attachment: {
            type: "image",
            payload: {
              url: user.profile_pic
            }
          }
        }, pageAccessToken);
      }

    } catch (error) {
      console.error("❌ Error fetching IG profile:", error.message);
      return sendMessage(senderId, {
        text: `❌ Failed to fetch Instagram profile.\nReason: ${error.message || "Unknown error"}`
      }, pageAccessToken);
    }
  }
};
