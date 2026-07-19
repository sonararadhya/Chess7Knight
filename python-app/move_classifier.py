import chess
import math
from accuracy import score_to_cp

# Simple opening database mapping move sequences to opening names.
# This helps identify Book moves and the name of the opening.
OPENING_BOOK = {
    # e4 openings
    ("e2e4", "e7e5"): "Open Game",
    ("e2e4", "e7e5", "g1f3", "b8c6", "f1b5"): "Ruy Lopez",
    ("e2e4", "e7e5", "g1f3", "b8c6", "f1c4"): "Italian Game",
    ("e2e4", "e7e5", "g1f3", "d8f6"): "Greco Defense",
    ("e2e4", "e7e5", "f2f4"): "King's Gambit",
    ("e2e4", "c7c5"): "Sicilian Defense",
    ("e2e4", "c7c5", "g1f3", "d7d6", "d2d4", "c5d4", "f3d4", "g8f6", "b8c3"): "Sicilian Defense: Open",
    ("e2e4", "e7e6"): "French Defense",
    ("e2e4", "c7c6"): "Caro-Kann Defense",
    ("e2e4", "d7d5"): "Scandinavian Defense",
    ("e2e4", "g7g6"): "Modern Defense",
    ("e2e4", "d7d6"): "Pirc Defense",
    ("e2e4", "g8f6"): "Alekhine's Defense",
    # d4 openings
    ("d2d4", "d7d5"): "Closed Game",
    ("d2d4", "d7d5", "c2c4"): "Queen's Gambit",
    ("d2d4", "d7d5", "c2c4", "e7e6"): "Queen's Gambit Declined",
    ("d2d4", "d7d5", "c2c4", "c7c6"): "Slav Defense",
    ("d2d4", "g8f6"): "Indian Defense",
    ("d2d4", "g8f6", "c2c4", "g7g6"): "King's Indian Defense",
    ("d2d4", "g8f6", "c2c4", "e7e6", "g1f3"): "Queen's Indian Defense",
    ("d2d4", "g8f6", "c2c4", "e7e6", "b8c3", "f1b4"): "Nimzo-Indian Defense",
    ("d2d4", "f7f5"): "Dutch Defense",
    # Other openings
    ("c2c4",): "English Opening",
    ("g1f3",): "Reti Opening",
    ("f2f4",): "Bird's Opening",
    ("g2g3",): "Benko Opening",
    ("b2b3",): "Nimzowitsch-Larsen Attack",
}

PIECE_VALUES = {
    chess.PAWN: 100,
    chess.KNIGHT: 300,
    chess.BISHOP: 300,
    chess.ROOK: 500,
    chess.QUEEN: 900,
    chess.KING: 20000
}

def get_material_value(board, color):
    """Calculate the total material value on the board for a given color."""
    val = 0
    for pt in [chess.PAWN, chess.KNIGHT, chess.BISHOP, chess.ROOK, chess.QUEEN]:
        val += len(board.pieces(pt, color)) * PIECE_VALUES[pt]
    return val

def get_material_difference(board):
    """Return material difference from White's perspective (White - Black)."""
    return get_material_value(board, chess.WHITE) - get_material_value(board, chess.BLACK)

def is_sacrifice(board, move, played_score, best_score, turn):
    """Check if the move is a piece sacrifice.
    
    A sacrifice is defined as moving a piece to a square where it can be captured
    or capturing a piece of lower value, resulting in a material loss, but the
    positional evaluation remains good/winning.
    """
    # Create board copy before the move
    temp_board = board.copy()
    
    # Material count before move
    my_mat_before = get_material_value(temp_board, turn)
    opp_mat_before = get_material_value(temp_board, not turn)
    
    # Let's see what piece is moved
    moved_piece = temp_board.piece_at(move.from_square)
    if not moved_piece:
        return False
        
    captured_piece = temp_board.piece_at(move.to_square)
    
    # Push the move
    temp_board.push(move)
    
    # Simple check: did we move a piece to an attacked square?
    # And the piece has a value higher than what we captured (if any)?
    is_attacked = temp_board.is_attacked_by(not turn, move.to_square)
    
    val_moved = PIECE_VALUES[moved_piece.piece_type]
    val_captured = PIECE_VALUES[captured_piece.piece_type] if captured_piece else 0
    
    # If we put a higher value piece in danger or gave it up
    material_given = val_moved - val_captured
    
    # If the score is still very good (e.g. played_score >= best_score - 50 or played_score > 100)
    cp_played = score_to_cp(played_score, turn)
    
    # A sacrifice requires giving up a Knight, Bishop, Rook, or Queen, or sometimes a Pawn
    if is_attacked and material_given > 100 and cp_played > -100:
        return True
        
    return False

def is_passed_pawn(board, square, color):
    file = chess.square_file(square)
    rank = chess.square_rank(square)
    opp_pawns = board.pieces(chess.PAWN, not color)
    for opp_sq in opp_pawns:
        opp_file = chess.square_file(opp_sq)
        opp_rank = chess.square_rank(opp_sq)
        if abs(opp_file - file) <= 1:
            if color == chess.WHITE and opp_rank > rank:
                return False
            if color == chess.BLACK and opp_rank < rank:
                return False
    return True

def get_opening_name(move_history_uci):
    """Determine the opening name from the move history (list of UCI strings)."""
    longest_match = "Unknown Opening"
    longest_len = 0
    
    # Check prefixes
    for moves, name in OPENING_BOOK.items():
        match = True
        if len(moves) > len(move_history_uci):
            continue
            
        for i in range(len(moves)):
            if move_history_uci[i] != moves[i]:
                match = False
                break
                
        if match and len(moves) > longest_len:
            longest_len = len(moves)
            longest_match = name
            
    return longest_match

def classify_move(board, move, analysis_results, played_idx, turn, uci_history):
    """Classify a move using engine analysis and position context.
    
    analysis_results: list of dicts from StockfishWrapper (MultiPV)
    played_idx: index of the played move in the analysis_results, or None if not in top lines.
    turn: chess.WHITE or chess.BLACK
    uci_history: list of UCI strings of moves played leading up to this move (including this move).
    """
    # 1. Book Move Check
    # If the move history matches an opening prefix, classify as Book.
    history_tuple = tuple(uci_history)
    for moves in OPENING_BOOK.keys():
        if len(history_tuple) <= len(moves) and moves[:len(history_tuple)] == history_tuple:
            return "Book"

    # Legal moves count
    legal_count = board.legal_moves.count()
    if legal_count == 1:
        return "Forced"

    # Best move from engine
    best_item = analysis_results[0]
    best_move = best_item["move"]
    best_score = best_item["score"]
    
    # Played move item
    played_item = None
    if played_idx is not None and played_idx < len(analysis_results):
        played_item = analysis_results[played_idx]
    
    # Calculate evaluations
    cp_best = score_to_cp(best_score, turn)
    
    # If the played move was not analyzed (not in MultiPV), we calculate its evaluation.
    # We will assume its evaluation is lower.
    # Note: caller will make sure the played move is analyzed, but in case it's not:
    if played_item:
        played_score = played_item["score"]
    else:
        # Played move was very bad, worse than the worst MultiPV
        played_score = analysis_results[-1]["score"]
        
    cp_played = score_to_cp(played_score, turn)
    cpl = max(0, cp_best - cp_played)
    
    # Check if this was the ONLY move that isn't a blunder/mistake
    is_only_move = False
    if len(analysis_results) > 1:
        second_best_score = analysis_results[1]["score"]
        cp_second = score_to_cp(second_best_score, turn)
        # If the best move is > 180 centipawns better than the second best, it is the only move!
        if (cp_best - cp_second) >= 180:
            is_only_move = True

    # Sacrifice detection
    is_sac = is_sacrifice(board, move, played_score, best_score, turn)

    # 2. Brilliant Move
    # A sacrifice that is either the best move or an excellent move (low CPL)
    if is_sac and cpl <= 30:
        return "Brilliant"

    # 3. Great Move
    # A move that is a sacrifice with low CPL, or the ONLY move in a critical situation
    # or a move that saves the game or finds a checkmate.
    if is_sac and cpl <= 80:
        return "Great"
        
    if is_only_move and move == best_move and cpl <= 10:
        # Only move played correctly
        return "Only Move"

    # 4. Missed Win / Missed Draw
    # If played move is a blunder/mistake and best move is a win or draw
    # Let's say a win is evaluation >= +250, draw is between -150 and +150
    if cpl >= 150:
        # Best move was a win (cp_best >= 250) but played move dropped it below 100
        if cp_best >= 250 and cp_played < 100:
            return "Missed Win"
        # Best move was a draw (cp_best >= -100) but played move dropped it to a loss (cp_played < -250)
        if cp_best >= -100 and cp_played < -250:
            return "Missed Draw"

    # 5. Best Move
    if move == best_move:
        return "Best"

    # 6. Excellent Move
    if cpl <= 30:
        return "Excellent"

    # 7. Good Move
    if cpl <= 75:
        return "Good"

    # 8. Inaccuracy
    if cpl <= 150:
        return "Inaccuracy"

    # 9. Mistake
    if cpl <= 300:
        return "Mistake"

    # 10. Blunder
    return "Blunder"
