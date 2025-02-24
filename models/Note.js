const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

// Compound index for faster title & user searches
NoteSchema.index({ title: 1, userId: 1 });

// Index for efficient sorting by creation date
NoteSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Note', NoteSchema);
