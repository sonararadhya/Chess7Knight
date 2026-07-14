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
    type: Number,
    default: 1200
  },
  timeControl: {
    type: String,
    default: 'no limit'
  },
  analysis: {
    brilliant: { type: Number, default: 0 },
    great: { type: Number, default: 0 },
    best: { type: Number, default: 0 },
    excellent: { type: Number, default: 0 },
    good: { type: Number, default: 0 },
    book: { type: Number, default: 0 },
    inaccuracy: { type: Number, default: 0 },
    mistake: { type: Number, default: 0 },
    miss: { type: Number, default: 0 },
    blunder: { type: Number, default: 0 }
  },
  performanceRating: {
    type: Number,
    default: 0
  },
  openingName: {
    type: String,
    default: 'Unknown Opening'
  },
  phasePerformance: {
    opening: { type: Number, default: 0 },
    middlegame: { type: Number, default: 0 },
    endgame: { type: Number, default: 0 }
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Match', MatchSchema);
