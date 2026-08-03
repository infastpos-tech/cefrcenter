import TelegramBot from "node-telegram-bot-api";

let botInstance = null;

export function initTelegramBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const webAppUrl = process.env.TELEGRAM_WEBAPP_URL || "https://cefrcenter.vercel.app";

  if (!token) {
    console.log("ℹ️ TELEGRAM_BOT_TOKEN topilmadi. Telegram bot polling rejimida ishga tushirilmadi.");
    return null;
  }

  try {
    botInstance = new TelegramBot(token, { polling: true });
    console.log("🤖 Telegram Bot muvaffaqiyatli ishga tushdi!");

    // /start command
    botInstance.onText(/\/start/, (msg) => {
      const chatId = msg.chat.id;
      const firstName = msg.from?.first_name || "Foydalanuvchi";

      const welcomeText = 
`👋 **Salom, ${firstName}! CEFR Center-ga xush kelibsiz!** 🎓

**CEFR Center** — O'zbekistondagi eng ilg'or AI-asosli CEFR imtihon simulyatori!

📱 **Telegram Mini App orqali:**
• 🎧 Listening testlari
• 📖 Reading mashqlari
• ✍️ Writing insho va tavsiflar (AI baholash)
• 🗣️ Speaking AI suhbatdoshi
• 🏆 Umumiy peshqadamlar jadvali

Pastdagi tugmani bosing va Mini App-ni Telegram ichida oching! 👇`;

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
              { text: "ℹ️ Yordam & Yo'riqnoma", callback_data: "help_info" },
              { text: "📊 Veb-sayt", url: webAppUrl }
            ]
          ]
        }
      });
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
`ℹ️ **CEFR Center Yo'riqnomasi:**
1. Mini App-ni oching.
2. Telegram hisobingiz yoki Google orqali avtorizatsiyadan o'ting.
3. Testlar bo'limidan darajangizni tanlang va topshirishni boshlang!

Savollar yoki muammolar yuzasidan: @CefrCenterSupport`, { parse_mode: "Markdown" });
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

// Rate limiting map to prevent spamming notifications if user reloads multiple times within 60s
const lastNotifiedMap = new Map();

export async function notifyAdminUserLogin({ email, username, isNewUser, phoneNumbers = ["+998955331528", "+998936910311"] }, io = null) {
  try {
    const now = Date.now();
    const lastTime = lastNotifiedMap.get(email) || 0;
    if (now - lastTime < 60000) return;
    lastNotifiedMap.set(email, now);

    const timeStr = new Date().toLocaleTimeString("uz-UZ", { timeZone: "Asia/Tashkent" });
    const dateStr = new Date().toLocaleDateString("uz-UZ");

    const message = 
`🔔 **CEFR CENTER — O'QUVCHI KIRDI!**
----------------------------------------
👤 **Ism:** ${username || "O'quvchi"}
📧 **Email:** \`${email}\`
📌 **Holat:** ${isNewUser ? "✨ Yangi ro'yxatdan o'tdi!" : "🔑 Tizimga qaytadan kirdi"}
⏰ **Vaqt:** ${timeStr} (${dateStr})
📱 **Yuborilgan raqamlar:** +998 95 533 15 28 / +998 93 691 03 11`;

    console.log(`\n📢 ADMIN NOTIFICATION (${timeStr}): User ${email} (${username}) logged in.`);

    // 1. Send via Socket.io to AdminPanel in real-time
    if (io) {
      io.emit("admin_user_login", {
        email,
        username: username || email.split('@')[0],
        isNewUser,
        time: timeStr,
        date: dateStr,
        phoneNumbers
      });
    }

    // 2. Send via Telegram Bot to Admin Telegram Chat ID if configured
    const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
    if (botInstance && adminChatId) {
      botInstance.sendMessage(adminChatId, message, { parse_mode: "Markdown" }).catch(err => {
        console.warn("⚠️ Admin Telegram notification failed:", err.message);
      });
    }

    // 3. Optional Eskiz.uz SMS integration structure
    const eskizToken = process.env.ESKIZ_TOKEN;
    if (eskizToken) {
      const smsText = `CEFR Center: ${username || email} ${isNewUser ? "yangi kirdi" : "saytga kirdi"}. Vaqt: ${timeStr}`;
      for (const phone of phoneNumbers) {
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

