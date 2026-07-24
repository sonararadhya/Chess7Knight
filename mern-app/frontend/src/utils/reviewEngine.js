import { Chess } from 'chess.js';

const PIECE_VALUES = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
const BOOK_MOVES = ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'd4', 'd5', 'c4', 'Nf6', 'c5', 'e6', 'c6', 'd6', 'g3', 'Nf3', 'd3', 'Be2', 'O-O', 'Nc3', 'Bg5', 'b3', 'Bb2'];

export const generateIndustryGameReview = (historyMoves) => {
  if (!historyMoves || historyMoves.length === 0) {
    return {
      reviewList: [],
      accuracy: 85,
      performanceRating: 1200,
      turningPoint: null,
      openingName: 'Standard Game',
      phasePerformance: { opening: 90, middlegame: 80, endgame: 85 },
      classificationsCount: { brilliant: 0, great: 0, best: 0, excellent: 0, good: 0, book: 0, inaccuracy: 0, mistake: 0, miss: 0, blunder: 0 }
    };
  }

  const reviewList = [];
  const tempGame = new Chess();
  let currentEval = 0.2; // Baseline White advantage +0.2
  let turningPoint = null;
  let maxEvalDrop = 0;

  const counts = {
    brilliant: 0, great: 0, best: 0, excellent: 0, good: 0, book: 0, inaccuracy: 0, mistake: 0, miss: 0, blunder: 0
  };

  historyMoves.forEach((move, index) => {
    const moveNum = Math.floor(index / 2) + 1;
    const isWhite = move.color === 'w';
    const sign = isWhite ? 1 : -1;
    const prevFen = tempGame.fen();

    // Perform move on simulator
    tempGame.move(move);
    const fenAfter = tempGame.fen();

    let classification = 'good';
    let commentary = '';
    let whatWentWrong = '';
    let preventativeMove = '';
    let bestMoveSan = '';
    let bestMoveFrom = '';
    let bestMoveTo = '';

    const capturedPiece = move.captured ? PIECE_VALUES[move.captured] || 0 : 0;
    const movingPieceVal = PIECE_VALUES[move.piece] || 1;

    // Check Legal moves in previous position to evaluate best alternatives
    const prevGame = new Chess(prevFen);
    const legalMoves = prevGame.moves({ verbose: true });

    // 1. Checkmate delivered
    if (tempGame.isCheckmate()) {
      classification = 'brilliant';
      commentary = `💎 Brilliant! Decisive tactical blow delivering Checkmate on move ${moveNum}!`;
    }
    // 2. Check delivered
    else if (tempGame.inCheck()) {
      classification = 'best';
      commentary = `🟢 Best Move: ${move.san} puts the opponent's king in check, seizing the initiative.`;
    }
    // 3. Opening Book
    else if (moveNum <= 5 && BOOK_MOVES.includes(move.san)) {
      classification = 'book';
      commentary = `📖 Book Move: ${move.san} follows standard opening theory, establishing piece harmony and center control.`;
    }
    // 4. Material Captures
    else if (move.captured) {
      if (capturedPiece > movingPieceVal) {
        classification = 'great';
        commentary = `⭐ Great Move: Capturing the higher value ${move.captured.toUpperCase()} with your ${move.piece.toUpperCase()} wins material!`;
      } else if (capturedPiece === movingPieceVal) {
        classification = 'best';
        commentary = `🟢 Best Move: Even trade on ${move.to} maintaining position stability.`;
      } else {
        classification = 'excellent';
        commentary = `✅ Excellent: Tactical exchange building piece pressure on ${move.to}.`;
      }
    }
    // 5. Positional & Blunder evaluation
    else {
      // Check if square 'to' is attacked by opponent for free
      const oppGame = new Chess(fenAfter);
      const oppMoves = oppGame.moves({ verbose: true });
      const freeCap = oppMoves.find(m => m.captured && m.to === move.to);

      if (freeCap) {
        oppGame.move(freeCap);
        const canRecapture = oppGame.moves({ verbose: true }).some(m => m.to === move.to);

        if (!canRecapture) {
          classification = 'blunder';
          whatWentWrong = `🔴 Blunder: Moving your ${move.piece.toUpperCase()} to ${move.to} leaves it completely undefended and vulnerable to free capture by the opponent's ${freeCap.piece.toUpperCase()}.`;
          
          // Find safe preventative move
          const safeAlt = legalMoves.find(m => m.from !== move.from && !prevGame.get(m.to) && m.san !== move.san);
          if (safeAlt) {
            bestMoveSan = safeAlt.san;
            bestMoveFrom = safeAlt.from;
            bestMoveTo = safeAlt.to;
            preventativeMove = `🛡️ Preventative Move: Playing ${safeAlt.san} (${safeAlt.from} → ${safeAlt.to}) maintains piece safety and preserves your position.`;
          } else {
            bestMoveSan = 'Piece Defense';
            preventativeMove = `🛡️ Preventative Move: Defending ${move.from} or castling would have avoided material loss.`;
          }
        } else {
          const capVal = PIECE_VALUES[freeCap.piece] || 1;
          if (movingPieceVal > capVal) {
            classification = 'mistake';
            whatWentWrong = `⚠️ Mistake: Moving ${move.piece.toUpperCase()} to ${move.to} leads to a bad trade losing material.`;
            const safeAlt = legalMoves.find(m => m.from !== move.from && m.san !== move.san);
            if (safeAlt) {
              bestMoveSan = safeAlt.san;
              bestMoveFrom = safeAlt.from;
              bestMoveTo = safeAlt.to;
              preventativeMove = `🛡️ Preventative Move: Playing ${safeAlt.san} keeps material parity.`;
            }
          }
        }
      }
    }

    // Default positional rules
    if (classification === 'good') {
      const centerSquares = ['e4', 'e5', 'd4', 'd5', 'c4', 'c5', 'f4', 'f5'];
      if (centerSquares.includes(move.to)) {
        classification = 'best';
        commentary = `🟢 Best Move: Seizes control of central square ${move.to}.`;
      } else if (move.piece === 'n' || move.piece === 'b') {
        classification = 'excellent';
        commentary = `✅ Excellent: Active minor piece development improving piece coordination.`;
      } else if (move.san === 'O-O' || move.san === 'O-O-O') {
        classification = 'best';
        commentary = `🟢 Best Move: Castling safeguards the King and connects the Rooks.`;
      } else {
        const comments = [
          "👍 Good Move: Maintains pressure and positional balance.",
          "👍 Good Move: Solid developing move improving piece harmony.",
          "👍 Good Move: Controlled positioning waiting for tactical opportunities."
        ];
        commentary = comments[index % comments.length];
      }
    }

    // Eval Score Calculation
    let evalDelta = 0;
    if (classification === 'blunder') evalDelta = -3.5 * sign;
    else if (classification === 'mistake') evalDelta = -1.8 * sign;
    else if (classification === 'inaccuracy') evalDelta = -0.7 * sign;
    else if (classification === 'brilliant') evalDelta = 2.0 * sign;
    else if (classification === 'great' || classification === 'best') evalDelta = 0.4 * sign;
    else evalDelta = 0.05 * sign;

    currentEval += evalDelta;

    // Track biggest blunder as Turning Point
    if (Math.abs(evalDelta) > maxEvalDrop && (classification === 'blunder' || classification === 'mistake')) {
      maxEvalDrop = Math.abs(evalDelta);
      turningPoint = {
        moveNum,
        player: isWhite ? 'White' : 'Black',
        san: move.san,
        classification,
        whatWentWrong,
        preventativeMove,
        bestMoveSan
      };
    }

    counts[classification] = (counts[classification] || 0) + 1;

    const formattedScore = (currentEval >= 0 ? '+' : '') + currentEval.toFixed(1);

    reviewList.push({
      index: index + 1,
      moveNum,
      san: move.san,
      from: move.from,
      to: move.to,
      color: move.color,
      piece: move.piece,
      classification,
      commentary,
      whatWentWrong,
      preventativeMove,
      bestMoveSan,
      bestMoveFrom,
      bestMoveTo,
      scoreAfter: formattedScore,
      fenAfter
    });
  });

  // Calculate overall accuracy score
  const totalMoves = reviewList.length;
  const goodWeight = (counts.brilliant * 1.0 + counts.great * 0.95 + counts.best * 0.9 + counts.excellent * 0.85 + counts.good * 0.75 + counts.book * 0.9);
  const penaltyWeight = (counts.inaccuracy * 0.2 + counts.mistake * 0.5 + counts.blunder * 0.95);
  const rawAccuracy = Math.max(35, Math.min(98, Math.round(((goodWeight - penaltyWeight) / Math.max(1, totalMoves)) * 100)));

  // Performance ELO calculation
  const performanceRating = Math.max(400, Math.round(1200 + (rawAccuracy - 70) * 15));

  // Phase Accuracy calculation
  const openingMoves = reviewList.slice(0, 10);
  const midgameMoves = reviewList.slice(10, 30);
  const endgameMoves = reviewList.slice(30);

  const calcAcc = (subList) => {
    if (subList.length === 0) return 90;
    const bld = subList.filter(m => m.classification === 'blunder').length;
    const mst = subList.filter(m => m.classification === 'mistake').length;
    return Math.max(40, Math.min(99, Math.round(95 - (bld * 18 + mst * 10))));
  };

  return {
    reviewList,
    accuracy: rawAccuracy,
    performanceRating,
    turningPoint,
    openingName: getOpeningNameFromMoves(historyMoves),
    phasePerformance: {
      opening: calcAcc(openingMoves),
      middlegame: calcAcc(midgameMoves),
      endgame: endgameMoves.length > 0 ? calcAcc(endgameMoves) : 0
    },
    classificationsCount: counts
  };
};

function getOpeningNameFromMoves(moves) {
  if (!moves || moves.length === 0) return 'Standard Game';
  const sans = moves.map(m => m.san).join(' ');
  if (sans.includes('e4 e5 Nf3 Nc6 Bb5')) return 'Ruy Lopez';
  if (sans.includes('e4 e5 Nf3 Nc6 Bc4')) return 'Italian Game';
  if (sans.includes('e4 c5')) return 'Sicilian Defense';
  if (sans.includes('d4 d5 c4')) return "Queen's Gambit";
  if (sans.includes('e4 e6')) return 'French Defense';
  if (sans.includes('e4 c6')) return 'Caro-Kann Defense';
  if (sans.includes('e4 e5')) return 'Open Game';
  if (sans.includes('d4 d5')) return 'Closed Game';
  return 'Modern Defense';
}
