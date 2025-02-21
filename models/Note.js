const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',  // ✅ Ensure this matches your User model name
    required: true 
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Note', NoteSchema);
