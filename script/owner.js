const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
	name: 'owner',
	version: '1.0.0',
	hasPermision: 0,
	credits: 'Vern',
	usePrefix: false,
	description: 'Display bot owner information',
	commandCategory: 'system',
	usages: '',
	cooldowns: 0
};

module.exports.run = async ({ api, event }) => {
	try {
		const ownerInfo = {
			name: `ARI`,
			gender: 'MALE',
			age: 'HULAAN MO NALANG',
			height: '69',
			facebookLink: `https://www.facebook.com/61577110900436`,
			status: 'GUTOM'
		};

		const videoUrl =  [
      "https://files.catbox.moe/eksnob.mp4",
      "https://files.catbox.moe/l27lu3.mp4",
      "https://files.catbox.moe/4sh4f2.mp4",
      "https://files.catbox.moe/af5o24.mp4",
      "https://files.catbox.moe/i1sfb7.mp4",
      "https://files.catbox.moe/tiygtc.mp4",
      "https://files.catbox.moe/pxn6ri.mp4",
      "https://files.catbox.moe/93flm8.mp4",
      "https://files.catbox.moe/ogjrsp.mp4",
      "https://files.catbox.moe/c7iby8.mp4",
      "https://files.catbox.moe/9x5sy4.mp4"
			];

		const chosenVideoUrl = videoUrl[Math.floor(Math.random() * videoUrl.length)];
		const tmpFolderPath = path.join(__dirname, 'tmp');

		if (!fs.existsSync(tmpFolderPath)) {
			fs.mkdirSync(tmpFolderPath);
		}

		const filePath = path.join(tmpFolderPath, (Math.random() + 1).toString(36).substring(4) + '_owner_video.mp4'); // adding random string to file name to prevent collision

		const videoResponse = await axios.get(chosenVideoUrl, { responseType: 'arraybuffer' });
		fs.writeFileSync(filePath, Buffer.from(videoResponse.data, 'binary'));

		const response = `
✧ 𝗢𝗪𝗡𝗘𝗥 𝗜𝗡𝗙𝗢𝗥𝗠𝗔𝗧𝗜𝗢𝗡 ✧\n
Name: ${ownerInfo.name}
Gender: ${ownerInfo.gender}
Age: ${ownerInfo.age}
Height: ${ownerInfo.height}
Facebook: ${ownerInfo.facebookLink}
Status: ${ownerInfo.status}
`;

		await api.sendMessage({
			body: response,
			attachment: fs.createReadStream(filePath)
		}, event.threadID, event.messageID);

		fs.unlinkSync(filePath); // delete the video after sending the message

		if (event.body && event.body.toLowerCase().includes('owner')) {
			api.setMessageReaction('😽', event.messageID, (err) => {}, true);
		}

	} catch (error) {
		console.error('Error in owner command:', error);
		return api.sendMessage('An error occurred while processing the command.', event.threadID);
	}
};
