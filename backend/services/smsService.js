/**
 * smsService.js — Eskiz.uz SMS Provider Integration
 * Sends SMS to admin numbers on user register/login events.
 * API credentials must be set in .env — NEVER hardcoded here.
 */

const ESKIZ_BASE = "https://notify.eskiz.uz/api";

// ── Rate limiting map (prevent duplicate SMS per user per 60s) ──────────────
const smsRateMap = new Map();

function isRateLimited(key) {
  const now = Date.now();
  const last = smsRateMap.get(key) || 0;
  if (now - last < 60000) return true;
  smsRateMap.set(key, now);
  return false;
}

// ── Get Eskiz token (cached, refreshes every hour) ──────────────────────────
let eskizTokenCache = null;
let eskizTokenExpiry = 0;

async function getEskizToken() {
  if (process.env.ESKIZ_TOKEN) return process.env.ESKIZ_TOKEN;
  if (process.env.SMS_API_KEY) return process.env.SMS_API_KEY;

  const now = Date.now();
  if (eskizTokenCache && now < eskizTokenExpiry) return eskizTokenCache;

  const email = process.env.ESKIZ_EMAIL;
  const password = process.env.ESKIZ_PASSWORD;

  if (!email || !password) {
    console.warn("⚠️ ESKIZ_EMAIL / ESKIZ_PASSWORD / ESKIZ_TOKEN missing in .env — SMS disabled");
    return null;
  }

  try {
    const res = await fetch(`${ESKIZ_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data?.data?.token) {
      eskizTokenCache = data.data.token;
      eskizTokenExpiry = now + 3600 * 1000; // 1 hour
      console.log("✅ Eskiz token yangilandi");
      return eskizTokenCache;
    }
    console.warn("⚠️ Eskiz login failed:", data);
    return null;
  } catch (err) {
    console.error("❌ Eskiz auth error:", err.message);
    return null;
  }
}

/**
 * Send SMS to a single phone number via Eskiz.uz
 * @param {string} phone  - E.g. "998955331528" (no + prefix)
 * @param {string} message
 */
async function sendSingleSMS(phone, message) {
  const token = await getEskizToken();
  if (!token) return;

  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const from = process.env.SMS_SENDER || "4546";

  try {
    const res = await fetch(`${ESKIZ_BASE}/message/sms/send`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mobile_phone: cleanPhone,
        message,
        from,
        callback_url: "",
      }),
    });
    const data = await res.json();
    if (data?.status === "waiting" || data?.id) {
      console.log(`📱 SMS sent to ${cleanPhone}: ${data.id || "OK"}`);
    } else {
      console.warn(`⚠️ SMS to ${cleanPhone} failed:`, JSON.stringify(data));
    }
  } catch (err) {
    console.error(`❌ SMS send error to ${cleanPhone}:`, err.message);
  }
}

/**
 * Send SMS to BOTH admin numbers (from .env)
 * @param {string} message
 */
export async function sendAdminSMS(message) {
  const phones = [
    process.env.ADMIN_PHONE_1 || "+998 95 533 15 28",
    process.env.ADMIN_PHONE_2 || "+998 93 691 03 11",
  ];

  await Promise.allSettled(phones.map((p) => sendSingleSMS(p, message)));
}

/**
 * Send register notification SMS (rate-limited per email)
 */
export async function sendRegisterSMS({ name, email, phone }) {
  const key = `register:${email}`;
  if (isRateLimited(key)) return;

  const dateTime = new Date().toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" });
  const message = `CefrCenter\n🆕 Yangi foydalanuvchi ro'yxatdan o'tdi.\n\nIsm: ${name}\nEmail: ${email}\nTelefon: ${phone || "kiritilmagan"}\nVaqt: ${dateTime}`;

  try {
    await sendAdminSMS(message);
  } catch (err) {
    console.error("SMS register notification error:", err.message);
  }
}

/**
 * Send login notification SMS (rate-limited per email, 60s)
 */
export async function sendLoginSMS({ name, email, phone }) {
  const key = `login:${email}`;
  if (isRateLimited(key)) return;

  const dateTime = new Date().toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" });
  const message = `CefrCenter\n🔔 Foydalanuvchi tizimga kirdi.\n\nIsm: ${name}\nEmail: ${email}\nTelefon: ${phone || "kiritilmagan"}\nVaqt: ${dateTime}`;

  try {
    await sendAdminSMS(message);
  } catch (err) {
    console.error("SMS login notification error:", err.message);
  }
}
