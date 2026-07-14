const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Match = require('../models/Match');
const User = require('../models/User');

// Helper to extract opening name from PGN or simulate one
function getOpeningName(pgn) {
  if (!pgn) return 'Unknown Opening';
  // Standard openings based on first moves in PGN
  if (pgn.includes('e4 e5 Nf3 Nc6 Bb5')) return 'Ruy Lopez';
  if (pgn.includes('e4 e5 Nf3 Nc6 Bc4')) return 'Italian Game';
  if (pgn.includes('e4 c5')) return 'Sicilian Defense';
  if (pgn.includes('d4 d5 c4')) return "Queen's Gambit";
  if (pgn.includes('e4 e6')) return 'French Defense';
  if (pgn.includes('e4 c6')) return 'Caro-Kann Defense';
  if (pgn.includes('Nf3 d5 g3')) return 'King\'s Indian Attack';
  if (pgn.includes('d4 Nf6 c4 g6')) return 'King\'s Indian Defense';
  if (pgn.includes('d4 Nf6 c4 e6 Nf3 b6')) return 'Queen\'s Indian Defense';
  if (pgn.includes('e4 e5')) return 'Open Game';
  if (pgn.includes('d4 d5')) return 'Closed Game';
  return 'Modern Defense';
}

// @route   POST api/matches/save
// @desc    Save a match result and generate analysis
// @access  Private
router.post('/save', auth, async (req, res) => {
  const { pgn, result, accuracy, difficulty, timeControl } = req.body;

  try {
    // Determine move count from PGN
    const movesCount = pgn ? pgn.split(' ').filter(word => !word.includes('.')).length : 20;
    
    // Simulate realistic move analysis based on accuracy
    const acc = accuracy || (Math.floor(Math.random() * 30) + 65); // 65-95%
    
    const blunderChance = Math.max(0, Math.floor((100 - acc) / 8));
    const mistakeChance = Math.max(0, Math.floor((100 - acc) / 5));
    const inaccuracyChance = Math.max(0, Math.floor((100 - acc) / 3));
    
    const blunders = Math.min(movesCount, Math.floor(Math.random() * blunderChance));
    const mistakes = Math.min(movesCount - blunders, Math.floor(Math.random() * mistakeChance));
    const inaccuracies = Math.min(movesCount - blunders - mistakes, Math.floor(Math.random() * inaccuracyChance));
    
    const brilliant = Math.random() > 0.85 ? 1 : 0;
    const great = Math.floor(Math.random() * 2);
    
    const remainingMoves = Math.max(0, movesCount - blunders - mistakes - inaccuracies - brilliant - great);
    const best = Math.floor(remainingMoves * (acc / 100));
    const excellent = Math.floor((remainingMoves - best) * 0.4);
    const good = Math.max(0, remainingMoves - best - excellent);
    const book = Math.floor(Math.random() * 6) + 2; // 2-8 book moves
    
    const analysis = {
      brilliant,
      great,
      best,
      excellent,
      good,
      book,
      inaccuracy: inaccuracies,
      mistake: mistakes,
      miss: Math.random() > 0.7 ? 1 : 0,
      blunder: blunders
    };

    // Performance rating is roughly related to accuracy and opponent ELO
    let performanceRating = Math.floor(difficulty * (acc / 100));
    if (result === '1-0') performanceRating += 200;
    if (result === '0-1') performanceRating -= 200;
    performanceRating = Math.max(100, performanceRating);

    const openingName = getOpeningName(pgn);

    // Phase accuracy
    const phasePerformance = {
      opening: Math.min(100, Math.floor(acc + (Math.random() * 10 - 3))),
      middlegame: Math.min(100, Math.floor(acc + (Math.random() * 12 - 7))),
      endgame: movesCount > 30 ? Math.min(100, Math.floor(acc + (Math.random() * 16 - 8))) : 0
    };

    const newMatch = new Match({
      userId: req.user.id,
      pgn,
      result,
      accuracy: acc,
      difficulty: parseInt(difficulty) || 1200,
      timeControl: timeControl || 'no limit',
      analysis,
      performanceRating,
      openingName,
      phasePerformance
    });

    const match = await newMatch.save();

    // ELO Updates: starting at 0, increasing when beating opponent
    const user = await User.findById(req.user.id);
    let ratingChange = 0;

    if (result === '1-0') {
      // User beat bot. Rating change depends on bot ELO vs user ELO
      const diff = (parseInt(difficulty) || 1200) - user.rating;
      const expectedScore = 1 / (1 + Math.pow(10, -diff / 400));
      ratingChange = Math.round(32 * (1 - expectedScore));
      // Ensure positive change on win
      if (ratingChange <= 0) ratingChange = 10;
    } else if (result === '0-1') {
      // User lost. Rating change
      const diff = (parseInt(difficulty) || 1200) - user.rating;
      const expectedScore = 1 / (1 + Math.pow(10, -diff / 400));
      ratingChange = Math.round(32 * (0 - expectedScore));
      // Ensure it's negative
      if (ratingChange >= 0) ratingChange = -10;
    } else {
      // Draw
      const diff = (parseInt(difficulty) || 1200) - user.rating;
      const expectedScore = 1 / (1 + Math.pow(10, -diff / 400));
      ratingChange = Math.round(32 * (0.5 - expectedScore));
    }

    user.rating = Math.max(0, user.rating + ratingChange);
    await user.save();

    res.json({ match, newRating: user.rating });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/matches/history
// @desc    Get user's match history
// @access  Private
router.get('/history', auth, async (req, res) => {
  try {
    const matches = await Match.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(matches);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
