const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ['user', 'admin'], default: 'user' },
  failedLoginAttempts: { type: Number, default: 0 },
  isLocked: { type: Boolean, default: false }
});

// 📌 Index for efficient email lookups
UserSchema.index({ email: 1 });

module.exports = mongoose.model('User', UserSchema);
