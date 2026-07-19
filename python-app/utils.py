import os
import pygame
import chess
import chess.pgn
import io

# ──────────────────────────────────────────────────────────────
#  LAYOUT CONSTANTS
# ──────────────────────────────────────────────────────────────
BOARD_PX   = 560
SQ         = BOARD_PX // 8        # 70
EVAL_W     = 24
PANEL_W    = 300
BOARD_LEFT = EVAL_W
BOARD_TOP  = 44
BOT_H      = 38

WIDTH  = EVAL_W + BOARD_PX + PANEL_W   # 884
HEIGHT = BOARD_TOP + BOARD_PX + BOT_H  # 642

# ──────────────────────────────────────────────────────────────
#  FONTS
# ──────────────────────────────────────────────────────────────
_fonts = {}

def get_font(size, bold=False):
    key = (size, bold)
    if key in _fonts:
        return _fonts[key]
    
    # Try system monospaced fonts
    for name in ("Consolas", "Courier New", "DejaVu Sans Mono", "monospace"):
        try:
            f = pygame.font.SysFont(name, size, bold=bold)
            if f:
                _fonts[key] = f
                return f
        except Exception:
            pass
    f = pygame.font.SysFont(None, size, bold=bold)
    _fonts[key] = f
    return f

# ──────────────────────────────────────────────────────────────
#  COORDINATE HELPERS
# ──────────────────────────────────────────────────────────────
def is_board_flipped(player_color, board_flipped_manual):
    """Returns True if the board should be rendered flipped (from Black's perspective)."""
    return (player_color == chess.BLACK) ^ board_flipped_manual

def sq_to_px(sq, flipped):
    """Convert a square to (x, y) pixel coordinates of its top-left corner."""
    rank = chess.square_rank(sq)
    file = chess.square_file(sq)
    if flipped:
        sr, sc = rank, 7 - file
    else:
        sr, sc = 7 - rank, file
    return (BOARD_LEFT + sc * SQ, BOARD_TOP + sr * SQ)

def px_to_sq(x, y, flipped):
    """Convert (x, y) screen coordinates to a chess.Square (or None if outside board)."""
    sc = (x - BOARD_LEFT) // SQ
    sr = (y - BOARD_TOP)  // SQ
    if not (0 <= sc < 8 and 0 <= sr < 8):
        return None
    if flipped:
        return chess.square(7 - sc, sr)
    return chess.square(sc, 7 - sr)

def fmt_time(seconds):
    seconds = max(0, int(seconds))
    return f"{seconds//60:02d}:{seconds%60:02d}"

# ──────────────────────────────────────────────────────────────
#  DRAWING UTILITIES
# ──────────────────────────────────────────────────────────────
def blit_text(surface, text, x, y, font, color, right=False, center=False):
    sur = font.render(str(text), True, color)
    if right:
        x -= sur.get_width()
    if center:
        x -= sur.get_width() // 2
    surface.blit(sur, (x, y))
    return sur.get_width(), sur.get_height()

def draw_filled_rect(surface, color, rect, r=6):
    pygame.draw.rect(surface, color, rect, border_radius=r)

def draw_outline_rect(surface, color, rect, w=2, r=6):
    pygame.draw.rect(surface, color, rect, w, border_radius=r)

def draw_alpha_rect(surface, color, rect):
    s = pygame.Surface((rect[2], rect[3]), pygame.SRCALPHA)
    s.fill(color)
    surface.blit(s, (rect[0], rect[1]))

# ──────────────────────────────────────────────────────────────
#  PGN IMPORT / EXPORT
# ──────────────────────────────────────────────────────────────
def export_to_pgn(moves, initial_fen=None, white_name="White Player", black_name="Black Bot", result="*"):
    """Export the played moves as a PGN string."""
    game = chess.pgn.Game()
    
    # Headers
    game.headers["Event"] = "Offline Match"
    game.headers["Site"] = "Chess7Knight App"
    game.headers["White"] = white_name
    game.headers["Black"] = black_name
    game.headers["Result"] = result
    
    if initial_fen:
        game.setup(chess.Board(initial_fen))
        
    node = game
    for move in moves:
        node = node.add_main_line(move)
        
    exporter = chess.pgn.StringExporter(headers=True, variations=False, comments=False)
    return game.accept(exporter)

def import_from_pgn(pgn_str):
    """Import a game from PGN string and return (moves_list, initial_fen, white_name, black_name, result)."""
    pgn_io = io.StringIO(pgn_str)
    game = chess.pgn.read_game(pgn_io)
    if not game:
        return None
        
    moves = []
    node = game
    while node.variations:
        next_node = node.variation(0)
        moves.append(next_node.move)
        node = next_node
        
    initial_fen = game.headers.get("FEN")
    white = game.headers.get("White", "White Player")
    black = game.headers.get("Black", "Black Bot")
    result = game.headers.get("Result", "*")
    
    return {
        "moves": moves,
        "initial_fen": initial_fen,
        "white": white,
        "black": black,
        "result": result
    }
