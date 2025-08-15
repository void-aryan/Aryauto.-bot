module.exports.config = {
  name: "greethourly",
  version: "1.2.0",
  role: 0,
  credits: "ARI + AJ",
  description: "Automatic greetings at specific times (Asia/Manila) with custom messages",
  hasPrefix: false
};

const TIMEZONE = "Asia/Manila";

const SCHEDULES = [
  { hour: 7, messages: [
    "🌞 Good morning! Panibagong araw, panibagong oportunidad!",
    "Magandang umaga! Simulan natin ang araw ng may ngiti. 😊",
    "Rise and shine! Let's make today productive 💪",
    "Umaga na! Huwag kalimutan mag-breakfast. 🍳"
  ]},
  { hour: 12, messages: [
    "🍽️ Tanghali na! Kumain ka muna para may energy.",
    "Happy lunch! Refill muna ng energy. 🔋",
    "Magandang tanghali! One step closer na sa goals mo. 🚀"
  ]},
  { hour: 18, messages: [
    "🌆 Good evening! Konting push pa para sa goals mo!",
    "Magandang gabi! Pahinga ka rin ha. 💧",
    "Hapon na! Time to slow down and relax. 🛋️"
  ]},
  { hour: 22, messages: [
    "🌙 Good night! Matulog ka na para fresh bukas.",
    "Late night na! Pahinga ka na para makabawi ng energy. 😴",
    "Good night! Kita-kits bukas para sa panibagong laban. ✨",
    "Tulog na, tama na kaka-relapse."
  ]}
];

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

function buildMessage(messages) {
  const now = getDatePH();
  const base = pick(messages);
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

async function broadcast(api, messages) {
  const message = buildMessage(messages);
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
function startScheduler(api) {
  if (schedulerStarted) return;
  schedulerStarted = true;

  function scheduleNext() {
    const now = getDatePH();
    let nextSchedule = null;

    for (const sched of SCHEDULES) {
      const target = new Date(now);
      target.setHours(sched.hour, 0, 0, 0);
      if (target > now) {
        nextSchedule = { time: target, messages: sched.messages };
        break;
      }
    }

    if (!nextSchedule) {
      const target = new Date(now);
      target.setDate(now.getDate() + 1);
      target.setHours(SCHEDULES[0].hour, 0, 0, 0);
      nextSchedule = { time: target, messages: SCHEDULES[0].messages };
    }

    const msUntilNext = nextSchedule.time - now;
    console.log(`[greethourly] Next greet at ${nextSchedule.time.toLocaleString("en-PH", { timeZone: TIMEZONE })}`);

    setTimeout(async () => {
      await broadcast(api, nextSchedule.messages);
      scheduleNext(); 
    }, msUntilNext);
  }

  scheduleNext();
}

// Para mag-load agad pag start ng bot
module.exports.onLoad = function ({ api }) {
  startScheduler(api);
};

// Wala talagang command at event na ginagamit dito
module.exports.run = function () { return; };
module.exports.handleEvent = function () { return; };
