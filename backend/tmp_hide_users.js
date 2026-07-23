
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const UserSchema = new mongoose.Schema({
  email: String,
  isHidden: Boolean
});
const User = mongoose.model('User', UserSchema);

async function hideUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");
    
    // Mark all currently existing users as hidden
    const res = await User.updateMany({}, { $set: { isHidden: true } });
    console.log(`Updated ${res.modifiedCount} users to isHidden: true`);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

hideUsers();
