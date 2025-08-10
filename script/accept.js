module.exports.config = {
  name: "accept",
  version: "1.2.0",
  role: 0,
  aliases: ["friend", "fr", "accept", "reject", "listfriends"],
  credits: "Ari",
  cooldown: 5,
  hasPretix: false,
};

module.exports.run = async function ({ api, event, args }) {
  try {
    const command = event.body.toLowerCase().split(" ")[0]; 
    
    if (command === "!list") {
      const pendingRequests = await api.getPendingFriendRequests();

      if (!pendingRequests || pendingRequests.length === 0) {
        return api.sendMessage("You have no pending friend requests.", event.threadID);
      }

      let msg = "📋 Pending Friend Requests:\n\n";
      pendingRequests.forEach((req, index) => {
        msg += `${index + 1}. UID: ${req.uid}${req.name ? ` - Name: ${req.name}` : ""}\n`;
      });

      return api.sendMessage(msg, event.threadID);
    }

    if (args.length !== 1) {
      return api.sendMessage(
        "⚠️ Please provide exactly one UID.\n\nUsage:\n!accept <UID>\n!reject <UID>\n!list",
        event.threadID
      );
    }

    const uid = args[0];

    if (command === "!reject") {
      await api.rejectFriendRequest(uid);
      return api.sendMessage(`❌ Rejected friend request from UID: ${uid}`, event.threadID);
    }

    if (command === "!accept") {
      await api.acceptFriendRequest(uid);
      return api.sendMessage(`✅ Accepted friend request from UID: ${uid}`, event.threadID);
    }

    return api.sendMessage(
      "⚠️ Unknown command. Use !list, !accept <UID>, or !reject <UID>.",
      event.threadID
    );

  } catch (error) {
    console.error("Error in friend command:", error);
    api.sendMessage(
      "❗ An error occurred while processing your request. Please try again later.",
      event.threadID
    );
  }
};
