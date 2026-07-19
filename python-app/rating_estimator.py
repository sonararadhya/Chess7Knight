import math
import chess

def calculate_std_dev(values):
    if not values:
        return 0.0
    mean = sum(values) / len(values)
    variance = sum((x - mean) ** 2 for x in values) / len(values)
    return math.sqrt(variance)

def estimate_player_rating(move_details, player_color):
    """Estimate a player's rating based on their moves in the game.
    
    move_details: list of dicts for all moves in the game.
    Each dict contains:
        - 'turn': chess.WHITE/chess.BLACK (who played it)
        - 'accuracy': float (0-100)
        - 'cpl': float
        - 'classification': string
        - 'time_used': float (optional)
        - 'is_endgame': bool
    """
    player_moves = [m for m in move_details if m["turn"] == player_color]
    num_moves = len(player_moves)
    
    if num_moves == 0:
        return 1200, 150, "No moves played.", 50

    accuracies = [m["accuracy"] for m in player_moves]
    cpls = [m["cpl"] for m in player_moves]
    
    avg_accuracy = sum(accuracies) / num_moves
    avg_cpl = sum(cpls) / num_moves
    std_dev_acc = calculate_std_dev(accuracies)
    
    # Classification counts
    counts = {
        "Brilliant": 0, "Great": 0, "Best": 0, "Excellent": 0, "Good": 0,
        "Book": 0, "Forced": 0, "Inaccuracy": 0, "Mistake": 0, "Blunder": 0,
        "Missed Win": 0, "Missed Draw": 0, "Only Move": 0
    }
    for m in player_moves:
        cls = m.get("classification", "Good")
        counts[cls] = counts.get(cls, 0) + 1
        
    blunder_freq = counts["Blunder"] / num_moves
    mistake_freq = counts["Mistake"] / num_moves
    inaccuracy_freq = counts["Inaccuracy"] / num_moves
    book_freq = counts["Book"] / num_moves
    
    # Base rating calculation
    # Linear scale based on accuracy
    rating = 1000 + (avg_accuracy - 55) * 28.0
    
    # Centipawn loss adjustments
    # High CPL reduces rating
    rating -= avg_cpl * 2.2
    
    # Blunder and mistake penalties
    rating -= blunder_freq * 600.0
    rating -= mistake_freq * 250.0
    rating -= inaccuracy_freq * 60.0
    
    # Opening book bonus (knowledge of theory)
    rating += book_freq * 120.0
    
    # Tactical precision: check if they found Brilliant/Great/Best moves
    tactical_hits = counts["Brilliant"] + counts["Great"] + counts["Only Move"]
    rating += (tactical_hits / num_moves) * 300.0
    
    # Cap rating between 100 and 2800 ELO
    rating = max(100.0, min(2800.0, rating))
    
    # Consistency adjustment (StDev of accuracy)
    # High StDev means inconsistent play. Let's make it affect error margins.
    
    # Confidence Score: 0 to 100
    # More moves means higher confidence.
    confidence = min(95, int(30 + 1.8 * num_moves))
    
    # Rating range/error (e.g. ±80)
    rating_error = int(max(40, 220 - 3.5 * num_moves + std_dev_acc * 0.5))
    
    # Explanation generation
    reasons = []
    if avg_accuracy >= 85:
        reasons.append(f"played with high precision (accuracy: {avg_accuracy:.1f}%)")
    elif avg_accuracy >= 70:
        reasons.append(f"showed solid fundamental play (accuracy: {avg_accuracy:.1f}%)")
    else:
        reasons.append(f"made several inconsistencies (accuracy: {avg_accuracy:.1f}%)")
        
    if counts["Blunder"] > 0:
        reasons.append(f"committed {counts['Blunder']} blunder(s)")
    if counts["Brilliant"] > 0:
        reasons.append(f"found {counts['Brilliant']} brilliant sacrifice(s)")
    if counts["Book"] >= 3:
        reasons.append("demonstrated good opening knowledge")
        
    explanation = f"Player played at a {int(rating)} strength. They " + ", ".join(reasons) + "."
    
    return int(rating), rating_error, explanation, confidence

def estimate_bot_rating(move_details, bot_color, level_idx, depth, skill_level, multipv):
    """Estimate the bot's rating using bot configuration and actual move performance.
    
    level_idx: 0 to 10 index of bot difficulty
    depth: stockfish depth
    skill_level: stockfish skill level
    multipv: stockfish multipv
    """
    # Difficulty menu ELOs
    base_elos = [400, 750, 950, 1050, 1250, 1350, 1450, 1550, 1650, 1850, 1950]
    config_elo = base_elos[level_idx] if level_idx < len(base_elos) else 1500
    
    bot_moves = [m for m in move_details if m["turn"] == bot_color]
    if not bot_moves:
        return config_elo, 60, "Configured difficulty settings.", 90
        
    # Calculate performance rating
    perf_rating, error, explanation, confidence = estimate_player_rating(move_details, bot_color)
    
    # Combine: 40% configured rating + 60% actual game performance rating
    final_rating = int(config_elo * 0.4 + perf_rating * 0.6)
    
    # Adjust error based on settings
    final_error = int(error * 0.8)
    
    # Reason explanation
    reason = f"Bot was set to Level {level_idx+1} ({config_elo} ELO) at depth {depth} and skill level {skill_level}."
    reason += f" They played at a performance ELO of {perf_rating}."
    
    return final_rating, final_error, reason, confidence
