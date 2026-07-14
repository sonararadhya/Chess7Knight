const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Match = require('../models/Match');
const User = require('../models/User');

// @route   POST api/matches/save
// @desc    Save a match result
// @access  Private
router.post('/save', auth, async (req, res) => {
  const { pgn, result, accuracy, difficulty } = req.body;

  try {
    const newMatch = new Match({
      userId: req.user.id,
      pgn,
      result,
      accuracy,
      difficulty
    });

    const match = await newMatch.save();

    // Optionally update user rating based on accuracy and result
    // Basic logic for demonstration
    const user = await User.findById(req.user.id);
    let ratingChange = 0;
    if (result === '1-0') ratingChange = 10;
    if (result === '0-1') ratingChange = -10;
    if (accuracy > 80 && result !== '0-1') ratingChange += 5;

    user.rating += ratingChange;
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
