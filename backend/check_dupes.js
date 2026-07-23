import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const UserSchema = new mongoose.Schema({
  email: String,
  username: String,
  xp: Number
}, { strict: false });

const User = mongoose.model('User', UserSchema);

async function checkDuplicates() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Checking for duplicates...");

  const users = await User.find({}).lean();
  console.log(`Total users: ${users.length}`);

  const nameMap = {};
  users.forEach(u => {
    const name = u.username || "EMPTY";
    if (!nameMap[name]) nameMap[name] = [];
    nameMap[name].push(u.email);
  });

  console.log("Username Distribution:");
  for (const [name, emails] of Object.entries(nameMap)) {
    if (emails.length > 1) {
      console.log(`❌ DUPLICATE USERNAME: "${name}" used by: ${emails.join(', ')}`);
    } else {
      console.log(`✅ Unique: "${name}" (${emails[0]})`);
    }
  }

  process.exit(0);
}

checkDuplicates();
