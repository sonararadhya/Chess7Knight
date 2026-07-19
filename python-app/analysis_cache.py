import os
import json
import chess
import chess.engine

CACHE_FILE = "chess7knight_cache.json"

class AnalysisCache:
    def __init__(self, filename=CACHE_FILE):
        self.filename = filename
        self.cache = {}
        self.load()

    def get_key(self, board):
        """Use the EPD (Extended Position Description) as the cache key.
        This ignores the move count and halfmove clock to max cache hits.
        """
        return board.epd()

    def load(self):
        if os.path.exists(self.filename):
            try:
                with open(self.filename, 'r') as f:
                    raw_cache = json.load(f)
                
                # Deserialize
                for epd, items in raw_cache.items():
                    deserialized_items = []
                    for item in items:
                        # Rebuild score object
                        score_type = item.get("score_type", "cp")
                        score_val = item.get("score_value", 0)
                        
                        # Note: chess.engine.Score uses PovScore. We'll store it as PovScore (White's perspective)
                        if score_type == "mate":
                            # mate in X from White's perspective
                            score = chess.engine.PovScore(chess.engine.Mate(score_val), chess.WHITE)
                        else:
                            score = chess.engine.PovScore(chess.engine.Cp(score_val), chess.WHITE)
                            
                        deserialized_items.append({
                            "move": chess.Move.from_uci(item["move"]) if item["move"] else None,
                            "score": score,
                            "pv": [chess.Move.from_uci(m) for m in item.get("pv", [])],
                            "depth": item.get("depth", 15)
                        })
                    self.cache[epd] = deserialized_items
            except Exception as e:
                print(f"Error loading analysis cache: {e}")
                self.cache = {}

    def save(self):
        try:
            serialized_cache = {}
            for epd, items in self.cache.items():
                serialized_items = []
                for item in items:
                    score = item["score"]
                    # We store it relative to White to make it color agnostic
                    white_score = score.white()
                    score_type = "mate" if white_score.is_mate() else "cp"
                    
                    if score_type == "mate":
                        score_val = white_score.mate()
                    else:
                        score_val = white_score.score(default=0)
                        
                    serialized_items.append({
                        "move": item["move"].uci() if item["move"] else None,
                        "score_type": score_type,
                        "score_value": score_val,
                        "pv": [m.uci() for m in item["pv"]],
                        "depth": item["depth"]
                    })
                serialized_cache[epd] = serialized_items
                
            with open(self.filename, 'w') as f:
                json.dump(serialized_cache, f, indent=2)
        except Exception as e:
            print(f"Error saving analysis cache: {e}")

    def get(self, board):
        key = self.get_key(board)
        return self.cache.get(key)

    def set(self, board, analysis_results):
        key = self.get_key(board)
        self.cache[key] = analysis_results
        self.save()
