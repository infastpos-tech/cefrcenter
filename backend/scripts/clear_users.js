#!/usr/bin/env node
// clear_users.js — Deletes non-admin users from MongoDB and optionally Firebase (if configured)
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('MONGO_URI not set in environment. Aborting.');
  process.exit(1);
}

async function main() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    const User = (await import('../models/User.js')).default;

    // Delete all users except admins
    const res = await User.deleteMany({ isAdmin: { $ne: true } });
    console.log(`Deleted ${res.deletedCount} users from MongoDB (non-admin).`);

    // Optional: delete from Firebase Auth if service account provided
    if (process.env.FIREBASE_ADMIN_SA_PATH || process.env.FIREBASE_ADMIN_SA_JSON) {
      try {
        const admin = await import('firebase-admin');
        if (process.env.FIREBASE_ADMIN_SA_JSON) {
          const sa = JSON.parse(process.env.FIREBASE_ADMIN_SA_JSON);
          admin.initializeApp({ credential: admin.credential.cert(sa) });
        } else {
          const saPath = process.env.FIREBASE_ADMIN_SA_PATH;
          admin.initializeApp({ credential: admin.credential.cert(require(saPath)) });
        }
        console.log('Firebase Admin initialized — deleting auth users...');
        // List users in batches and delete non-admins
        const auth = admin.auth();
        let nextPageToken = undefined;
        let deleted = 0;
        do {
          const list = await auth.listUsers(1000, nextPageToken);
          const uidsToDelete = list.users
            .filter(u => !(u.email === 'xojiakbar@admin.com' || u.email === 'xolmirzayevanargiza57@gmail.com'))
            .map(u => u.uid);
          if (uidsToDelete.length) {
            const r = await auth.deleteUsers(uidsToDelete);
            deleted += r.successCount;
            console.log(`Deleted ${r.successCount} users from Firebase Auth.`);
          }
          nextPageToken = list.pageToken;
        } while (nextPageToken);
        console.log(`Firebase Auth deleted ${deleted} users.`);
      } catch (e) {
        console.warn('Firebase deletion skipped or failed:', e.message);
      }
    } else {
      console.log('Firebase Admin service account not provided — skipped Firebase deletion.');
    }

    process.exit(0);
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  }
}

main();
