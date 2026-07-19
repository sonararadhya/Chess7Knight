import math
import chess

def score_to_cp(score, turn):
    """Convert a chess.engine.Score to centipawn value from the moving player's perspective.
    Mate score is converted to a large CP value.
    """
    if score is None:
        return 0
        
    pov_score = score.pov(turn)
    if pov_score.is_mate():
        mate_moves = pov_score.mate()
        if mate_moves > 0:
            # Player has mate
            return max(3000, 10000 - mate_moves * 100)
        else:
            # Player is being mated
            return min(-3000, -10000 - mate_moves * 100)
            
    return pov_score.score(default=0)

def cp_to_win_prob(cp):
    """Convert centipawn score to win probability using Chess.com's erf-based formula.
    Win probability ranges from 0.0 to 1.0.
    """
    return 0.5 + 0.5 * math.erf(cp / (290.0 * math.sqrt(2)))

def calculate_move_accuracy(best_score, played_score, turn):
    """Calculate the accuracy (0 to 100) of a played move compared to the best engine move.
    
    Accuracy = 100 * (1.0 - (prob_best - prob_played))
    """
    cp_best = score_to_cp(best_score, turn)
    cp_played = score_to_cp(played_score, turn)
    
    prob_best = cp_to_win_prob(cp_best)
    prob_played = cp_to_win_prob(cp_played)
    
    # Accuracy shouldn't exceed 100%
    prob_diff = max(0.0, prob_best - prob_played)
    
    # We can apply a scaling factor to make it feel like Chess.com's accuracy
    # Chess.com is slightly more forgiving for minor mistakes.
    # Let's use accuracy = 100 * (1 - prob_diff^2) or a scaled linear version.
    # Accuracy = 100 * (1.0 - prob_diff) is good, but 100 * (1.0 - prob_diff) can be penalizing.
    # A standard formula is accuracy = 100 * (1.0 - prob_diff)
    # Let's use:
    accuracy = 100.0 * (1.0 - prob_diff)
    return max(0.0, min(100.0, accuracy))

def calculate_cpl(best_score, played_score, turn):
    """Calculate Centipawn Loss (CPL) for a move."""
    cp_best = score_to_cp(best_score, turn)
    cp_played = score_to_cp(played_score, turn)
    return max(0, cp_best - cp_played)

def calculate_game_accuracies(move_details):
    """Calculate game-wide accuracies and stats for White and Black.
    
    move_details is a list of dicts containing:
    - 'turn': chess.WHITE/chess.BLACK
    - 'accuracy': float (0-100)
    - 'cpl': float
    """
    white_accs = []
    black_accs = []
    white_cpl = []
    black_cpl = []
    
    for move in move_details:
        # Move detail represents the played move.
        acc = move.get("accuracy", 100.0)
        cpl = move.get("cpl", 0)
        
        # Note: chess.WHITE is True, chess.BLACK is False.
        # But wait! The turn is of the player WHO MADE THE MOVE.
        # The turn field in move_details should represent who made the move.
        if move["turn"] == chess.WHITE:
            white_accs.append(acc)
            white_cpl.append(cpl)
        else:
            black_accs.append(acc)
            black_cpl.append(cpl)
            
    white_avg_acc = sum(white_accs) / len(white_accs) if white_accs else 100.0
    black_avg_acc = sum(black_accs) / len(black_accs) if black_accs else 100.0
    
    white_avg_cpl = sum(white_cpl) / len(white_cpl) if white_cpl else 0.0
    black_avg_cpl = sum(black_cpl) / len(black_cpl) if black_cpl else 0.0
    
    total_accs = white_accs + black_accs
    game_avg_acc = sum(total_accs) / len(total_accs) if total_accs else 100.0
    
    total_cpl = white_cpl + black_cpl
    game_avg_cpl = sum(total_cpl) / len(total_cpl) if total_cpl else 0.0
    
    return {
        "white_accuracy": round(white_avg_acc, 1),
        "black_accuracy": round(black_avg_acc, 1),
        "game_accuracy": round(game_avg_acc, 1),
        "white_cpl": round(white_avg_cpl, 1),
        "black_cpl": round(black_avg_cpl, 1),
        "game_cpl": round(game_avg_cpl, 1)
    }
