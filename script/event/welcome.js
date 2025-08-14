const axios = require('axios');
const fs = require('fs');

module.exports.config = {
    name: "welcome",
    version: "2.0.0",
};

module.exports.handleEvent = async function ({ api, event }) {
    if (event.logMessageType === "log:subscribe") {
        try {
            const addedParticipants = event.logMessageData.addedParticipants;
            const senderID = addedParticipants[0].userFbId;

            let name = await api.getUserInfo(senderID).then(info => info[senderID].name);

            const maxLength = 15;
            if (name.length > maxLength) name = name.substring(0, maxLength - 3) + '...';

            const groupInfo = await api.getThreadInfo(event.threadID);
            const groupName = groupInfo.threadName || "this group";
            const memberCount = groupInfo.participantIDs.length;
            const groupIcon = groupInfo.imageSrc || "https://i.ibb.co/G5mJZxs/rin.jpg";

            const apiURL = `https://kaiz-apis.gleeze.com/api/welcomecard?background=${encodeURIComponent(groupIcon)}&text1=${encodeURIComponent(name)}&text2=${encodeURIComponent("Welcome to " + groupName)}&text3=${memberCount}&avatar=https://api-canvass.vercel.app/profile?uid=${senderID}`;

            const { data } = await axios.get(apiURL, { responseType: 'arraybuffer' });
            const filePath = './script/cache/welcome_image.jpg';
            fs.writeFileSync(filePath, Buffer.from(data));

            api.sendMessage({
                body: `Everyone welcome the new member ${name} to ${groupName}!`,
                attachment: fs.createReadStream(filePath)
            }, event.threadID, () => fs.unlinkSync(filePath));

        } catch (error) {
            console.error("Error sending welcome image:", error);
            api.sendMessage({
                body: `🤖 Everyone welcome the new member!`
            }, event.threadID);
        }
    }
};
        
