const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
	name: 'redroom',
	version: '1.0.0',
	hasPermision: 0,
	credits: 'Modified by AJ/ARI',
	usePrefix: false,
	description: 'Sends a redroom video',
	commandCategory: 'system',
	usages: '',
	cooldowns: 0
};

module.exports.run = async ({ api, event }) => {
	try {
		const videoUrls = [
		"https://files.catbox.moe/c039x7.mp4",
    "https://files.catbox.moe/cyzs91.mp4",
    "https://files.catbox.moe/gpjmmw.mp4",
    "https://files.catbox.moe/gpjmmw.mp4",
    "https://files.catbox.moe/svisxu.mp4",
    "https://files.catbox.moe/qm3mdq.mp4",
    "https://files.catbox.moe/nfpc2v.mp4",
    "https://files.catbox.moe/hp0av4.mp4",
    "https://files.catbox.moe/itw6ix.mp4",
    "https://files.catbox.moe/9ouwzd.mp4",
    "https://files.catbox.moe/0vw7wh.mp4",
    "https://files.catbox.moe/d2h7nz.mp4",
    "https://files.catbox.moe/44jsle.mp4",
    "https://files.catbox.moe/qqse4t.mp4",
    "https://files.catbox.moe/g9qcr1.mp4",
    "https://files.catbox.moe/kqge9z.mp4",
    "https://files.catbox.moe/0ic5f9.mp4"
    ];

		const chosenVideoUrl = videoUrls[Math.floor(Math.random() * videoUrls.length)];
		const tmpFolderPath = path.join(__dirname, 'tmp');

		if (!fs.existsSync(tmpFolderPath)) {
			fs.mkdirSync(tmpFolderPath);
		}

		const filePath = path.join(tmpFolderPath, (Math.random() + 1).toString(36).substring(4) + '_redroom.mp4');

		const videoResponse = await axios.get(chosenVideoUrl, { responseType: 'arraybuffer' });
		fs.writeFileSync(filePath, Buffer.from(videoResponse.data, 'binary'));

		await api.sendMessage({
			body: `🚨 𝗥𝗘𝗗𝗥𝗢𝗢𝗠 𝗜𝗡𝗜𝗧𝗜𝗔𝗧𝗘𝗗`,
			attachment: fs.createReadStream(filePath)
		}, event.threadID, event.messageID);

		fs.unlinkSync(filePath);

		if (event.body && event.body.toLowerCase().includes('redroom')) {
			api.setMessageReaction('🔴', event.messageID, (err) => {}, true);
		}

	} catch (error) {
		console.error('Error in redroom command:', error);
		return api.sendMessage('❌ An error occurred while processing the redroom command.', event.threadID);
	}
};
