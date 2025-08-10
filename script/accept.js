module.exports.config = {
  name: "accept",
  version: "1.0.0",
  role: 0,
  aliases: ["list", "accept", "reject"],
  credits: "ChatGPT",
  cooldown: 5,
};

module.exports.run = async function ({ api, event, args }) {
  try {
    const message = event.body.trim();
    const split = message.split(/\s+/);
    const command = split[0].toLowerCase();
    const params = split.slice(1);

    if (!["list", "accept", "reject"].includes(command)) {
      return api.sendMessage(
        "⚠️ Unknown command.\nUse: list, accept <UID>, or reject <UID>.",
        event.threadID
      );
    }

    if (command === "list") {
      if (typeof api.getPendingFriendRequests !== "function") {
        return api.sendMessage("⚠️ I don't have a method to fetch friend requests.", event.threadID);
      }

      const pendingRequests = await api.getPendingFriendRequests();

      if (!pendingRequests || pendingRequests.length === 0) {
        return api.sendMessage("You have no pending friend requests.", event.threadID);
      }

      let msg = "📋 Pending Friend Requests:\n\n";
      pendingRequests.forEach((req, i) => {
        msg += `${i + 1}. UID: ${req.uid}${req.name ? " - Name: " + req.name : ""}\n`;
      });

      return api.sendMessage(msg, event.threadID);
    }

    if (command === "accept" || command === "reject") {
      if (params.length !== 1) {
        return api.sendMessage(
          `⚠️ Please provide a valid UID.\nUsage:\naccept <UID>\nreject <UID>\nlist`,
          event.threadID
        );
      }

      const uid = params[0];

      if (command === "accept") {
        await api.acceptFriendRequest(uid);
        return api.sendMessage(`✅ Accepted friend request from UID: ${uid}`, event.threadID);
      } else {
        await api.rejectFriendRequest(uid);
        return api.sendMessage(`❌ Rejected friend request from UID: ${uid}`, event.threadID);
      }
    }
  } catch (err) {
    console.error("Error in friend command:", err);
    return api.sendMessage(
      "❗ An error occurred while processing your request. Please try again later.",
      event.threadID
    );
  }
};
