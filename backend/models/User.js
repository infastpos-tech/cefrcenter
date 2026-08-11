import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, sparse: true, unique: true },
  name: { type: String, default: "" },              // Display name
  phone: { type: String, default: "" },             // Phone number
  role: { type: String, enum: ["user", "admin"], default: "user" },
  isOnline: { type: Boolean, default: false },      // Online/offline status
  registeredAt: { type: Date, default: null },       // First registration date
  xp: { type: Number, default: 0 },
  coins: { type: Number, default: 0 },
  level: { type: String, default: "A1" },
  completed: { type: Object, default: {} },
  purchased: { type: [String], default: [] },
  onboarded: { type: Boolean, default: false },
  consecutiveDays: { type: Number, default: 0 },
  lastLogin: { type: String, default: "" },
  scores: { type: Object, default: {} },
  coinTx: { type: [Object], default: [] },
  spinUsed: { type: Object, default: { date: "", count: 0 } },
  streakClaimed: { type: Object, default: {} },
  _scoreTimestamps: { type: Object, default: {} },
  todayXP: { type: Number, default: 0 },
  lastXPReset: { type: String, default: "" },
  vocabulary: { type: [Object], default: [] },
  totalDaysActive: { type: Number, default: 0 },
  activityLog: { type: [Object], default: [] }, // Array of { date, xp }
  totalTimeSpent: { type: Number, default: 0 }, // In seconds
  bio: { type: String, default: "" },
  telegram: { type: String, default: "" },
  instagram: { type: String, default: "" },
  dailyGoal: { type: Number, default: 50 },
  claimedTimeBonus: { type: String, default: "" }, // Track daily bonus claim date
  isHidden: { type: Boolean, default: false },
  lastActiveDate: { type: String, default: "" },
  lastUpdated: { type: Date, default: Date.now },
  isPremium: { type: Boolean, default: false },
  premiumPlan: { type: String, default: "" },
  premiumStart: { type: Date, default: null },
  premiumExpire: { type: Date, default: null },
  isAdmin: { type: Boolean, default: false },
  photoURL: { type: String, default: "" }
}, {
  timestamps: true  // adds createdAt and updatedAt automatically
});

userSchema.index({ xp: -1 });
userSchema.index({ consecutiveDays: -1 });
userSchema.index({ isHidden: 1, xp: -1 });
userSchema.index({ isHidden: 1, consecutiveDays: -1 });
userSchema.index({ isOnline: 1 });
userSchema.index({ createdAt: -1 });

const User = mongoose.model("User", userSchema);
export default User;
