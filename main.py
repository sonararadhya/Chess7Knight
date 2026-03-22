"""
Chess has always felt like more than just a game to me — it’s a mix of logic, patience, creativity, and sometimes pure chaos. Chess7Knight started as a simple idea: “Can I build a chess game that feels like the ones I enjoy playing online, but runs completely offline and is fully under my control?”

What began as a small experiment with Python and Pygame slowly evolved into something much bigger. Along the way, I learned a lot — not just about game development, but about structuring large projects, handling performance issues, designing UI flows, and integrating powerful tools like Stockfish in a meaningful way.

I wanted this project to feel complete — not just playable, but enjoyable:

Smooth UI and clean navigation
Real-time feedback like evaluation bars and move accuracy
A sense of progression through dynamic rating
Personal touches like themes and persistent stats

There were definitely challenges (and a lot of debugging 😅), but that’s what made building this so rewarding.

If you're exploring the code, building something similar, or just playing the game — I hope it gives you the same satisfaction I had while creating it.

— Aradhya Sonar
"""

import pygame, chess, chess.engine, sys, atexit, math, random, json, os

# ──────────────────────────────────────────────────────────────
#  LAYOUT
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

FPS      = 60
APP_NAME = "Chess7Knight"
USERNAME = "aradhyasonar"
SAVE_FILE = "chess7knight_stats.json"

# ──────────────────────────────────────────────────────────────
#  PYGAME INIT
# ──────────────────────────────────────────────────────────────
pygame.init()
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption(APP_NAME)
clock = pygame.time.Clock()

def _font(size, bold=False):
    for name in ("Consolas", "Courier New", "DejaVu Sans Mono", "monospace"):
        try:
            f = pygame.font.SysFont(name, size, bold=bold)
            if f: return f
        except Exception:
            pass
    return pygame.font.SysFont(None, size, bold=bold)

F_TINY  = _font(11)
F_SMALL = _font(13)
F_MAIN  = _font(16)
F_BOLD  = _font(16, bold=True)
F_MED   = _font(22, bold=True)
F_BIG   = _font(44, bold=True)
F_TITLE = _font(19, bold=True)

# ──────────────────────────────────────────────────────────────
#  ENGINE
# ──────────────────────────────────────────────────────────────
engine = chess.engine.SimpleEngine.popen_uci("/usr/games/stockfish")

def _cleanup():
    try: engine.quit()
    except Exception: pass

atexit.register(_cleanup)

def quit_game():
    _cleanup(); pygame.quit(); sys.exit()

# ──────────────────────────────────────────────────────────────
#  DIFFICULTY TABLE  (level → ELO, time_limit_s, skill_level)
# ──────────────────────────────────────────────────────────────
LEVELS = [
    # (display_name, elo, time_s, stockfish_skill 0-20)
    ( "1  –  Beginner",       400,  0.05,  0),
    ( "2  –  Casual",         750,  0.10,  2),
    ( "3  –  Amateur",        950,  0.15,  4),
    ( "4  –  Club",          1050,  0.20,  6),
    ( "5  –  Intermediate",  1250,  0.30,  8),
    ( "6  –  Advanced",      1350,  0.40, 10),
    ( "7  –  Expert",        1450,  0.50, 12),
    ( "8  –  Master",        1550,  0.70, 14),
    ( "9  –  Candidate",     1650,  0.90, 16),
    ("10  –  International", 1850,  1.20, 18),
    ("11  –  Grandmaster",   1950,  2.00, 20),
]

# ──────────────────────────────────────────────────────────────
#  THEMES
# ──────────────────────────────────────────────────────────────
THEMES = {
    "midnight": dict(
        name="Midnight",
        bg=(13,14,22), panel_bg=(19,21,34), border=(40,44,70),
        sq_light=(88,108,142), sq_dark=(30,40,62),
        text=(215,220,240), dim=(100,110,145),
        accent=(72,196,255), accent2=(255,162,32),
        good=(72,214,120), bad=(255,76,76),
        ev_w=(228,228,235), ev_b=(22,22,36),
        dot=(72,196,255), hi=(255,220,50,105), chk=(255,55,55,160),
        danger=(255,80,80,90),
    ),
    "forest": dict(
        name="Forest",
        bg=(16,24,16), panel_bg=(20,32,20), border=(46,72,46),
        sq_light=(162,196,134), sq_dark=(72,106,66),
        text=(216,232,208), dim=(104,136,96),
        accent=(112,208,96), accent2=(248,198,72),
        good=(96,228,128), bad=(224,76,76),
        ev_w=(228,238,218), ev_b=(16,24,16),
        dot=(96,216,76), hi=(196,238,96,105), chk=(224,56,56,160),
        danger=(255,80,60,90),
    ),
    "ivory": dict(
        name="Ivory",
        bg=(242,238,226), panel_bg=(228,222,206), border=(184,176,154),
        sq_light=(238,226,194), sq_dark=(156,120,76),
        text=(38,34,26), dim=(116,106,86),
        accent=(134,74,16), accent2=(196,136,36),
        good=(56,154,74), bad=(194,56,56),
        ev_w=(246,243,232), ev_b=(46,38,26),
        dot=(154,96,26), hi=(216,198,72,115), chk=(214,56,56,150),
        danger=(220,60,40,100),
    ),
    "neon": dict(
        name="Neon",
        bg=(6,6,10), panel_bg=(10,8,18), border=(38,4,76),
        sq_light=(46,16,78), sq_dark=(18,4,38),
        text=(238,218,255), dim=(124,86,174),
        accent=(196,0,255), accent2=(0,252,196),
        good=(0,252,156), bad=(255,46,46),
        ev_w=(218,198,255), ev_b=(8,0,18),
        dot=(196,0,255), hi=(196,0,255,88), chk=(255,0,76,160),
        danger=(255,0,100,100),
    ),
}
THEME_KEYS = list(THEMES.keys())
theme_idx  = 0
def T(): return THEMES[THEME_KEYS[theme_idx]]
def cycle_theme():
    global theme_idx
    theme_idx = (theme_idx + 1) % len(THEME_KEYS)

# ──────────────────────────────────────────────────────────────
#  PERSISTENT STATS
# ──────────────────────────────────────────────────────────────
def load_stats():
    if os.path.exists(SAVE_FILE):
        try:
            with open(SAVE_FILE) as f:
                return json.load(f)
        except Exception:
            pass
    return {"matches": [], "wins": 0, "losses": 0, "draws": 0, "best_acc": 0.0}

def save_stats(stats):
    try:
        with open(SAVE_FILE, "w") as f:
            json.dump(stats, f, indent=2)
    except Exception:
        pass

stats = load_stats()

def record_match(result, accuracy, rating, level_idx, moves):
    """result: 'win'|'loss'|'draw'|'abandoned'|'resigned'"""
    stats["matches"].append({
        "result": result, "accuracy": round(accuracy, 1),
        "rating": rating, "level": level_idx + 1,
        "moves": moves,
    })
    stats["matches"] = stats["matches"][-50:]   # keep last 50
    if result == "win":    stats["wins"]   += 1
    elif result == "loss": stats["losses"] += 1
    elif result == "draw": stats["draws"]  += 1
    if accuracy > stats.get("best_acc", 0):
        stats["best_acc"] = round(accuracy, 1)
    save_stats(stats)

# ──────────────────────────────────────────────────────────────
#  GAME STATE
# ──────────────────────────────────────────────────────────────
board         = chess.Board()
dragging      = None
drag_pos      = None
last_move     = None
move_history  = []
san_history   = []

level_idx     = 6          # default level 7
player_color  = chess.WHITE
board_flipped = False      # manual flip toggle (independent of player_color)

tutor_on      = True       # show move hints
danger_on     = True       # highlight squares attacked by opponent

white_time    = 600.0
black_time    = 600.0

eval_score    = 0.0
eval_history  = []
acc_history   = []
move_accuracy = 100.0
player_rating = 1200

IMAGES = {}

# ──────────────────────────────────────────────────────────────
#  LOAD PIECES
# ──────────────────────────────────────────────────────────────
def load_pieces():
    for p in ['wp','wr','wn','wb','wq','wk','bp','br','bn','bb','bq','bk']:
        try:
            img = pygame.image.load(f"assets/pieces/{p}.png").convert_alpha()
            IMAGES[p] = pygame.transform.smoothscale(img, (SQ, SQ))
        except Exception:
            s  = pygame.Surface((SQ, SQ), pygame.SRCALPHA)
            fg = (240,240,235) if p[0]=='w' else (26,24,32)
            bg = (26,24,32)   if p[0]=='w' else (240,240,235)
            pygame.draw.circle(s, fg, (SQ//2, SQ//2), SQ//2-4)
            pygame.draw.circle(s, bg, (SQ//2, SQ//2), SQ//2-4, 2)
            lbl = F_SMALL.render(p[1].upper(), True, bg)
            s.blit(lbl, (SQ//2-lbl.get_width()//2, SQ//2-lbl.get_height()//2))
            IMAGES[p] = s

# ──────────────────────────────────────────────────────────────
#  COORDINATE HELPERS  (respects manual flip toggle)
# ──────────────────────────────────────────────────────────────
def _is_flipped():
    # board flipped if player chose black OR manually toggled
    base = (player_color == chess.BLACK)
    return base ^ board_flipped

def sq_px(sq):
    rank = chess.square_rank(sq)
    file = chess.square_file(sq)
    if _is_flipped():
        sr, sc = rank, 7 - file
    else:
        sr, sc = 7 - rank, file
    return (BOARD_LEFT + sc * SQ, BOARD_TOP + sr * SQ)

def px_sq(x, y):
    sc = (x - BOARD_LEFT) // SQ
    sr = (y - BOARD_TOP)  // SQ
    if not (0 <= sc < 8 and 0 <= sr < 8):
        return None
    if _is_flipped():
        return chess.square(7 - sc, sr)
    return chess.square(sc, 7 - sr)

def fmt_time(s):
    s = max(0, int(s))
    return f"{s//60:02d}:{s%60:02d}"

# ──────────────────────────────────────────────────────────────
#  EVALUATION HELPERS
# ──────────────────────────────────────────────────────────────
def get_eval(b):
    try:
        info = engine.analyse(b, chess.engine.Limit(time=0.05))
        sc   = info["score"].white()
        if sc.is_mate():
            return 2000 if sc.mate() > 0 else -2000
        return max(-2000, min(2000, sc.score()))
    except Exception:
        return 0

def cp_to_win(cp):
    return 1.0 / (1.0 + math.exp(-cp / 400.0))

def accuracy_from_loss(delta):
    if delta <= 0: return 100.0
    return max(0.0, 100.0 * math.exp(-delta / 300.0))

def rating_delta_fn(acc):
    if acc >= 95: return  3
    if acc >= 85: return  1
    if acc >= 70: return -1
    if acc >= 50: return -3
    return -6

# ──────────────────────────────────────────────────────────────
#  DRAW HELPERS
# ──────────────────────────────────────────────────────────────
def blit(text, x, y, font=None, color=None, right=False, center=False):
    col = color or T()["text"]
    sur = (font or F_MAIN).render(str(text), True, col)
    if right:  x -= sur.get_width()
    if center: x -= sur.get_width() // 2
    screen.blit(sur, (x, y))
    return sur.get_width(), sur.get_height()

def filled_rect(color, rect, r=6):
    pygame.draw.rect(screen, color, rect, border_radius=r)

def outline_rect(color, rect, w=2, r=6):
    pygame.draw.rect(screen, color, rect, w, border_radius=r)

def alpha_rect(surf, color, rect):
    s = pygame.Surface((rect[2], rect[3]), pygame.SRCALPHA)
    s.fill(color)
    surf.blit(s, (rect[0], rect[1]))

# ──────────────────────────────────────────────────────────────
#  BOARD DRAWING
# ──────────────────────────────────────────────────────────────
def draw_squares():
    t    = T()
    flip = _is_flipped()
    for sr in range(8):
        for sc in range(8):
            rank = sr if flip else 7 - sr
            file = 7 - sc if flip else sc
            light = (file + rank) % 2 == 1
            col = t["sq_light"] if light else t["sq_dark"]
            pygame.draw.rect(screen, col,
                             (BOARD_LEFT + sc*SQ, BOARD_TOP + sr*SQ, SQ, SQ))
    for i in range(8):
        fl = chr(ord('a') + (7-i if flip else i))
        rn = str(i+1 if flip else 8-i)
        lf = F_TINY.render(fl, True, t["dim"])
        lr = F_TINY.render(rn, True, t["dim"])
        screen.blit(lf, (BOARD_LEFT + i*SQ + SQ - lf.get_width() - 2,
                          BOARD_TOP + BOARD_PX - lf.get_height() - 1))
        screen.blit(lr, (BOARD_LEFT + 2, BOARD_TOP + i*SQ + 2))

def draw_danger():
    """Highlight squares attacked by the opponent."""
    if not danger_on: return
    t   = T()
    opp = not player_color
    attacked = set()
    for sq in chess.SQUARES:
        if board.is_attacked_by(opp, sq):
            attacked.add(sq)
    for sq in attacked:
        px, py = sq_px(sq)
        s = pygame.Surface((SQ, SQ), pygame.SRCALPHA)
        s.fill(t["danger"])
        screen.blit(s, (px, py))

def draw_last_move_hi():
    if not last_move: return
    t = T()
    rgba = t["hi"]
    for sq in [last_move.from_square, last_move.to_square]:
        px, py = sq_px(sq)
        s = pygame.Surface((SQ, SQ), pygame.SRCALPHA)
        s.fill(rgba[:3] + ((rgba[3],) if len(rgba)>3 else (105,)))
        screen.blit(s, (px, py))

def draw_check_hi():
    if not board.is_check(): return
    t  = T()
    sq = board.king(board.turn)
    px, py = sq_px(sq)
    s  = pygame.Surface((SQ, SQ), pygame.SRCALPHA)
    s.fill(t["chk"])
    screen.blit(s, (px, py))

def draw_dots(from_sq):
    if from_sq is None or not tutor_on: return
    t = T()
    for m in board.legal_moves:
        if m.from_square != from_sq: continue
        px, py = sq_px(m.to_square)
        s = pygame.Surface((SQ, SQ), pygame.SRCALPHA)
        if board.piece_at(m.to_square):
            pygame.draw.circle(s, (*t["dot"], 160), (SQ//2,SQ//2), SQ//2, 6)
        else:
            pygame.draw.circle(s, (*t["dot"], 140), (SQ//2,SQ//2), 14)
        screen.blit(s, (px, py))

def draw_pieces_on_board(skip=None):
    for sq in chess.SQUARES:
        if sq == skip: continue
        p = board.piece_at(sq)
        if p:
            code = ('w' if p.color else 'b') + p.symbol().lower()
            px, py = sq_px(sq)
            screen.blit(IMAGES[code], (px, py))

# ──────────────────────────────────────────────────────────────
#  EVAL BAR
# ──────────────────────────────────────────────────────────────
def draw_eval_bar():
    t  = T()
    bh = BOARD_PX
    by = BOARD_TOP
    pygame.draw.rect(screen, t["ev_b"], (0, by, EVAL_W, bh))
    wh = int(bh * cp_to_win(eval_score))
    pygame.draw.rect(screen, t["ev_w"], (0, by + bh - wh, EVAL_W, wh))
    pygame.draw.line(screen, t["border"], (0, by+bh//2), (EVAL_W, by+bh//2), 1)
    val = f"{abs(eval_score/100):.1f}"
    lbl = F_TINY.render(val, True, t["dim"])
    lr  = pygame.transform.rotate(lbl, 90)
    screen.blit(lr, (EVAL_W//2 - lr.get_width()//2, by+bh//2 - lr.get_height()//2))

# ──────────────────────────────────────────────────────────────
#  PLAYER BARS
# ──────────────────────────────────────────────────────────────
def draw_player_bars():
    t     = T()
    my_c  = player_color
    op_c  = not my_c
    op_t  = black_time if my_c==chess.WHITE else white_time
    my_t  = white_time if my_c==chess.WHITE else black_time
    op_act = board.turn == op_c
    my_act = board.turn == my_c

    # opponent top
    filled_rect(t["panel_bg"], (BOARD_LEFT, 0, BOARD_PX, BOARD_TOP))
    if op_act:
        outline_rect(t["accent"], (BOARD_LEFT, 0, BOARD_PX, BOARD_TOP))
    lv = LEVELS[level_idx]
    blit(f"Stockfish  Lv{level_idx+1}  ({lv[1]} ELO)",
         BOARD_LEFT+8, 12, F_BOLD, t["accent"] if op_act else t["dim"])
    blit(fmt_time(op_t), BOARD_LEFT+BOARD_PX-8, 12,
         F_BOLD, t["accent2"] if op_act else t["dim"], right=True)

    # player bottom
    by = BOARD_TOP + BOARD_PX
    filled_rect(t["panel_bg"], (BOARD_LEFT, by, BOARD_PX, BOT_H))
    if my_act:
        outline_rect(t["accent"], (BOARD_LEFT, by, BOARD_PX, BOT_H))
    blit(f"{USERNAME}  ({player_rating} ELO)",
         BOARD_LEFT+8, by+10, F_BOLD, t["accent"] if my_act else t["dim"])
    blit(fmt_time(my_t), BOARD_LEFT+BOARD_PX-8, by+10,
         F_BOLD, t["accent2"] if my_act else t["dim"], right=True)

# ──────────────────────────────────────────────────────────────
#  RIGHT PANEL
# ──────────────────────────────────────────────────────────────
PANEL_X = BOARD_LEFT + BOARD_PX

def pdiv(y):
    pygame.draw.line(screen, T()["border"],
                     (PANEL_X+10, y), (PANEL_X+PANEL_W-10, y), 1)

# Small icon-style in-panel buttons
_PANEL_BTNS = {}   # filled by draw_panel, read by game_loop

def panel_btn(label, rect, danger=False, active=False):
    t   = T()
    hov = rect.collidepoint(pygame.mouse.get_pos())
    if danger:
        bg = t["bad"] if hov else tuple(max(0,c-40) for c in t["bad"])
        bc = t["bad"]
        tc = (255,255,255)
    elif active:
        bg = t["accent"]
        bc = t["accent"]
        tc = t["bg"]
    else:
        bg = tuple(min(255,c+20) for c in t["panel_bg"]) if hov else t["panel_bg"]
        bc = t["accent"] if hov else t["border"]
        tc = t["accent"] if hov else t["text"]
    filled_rect(bg, rect, r=7)
    outline_rect(bc, rect, w=1, r=7)
    lbl = F_SMALL.render(label, True, tc)
    screen.blit(lbl, (rect.centerx - lbl.get_width()//2,
                       rect.centery - lbl.get_height()//2))
    return rect

def draw_panel():
    global _PANEL_BTNS
    t   = T()
    px  = PANEL_X
    pw  = PANEL_W
    lx  = px + 14
    rx  = px + pw - 14
    filled_rect(t["panel_bg"], (px, 0, pw, HEIGHT))
    pygame.draw.line(screen, t["border"], (px, 0), (px, HEIGHT), 1)

    y = 10
    blit(APP_NAME, lx, y, F_TITLE, t["accent"])
    blit(f"★{player_rating}", rx, y, F_BOLD, t["accent2"], right=True)
    y += 24
    blit(f"@{USERNAME}", lx, y, F_SMALL, t["dim"])
    lv = LEVELS[level_idx]
    blit(f"Lv{level_idx+1} · {lv[1]} ELO", rx, y, F_SMALL, t["dim"], right=True)
    y += 18; pdiv(y); y += 9

    # accuracy
    blit("ACCURACY", lx, y, F_TINY, t["dim"]); y += 14
    bw = pw - 28
    filled_rect(t["border"], (lx, y, bw, 8), r=4)
    acc_col = t["good"] if move_accuracy>=80 else t["accent2"] if move_accuracy>=58 else t["bad"]
    fill = max(0, int(bw * move_accuracy / 100))
    if fill: filled_rect(acc_col, (lx, y, fill, 8), r=4)
    y += 11
    blit(f"{move_accuracy:.1f}%", lx, y, F_MED, acc_col)
    y += 28; pdiv(y); y += 9

    # eval
    blit("EVALUATION", lx, y, F_TINY, t["dim"]); y += 14
    sign = "+" if eval_score >= 0 else ""
    ev_col = t["good"] if eval_score>50 else t["bad"] if eval_score<-50 else t["text"]
    blit(f"{sign}{eval_score/100:.2f}", lx, y, F_MED, ev_col)
    y += 28; pdiv(y); y += 9

    # clock
    blit("CLOCK", lx, y, F_TINY, t["dim"]); y += 14
    op_t = black_time if player_color==chess.WHITE else white_time
    my_t = white_time if player_color==chess.WHITE else black_time
    blit("Stockfish", lx, y, F_MAIN, t["dim"])
    blit(fmt_time(op_t), rx, y, F_BOLD,
         t["bad"] if op_t<30 else t["text"], right=True); y += 19
    blit(USERNAME,  lx, y, F_MAIN, t["dim"])
    blit(fmt_time(my_t), rx, y, F_BOLD,
         t["bad"] if my_t<30 else t["text"], right=True); y += 22
    pdiv(y); y += 9

    # moves
    blit("MOVES", lx, y, F_TINY, t["dim"]); y += 14
    pairs = [(i//2+1, san_history[i],
              san_history[i+1] if i+1<len(san_history) else "")
             for i in range(0, len(san_history), 2)]
    for num, w, b in pairs[-9:]:
        blit(f"{num}.", lx,    y, F_TINY, t["dim"])
        blit(w,         lx+22, y, F_MAIN, t["text"])
        blit(b,         lx+96, y, F_MAIN, t["dim"])
        y += 17
        if y > HEIGHT - 130: break

    # ── in-game action buttons ──────────────────
    by = HEIGHT - 118
    pdiv(by); by += 8

    bw2 = (pw - 34) // 2
    bh2 = 28

    r_undo   = pygame.Rect(lx,       by,      bw2, bh2)
    r_flip   = pygame.Rect(lx+bw2+6, by,      bw2, bh2)
    by += bh2 + 6
    r_aband  = pygame.Rect(lx,       by,      bw2, bh2)
    r_resign = pygame.Rect(lx+bw2+6, by,      bw2, bh2)
    by += bh2 + 8
    pdiv(by); by += 6

    panel_btn("⟲ Undo",        r_undo)
    panel_btn("⇅ Flip Board",  r_flip)
    panel_btn("✗ Abandon",     r_aband,  danger=True)
    panel_btn("⚑ Resign",      r_resign, danger=True)

    # theme + indicator row
    blit(f"[T] {t['name']}  ·  [Q] Quit", lx, by, F_TINY, t["dim"])

    _PANEL_BTNS = {"undo": r_undo, "flip": r_flip,
                   "abandon": r_aband, "resign": r_resign}

# ──────────────────────────────────────────────────────────────
#  ANIMATE MOVE
# ──────────────────────────────────────────────────────────────
def animate_move(m):
    p = board.piece_at(m.from_square)
    if not p: return
    code = ('w' if p.color else 'b') + p.symbol().lower()
    spx, spy = sq_px(m.from_square)
    epx, epy = sq_px(m.to_square)
    frames = max(6, int(math.hypot(epx-spx, epy-spy) / SQ) * 7)
    for f in range(frames+1):
        k = f / frames
        screen.fill(T()["bg"])
        draw_eval_bar(); draw_squares(); draw_danger()
        draw_last_move_hi(); draw_check_hi()
        draw_pieces_on_board(skip=m.from_square)
        screen.blit(IMAGES[code], (spx+(epx-spx)*k, spy+(epy-spy)*k))
        draw_panel(); draw_player_bars()
        pygame.display.flip(); clock.tick(FPS)

# ──────────────────────────────────────────────────────────────
#  PUSH MOVES
# ──────────────────────────────────────────────────────────────
def push_move(m, is_player):
    global last_move, eval_score, move_accuracy, player_rating
    prev_eval = eval_score
    prev_turn = board.turn
    san = board.san(m)
    animate_move(m)
    board.push(m)
    last_move = m; move_history.append(m); san_history.append(san)
    new_eval = get_eval(board)
    eval_history.append(new_eval); eval_score = new_eval
    if is_player:
        loss = (prev_eval - new_eval) if prev_turn==chess.WHITE else (new_eval - prev_eval)
        acc  = accuracy_from_loss(max(0, loss))
        acc_history.append(acc)
        move_accuracy = sum(acc_history)/len(acc_history)
        player_rating = max(100, min(3000, player_rating + rating_delta_fn(acc)))

def do_ai():
    lv = LEVELS[level_idx]
    # Set Stockfish skill level
    try:
        engine.configure({"Skill Level": lv[3]})
    except Exception:
        pass
    res = engine.play(board, chess.engine.Limit(time=lv[2]))
    push_move(res.move, is_player=False)

def do_player(m):
    push_move(m, is_player=True)

# ──────────────────────────────────────────────────────────────
#  OVERLAYS
# ──────────────────────────────────────────────────────────────
def draw_overlay_box(title, lines, sub=None):
    """Draw a centred modal box. Returns nothing."""
    t  = T()
    ov = pygame.Surface((WIDTH, HEIGHT), pygame.SRCALPHA)
    ov.fill((0,0,0,155))
    screen.blit(ov, (0,0))
    bh = 60 + len(lines)*24 + (30 if sub else 0)
    bx = pygame.Rect(WIDTH//2-220, HEIGHT//2-bh//2, 440, bh)
    filled_rect(t["panel_bg"], bx, r=18)
    outline_rect(t["accent"], bx, w=3, r=18)
    tl = F_MED.render(title, True, t["accent"])
    screen.blit(tl, (bx.centerx-tl.get_width()//2, bx.y+14))
    for i, line in enumerate(lines):
        ll = F_MAIN.render(line, True, t["text"])
        screen.blit(ll, (bx.centerx-ll.get_width()//2, bx.y+50+i*24))
    if sub:
        sl = F_TINY.render(sub, True, t["dim"])
        screen.blit(sl, (bx.centerx-sl.get_width()//2, bx.bottom-22))

def draw_game_over(result_str):
    res = board.result()
    if result_str == "abandoned":
        title = "Match Abandoned"
    elif result_str == "resigned":
        title = "You Resigned"
    elif res == "1-0":
        title = "White Wins!"
    elif res == "0-1":
        title = "Black Wins!"
    else:
        title = "Draw!"
    draw_overlay_box(title,
        [f"Accuracy: {move_accuracy:.1f}%",
         f"Rating:   {player_rating}",
         f"Moves:    {len(san_history)}"],
        sub="R = New Game   M = Main Menu   Q = Quit")

def confirm_dialog(question):
    """Blocking yes/no. Returns True for yes."""
    t = T()
    while True:
        # redraw game underneath
        screen.fill(t["bg"])
        draw_eval_bar(); draw_squares(); draw_danger()
        draw_last_move_hi(); draw_check_hi()
        draw_pieces_on_board(); draw_panel(); draw_player_bars()

        ov = pygame.Surface((WIDTH, HEIGHT), pygame.SRCALPHA)
        ov.fill((0,0,0,160))
        screen.blit(ov, (0,0))

        bx = pygame.Rect(WIDTH//2-200, HEIGHT//2-70, 400, 140)
        filled_rect(t["panel_bg"], bx, r=16)
        outline_rect(t["accent"], bx, w=2, r=16)
        ql = F_MED.render(question, True, t["text"])
        screen.blit(ql, (bx.centerx-ql.get_width()//2, bx.y+16))

        W2 = 140; H2 = 38
        yr  = pygame.Rect(bx.centerx-W2-6, bx.y+70, W2, H2)
        nr  = pygame.Rect(bx.centerx+6,    bx.y+70, W2, H2)
        mx,my = pygame.mouse.get_pos()
        for rect, lbl, danger in [(yr,"Yes",True),(nr,"No",False)]:
            hov = rect.collidepoint(mx,my)
            bg  = t["bad"] if (hov and danger) else \
                  t["good"] if hov else t["panel_bg"]
            bc  = t["bad"] if danger else t["border"]
            filled_rect(bg, rect, r=8); outline_rect(bc, rect, w=2, r=8)
            ll = F_BOLD.render(lbl, True, (255,255,255) if hov else t["text"])
            screen.blit(ll, (rect.centerx-ll.get_width()//2,
                              rect.centery-ll.get_height()//2))
        pygame.display.flip()
        clock.tick(FPS)

        for e in pygame.event.get():
            if e.type == pygame.QUIT: quit_game()
            if e.type == pygame.KEYDOWN:
                if e.key == pygame.K_y: return True
                if e.key in (pygame.K_n, pygame.K_ESCAPE): return False
            if e.type == pygame.MOUSEBUTTONDOWN:
                if yr.collidepoint(e.pos): return True
                if nr.collidepoint(e.pos): return False

# ──────────────────────────────────────────────────────────────
#  RESET
# ──────────────────────────────────────────────────────────────
def reset_game():
    global board, dragging, drag_pos, last_move, move_history, san_history
    global eval_score, eval_history, acc_history, move_accuracy, player_rating
    global white_time, black_time, board_flipped
    board = chess.Board()
    dragging = drag_pos = last_move = None
    move_history = []; san_history = []
    eval_score = 0.0; eval_history = []; acc_history = []
    move_accuracy = 100.0; player_rating = 1200
    white_time = 600.0; black_time = 600.0
    board_flipped = False

# ──────────────────────────────────────────────────────────────
#  MENU HELPERS
# ──────────────────────────────────────────────────────────────
def menu_bg():
    t = T()
    screen.fill(t["bg"])
    for i in range(0, WIDTH, 60):
        pygame.draw.line(screen, (*t["border"][:3], 40), (i,0),(i,HEIGHT))
    for j in range(0, HEIGHT, 60):
        pygame.draw.line(screen, (*t["border"][:3], 40), (0,j),(WIDTH,j))

def mbtn(label, rect, accent=False, danger=False, selected=False):
    t   = T()
    hov = rect.collidepoint(pygame.mouse.get_pos())
    if danger:
        bg = tuple(min(255,c+20) for c in t["bad"]) if hov else t["bad"]
        bc = t["bad"]; tc = (255,255,255)
    elif selected:
        bg = t["accent"]; bc = t["accent"]; tc = t["bg"]
    elif accent:
        bg = t["accent"] if hov else t["panel_bg"]
        bc = t["accent"]; tc = t["bg"] if hov else t["accent"]
    else:
        bg = tuple(min(255,c+22) for c in t["panel_bg"]) if hov else t["panel_bg"]
        bc = t["accent"] if hov else t["border"]
        tc = t["text"]
    filled_rect(bg, rect, r=9); outline_rect(bc, rect, w=2, r=9)
    ll = F_MED.render(label, True, tc)
    screen.blit(ll, (rect.centerx-ll.get_width()//2, rect.centery-ll.get_height()//2))
    return hov

def menu_small_btn(label, rect, selected=False):
    """Compact button for stats/options rows."""
    t   = T()
    hov = rect.collidepoint(pygame.mouse.get_pos())
    bg  = t["accent"] if selected else \
          (tuple(min(255,c+22) for c in t["panel_bg"]) if hov else t["panel_bg"])
    bc  = t["accent"] if (selected or hov) else t["border"]
    tc  = t["bg"] if selected else t["text"]
    filled_rect(bg, rect, r=7); outline_rect(bc, rect, w=1, r=7)
    ll = F_SMALL.render(label, True, tc)
    screen.blit(ll, (rect.centerx-ll.get_width()//2, rect.centery-ll.get_height()//2))
    return hov

# ──────────────────────────────────────────────────────────────
#  MAIN MENU
# ──────────────────────────────────────────────────────────────
def menu_main():
    """Returns 'play'|'theme'|'stats'|'quit'"""
    while True:
        menu_bg()
        t = T()
        tl = F_BIG.render(APP_NAME, True, t["accent"])
        screen.blit(tl, (WIDTH//2-tl.get_width()//2, 60))
        sub = F_MAIN.render("Game of brains and wise.", True, t["dim"])
        screen.blit(sub, (WIDTH//2-sub.get_width()//2, 118))

        W=280; H=54; X=WIDTH//2-W//2
        bp = pygame.Rect(X, 184, W, H)
        bt = pygame.Rect(X, 252, W, H)
        bs = pygame.Rect(X, 320, W, H)
        bq = pygame.Rect(X, 410, W, H)

        mbtn("▶  Play",   bp, accent=True)
        mbtn("◈  Theme",  bt)
        mbtn("📊  Stats",  bs)
        mbtn("✕  Quit",   bq, danger=True)

        # current theme name shown small
        tn = F_SMALL.render(f"Theme: {t['name']}", True, t["dim"])
        screen.blit(tn, (WIDTH//2-tn.get_width()//2, 316+H+6))

        pygame.display.flip()
        for e in pygame.event.get():
            if e.type == pygame.QUIT: quit_game()
            if e.type == pygame.KEYDOWN:
                if e.key in (pygame.K_q, pygame.K_ESCAPE): quit_game()
                if e.key == pygame.K_t: cycle_theme()
            if e.type == pygame.MOUSEBUTTONDOWN:
                if bp.collidepoint(e.pos): return "play"
                if bt.collidepoint(e.pos): cycle_theme()
                if bs.collidepoint(e.pos): return "stats"
                if bq.collidepoint(e.pos): quit_game()

# ──────────────────────────────────────────────────────────────
#  DIFFICULTY MENU  (11 levels)
# ──────────────────────────────────────────────────────────────
def menu_difficulty():
    """Returns 'ok'|'back'"""
    global level_idx
    scroll = max(0, level_idx - 4)   # keep selection visible

    while True:
        menu_bg()
        t = T()
        tl = F_BIG.render("Select Difficulty", True, t["accent"])
        screen.blit(tl, (WIDTH//2-tl.get_width()//2, 30))
        sub = F_SMALL.render("Choose your opponent's strength", True, t["dim"])
        screen.blit(sub, (WIDTH//2-sub.get_width()//2, 88))

        # Draw 6 visible levels at a time
        visible = 7
        start   = max(0, min(scroll, len(LEVELS)-visible))
        BW = 440; BH = 46; BX = WIDTH//2 - BW//2

        rects = []
        for i, idx in enumerate(range(start, min(start+visible, len(LEVELS)))):
            name, elo, _, _ = LEVELS[idx]
            r = pygame.Rect(BX, 112 + i*(BH+6), BW, BH)
            rects.append((r, idx))
            sel = (idx == level_idx)
            hov = r.collidepoint(pygame.mouse.get_pos())
            bg  = t["accent"] if sel else \
                  (tuple(min(255,c+22) for c in t["panel_bg"]) if hov else t["panel_bg"])
            bc  = t["accent"] if (sel or hov) else t["border"]
            tc_main = t["bg"] if sel else t["text"]
            tc_elo  = t["bg"] if sel else t["dim"]
            filled_rect(bg, r, r=9); outline_rect(bc, r, w=2, r=9)
            nl = F_BOLD.render(name, True, tc_main)
            screen.blit(nl, (r.x+16, r.centery-nl.get_height()//2))
            el = F_SMALL.render(f"{elo} ELO", True, tc_elo)
            screen.blit(el, (r.right-el.get_width()-16, r.centery-el.get_height()//2))

        # scroll arrows
        if start > 0:
            al = F_MED.render("▲", True, t["dim"])
            screen.blit(al, (WIDTH//2-al.get_width()//2, 102))
        if start + visible < len(LEVELS):
            al = F_MED.render("▼", True, t["dim"])
            screen.blit(al, (WIDTH//2-al.get_width()//2, 112+visible*(BH+6)+4))

        # back / ok
        bk = pygame.Rect(BX, HEIGHT-58, 130, 42)
        ok = pygame.Rect(BX+BW-160, HEIGHT-58, 160, 42)
        mbtn("← Back", bk)
        mbtn("Next →",  ok, accent=True)

        pygame.display.flip()

        for e in pygame.event.get():
            if e.type == pygame.QUIT: quit_game()
            if e.type == pygame.KEYDOWN:
                if e.key == pygame.K_ESCAPE: return "back"
                if e.key == pygame.K_RETURN: return "ok"
                if e.key == pygame.K_UP:
                    level_idx = max(0, level_idx-1)
                    scroll = max(0, level_idx-3)
                if e.key == pygame.K_DOWN:
                    level_idx = min(len(LEVELS)-1, level_idx+1)
                    scroll = min(len(LEVELS)-visible, level_idx-3)
            if e.type == pygame.MOUSEBUTTONDOWN:
                for r, idx in rects:
                    if r.collidepoint(e.pos):
                        level_idx = idx
                if bk.collidepoint(e.pos): return "back"
                if ok.collidepoint(e.pos): return "ok"
            if e.type == pygame.MOUSEWHEEL:
                scroll = max(0, min(len(LEVELS)-visible, scroll - e.y))

# ──────────────────────────────────────────────────────────────
#  SIDE MENU
# ──────────────────────────────────────────────────────────────
def menu_side():
    """Returns 'ok'|'back'"""
    global player_color
    while True:
        menu_bg()
        t  = T()
        tl = F_BIG.render("Play As", True, t["accent"])
        screen.blit(tl, (WIDTH//2-tl.get_width()//2, 50))
        lv = LEVELS[level_idx]
        sub = F_SMALL.render(f"Level {level_idx+1}  ·  {lv[1]} ELO  ·  {lv[2]}s/move",
                              True, t["dim"])
        screen.blit(sub, (WIDTH//2-sub.get_width()//2, 112))

        W,H = 168,168; gap=16
        total = W*3+gap*2
        sx = WIDTH//2 - total//2
        wr = pygame.Rect(sx,       200, W, H)
        br = pygame.Rect(sx+W+gap, 200, W, H)
        rr = pygame.Rect(sx+2*(W+gap), 200, W, H)

        mx,my = pygame.mouse.get_pos()
        for rect, sym, label, fbg, ftx, pc in [
            (wr, "♔", "White", (230,227,215), (20,18,14), chess.WHITE),
            (br, "♚", "Black", (28,26,36),    (228,224,240), chess.BLACK),
            (rr, "?", "Random", t["panel_bg"], t["text"], None),
        ]:
            sel = (player_color == pc) if pc is not None else False
            hov = rect.collidepoint(mx,my)
            bg  = fbg
            bc  = t["accent"] if (hov or sel) else t["border"]
            bw  = 4 if sel else (2 if hov else 1)
            filled_rect(bg, rect, r=14)
            outline_rect(bc, rect, w=bw, r=14)
            sl = F_BIG.render(sym, True, ftx)
            screen.blit(sl, (rect.centerx-sl.get_width()//2, rect.y+28))
            ll = F_MAIN.render(label, True, ftx)
            screen.blit(ll, (rect.centerx-ll.get_width()//2, rect.bottom-38))

        bk = pygame.Rect(WIDTH//2-200, HEIGHT-70, 150, 44)
        nxt= pygame.Rect(WIDTH//2+50,  HEIGHT-70, 150, 44)
        mbtn("← Back", bk)
        mbtn("Next →",  nxt, accent=True)
        pygame.display.flip()

        for e in pygame.event.get():
            if e.type == pygame.QUIT: quit_game()
            if e.type == pygame.KEYDOWN:
                if e.key == pygame.K_ESCAPE: return "back"
                if e.key == pygame.K_RETURN: return "ok"
            if e.type == pygame.MOUSEBUTTONDOWN:
                if wr.collidepoint(e.pos):  player_color = chess.WHITE
                if br.collidepoint(e.pos):  player_color = chess.BLACK
                if rr.collidepoint(e.pos):
                    player_color = random.choice([chess.WHITE, chess.BLACK])
                if bk.collidepoint(e.pos):  return "back"
                if nxt.collidepoint(e.pos): return "ok"

# ──────────────────────────────────────────────────────────────
#  OPTIONS MENU  (tutor + danger)
# ──────────────────────────────────────────────────────────────
def menu_options():
    """Returns 'ok'|'back'"""
    global tutor_on, danger_on
    while True:
        menu_bg()
        t  = T()
        tl = F_BIG.render("Options", True, t["accent"])
        screen.blit(tl, (WIDTH//2-tl.get_width()//2, 50))
        lv = LEVELS[level_idx]
        pc_str = "White" if player_color==chess.WHITE else "Black"
        sub = F_SMALL.render(f"Level {level_idx+1}  ·  {lv[1]} ELO  ·  Playing as {pc_str}",
                              True, t["dim"])
        screen.blit(sub, (WIDTH//2-sub.get_width()//2, 110))

        # option rows
        OW=380; OH=58; OX=WIDTH//2-OW//2

        def option_row(label, desc, val, ry):
            r  = pygame.Rect(OX, ry, OW, OH)
            filled_rect(t["panel_bg"], r, r=10)
            outline_rect(t["border"], r, w=1, r=10)
            ll = F_BOLD.render(label, True, t["text"])
            screen.blit(ll, (r.x+16, r.y+10))
            dl = F_SMALL.render(desc, True, t["dim"])
            screen.blit(dl, (r.x+16, r.y+32))
            # toggle
            tw=64; th=28
            tr = pygame.Rect(r.right-tw-12, r.centery-th//2, tw, th)
            tbg = t["good"] if val else t["border"]
            filled_rect(tbg, tr, r=14)
            tlbl = F_SMALL.render("ON" if val else "OFF", True, t["bg"] if val else t["dim"])
            screen.blit(tlbl, (tr.centerx-tlbl.get_width()//2, tr.centery-tlbl.get_height()//2))
            return r

        r_tutor  = option_row("Tutor Mode",
                               "Show legal move hints when you click a piece",
                               tutor_on, 160)
        r_danger = option_row("Danger Squares",
                               "Highlight squares attacked by the opponent",
                               danger_on, 236)

        bk  = pygame.Rect(OX,         HEIGHT-70, 150, 44)
        play= pygame.Rect(OX+OW-160,  HEIGHT-70, 160, 44)
        mbtn("← Back", bk)
        mbtn("Let's Play!", play, accent=True)
        pygame.display.flip()

        for e in pygame.event.get():
            if e.type == pygame.QUIT: quit_game()
            if e.type == pygame.KEYDOWN:
                if e.key == pygame.K_ESCAPE: return "back"
                if e.key == pygame.K_RETURN: return "ok"
            if e.type == pygame.MOUSEBUTTONDOWN:
                if r_tutor.collidepoint(e.pos):  tutor_on  = not tutor_on
                if r_danger.collidepoint(e.pos): danger_on = not danger_on
                if bk.collidepoint(e.pos):   return "back"
                if play.collidepoint(e.pos): return "ok"

# ──────────────────────────────────────────────────────────────
#  STATS SCREEN
# ──────────────────────────────────────────────────────────────
def menu_stats():
    scroll = 0
    while True:
        menu_bg()
        t  = T()
        tl = F_BIG.render("Statistics", True, t["accent"])
        screen.blit(tl, (WIDTH//2-tl.get_width()//2, 28))

        # summary row
        W=160; H=68; gap=14; sx=WIDTH//2-int(W*1.5+gap)
        total_games = stats["wins"]+stats["losses"]+stats["draws"]
        for i,(label,val) in enumerate([
            ("Wins",   str(stats["wins"])),
            ("Losses", str(stats["losses"])),
            ("Draws",  str(stats["draws"])),
            ("Best Acc", f"{stats.get('best_acc',0):.1f}%"),
        ]):
            r = pygame.Rect(sx+i*(W+gap), 90, W, H)
            filled_rect(t["panel_bg"], r, r=10)
            outline_rect(t["border"], r, w=1, r=10)
            vl = F_MED.render(val, True, t["accent"])
            screen.blit(vl, (r.centerx-vl.get_width()//2, r.y+8))
            ll = F_SMALL.render(label, True, t["dim"])
            screen.blit(ll, (r.centerx-ll.get_width()//2, r.y+44))

        # match list
        matches = list(reversed(stats["matches"]))
        headers = ["#","Result","Accuracy","Rating","Level","Moves"]
        cols    = [30, 120, 100, 80, 60, 60]
        mx_list = [WIDTH//2-sum(cols)//2 + sum(cols[:i]) for i in range(len(cols))]

        blit("Recent Matches", mx_list[0], 174, F_TITLE, t["accent"])
        for ci,(h,cx) in enumerate(zip(headers, mx_list)):
            blit(h, cx+2, 198, F_TINY, t["dim"])
        pygame.draw.line(screen, t["border"], (mx_list[0]-4,212),
                         (mx_list[-1]+cols[-1]+4, 212), 1)

        visible = 9
        for ri, m in enumerate(matches[scroll:scroll+visible]):
            y = 218 + ri*22
            rc = t["good"] if m["result"]=="win" else \
                 t["bad"]  if m["result"] in ("loss","resigned") else \
                 t["dim"]
            vals = [str(scroll+ri+1), m["result"].capitalize(),
                    f"{m['accuracy']:.1f}%", str(m["rating"]),
                    str(m["level"]), str(m["moves"])]
            for ci,(v,cx) in enumerate(zip(vals, mx_list)):
                col = rc if ci==1 else t["text"]
                blit(v, cx+2, y, F_SMALL, col)

        if len(matches) > visible:
            blit(f"↑↓ scroll  ({scroll+1}-{min(scroll+visible,len(matches))} of {len(matches)})",
                 WIDTH//2, HEIGHT-60, F_TINY, t["dim"], center=True)

        bk = pygame.Rect(WIDTH//2-80, HEIGHT-48, 160, 38)
        mbtn("← Back", bk)
        pygame.display.flip()

        for e in pygame.event.get():
            if e.type == pygame.QUIT: quit_game()
            if e.type == pygame.KEYDOWN:
                if e.key in (pygame.K_ESCAPE, pygame.K_m): return
                if e.key == pygame.K_UP:   scroll = max(0, scroll-1)
                if e.key == pygame.K_DOWN: scroll = min(max(0,len(matches)-visible), scroll+1)
            if e.type == pygame.MOUSEWHEEL:
                scroll = max(0, min(max(0,len(matches)-visible), scroll-e.y))
            if e.type == pygame.MOUSEBUTTONDOWN:
                if bk.collidepoint(e.pos): return

# ──────────────────────────────────────────────────────────────
#  GAME LOOP
# ──────────────────────────────────────────────────────────────
def game_loop():
    global dragging, drag_pos, last_move, eval_score, move_accuracy
    global white_time, black_time, board_flipped, player_rating

    game_over   = False
    result_str  = ""   # 'win'|'loss'|'draw'|'abandoned'|'resigned'

    while True:
        dt = clock.tick(FPS) / 1000.0

        if not game_over:
            if not board.is_game_over():
                if board.turn==chess.WHITE: white_time -= dt
                else:                       black_time -= dt
            else:
                res = board.result()
                if res=="1-0":
                    result_str = "win" if player_color==chess.WHITE else "loss"
                elif res=="0-1":
                    result_str = "win" if player_color==chess.BLACK else "loss"
                else:
                    result_str = "draw"
                record_match(result_str, move_accuracy, player_rating,
                             level_idx, len(san_history))
                game_over = True

        # render
        screen.fill(T()["bg"])
        draw_eval_bar()
        draw_squares()
        draw_danger()
        draw_last_move_hi()
        draw_check_hi()
        draw_dots(dragging)
        draw_pieces_on_board(skip=dragging)

        if dragging and drag_pos:
            p = board.piece_at(dragging)
            if p:
                code = ('w' if p.color else 'b') + p.symbol().lower()
                screen.blit(IMAGES[code],
                            (drag_pos[0]-SQ//2, drag_pos[1]-SQ//2))

        draw_panel()
        draw_player_bars()

        if game_over:
            draw_game_over(result_str)

        pygame.display.flip()

        # AI turn
        if not game_over and board.turn != player_color:
            pygame.event.pump()
            do_ai()

        # events
        for e in pygame.event.get():
            if e.type == pygame.QUIT:
                quit_game()

            if e.type == pygame.KEYDOWN:
                if e.key in (pygame.K_q, pygame.K_ESCAPE):
                    quit_game()
                if e.key == pygame.K_t:
                    cycle_theme()
                if e.key == pygame.K_m:
                    # main menu shortcut (after game over or anytime)
                    return "menu"
                if e.key == pygame.K_r:
                    reset_game(); game_over = False; result_str = ""
                if e.key == pygame.K_u and not game_over:
                    # undo 2 plies (player + AI)
                    n = min(2, len(move_history))
                    for _ in range(n):
                        board.pop(); move_history.pop(); san_history.pop()
                        if eval_history:  eval_history.pop()
                        if acc_history:   acc_history.pop()
                    last_move     = move_history[-1] if move_history else None
                    eval_score    = eval_history[-1]  if eval_history else 0.0
                    move_accuracy = (sum(acc_history)/len(acc_history)
                                     if acc_history else 100.0)

            if e.type == pygame.MOUSEBUTTONDOWN and e.button == 1:
                mx, my = e.pos

                # panel buttons
                if not game_over:
                    if "undo" in _PANEL_BTNS and _PANEL_BTNS["undo"].collidepoint(mx,my):
                        n = min(2, len(move_history))
                        for _ in range(n):
                            board.pop(); move_history.pop(); san_history.pop()
                            if eval_history:  eval_history.pop()
                            if acc_history:   acc_history.pop()
                        last_move     = move_history[-1] if move_history else None
                        eval_score    = eval_history[-1]  if eval_history else 0.0
                        move_accuracy = (sum(acc_history)/len(acc_history)
                                         if acc_history else 100.0)

                    elif _PANEL_BTNS.get("flip") and _PANEL_BTNS["flip"].collidepoint(mx,my):
                        board_flipped = not board_flipped

                    elif _PANEL_BTNS.get("abandon") and _PANEL_BTNS["abandon"].collidepoint(mx,my):
                        if confirm_dialog("Abandon this match?"):
                            record_match("abandoned", move_accuracy, player_rating,
                                         level_idx, len(san_history))
                            result_str = "abandoned"; game_over = True

                    elif _PANEL_BTNS.get("resign") and _PANEL_BTNS["resign"].collidepoint(mx,my):
                        if confirm_dialog("Resign this match?"):
                            record_match("resigned", move_accuracy, player_rating,
                                         level_idx, len(san_history))
                            result_str = "resigned"; game_over = True

                # game-over shortcuts
                if game_over:
                    pass  # handled by keydown R/M/Q

                # board click – pick up piece
                if not game_over and board.turn == player_color:
                    sq = px_sq(mx, my)
                    if sq is not None:
                        p = board.piece_at(sq)
                        if p and p.color == player_color:
                            dragging = sq; drag_pos = (mx, my)

            if e.type == pygame.MOUSEMOTION:
                if dragging: drag_pos = e.pos

            if e.type == pygame.MOUSEBUTTONUP and e.button == 1:
                if dragging is not None:
                    tgt = px_sq(*e.pos)
                    if tgt is not None:
                        for m in board.legal_moves:
                            if m.from_square==dragging and m.to_square==tgt:
                                do_player(m); break
                    dragging = drag_pos = None

        # game-over key shortcuts (R = new game, M = menu)
        # already handled in KEYDOWN above; M returns "menu"

    return "menu"

# ──────────────────────────────────────────────────────────────
#  ENTRY POINT
# ──────────────────────────────────────────────────────────────
load_pieces()

while True:
    action = menu_main()
    if action == "stats":
        menu_stats()
        continue
    if action == "theme":
        cycle_theme()
        continue
    # action == "play"
    # difficulty → side → options → game
    step = "difficulty"
    while True:
        if step == "difficulty":
            r = menu_difficulty()
            step = "side" if r=="ok" else "__main"
        elif step == "side":
            r = menu_side()
            step = "options" if r=="ok" else "difficulty"
        elif step == "options":
            r = menu_options()
            step = "game" if r=="ok" else "side"
        elif step == "game":
            reset_game()
            ret = game_loop()
            step = "__main"    # after game always back to main
        else:
            break
