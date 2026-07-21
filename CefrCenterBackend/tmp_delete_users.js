
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

async function deleteUsers() {
  try {
    if (!process.env.MONGO_URI) throw new Error("MONGO_URI not found");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");
    
    // Define temporary schema
    const User = mongoose.model('User', new mongoose.Schema({}));
    
    // Delete all users
    const res = await User.deleteMany({});
    console.log(`Successfully removed ${res.deletedCount} users from database.`);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

deleteUsers();
