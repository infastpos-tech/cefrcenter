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
