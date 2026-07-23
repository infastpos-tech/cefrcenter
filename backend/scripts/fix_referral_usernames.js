#!/usr/bin/env node
// fix_referral_usernames.js — Move referral labels from `username` into `hearAbout` and set sane usernames
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('MONGO_URI not set. Aborting.');
  process.exit(1);
}

const REFERRAL_LABELS = [
  'Google / Search', 'Google', 'Google Search',
  'Friend / Recommendation', 'Friend',
  'Other', 'Telegram', 'Instagram'
];

async function main() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

  const User = (await import('../models/User.js')).default;

  // Find users whose username matches any referral label
  const users = await User.find({ username: { $in: REFERRAL_LABELS } }).lean();
  console.log(`Found ${users.length} users with referral-like usernames.`);

  for (const u of users) {
    const emailLocal = (u.email || '').split('@')[0] || `user${Math.floor(Math.random()*9000)+1000}`;
    const newUsername = emailLocal;
    const hearAbout = u.username;
    try {
      await User.updateOne({ _id: u._id }, { $set: { username: newUsername, hearAbout } });
      console.log(`Updated user ${u._id}: username -> ${newUsername}, hearAbout -> ${hearAbout}`);
    } catch (e) {
      console.error('Failed to update', u._id, e.message);
    }
  }

  console.log('Done.');
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
