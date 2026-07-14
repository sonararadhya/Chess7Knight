const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pgn: {
    type: String,
    required: true
  },
  result: {
    type: String, // '1-0', '0-1', '1/2-1/2', '*'
    required: true
  },
  accuracy: {
    type: Number,
    default: 0
  },
  difficulty: {
    type: Number, // 1-11
    default: 1
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Match', MatchSchema);
