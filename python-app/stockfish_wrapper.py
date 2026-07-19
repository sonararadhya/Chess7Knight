import os
import shutil
import chess
import chess.engine

def locate_stockfish():
    """Locate the stockfish binary in common locations."""
    # 1. Local workspace bin folder
    local_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "bin", "stockfish", "stockfish-ubuntu-x86-64"))
    if os.path.exists(local_path) and os.access(local_path, os.X_OK):
        return local_path
    
    # 2. Check if stockfish is in PATH
    which_path = shutil.which("stockfish")
    if which_path:
        return which_path
        
    # 3. System common paths
    system_paths = [
        "/usr/games/stockfish",
        "/usr/local/bin/stockfish",
        "/usr/bin/stockfish",
    ]
    for p in system_paths:
        if os.path.exists(p) and os.access(p, os.X_OK):
            return p
            
    return None

class StockfishWrapper:
    def __init__(self, path=None, skill_level=20, threads=2, hash_size=64, multipv=3):
        self.path = path or locate_stockfish()
        self.skill_level = skill_level
        self.threads = threads
        self.hash_size = hash_size
        self.multipv = multipv
        self.engine = None
        
    def start(self):
        if not self.path:
            raise FileNotFoundError("Stockfish binary not found. Please specify the path or install Stockfish.")
        try:
            self.engine = chess.engine.SimpleEngine.popen_uci(self.path)
            self.configure()
        except Exception as e:
            self.engine = None
            raise RuntimeError(f"Failed to start Stockfish engine: {e}")

    def configure(self):
        if not self.engine:
            return
        config = {
            "Threads": self.threads,
            "Hash": self.hash_size,
        }
        # Only set Skill Level if it's not maxed to 20 or if handicap is active
        # UCI Stockfish supports Skill Level option
        try:
            config["Skill Level"] = self.skill_level
        except Exception:
            pass
            
        try:
            self.engine.configure(config)
        except Exception as e:
            print(f"Warning: Failed to configure engine: {e}")

    def analyze_position(self, board_fen, depth=15):
        """Analyze a position and return top MultiPV lines."""
        if not self.engine:
            self.start()
            
        board = chess.Board(board_fen)
        try:
            # We want to analyze the top MultiPV lines
            info = self.engine.analyse(
                board,
                chess.engine.Limit(depth=depth),
                multipv=self.multipv
            )
            
            # If multipv=1, info is a dict; if multipv > 1, info is a list of dicts
            if isinstance(info, dict):
                info = [info]
                
            results = []
            for item in info:
                move = item.get("pv", [None])[0]
                score = item.get("score")
                pv = item.get("pv", [])
                
                results.append({
                    "move": move,
                    "score": score,
                    "pv": pv,
                    "depth": item.get("depth", depth)
                })
            return results
        except Exception as e:
            print(f"Error during position analysis: {e}")
            return []

    def close(self):
        if self.engine:
            try:
                self.engine.quit()
            except Exception:
                pass
            self.engine = None
