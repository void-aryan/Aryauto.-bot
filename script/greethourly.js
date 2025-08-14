module.exports.config = {
  name: "greethourly",
  version: "1.0.1",
  role: 0,
  aliases: ["greetnow"],
  credits: "ARI + AJ",
  cooldown: 3,
  description: "Hourly greeting event (Asia/Manila) without manual thread IDs",
  hasPrefix: false
};

const TIMEZONE = "Asia/Manila";
const SEND_AT_MINUTE = 0; // Minute to send (0–59)
const SEND_AT_SECOND = 0; // Second to send (0–59)

const GREET_BANK = {
  morning: [
    "Good morning! 🌞 Simulan natin ang araw na productive!",
    "Magandang umaga! Kape muna tayo? ☕",
    "Rise and shine! Panibagong laban 💪",
    "Umaga na! Keep grinding, keep smiling. ✨"
  ],
  noon: [
    "Tanghali na! 🍽️ Huwag kalimutang kumain.",
    "Happy lunch! Refill energy muna. 🔋",
    "Magandang tanghali! One step closer na sa goals mo. 🚀"
  ],
  afternoon: [
    "Good afternoon! Keep the momentum going! ⚡",
    "Hapon na! Stretch ka muna saglit. 🧘",
    "Still hustling? Respect. 🙌"
  ],
  evening: [
    "Good evening! 🌙 Wrap up ka na ba?",
    "Gabi na! Time to cool down. ❄️",
    "Magandang gabi! Pa-hydrate ka ha. 💧"
  ],
  night: [
    "Late night grind? Kaya mo 'yan! 🌙",
    "Gabi na talaga… pahinga ka rin. 😴",
    "Keep it chill. See you tomorrow! ✌️"
  ]
};

// Helpers
function getPartOfDay(hour) {
  if (hour >= 5 && hour < 11) return "morning";
  if (hour >= 11 && hour < 13) return "noon";
  if (hour >= 13 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 22) return "evening";
  return "night";
}

function getDatePH() {
  return new Date(new Date().toLocaleString("en-US", { timeZone: TIMEZONE }));
}

function formatTimePH(date) {
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  }).format(date);
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildMessage() {
  const now = getDatePH();
  const hour = now.getHours();
  const part = getPartOfDay(hour);
  const base = pick(GREET_BANK[part]);
  const timeStr = formatTimePH(now);
  const weekday = now.toLocaleDateString("en-PH", { timeZone: TIMEZONE, weekday: "long" });
  return `${base}\n🕒 ${timeStr} • ${weekday}`;
}

async function getActiveThreads(api) {
  try {
    const inbox = await api.getThreadList(50, null, ["INBOX"]);
    return inbox
      .filter(t => (t.isGroup || t.participants.length > 1) && !t.isArchived)
      .map(t => t.threadID);
  } catch (err) {
    console.error("[greethourly] Error getting thread list:", err.message);
    return [];
  }
}

async function broadcast(api) {
  const message = buildMessage();
  const threads = await getActiveThreads(api);

  if (!threads.length) {
    console.warn("[greethourly] No active threads found.");
    return;
  }

  for (const id of threads) {
    try {
      await api.sendMessage(message, id);
      await sleep(500);
    } catch (e) {
      console.error(`[greethourly] Failed to send to ${id}:`, e.message);
    }
  }
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

let schedulerStarted = false;
function startHourlyScheduler(api) {
  if (schedulerStarted) return;
  schedulerStarted = true;

  const now = getDatePH();
  const next = new Date(now);
  next.setMinutes(SEND_AT_MINUTE, SEND_AT_SECOND, 0);

  if (next <= now) next.setHours(next.getHours() + 1);

  const msUntilNext = next - now;
  console.log(`[greethourly] First send at ${next.toLocaleString("en-PH", { timeZone: TIMEZONE })}`);

  setTimeout(async () => {
    await broadcast(api);
    setInterval(async () => {
      await broadcast(api);
    }, 60 * 60 * 1000);
  }, msUntilNext);
}

module.exports.handleEvent = function() {
  return;
};

module.exports.onLoad = function({ api }) {
  startHourlyScheduler(api);
};

module.exports.run = async function({ api, event }) {
  await broadcast(api);
  api.sendMessage("✅ Greetings sent to all active threads!", event.threadID, event.messageID);
};
           
