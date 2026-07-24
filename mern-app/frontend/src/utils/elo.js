// ELO Rating calculation helper for Chess7Knight

export const calculateEloChange = (playerRating = 1200, opponentRating = 1200, result = '1-0') => {
  const K = 32; // Development K-Factor
  const expected = 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
  
  let score = 0.5;
  if (result === '1-0') score = 1.0;
  else if (result === '0-1') score = 0.0;
  else score = 0.5;

  let delta = Math.round(K * (score - expected));

  // Ensure minimum win reward (+8) and minimum loss penalty (-8) for wins and losses
  if (result === '1-0' && delta <= 0) delta = 8;
  if (result === '0-1' && delta >= 0) delta = -8;
  if (result === '1/2-1/2') delta = 0;

  const newRating = Math.max(100, playerRating + delta);

  return {
    delta,
    newRating,
    formattedDelta: delta > 0 ? `+${delta}` : `${delta}`
  };
};
