import TelegramBot from "node-telegram-bot-api";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ADMIN_CHATS_FILE = path.join(__dirname, "..", "admin_chats.json");

let botInstance = null;

// Load / save admin chat IDs from file so they persist across restarts
function loadAdminChatIds() {
  try {
    if (fs.existsSync(ADMIN_CHATS_FILE)) {
      const data = JSON.parse(fs.readFileSync(ADMIN_CHATS_FILE, "utf8"));
      return Array.isArray(data.chatIds) ? data.chatIds : [];
    }
  } catch(e) {}
  return [];
}

function saveAdminChatIds(chatIds) {
  try {
    fs.writeFileSync(ADMIN_CHATS_FILE, JSON.stringify({ chatIds }, null, 2), "utf8");
  } catch(e) {}
}

let adminChatIds = loadAdminChatIds();
console.log("📋 Saved Admin Telegram Chat IDs:", adminChatIds);

export function initTelegramBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const webAppUrl = process.env.TELEGRAM_WEBAPP_URL || "https://cefrcenter.vercel.app";

  if (!token) {
    console.log("ℹ️ TELEGRAM_BOT_TOKEN topilmadi. Telegram bot ishga tushirilmadi.");
    return null;
  }

  try {
    botInstance = new TelegramBot(token, { polling: true });
    console.log("🤖 Telegram Bot muvaffaqiyatli ishga tushdi!");
    console.log(`📌 Bildirishnomalar olish uchun Botga /start yozing!`);

    // Auto-register ANY incoming message chat ID as admin notification recipient
    botInstance.on("message", (msg) => {
      if (msg && msg.chat && msg.chat.id) {
        const chatId = msg.chat.id;
        if (!adminChatIds.includes(chatId)) {
          adminChatIds.push(chatId);
          saveAdminChatIds(adminChatIds);
          console.log(`✅ Admin Chat ID avtomatik saqlandi: ${chatId}`);
        }
      }
    });

    // /start command — auto registers chat as admin notification target
    botInstance.onText(/\/start/, (msg) => {
      const chatId = msg.chat.id;
      const firstName = msg.from?.first_name || "Admin";

      // Auto-register this chat for admin notifications
      if (!adminChatIds.includes(chatId)) {
        adminChatIds.push(chatId);
        saveAdminChatIds(adminChatIds);
        console.log(`✅ Yangi admin chat ro'yxatdan o'tdi: ${chatId} (${firstName})`);
        botInstance.sendMessage(chatId, 
`✅ *Siz admin bildirishnomalar ro'yxatiga qo'shildingiz!*

📱 Chat ID: \`${chatId}\`
Endi CEFR Center-ga kimdir kirsa, sizga Telegram-da xabar keladi! 🔔

*Test:* Biror foydalanuvchi saytga kirsa — xabar ko'ring.`, 
          { parse_mode: "Markdown" });
      } else {
        botInstance.sendMessage(chatId, `✅ Siz allaqachon bildirishnomalar ro'yxatidasisiz!\n📱 Chat ID: \`${chatId}\``, { parse_mode: "Markdown" });
      }

      const welcomeText = 
`👋 *Salom, ${firstName}! CEFR Center Admin Bot!* 🎓

🔔 *Admin bildirishnomalar ro'yxatiga qo'shildingiz!*
Har safar foydalanuvchi saytga kirsa yoki ro'yxatdan o'tsa, sizga Telegram-da xabar keladi.

📱 *Qo'shimcha buyruqlar:*
/chatid — Sizning Chat ID ingizni ko'rsatish
/status — Bot holati`;

      botInstance.sendMessage(chatId, welcomeText, {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🚀 CEFR Center-ni Ochish (Mini App)",
                web_app: { url: webAppUrl }
              }
            ],
            [
              { text: "ℹ️ Yordam", callback_data: "help_info" },
              { text: "📊 Veb-sayt", url: webAppUrl }
            ]
          ]
        }
      });
    });

    // /chatid command
    botInstance.onText(/\/chatid/, (msg) => {
      const chatId = msg.chat.id;
      botInstance.sendMessage(chatId, `📱 *Sizning Chat ID:* \`${chatId}\``, { parse_mode: "Markdown" });
    });

    // /status command
    botInstance.onText(/\/status/, (msg) => {
      const chatId = msg.chat.id;
      botInstance.sendMessage(chatId, 
`🟢 *Bot ishlayapti!*
📋 Ro'yxatdagi admin chatlar: ${adminChatIds.length} ta
Chat IDs: ${adminChatIds.join(", ") || "Hech kim yo'q"}

Ro'yxatga kirish uchun: /start`, { parse_mode: "Markdown" });
    });

    // /help or /app commands
    botInstance.onText(/\/(help|app|test)/, (msg) => {
      const chatId = msg.chat.id;
      botInstance.sendMessage(chatId, `🚀 CEFR Center testlarini boshlash uchun pastdagi tugmani bosing:`, {
        reply_markup: {
          inline_keyboard: [
            [{ text: "⚡️ Launch CEFR Mini App", web_app: { url: webAppUrl } }]
          ]
        }
      });
    });

    // Callback queries
    botInstance.on("callback_query", (query) => {
      const chatId = query.message.chat.id;
      if (query.data === "help_info") {
        botInstance.sendMessage(chatId, 
`ℹ️ *CEFR Center Yo'riqnomasi:*
1. Mini App-ni oching.
2. Telegram hisobingiz yoki Google orqali avtorizatsiyadan o'ting.
3. Testlar bo'limidan darajangizni tanlang va topshirishni boshlang!

Savollar yuzasidan: @CefrCenterSupport`, { parse_mode: "Markdown" });
      }
      botInstance.answerCallbackQuery(query.id);
    });

    // Error handling
    botInstance.on("polling_error", (error) => {
      console.warn("⚠️ Telegram Bot polling xatosi:", error.message || error);
    });

    return botInstance;
  } catch (err) {
    console.error("❌ Telegram Bot-ni yaratishda xatolik:", err.message);
    return null;
  }
}

export function getTelegramBot() {
  return botInstance;
}

export function getAdminChatIds() {
  return adminChatIds;
}

// Rate limiting map to prevent spamming notifications if user reloads multiple times within 60s
const lastNotifiedMap = new Map();

export async function notifyAdminUserLogin({ email, username, isNewUser }, io = null) {
  try {
    const now = Date.now();
    const lastTime = lastNotifiedMap.get(email) || 0;
    if (now - lastTime < 60000) return;
    lastNotifiedMap.set(email, now);

    const timeStr = new Date().toLocaleTimeString("uz-UZ", { timeZone: "Asia/Tashkent" });
    const dateStr = new Date().toLocaleDateString("uz-UZ");

    const displayName = username || email.split('@')[0];
    const message =
`🔔 *CEFR CENTER — O'QUVCHI ${isNewUser ? "RO'YXATDAN O'TDI!" : "KIRDI!"}*

👤 *Ism:* ${displayName}
📧 *Email:* \`${email}\`
📌 *Holat:* ${isNewUser ? "✨ Yangi ro'yxatdan o'tdi!" : "🔑 Tizimga qaytadan kirdi"}
⏰ *Vaqt:* ${timeStr} (${dateStr})`;

    console.log(`\n📢 ADMIN NOTIFICATION (${timeStr}): User ${email} (${displayName}) logged in. Notifying ${adminChatIds.length} admin chat(s).`);

    // 1. Send via Socket.io to AdminPanel in real-time
    if (io) {
      io.emit("admin_user_login", {
        email,
        username: displayName,
        isNewUser,
        time: timeStr,
        date: dateStr,
      });
    }

    // 2. Send via Telegram Bot to ALL registered admin chats
    if (botInstance && adminChatIds.length > 0) {
      for (const chatId of adminChatIds) {
        botInstance.sendMessage(chatId, message, { parse_mode: "Markdown" }).catch(err => {
          console.warn(`⚠️ Admin Telegram notification to ${chatId} failed:`, err.message);
        });
      }
    } else if (botInstance && adminChatIds.length === 0) {
      console.warn("⚠️ Hech qanday admin Telegram chat ro'yxatda yo'q! Botga /start yuboring.");
    }

    // 3. Optional Eskiz.uz SMS integration
    const eskizToken = process.env.ESKIZ_TOKEN;
    if (eskizToken) {
      const smsText = `CEFR Center: ${displayName} ${isNewUser ? "yangi ro'yxatdan o'tdi" : "saytga kirdi"}. Vaqt: ${timeStr}`;
      for (const phone of ["+998955331528", "+998936910311"]) {
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        fetch("https://notify.eskiz.uz/api/message/sms/send", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${eskizToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            mobile_phone: cleanPhone,
            message: smsText,
            from: "4546",
            callback_url: ""
          })
        }).catch(e => console.warn("Eskiz SMS error:", e.message));
      }
    }
  } catch (err) {
    console.error("❌ Notification error:", err.message);
  }
}
