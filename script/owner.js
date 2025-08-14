// Owner command with stylish fonts and a clean card layout (No Social Media / No Contact) // Works in most Node.js chat-bot frameworks that pass { api, event, args } to run()

module.exports.config = { name: "owner", version: "2.0.0", role: 0, aliases: ["creator", "dev", "founder"], credits: "ARI", cooldown: 3 };

const OWNER = { handle: "ARI", aka: "Ari", title: "AutoBot Owner & Dev", tag: "@ari", quote: "Ship fast. Learn faster.", timezone: "Asia/Manila" };

const Fonts = { monoBold: (s) => mapChars(s, A("𝙰"), A("𝚊")), serifBold: (s) => mapChars(s, A("𝐀"), A("𝐚"), "𝐎", "𝐨"), serifItalic: (s) => mapChars(s, A("𝐴"), A("𝑎")), sansBold: (s) => mapChars(s, A("𝗔"), A("𝗮"), "𝗢", "𝗼"), sansItalic: (s) => mapChars(s, A("𝘈"), A("𝘢")), sansBoldItalic: (s) => mapChars(s, A("𝙰"), A("𝚊")), script: (s) => mapChars(s, A("𝒜"), A("𝒶")), fraktur: (s) => mapChars(s, A("𝔄"), A("𝔞"), "𝔒", "𝔬"), smallCaps: (s) => s.replace(/[a-z]/g, (c) => smallCaps[c] || c), bubble: (s) => mapDigits(mapLetters(s, A("🅐"), A("🅐")).replace(/[A-Z]/g, (c)=>bubbleCaps[c]||c)) };

function A(ch) { return ch.codePointAt(0); } function mapChars(str, upStart, lowStart, upO = null, lowO = null) { return str.replace(/[A-Za-z]/g, (ch) => { const code = ch.codePointAt(0); if (code >= 65 && code <= 90) { const mapped = String.fromCodePoint(upStart + (code - 65)); return (ch === 'O' && upO) ? upO : mapped; } if (code >= 97 && code <= 122) { const mapped = String.fromCodePoint(lowStart + (code - 97)); return (ch === 'o' && lowO) ? lowO : mapped; } return ch; }); }

const smallCaps = { a:"ᴀ", b:"ʙ", c:"ᴄ", d:"ᴅ", e:"ᴇ", f:"ꜰ", g:"ɢ", h:"ʜ", i:"ɪ", j:"ᴊ", k:"ᴋ", l:"ʟ", m:"ᴍ", n:"ɴ", o:"ᴏ", p:"ᴘ", q:"ꞯ", r:"ʀ", s:"s", t:"ᴛ", u:"ᴜ", v:"ᴠ", w:"ᴡ", x:"x", y:"ʏ", z:"ᴢ" };

const bubbleCaps = { A:"🅐",B:"🅑",C:"🅒",D:"🅓",E:"🅔",F:"🅕",G:"🅖",H:"🅗",I:"🅘",J:"🅙", K:"🅚",L:"🅛",M:"🅜",N:"🅝",O:"🅞",P:"🅟",Q:"🅠",R:"🅡",S:"🅢",T:"🅣", U:"🅤",V:"🅥",W:"🅦",X:"🅧",Y:"🅨",Z:"🅩" };

function mapLetters(s, upStart, lowStart) { return s.replace(/[A-Za-z]/g, (ch)=>{ const code = ch.codePointAt(0); if (code>=65 && code<=90) return String.fromCodePoint(upStart + (code-65)); if (code>=97 && code<=122) return String.fromCodePoint(lowStart + (code-97)); return ch; }); }

function mapDigits(s){ const digits = ['⓪','①','②','③','④','⑤','⑥','⑦','⑧','⑨']; return s.replace(/[0-9]/g, d=>digits[Number(d)]); }

const line = (w=32) => "━".repeat(w); const dot = "•";

function phTime() { try { return new Date().toLocaleString('en-PH', { timeZone: OWNER.timezone, hour12: true }); } catch (_) { return new Date().toLocaleString(); } }

function buildOwnerCard() { const fancyName = Fonts.serifBold(OWNER.handle); const mini = Fonts.smallCaps(OWNER.title);

const lines = [ ┏${line(30)}┓, ┃  ${fancyName}  ┃, ┃  ${mini}  ┃, ┣${line(30)}┫, ┃ ${dot} Tag: ${Fonts.sansBold(OWNER.tag)} , ┃ ${dot} Time: ${Fonts.monoBold(phTime())} , ┃ ${dot} Quote: "${Fonts.script(OWNER.quote)}", ┗${line(30)}┛ ];

return lines.join("\n"); }

function previewFonts(sample = OWNER.handle) { const pairs = Object.entries(Fonts).map(([k, fn]) => ${k.padEnd(14)}: ${fn(sample)}); return [ 🅵🅾🅽🆃 🅿🆁🅴🆅🅸🅴🆆, line(24), ...pairs ].join("\n"); }

module.exports.run = async function({ api, event, args }) { try { const sub = (args && args[0] || '').toLowerCase();

if (sub === 'fonts' || sub === 'preview') {
  const sample = args.slice(1).join(' ') || OWNER.handle;
  return api.sendMessage(previewFonts(sample), event.threadID, event.messageID);
}

if (sub === 'raw') {
  const json = '```json\n' + JSON.stringify(OWNER, null, 2) + '\n```';
  return api.sendMessage(json, event.threadID, event.messageID);
}

return api.sendMessage(buildOwnerCard(), event.threadID, event.messageID);

} catch (err) { return api.sendMessage(Owner command error: ${err.message}, event.threadID, event.messageID); } };
