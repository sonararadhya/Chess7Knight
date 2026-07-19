import threading
import chess
import chess.engine
import math
from stockfish_wrapper import StockfishWrapper
from analysis_cache import AnalysisCache
from move_classifier import classify_move, get_opening_name, get_material_difference, is_passed_pawn
from accuracy import calculate_move_accuracy, calculate_cpl, calculate_game_accuracies
from rating_estimator import estimate_player_rating, estimate_bot_rating

def detect_discovered_attacks(board_before, move):
    """Detect if the move created a discovered attack."""
    board_after = board_before.copy()
    board_after.push(move)
    
    turn = board_before.turn
    moving_sq = move.from_square
    
    # Rooks, Bishops, Queens that didn't move
    for sq in chess.SQUARES:
        if sq == move.to_square:
            continue
        p = board_before.piece_at(sq)
        if p and p.color == turn and p.piece_type in [chess.ROOK, chess.BISHOP, chess.QUEEN]:
            # Was it attacking any opponent piece before?
            opponents_before = set()
            for target_sq in board_before.attacks(sq):
                target_p = board_before.piece_at(target_sq)
                if target_p and target_p.color != turn:
                    opponents_before.add(target_sq)
                    
            # Is it attacking any opponent piece now?
            opponents_after = set()
            for target_sq in board_after.attacks(sq):
                target_p = board_after.piece_at(target_sq)
                if target_p and target_p.color != turn:
                    opponents_after.add(target_sq)
                    
            # If there's a new attack on an opponent piece of value
            new_attacks = opponents_after - opponents_before
            if new_attacks:
                # Discovered attack!
                return True
    return False

def get_forks(board, turn):
    """Get all squares where a fork is created by turn color."""
    forks = []
    for sq in chess.SQUARES:
        p = board.piece_at(sq)
        if p and p.color == turn:
            # How many opponent pieces does this piece attack?
            attacked_valuable = 0
            for target_sq in board.attacks(sq):
                target_p = board.piece_at(target_sq)
                if target_p and target_p.color != turn:
                    # Is it defended?
                    is_defended = board.is_attacked_by(not turn, target_sq)
                    # If target is undefended OR has higher value than attacker
                    if not is_defended or target_p.piece_type > p.piece_type:
                        attacked_valuable += 1
            if attacked_valuable >= 2:
                forks.append(sq)
    return forks

def get_pins(board, turn):
    """Get all squares containing pinned pieces of color turn."""
    pins = []
    for sq in chess.SQUARES:
        p = board.piece_at(sq)
        if p and p.color == turn:
            if board.is_pinned(turn, sq):
                pins.append(sq)
    return pins

def get_hanging_pieces(board, turn):
    """Get all squares with hanging pieces of color turn."""
    hanging = []
    for sq in chess.SQUARES:
        p = board.piece_at(sq)
        if p and p.color == turn:
            # Attacked by opponent?
            is_attacked = board.is_attacked_by(not turn, sq)
            # Defended by self?
            is_defended = board.is_attacked_by(turn, sq)
            if is_attacked and not is_defended:
                hanging.append(sq)
    return hanging

def generate_move_explanation(board_before, move, classification, played_score, best_score, best_move):
    """Generate a specific, position-aware human explanation for the move."""
    turn = board_before.turn
    piece = board_before.piece_at(move.from_square)
    pname = "piece"
    if piece:
        pnames = {
            chess.PAWN: "pawn", chess.KNIGHT: "knight", chess.BISHOP: "bishop",
            chess.ROOK: "rook", chess.QUEEN: "queen", chess.KING: "king"
        }
        pname = pnames.get(piece.piece_type, "piece")

    is_cap = board_before.is_capture(move)
    cap_piece = board_before.piece_at(move.to_square)
    cname = "piece"
    if cap_piece:
        cnames = {
            chess.PAWN: "pawn", chess.KNIGHT: "knight", chess.BISHOP: "bishop",
            chess.ROOK: "rook", chess.QUEEN: "queen"
        }
        cname = cnames.get(cap_piece.piece_type, "piece")
        
    board_after = board_before.copy()
    board_after.push(move)
    
    # Mate score conversions
    def is_mate_in_n(score):
        if score and score.pov(turn).is_mate():
            return score.pov(turn).mate()
        return None

    mate_played = is_mate_in_n(played_score)
    mate_best = is_mate_in_n(best_score)

    if classification == "Book":
        return f"This is a theoretical book move. You are developing your {pname} and fighting for central space."
    if classification == "Forced":
        return "This is a forced move, as you had no other legal squares to escape check or threats."
    if board_before.is_castling(move):
        return "This castles your king to safety and activates your rook along the back rank."
    if move.promotion:
        return "This promotes your passed pawn, creating a powerful new queen."

    # Blunder/Mistake specific analysis
    if classification in ["Blunder", "Mistake"]:
        if mate_best is not None and mate_best > 0 and (mate_played is None or mate_played < 0):
            return f"A severe error. This misses a forced checkmate in {mate_best} moves."
        if is_cap:
            return f"You captured the opponent's {cname}, but this allows a counter-tactic that loses major material."
        # Check if we hung a piece
        hanging_after = get_hanging_pieces(board_after, turn)
        if move.to_square in hanging_after:
            return f"This blunder moves your {pname} to an undefended square, hanging it."
        # Did we allow a fork?
        forks_opp = get_forks(board_after, not turn)
        if forks_opp:
            return "This allows your opponent to fork your pieces, winning material."
        # General blunder explanation
        return f"This move severely weakens your position and allows your opponent to gain a large advantage."

    # Brilliant/Great explanation
    if classification in ["Brilliant", "Great"]:
        if mate_played is not None and mate_played > 0:
            return f"Outstanding play! This starts a forced mating sequence in {mate_played} moves."
        # If it was a sacrifice
        return "A brilliant sacrifice! You gave up material to unlock a winning tactical continuation."

    # Missed win explanation
    if classification == "Missed Win":
        if mate_best is not None and mate_best > 0:
            return f"This misses a forced checkmate in {mate_best} moves. You had a direct path to victory."
        return "This misses a critical opportunity to win material or secure a completely winning advantage."

    # Only move explanation
    if classification == "Only Move":
        return "This was the only move on the board that maintains equality and keeps you in the game."

    # Tactical creations
    if board_after.is_check():
        return f"This develops the {pname} with check, forcing the opponent's king to respond."
        
    discovered = detect_discovered_attacks(board_before, move)
    if discovered:
        return f"This moves the {pname} to unleash a discovered attack from your long-range pieces."
        
    forks_self = get_forks(board_after, turn)
    if move.to_square in forks_self:
        return f"This beautiful move forks your opponent's pieces, creating multiple threats."
        
    pins_created = get_pins(board_after, not turn)
    if pins_created:
        # Check if we pinned something
        for sq in pins_created:
            if board_after.is_attacked_by(turn, sq):
                pinned_p = board_after.piece_at(sq)
                pinned_name = "piece"
                if pinned_p:
                    pinned_name = cnames.get(pinned_p.piece_type, "piece")
                return f"This pins the opponent's {pinned_name}, rendering it immobile."

    # Capture explanation
    if is_cap:
        # Check if captured piece was hanging
        hanging_before = get_hanging_pieces(board_before, not turn)
        if move.to_square in hanging_before:
            return f"You win a hanging {cname} for free, increasing your material advantage."
        return f"This trade captures the opponent's {cname}."

    # Developing/Positional moves
    if move.from_square in [chess.G1, chess.B1, chess.G8, chess.B8] and piece and piece.piece_type in [chess.KNIGHT, chess.BISHOP]:
        return f"This develops your {pname} off the starting rank to control key squares in the center."
    
    # Passed pawn push
    if piece and piece.piece_type == chess.PAWN:
        if is_passed_pawn(board_after, move.to_square, turn):
            return "This pushes a passed pawn, creating a dangerous threat that must be blocked."

    # Default
    return f"This repositions your {pname} to a more active square, improving your positional layout."

class GameReviewEngine:
    def __init__(self, move_history, initial_fen=None, bot_level_idx=6, stockfish_depth=15):
        self.move_history = move_history
        self.initial_fen = initial_fen
        self.bot_level_idx = bot_level_idx
        self.depth = stockfish_depth
        
        self.cache = AnalysisCache()
        self.completed_moves = 0
        self.total_moves = len(move_history)
        
        self.review_details = []
        self.summary = {}
        
        self.is_running = False
        self.is_complete = False
        self.thread = None
        self._stop_event = threading.Event()

    def start_analysis(self, threads=2, hash_size=64):
        self.is_running = True
        self.is_complete = False
        self.completed_moves = 0
        self.review_details = []
        self._stop_event.clear()
        
        self.thread = threading.Thread(
            target=self._run_analysis_thread,
            args=(threads, hash_size),
            daemon=True
        )
        self.thread.start()

    def stop_analysis(self):
        self._stop_event.set()
        self.is_running = False

    def _run_analysis_thread(self, threads, hash_size):
        # 1. Start a local Stockfish instance
        try:
            sf = StockfishWrapper(threads=threads, hash_size=hash_size, multipv=3)
            sf.start()
        except Exception as e:
            print(f"Engine failed to start in review thread: {e}")
            self.is_running = False
            return
            
        board = chess.Board(self.initial_fen) if self.initial_fen else chess.Board()
        
        # Keep track of UCI moves for opening detection
        uci_history = []
        
        # Pre-analyze the initial board position
        initial_board = board.copy()
        init_epd = initial_board.epd()
        init_analysis = self.cache.get(initial_board)
        if not init_analysis:
            init_analysis = sf.analyze_position(initial_board.fen(), depth=self.depth)
            self.cache.set(initial_board, init_analysis)
            
        # Initial score
        prev_eval = init_analysis[0]["score"]
        
        # Step through every move
        for i, move in enumerate(self.move_history):
            if self._stop_event.is_set():
                break
                
            turn = board.turn
            san = board.san(move)
            uci = move.uci()
            uci_history.append(uci)
            
            # Position *before* the move is played
            board_before = board.copy()
            
            # Push the move
            board.push(move)
            
            # Check if this position is in cache
            post_analysis = self.cache.get(board)
            if not post_analysis:
                post_analysis = sf.analyze_position(board.fen(), depth=self.depth)
                self.cache.set(board, post_analysis)
                
            # If the board is checkmate / game over, Stockfish might return empty
            if not post_analysis:
                # Fill dummy mate evaluation
                mate_score = chess.engine.PovScore(chess.engine.Mate(0), chess.WHITE)
                post_analysis = [{"move": None, "score": mate_score, "pv": [], "depth": self.depth}]
                
            # Find the played move evaluation.
            # We look at post_analysis which shows the evaluation of the board AFTER the move.
            # But wait! To classify a move, we need to know the evaluation of the board BEFORE the move,
            # and what the best move was in the BEFORE position.
            
            # The evaluation of the BEFORE position is what we analyzed in the previous step.
            # Let's get the analysis of board_before.
            before_analysis = self.cache.get(board_before)
            if not before_analysis:
                before_analysis = sf.analyze_position(board_before.fen(), depth=self.depth)
                self.cache.set(board_before, before_analysis)
                
            # Best move in the before position
            best_item = before_analysis[0]
            best_move = best_item["move"]
            best_score = best_item["score"]
            best_pv = best_item["pv"]
            
            # Played move evaluation.
            # How does python-chess score look?
            # It's evaluated relative to the side whose turn it is in the post position.
            # To get the score of the played move from the perspective of the player who made it:
            # We can use post_analysis[0]['score'], which is the evaluation of the resulting position.
            # Since the turn has flipped in the post position, the score of the played move is:
            # -post_score (relative to turn)
            played_score = post_analysis[0]["score"]
            
            # Calculate played move index in the before position's top moves (MultiPV)
            # If the played move matches one of the top MultiPV lines in the before position:
            played_idx = None
            for idx, item in enumerate(before_analysis):
                if item["move"] == move:
                    played_idx = idx
                    played_score = item["score"] # Use the exact score computed for this move
                    break
                    
            # If it's not in the MultiPV, we use the post-move evaluation
            # (since we analyzed the resulting position, that's exactly the evaluation of this move!).
            
            # Classify
            classification = classify_move(
                board_before, move, before_analysis, played_idx, turn, uci_history
            )
            
            # Accuracy and CPL
            acc = calculate_move_accuracy(best_score, played_score, turn)
            cpl = calculate_cpl(best_score, played_score, turn)
            
            # Highlight highlights list
            highlights = {
                "check": board_after.is_check(),
                "pinned": get_pins(board_after, not turn),
                "forks": get_forks(board_after, turn),
                "hanging": get_hanging_pieces(board_after, not turn),
                "discovered": detect_discovered_attacks(board_before, move),
                "passed_pawns": [sq for sq in chess.SQUARES if board_after.piece_at(sq) and board_after.piece_at(sq).piece_type == chess.PAWN and is_passed_pawn(board_after, sq, board_after.piece_at(sq).color)],
                "open_files": [f for f in range(8) if all(board_after.piece_at(chess.square(f, r)) is None or board_after.piece_at(chess.square(f, r)).piece_type != chess.PAWN for r in range(8))]
            }
            
            explanation = generate_move_explanation(
                board_before, move, classification, played_score, best_score, best_move
            )
            
            # Save detail
            self.review_details.append({
                "move_number": i + 1,
                "move": move,
                "san": san,
                "turn": turn,
                "fen_before": board_before.fen(),
                "fen_after": board.fen(),
                "played_score": played_score,
                "best_score": best_score,
                "best_move": best_move,
                "best_pv": best_pv,
                "classification": classification,
                "accuracy": acc,
                "cpl": cpl,
                "material_diff": get_material_difference(board),
                "explanation": explanation,
                "highlights": highlights
            })
            
            self.completed_moves += 1
            
        sf.close()
        
        # 2. Finalize calculations if not stopped
        if not self._stop_event.is_set():
            self._finalize_review()
            
        self.is_running = False

    def _finalize_review(self):
        """Compute summary statistics once analysis completes."""
        if not self.review_details:
            return
            
        # Accuracy stats
        game_stats = calculate_game_accuracies(self.review_details)
        
        # Estimated ratings
        white_rating, white_err, white_reason, white_conf = estimate_player_rating(self.review_details, chess.WHITE)
        
        # Estimate bot rating (if played by Black bot or White bot)
        # Let's assume Black was the bot in typical runs, but we'll estimate bot rating for whoever is NOT USERNAME.
        # Actually, let's estimate for both White and Black.
        # If Black is the bot, estimate using bot settings:
        black_rating, black_err, black_reason, black_conf = estimate_bot_rating(
            self.review_details, chess.BLACK, self.bot_level_idx, self.depth, 20, 3
        )
        
        # Classification counts
        w_counts = {c: 0 for c in ["Brilliant", "Great", "Best", "Excellent", "Good", "Book", "Forced", "Inaccuracy", "Mistake", "Blunder", "Missed Win", "Missed Draw", "Only Move"]}
        b_counts = w_counts.copy()
        
        longest_think = {"move": 0, "player": "White", "duration": 0} # Time usage not fully tracked in standard main.py, placeholder
        
        for m in self.review_details:
            cls = m["classification"]
            if m["turn"] == chess.WHITE:
                w_counts[cls] = w_counts.get(cls, 0) + 1
            else:
                b_counts[cls] = b_counts.get(cls, 0) + 1
                
        # Find opening name
        uci_moves = [m["move"].uci() for m in self.review_details]
        opening_name = get_opening_name(uci_moves)
        
        # Evaluation and Material lists for graphs
        eval_history = []
        material_history = []
        cpl_history = []
        accuracy_history = []
        
        for m in self.review_details:
            score = m["played_score"].white()
            if score.is_mate():
                val = 10.0 if score.mate() > 0 else -10.0
            else:
                val = score.score(default=0) / 100.0
            eval_history.append(val)
            material_history.append(m["material_diff"] / 100.0) # Scale to feel smaller
            cpl_history.append(m["cpl"])
            accuracy_history.append(m["accuracy"])
            
        self.summary = {
            "white_accuracy": game_stats["white_accuracy"],
            "black_accuracy": game_stats["black_accuracy"],
            "avg_cpl": game_stats["game_cpl"],
            "opening_name": opening_name,
            "game_length": len(self.review_details),
            "white_counts": w_counts,
            "black_counts": b_counts,
            
            "white_rating": white_rating,
            "white_rating_error": white_err,
            "white_rating_reason": white_reason,
            "white_rating_confidence": white_conf,
            
            "black_rating": black_rating,
            "black_rating_error": black_err,
            "black_rating_reason": black_reason,
            "black_rating_confidence": black_conf,
            
            "eval_history": eval_history,
            "material_history": material_history,
            "cpl_history": cpl_history,
            "accuracy_history": accuracy_history
        }
        
        self.is_complete = True
