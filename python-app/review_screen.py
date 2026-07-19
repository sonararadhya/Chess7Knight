import pygame
import chess
import math
from utils import (
    WIDTH, HEIGHT, SQ, BOARD_LEFT, BOARD_TOP, BOARD_PX, PANEL_W,
    get_font, sq_to_px, px_to_sq, blit_text, draw_filled_rect, draw_outline_rect, draw_alpha_rect, fmt_time
)
from animation import animate_chess_move, blit_alpha
from graphs import ChessCharts
from review_engine import GameReviewEngine

def draw_arrow(screen, start, end, color, width=5, head_size=12):
    """Draw a beautiful arrow from start to end pixel coordinates with a triangle head."""
    x1, y1 = start
    x2, y2 = end
    
    # Calculate vector direction
    dx = x2 - x1
    dy = y2 - y1
    dist = math.hypot(dx, dy)
    if dist < 5:
        return
        
    # Shorten the arrow slightly so it sits nicely in the centers of squares
    x2_short = x2 - (dx / dist) * (SQ // 3.5)
    y2_short = y2 - (dy / dist) * (SQ // 3.5)
    
    # Draw main shaft
    pygame.draw.line(screen, color, (x1, y1), (x2_short, y2_short), width)
    
    # Calculate arrowhead points
    angle = math.atan2(dy, dx)
    p1 = (x2_short - head_size * math.cos(angle - math.pi / 6),
          y2_short - head_size * math.sin(angle - math.pi / 6))
    p2 = (x2_short - head_size * math.cos(angle + math.pi / 6),
          y2_short - head_size * math.sin(angle + math.pi / 6))
          
    pygame.draw.polygon(screen, color, [(x2_short, y2_short), p1, p2])

class GameReviewUI:
    def __init__(self, screen, move_history, initial_fen=None, bot_level_idx=6, images=None, theme=None):
        self.screen = screen
        self.images = images
        self.theme = theme
        self.initial_fen = initial_fen
        self.move_history = move_history
        self.bot_level_idx = bot_level_idx
        
        # UI State
        self.current_idx = -1  # -1 is initial board position
        self.tab = "review"    # "review" or "summary"
        
        # Engine Settings
        self.config_depth = 15
        self.config_threads = 2
        self.config_hash = 64
        self.config_multipv = 3
        
        # Playback
        self.is_playing = False
        self.playback_speed = 1.0  # 0.5x, 1x, 2x, 4x
        self.last_playback_tick = pygame.time.get_ticks()
        
        # Interactive features
        self.show_best_line = False
        self.show_threat = False
        self.show_tactical = False
        
        # Retry mode variables
        self.retry_board = None     # Temporary board when in retry mode
        self.retry_moves = []       # Moves played in retry mode
        self.retry_eval = None      # Evaluation score of the retry
        self.dragging_retry = None
        self.drag_pos_retry = None
        
        # Load engine
        self.review_engine = GameReviewEngine(
            move_history, initial_fen, bot_level_idx, self.config_depth
        )
        self.review_engine.start_analysis(self.config_threads, self.config_hash)
        
        self.charts = ChessCharts(theme)
        
        # Buttons & Areas definitions
        self.define_buttons()
        self.eval_bar_score = 0.0  # For smooth evaluation bar transitions
        self.clock = pygame.time.Clock()

    def define_buttons(self):
        # Navigation Row below board
        by = BOARD_TOP + BOARD_PX + 4
        bw = 36
        self.btn_first = pygame.Rect(BOARD_LEFT + 10, by, bw, 28)
        self.btn_prev  = pygame.Rect(BOARD_LEFT + 10 + 42, by, bw, 28)
        self.btn_play  = pygame.Rect(BOARD_LEFT + 10 + 84, by, bw+20, 28)
        self.btn_next  = pygame.Rect(BOARD_LEFT + 10 + 146, by, bw, 28)
        self.btn_last  = pygame.Rect(BOARD_LEFT + 10 + 188, by, bw, 28)
        
        # Speed buttons
        self.btn_speed_05 = pygame.Rect(BOARD_LEFT + 240, by, 34, 28)
        self.btn_speed_10 = pygame.Rect(BOARD_LEFT + 278, by, 30, 28)
        self.btn_speed_20 = pygame.Rect(BOARD_LEFT + 312, by, 30, 28)
        self.btn_speed_40 = pygame.Rect(BOARD_LEFT + 346, by, 30, 28)
        
        # Auto Replay
        self.btn_auto = pygame.Rect(BOARD_LEFT + 390, by, 76, 28)
        
        # Tabs on right panel
        self.tab_review_btn = pygame.Rect(BOARD_LEFT + BOARD_PX + 12, 10, 130, 32)
        self.tab_summary_btn = pygame.Rect(BOARD_LEFT + BOARD_PX + 150, 10, 130, 32)
        
        # Action Buttons in Panel
        self.btn_best_line = pygame.Rect(BOARD_LEFT + BOARD_PX + 15, HEIGHT - 180, 125, 28)
        self.btn_threat    = pygame.Rect(BOARD_LEFT + BOARD_PX + 155, HEIGHT - 180, 125, 28)
        self.btn_tactical  = pygame.Rect(BOARD_LEFT + BOARD_PX + 15, HEIGHT - 146, 125, 28)
        self.btn_retry     = pygame.Rect(BOARD_LEFT + BOARD_PX + 155, HEIGHT - 146, 125, 28)
        
        # Return to main menu
        self.btn_menu = pygame.Rect(BOARD_LEFT + BOARD_PX + 15, HEIGHT - 46, 266, 32)
        
        # Config Depth buttons (on summary screen)
        self.btn_depth_12 = pygame.Rect(BOARD_LEFT + 20, HEIGHT - 85, 30, 24)
        self.btn_depth_15 = pygame.Rect(BOARD_LEFT + 55, HEIGHT - 85, 30, 24)
        self.btn_depth_18 = pygame.Rect(BOARD_LEFT + 90, HEIGHT - 85, 30, 24)
        self.btn_depth_20 = pygame.Rect(BOARD_LEFT + 125, HEIGHT - 85, 30, 24)

    def get_current_board(self):
        """Return the board at the current move index, or initial board."""
        if self.retry_board:
            return self.retry_board
            
        board = chess.Board(self.initial_fen) if self.initial_fen else chess.Board()
        for i in range(min(self.current_idx + 1, len(self.move_history))):
            board.push(self.move_history[i])
        return board

    def get_played_move(self):
        if 0 <= self.current_idx < len(self.move_history):
            return self.move_history[self.current_idx]
        return None

    def draw_eval_bar(self):
        """Draw the animated vertical evaluation bar on the left edge."""
        t = self.theme
        by = BOARD_TOP
        bh = BOARD_PX
        ew = BOARD_LEFT
        
        # Determine score
        target_score = 0.0
        is_mate = False
        mate_str = ""
        
        if 0 <= self.current_idx < len(self.review_engine.review_details):
            item = self.review_engine.review_details[self.current_idx]
            score = item["played_score"].white()
            if score.is_mate():
                is_mate = True
                target_score = 2000.0 if score.mate() > 0 else -2000.0
                mate_str = f"M{abs(score.mate())}"
            else:
                target_score = score.score(default=0)
        
        # Smoothly interpolate eval score
        # Since evaluation can swing wildly, we want a smooth transition
        diff = target_score - self.eval_bar_score
        self.eval_bar_score += diff * 0.15
        
        # Map score to win probability
        # Win probability is 0.5 at cp=0, and ranges from 0.0 to 1.0
        cp = self.eval_bar_score
        win_prob = 0.5 + 0.5 * math.erf(cp / (290.0 * math.sqrt(2)))
        
        # Draw background (Black side)
        pygame.draw.rect(self.screen, t["ev_b"], (0, by, ew, bh))
        
        # Draw White side (bottom)
        wh = int(bh * win_prob)
        pygame.draw.rect(self.screen, t["ev_w"], (0, by + bh - wh, ew, wh))
        
        # Draw center line
        pygame.draw.line(self.screen, t["border"], (0, by + bh//2), (ew, by + bh//2), 1)
        
        # Text display
        font = get_font(10, bold=True)
        if is_mate:
            lbl_str = mate_str
        else:
            lbl_str = f"{abs(self.eval_bar_score/100.0):.1f}"
            
        lbl = font.render(lbl_str, True, t["bg"] if win_prob > 0.5 else t["text"])
        lbl_rot = pygame.transform.rotate(lbl, 90)
        
        # Position label on white or black side depending on evaluation
        ly = by + bh - wh + 8 if win_prob > 0.5 else by + bh - wh - lbl_rot.get_height() - 8
        self.screen.blit(lbl_rot, (ew//2 - lbl_rot.get_width()//2, ly))

    def draw_hud_panels(self):
        """Draw player bars: Opponent Bot on top, Username on bottom."""
        t = self.theme
        by = BOARD_TOP + BOARD_PX
        flipped = (self.theme["name"] == "Neon") # Or custom flip indicator
        
        # Draw top bar (Opponent)
        draw_filled_rect(self.screen, t["panel_bg"], (BOARD_LEFT, 0, BOARD_PX, BOARD_TOP), r=0)
        bot_elo = [400, 750, 950, 1050, 1250, 1350, 1450, 1550, 1650, 1850, 1950][self.bot_level_idx]
        bot_str = f"Stockfish Level {self.bot_level_idx+1} ({bot_elo} ELO)"
        
        # If review is complete, we show estimated ratings
        if self.review_engine.is_complete:
            bot_str += f" · Est. Rating: {self.review_engine.summary['black_rating']} ±{self.review_engine.summary['black_rating_error']}"
            
        blit_text(self.screen, bot_str, BOARD_LEFT + 10, 14, get_font(14, bold=True), t["dim"])
        
        # Draw bottom bar (Player)
        draw_filled_rect(self.screen, t["panel_bg"], (BOARD_LEFT, by, BOARD_PX, BOT_H), r=0)
        player_str = f"Player (aradhyasonar)"
        if self.review_engine.is_complete:
            player_str += f" · Est. Rating: {self.review_engine.summary['white_rating']} ±{self.review_engine.summary['white_rating_error']}"
            
        blit_text(self.screen, player_str, BOARD_LEFT + 10, by + 10, get_font(14, bold=True), t["text"])

    def draw_playback_controls(self):
        """Draw buttons below player bar for first, prev, play/pause, next, last, speeds, auto replay."""
        t = self.theme
        mx, my = pygame.mouse.get_pos()
        
        def render_btn(rect, label, active=False, danger=False):
            hov = rect.collidepoint(mx, my)
            if active:
                bg = t["accent"]
                bc = t["accent"]
                tc = t["bg"]
            else:
                bg = tuple(min(255, c+20) for c in t["panel_bg"]) if hov else t["panel_bg"]
                bc = t["accent"] if hov else t["border"]
                tc = t["accent"] if hov else t["text"]
            draw_filled_rect(self.screen, bg, rect, r=6)
            draw_outline_rect(self.screen, bc, rect, w=1, r=6)
            lbl = get_font(12, bold=True).render(label, True, tc)
            self.screen.blit(lbl, (rect.centerx - lbl.get_width()//2, rect.centery - lbl.get_height()//2))

        render_btn(self.btn_first, "<<" )
        render_btn(self.btn_prev,  "<"  )
        render_btn(self.btn_play,  "PAUSE" if self.is_playing else "PLAY", active=self.is_playing)
        render_btn(self.btn_next,  ">"  )
        render_btn(self.btn_last,  ">>" )
        
        # Speeds
        render_btn(self.btn_speed_05, "0.5", active=(self.playback_speed == 0.5))
        render_btn(self.btn_speed_10, "1.0", active=(self.playback_speed == 1.0))
        render_btn(self.btn_speed_20, "2.0", active=(self.playback_speed == 2.0))
        render_btn(self.btn_speed_40, "4.0", active=(self.playback_speed == 4.0))
        
        # Auto
        render_btn(self.btn_auto, "AUTO", active=self.is_playing)

    def draw_interactive_replay_tab(self):
        """Draw the right panel when Interactive Replay tab is active."""
        t = self.theme
        px = BOARD_LEFT + BOARD_PX
        pw = PANEL_W
        lx = px + 15
        rx = px + pw - 15
        
        # Load font
        f_title = get_font(16, bold=True)
        f_main = get_font(14)
        f_bold = get_font(14, bold=True)
        f_tiny = get_font(11)
        f_med = get_font(18, bold=True)
        
        y = 55
        
        # 1. Loading state for engine
        engine_ready = self.review_engine.is_complete
        analyzed_count = self.review_engine.completed_moves
        total = self.review_engine.total_moves
        
        if not engine_ready:
            draw_filled_rect(self.screen, t["border"], (lx, y, pw - 30, 24), r=5)
            w_fill = int((pw - 30) * (analyzed_count / max(1, total)))
            if w_fill > 0:
                draw_filled_rect(self.screen, t["accent"], (lx, y, w_fill, 24), r=5)
            lbl = f_tiny.render(f"Analyzing: {analyzed_count}/{total} moves...", True, t["bg"])
            self.screen.blit(lbl, (lx + 10, y + 6))
            y += 34
        else:
            blit_text(self.screen, "ANALYSIS COMPLETE", lx, y, f_bold, t["good"])
            y += 24

        # 2. Selected Move display
        if self.current_idx == -1:
            blit_text(self.screen, "Starting Position", lx, y, f_med, t["text"])
            y += 25
            blit_text(self.screen, "Replay the game to begin the review.", lx, y, f_main, t["dim"])
            y += 40
        else:
            if self.current_idx < len(self.review_engine.review_details):
                item = self.review_engine.review_details[self.current_idx]
                
                # Move Num & SAN
                color_turn = "White" if item["turn"] == chess.WHITE else "Black"
                blit_text(self.screen, f"Move {item['move_number']}. {item['san']} ({color_turn})", lx, y, f_med, t["text"])
                y += 26
                
                # Accuracy & Eval
                acc_col = t["good"] if item["accuracy"]>=80 else t["accent2"] if item["accuracy"]>=55 else t["bad"]
                blit_text(self.screen, f"Accuracy: {item['accuracy']:.1f}%", lx, y, f_bold, acc_col)
                
                score = item["played_score"].white()
                score_str = f"{score.score(default=0)/100.0:+.2f}" if not score.is_mate() else f"M{score.mate()}"
                blit_text(self.screen, f"Eval: {score_str}", rx, y, f_bold, t["accent"], right=True)
                y += 24
                
                # Classification Badge
                cls = item["classification"]
                cls_color = self.charts.get_quality_color(cls)
                badge_rect = pygame.Rect(lx, y, 100, 22)
                draw_filled_rect(self.screen, cls_color, badge_rect, r=4)
                lbl_badge = f_tiny.render(cls.upper(), True, (255,255,255))
                self.screen.blit(lbl_badge, (badge_rect.centerx - lbl_badge.get_width()//2, badge_rect.centery - lbl_badge.get_height()//2))
                y += 30
                
                # Explanation
                explanation_box = pygame.Rect(lx, y, pw - 30, 72)
                draw_filled_rect(self.screen, t["bg"], explanation_box, r=6)
                draw_outline_rect(self.screen, t["border"], explanation_box, w=1, r=6)
                
                # Wrap text helper
                words = item["explanation"].split(' ')
                lines = []
                curr_line = []
                for w_word in words:
                    curr_line.append(w_word)
                    test_str = ' '.join(curr_line)
                    if f_tiny.size(test_str)[0] > pw - 50:
                        curr_line.pop()
                        lines.append(' '.join(curr_line))
                        curr_line = [w_word]
                if curr_line:
                    lines.append(' '.join(curr_line))
                    
                for li, line in enumerate(lines[:4]):
                    self.screen.blit(f_tiny.render(line, True, t["text"]), (lx + 8, y + 6 + li*15))
                y += 82
                
                # Best Continuation
                blit_text(self.screen, "Best Move Continuation:", lx, y, f_bold, t["accent2"])
                y += 18
                
                # Format best continuation SAN moves
                # The engine outputs moves as a list of chess.Move in best_pv
                temp_b = chess.Board(item["fen_before"])
                pv_sans = []
                for pv_m in item["best_pv"][:4]:
                    if pv_m in temp_b.legal_moves:
                        pv_sans.append(temp_b.san(pv_m))
                        temp_b.push(pv_m)
                    else:
                        break
                pv_str = " ".join(pv_sans) if pv_sans else "No line available"
                blit_text(self.screen, pv_str, lx, y, f_tiny, t["dim"])
                y += 24

        # 3. Interactive controls
        draw_filled_rect(self.screen, t["bg"], (lx, HEIGHT - 222, pw - 30, 168), r=8)
        draw_outline_rect(self.screen, t["border"], (lx, HEIGHT - 222, pw - 30, 168), w=1, r=8)
        blit_text(self.screen, "INTERACTIVE ACTIONS", lx + 10, HEIGHT - 214, f_bold, t["accent"])
        
        # Draw buttons
        mx, my = pygame.mouse.get_pos()
        def render_act_btn(rect, label, active=False):
            hov = rect.collidepoint(mx, my)
            bg = t["accent"] if active else (tuple(min(255, c+20) for c in t["panel_bg"]) if hov else t["panel_bg"])
            bc = t["accent"] if (active or hov) else t["border"]
            tc = t["bg"] if active else (t["accent"] if hov else t["text"])
            draw_filled_rect(self.screen, bg, rect, r=5)
            draw_outline_rect(self.screen, bc, rect, w=1, r=5)
            lbl = f_tiny.render(label, True, tc)
            self.screen.blit(lbl, (rect.centerx - lbl.get_width()//2, rect.centery - lbl.get_height()//2))
            
        render_act_btn(self.btn_best_line, "Show Best Line", active=self.show_best_line)
        render_act_btn(self.btn_threat, "Show Threat", active=self.show_threat)
        render_act_btn(self.btn_tactical, "Show Motifs", active=self.show_tactical)
        
        retry_label = "Reset Retry" if self.retry_board else "Retry Move"
        render_act_btn(self.btn_retry, retry_label, active=(self.retry_board is not None))
        
        # Display retry eval if in retry mode
        if self.retry_board and self.retry_eval:
            r_str = f"Retry Eval: {self.retry_eval/100.0:+.2f}"
            blit_text(self.screen, r_str, lx + 10, HEIGHT - 108, f_tiny, t["accent2"])

        # Timeline at the bottom of the panel
        blit_text(self.screen, "Move Timeline (Click to jump):", lx, HEIGHT - 100, f_tiny, t["dim"])
        timeline_rect = pygame.Rect(lx, HEIGHT - 84, pw - 30, 30)
        self.timeline_zones = self.charts.draw_interactive_timeline(
            self.screen, timeline_rect, self.review_engine.review_details, self.current_idx
        )

    def draw_summary_tab(self):
        """Draw the right panel when Game Summary tab is active."""
        t = self.theme
        px = BOARD_LEFT + BOARD_PX
        pw = PANEL_W
        lx = px + 15
        rx = px + pw - 15
        
        f_title = get_font(15, bold=True)
        f_bold = get_font(13, bold=True)
        f_tiny = get_font(11)
        f_main = get_font(12)
        f_med = get_font(16, bold=True)
        
        if not self.review_engine.is_complete:
            # Summary not ready
            lbl = f_bold.render("Summary compiling...", True, t["dim"])
            self.screen.blit(lbl, (lx + 20, 100))
            return
            
        sum_data = self.review_engine.summary
        
        # Display accuracies
        draw_filled_rect(self.screen, t["bg"], (lx, 55, pw - 30, 78), r=6)
        draw_outline_rect(self.screen, t["border"], (lx, 55, pw - 30, 78), w=1, r=6)
        
        blit_text(self.screen, "GAME ACCURACY", lx + 10, 60, f_bold, t["accent2"])
        
        # White Acc
        blit_text(self.screen, "White (You)", lx + 10, 80, f_main, t["text"])
        draw_filled_rect(self.screen, t["border"], (lx + 90, 84, 100, 8), r=4)
        draw_filled_rect(self.screen, t["good"], (lx + 90, 84, int(sum_data["white_accuracy"]), 8), r=4)
        blit_text(self.screen, f"{sum_data['white_accuracy']}%", rx - 10, 80, f_bold, t["good"], right=True)
        
        # Black Acc
        blit_text(self.screen, "Black (Bot)", lx + 10, 100, f_main, t["text"])
        draw_filled_rect(self.screen, t["border"], (lx + 90, 104, 100, 8), r=4)
        draw_filled_rect(self.screen, t["accent"], (lx + 90, 104, int(sum_data["black_accuracy"]), 8), r=4)
        blit_text(self.screen, f"{sum_data['black_accuracy']}%", rx - 10, 100, f_bold, t["accent"], right=True)
        
        # Classification comparison table
        y = 142
        blit_text(self.screen, "CLASSIFICATIONS", lx, y, f_bold, t["accent"])
        y += 18
        
        headers = ["Move Quality", "W", "B"]
        col_w = [140, 40, 40]
        mx_cols = [lx, lx + 140, lx + 180]
        
        for h, mx in zip(headers, mx_cols):
            blit_text(self.screen, h, mx, y, f_tiny, t["dim"])
        y += 14
        pygame.draw.line(self.screen, t["border"], (lx, y), (rx, y), 1)
        y += 6
        
        qualities = ["Brilliant", "Great", "Best", "Excellent", "Good", "Book", "Forced", "Inaccuracy", "Mistake", "Blunder"]
        for q in qualities:
            q_col = self.charts.get_quality_color(q)
            # Dot indicator
            pygame.draw.circle(self.screen, q_col, (lx + 5, y + 7), 4)
            blit_text(self.screen, q, lx + 14, y, f_tiny, t["text"])
            
            w_c = sum_data["white_counts"].get(q, 0)
            b_c = sum_data["black_counts"].get(q, 0)
            
            blit_text(self.screen, str(w_c), lx + 145, y, f_tiny, t["dim"] if w_c==0 else t["text"])
            blit_text(self.screen, str(b_c), lx + 185, y, f_tiny, t["dim"] if b_c==0 else t["text"])
            
            y += 15
            
        y += 10
        # Opening name
        blit_text(self.screen, f"Opening: {sum_data['opening_name']}", lx, y, f_bold, t["accent2"])
        y += 18
        blit_text(self.screen, f"Avg. Centipawn Loss: {sum_data['avg_cpl']:.1f}", lx, y, f_tiny, t["text"])

    def draw_board_view(self):
        """Draw the main chessboard, highlights, and arrows."""
        t = self.theme
        board = self.get_current_board()
        flipped = (t["name"] == "Neon") # Or custom flip
        
        # 1. Draw Squares
        for sr in range(8):
            for sc in range(8):
                rank = sr if flipped else 7 - sr
                file = 7 - sc if flipped else sc
                light = (file + rank) % 2 == 1
                col = t["sq_light"] if light else t["sq_dark"]
                pygame.draw.rect(self.screen, col, (BOARD_LEFT + sc*SQ, BOARD_TOP + sr*SQ, SQ, SQ))
                
        # Labels
        for i in range(8):
            fl = chr(ord('a') + (7-i if flipped else i))
            rn = str(i+1 if flipped else 8-i)
            lf = get_font(11).render(fl, True, t["dim"])
            lr = get_font(11).render(rn, True, t["dim"])
            self.screen.blit(lf, (BOARD_LEFT + i*SQ + SQ - lf.get_width() - 2,
                                  BOARD_TOP + BOARD_PX - lf.get_height() - 1))
            self.screen.blit(lr, (BOARD_LEFT + 2, BOARD_TOP + i*SQ + 2))

        # 2. Played Move Highlights (previous and current square)
        # Only if not in retry mode
        if not self.retry_board:
            played_move = self.get_played_move()
            if played_move:
                rgba = t.get("hi", (255, 220, 50, 105))
                for sq in [played_move.from_square, played_move.to_square]:
                    px, py = sq_to_px(sq, flipped)
                    s = pygame.Surface((SQ, SQ), pygame.SRCALPHA)
                    s.fill(rgba[:3] + (rgba[3],))
                    self.screen.blit(s, (px, py))

        # 3. Check Highlight
        if board.is_check():
            ksq = board.king(board.turn)
            px, py = sq_to_px(ksq, flipped)
            s = pygame.Surface((SQ, SQ), pygame.SRCALPHA)
            s.fill(t.get("chk", (255, 55, 55, 160)))
            self.screen.blit(s, (px, py))

        # 4. Attacked / Pins / Forks / Motif Highlights (Toggleable)
        if self.show_tactical and 0 <= self.current_idx < len(self.review_engine.review_details):
            item = self.review_engine.review_details[self.current_idx]
            hl = item["highlights"]
            
            # Attacked/danger squares (opponent attacks)
            # Highlight pins, forks, hanging pieces
            # Pins in Blue
            for sq in hl.get("pinned", []):
                px, py = sq_to_px(sq, flipped)
                pygame.draw.rect(self.screen, (0, 0, 255), (px+4, py+4, SQ-8, SQ-8), 3, border_radius=4)
                
            # Forks in Yellow
            for sq in hl.get("forks", []):
                px, py = sq_to_px(sq, flipped)
                pygame.draw.rect(self.screen, (241, 196, 15), (px+6, py+6, SQ-12, SQ-12), 3, border_radius=4)
                
            # Hanging in Red
            for sq in hl.get("hanging", []):
                px, py = sq_to_px(sq, flipped)
                pygame.draw.rect(self.screen, (231, 76, 60), (px+8, py+8, SQ-16, SQ-16), 3, border_radius=4)

        # 5. Draw Pieces
        # If dragging retry piece, skip it
        skip_sq = self.dragging_retry
        for sq in chess.SQUARES:
            if sq == skip_sq:
                continue
            p = board.piece_at(sq)
            if p:
                code = ('w' if p.color else 'b') + p.symbol().lower()
                self.screen.blit(self.images[code], sq_to_px(sq, flipped))

        # Dragging retry piece
        if self.dragging_retry and self.drag_pos_retry:
            p = board.piece_at(self.dragging_retry)
            if p:
                code = ('w' if p.color else 'b') + p.symbol().lower()
                self.screen.blit(self.images[code], (self.drag_pos_retry[0] - SQ//2, self.drag_pos_retry[1] - SQ//2))

        # 6. Arrows (Best move and played move)
        # Played Move Arrow in Orange
        if 0 <= self.current_idx < len(self.review_engine.review_details):
            item = self.review_engine.review_details[self.current_idx]
            
            # If Show Best Line toggle is active
            if self.show_best_line:
                best_m = item["best_move"]
                if best_m:
                    spx, spy = sq_to_px(best_m.from_square, flipped)
                    epx, epy = sq_to_px(best_m.to_square, flipped)
                    # Blue Arrow
                    draw_arrow(self.screen, (spx+SQ//2, spy+SQ//2), (epx+SQ//2, epy+SQ//2), (40, 120, 220))
                    
            # Draw played move arrow
            if not self.retry_board:
                played_m = item["move"]
                spx, spy = sq_to_px(played_m.from_square, flipped)
                epx, epy = sq_to_px(played_m.to_square, flipped)
                # Orange Arrow
                draw_arrow(self.screen, (spx+SQ//2, spy+SQ//2), (epx+SQ//2, epy+SQ//2), (230, 126, 34))

            # Threat arrow (what opponent wants to do) in Red
            if self.show_threat:
                # Get best move from opponent's perspective (next move in PV)
                if item["best_pv"] and len(item["best_pv"]) > 1:
                    threat_m = item["best_pv"][1]
                    spx, spy = sq_to_px(threat_m.from_square, flipped)
                    epx, epy = sq_to_px(threat_m.to_square, flipped)
                    draw_arrow(self.screen, (spx+SQ//2, spy+SQ//2), (epx+SQ//2, epy+SQ//2), (231, 76, 60))

    def draw_charts_dashboard(self):
        """Draw full-size line charts on the left screen (replacing board) in summary tab."""
        t = self.theme
        if not self.review_engine.is_complete:
            return
            
        sum_data = self.review_engine.summary
        
        # 1. Evaluation Graph (top half)
        eval_rect = pygame.Rect(BOARD_LEFT + 10, BOARD_TOP + 10, BOARD_PX - 20, 160)
        self.eval_points = self.charts.draw_line_graph(
            self.screen, eval_rect, sum_data["eval_history"], -8.0, 8.0, "EVALUATION GRAPH", self.current_idx
        )
        
        # 2. Material Difference Graph (middle)
        mat_rect = pygame.Rect(BOARD_LEFT + 10, BOARD_TOP + 180, BOARD_PX - 20, 160)
        self.mat_points = self.charts.draw_line_graph(
            self.screen, mat_rect, sum_data["material_history"], -15.0, 15.0, "MATERIAL GRAPH", self.current_idx
        )
        
        # 3. Accuracy / CPL timeline (bottom half)
        acc_rect = pygame.Rect(BOARD_LEFT + 10, BOARD_TOP + 350, BOARD_PX - 20, 160)
        self.acc_points = self.charts.draw_line_graph(
            self.screen, acc_rect, sum_data["accuracy_history"], 0, 100, "ACCURACY HISTOGRAM", self.current_idx, draw_zero=False
        )
        
        # Stockfish Depth setting selection buttons below graphs
        blit_text(self.screen, "Engine Depth:", BOARD_LEFT + 10, HEIGHT - 52, get_font(12, bold=True), t["text"])
        
        def render_depth_btn(rect, val):
            hov = rect.collidepoint(pygame.mouse.get_pos())
            active = (self.config_depth == val)
            bg = t["accent"] if active else (tuple(min(255, c+20) for c in t["panel_bg"]) if hov else t["panel_bg"])
            bc = t["accent"] if (active or hov) else t["border"]
            tc = t["bg"] if active else (t["accent"] if hov else t["text"])
            draw_filled_rect(self.screen, bg, rect, r=4)
            draw_outline_rect(self.screen, bc, rect, w=1, r=4)
            lbl = get_font(11, bold=True).render(str(val), True, tc)
            self.screen.blit(lbl, (rect.centerx - lbl.get_width()//2, rect.centery - lbl.get_height()//2))
            
        render_depth_btn(self.btn_depth_12, 12)
        render_depth_btn(self.btn_depth_15, 15)
        render_depth_btn(self.btn_depth_18, 18)
        render_depth_btn(self.btn_depth_20, 20)
        
        blit_text(self.screen, "Click any graph node to jump to that move.", BOARD_LEFT + 180, HEIGHT - 52, get_font(11), t["dim"])

    def handle_graph_clicks(self, pos):
        """Check if user clicked on any graph data nodes and jump to that move index."""
        if not self.review_engine.is_complete:
            return
            
        # Combine points from all graphs
        all_points = getattr(self, "eval_points", []) + getattr(self, "mat_points", []) + getattr(self, "acc_points", [])
        for cz, idx in all_points:
            if cz.collidepoint(pos):
                self.current_idx = idx
                # Switch tab back to review to display the board at that move!
                self.tab = "review"
                self.is_playing = False
                break

    def handle_timeline_clicks(self, pos):
        """Check if user clicked a node on the mini timeline."""
        for cz, idx in getattr(self, "timeline_zones", []):
            if cz.collidepoint(pos):
                self.current_idx = idx
                self.is_playing = False
                break

    def handle_retry_drag_drop(self, event):
        """Handle piece dragging and dropping when exploring alternative moves (Retry mode)."""
        t = self.theme
        flipped = (t["name"] == "Neon")
        board = self.get_current_board()
        
        if event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
            mx, my = event.pos
            sq = px_to_sq(mx, my, flipped)
            if sq is not None:
                p = board.piece_at(sq)
                # Allow moving color of whose turn it is
                if p and p.color == board.turn:
                    self.dragging_retry = sq
                    self.drag_pos_retry = (mx, my)
                    
        elif event.type == pygame.MOUSEMOTION:
            if self.dragging_retry:
                self.drag_pos_retry = event.pos
                
        elif event.type == pygame.MOUSEBUTTONUP and event.button == 1:
            if self.dragging_retry is not None:
                mx, my = event.pos
                tgt = px_to_sq(mx, my, flipped)
                if tgt is not None:
                    # Look for legal moves
                    for m in board.legal_moves:
                        if m.from_square == self.dragging_retry and m.to_square == tgt:
                            # Push move
                            if not self.retry_board:
                                self.retry_board = board.copy()
                                
                            # Animate retry move
                            def callback():
                                self.draw_hud_panels()
                                self.draw_playback_controls()
                                self.draw_interactive_replay_tab()
                                
                            animate_chess_move(
                                self.screen, self.retry_board, m, flipped, t, self.images,
                                callback, self.clock, fps=60
                            )
                            self.retry_board.push(m)
                            self.retry_moves.append(m)
                            
                            # Analyze this new position using Stockfish
                            # Simple quick check in thread or blocking (blocking 0.05s is fine for instant response)
                            try:
                                # We can launch a quick popen instance or reuse wrapper
                                # Let's run a quick 0.05s analysis
                                path_sf = self.review_engine.cache.filename
                                sf_temp = self.review_engine.review_details[0]["best_score"] # just a reference
                                # Let's query
                                # For simplicity, evaluate board using simple centipawn evaluation
                                # Or a quick mock score that decreases if it's a blunder
                                self.retry_eval = 0 # Default equal
                                # We can fetch actual UCI evaluation from simple UCI SimpleEngine popen
                                # but to keep it non-blocking and super fast, we can estimate it or do a fast query
                                sf_loc = locate_stockfish()
                                if sf_loc:
                                    with chess.engine.SimpleEngine.popen_uci(sf_loc) as temp_eng:
                                        info = temp_eng.analyse(self.retry_board, chess.engine.Limit(time=0.08))
                                        sc = info["score"].white()
                                        if sc.is_mate():
                                            self.retry_eval = 2000 if sc.mate() > 0 else -2000
                                        else:
                                            self.retry_eval = sc.score(default=0)
                            except Exception as e:
                                print(f"Retry evaluation failed: {e}")
                            break
                            
                self.dragging_retry = None
                self.drag_pos_retry = None

    def run_screen(self):
        """Main Loop for the Game Review screen. Returns 'menu' when exit."""
        t = self.theme
        flipped = (t["name"] == "Neon")
        
        while True:
            # Playback timing
            tick = pygame.time.get_ticks()
            if self.is_playing:
                # Speed conversions
                delay = 2000 / self.playback_speed
                if tick - self.last_playback_tick >= delay:
                    if self.current_idx < len(self.move_history) - 1:
                        self.current_idx += 1
                        
                        # Animate played move
                        m = self.move_history[self.current_idx]
                        board_before = chess.Board(self.initial_fen) if self.initial_fen else chess.Board()
                        for i in range(self.current_idx):
                            board_before.push(self.move_history[i])
                            
                        def callback():
                            self.draw_hud_panels()
                            self.draw_playback_controls()
                            self.draw_interactive_replay_tab()
                            
                        animate_chess_move(
                            self.screen, board_before, m, flipped, t, self.images,
                            callback, self.clock, fps=60
                        )
                    else:
                        self.is_playing = False
                    self.last_playback_tick = tick
                    
            # 1. Render Screen background
            self.screen.fill(t["bg"])
            
            # Left Screen: Board or Charts Dashboard
            if self.tab == "review":
                self.draw_eval_bar()
                self.draw_board_view()
                self.draw_hud_panels()
                self.draw_playback_controls()
            else:
                self.draw_charts_dashboard()
                
            # Right Screen Panel
            # Draw panel background
            px = BOARD_LEFT + BOARD_PX
            pw = PANEL_W
            draw_filled_rect(self.screen, t["panel_bg"], (px, 0, pw, HEIGHT), r=0)
            pygame.draw.line(self.screen, t["border"], (px, 0), (px, HEIGHT), 1)
            
            # Tab Selector Buttons
            mx, my = pygame.mouse.get_pos()
            def render_tab_btn(rect, label, active=False):
                hov = rect.collidepoint(mx, my)
                bg = t["panel_bg"] if active else (tuple(min(255, c+15) for c in t["panel_bg"]) if hov else t["bg"])
                bc = t["accent"] if active else t["border"]
                tc = t["accent"] if active else t["text"]
                draw_filled_rect(self.screen, bg, rect, r=6)
                draw_outline_rect(self.screen, bc, rect, w=1, r=6)
                lbl = get_font(13, bold=True).render(label, True, tc)
                self.screen.blit(lbl, (rect.centerx - lbl.get_width()//2, rect.centery - lbl.get_height()//2))
                
            render_tab_btn(self.tab_review_btn, "Interactive Replay", active=(self.tab == "review"))
            render_tab_btn(self.tab_summary_btn, "Game Summary", active=(self.tab == "summary"))
            
            # Render right panel contents
            if self.tab == "review":
                self.draw_interactive_replay_tab()
            else:
                self.draw_summary_tab()
                
            # Bottom Quit button
            def render_quit_btn(rect, label):
                hov = rect.collidepoint(mx, my)
                bg = t["bad"] if hov else tuple(max(0, c-45) for c in t["bad"])
                draw_filled_rect(self.screen, bg, rect, r=8)
                draw_outline_rect(self.screen, t["bad"], rect, w=1, r=8)
                lbl = get_font(13, bold=True).render(label, True, (255, 255, 255))
                self.screen.blit(lbl, (rect.centerx - lbl.get_width()//2, rect.centery - lbl.get_height()//2))
                
            render_quit_btn(self.btn_menu, "Exit Game Review")
            
            pygame.display.flip()
            self.clock.tick(60)
            
            # 2. Event Handling
            for e in pygame.event.get():
                if e.type == pygame.QUIT:
                    self.review_engine.stop_analysis()
                    pygame.quit()
                    import sys; sys.exit()
                    
                # Handle piece dragging in retry mode
                if self.tab == "review" and (self.retry_board or self.btn_retry.collidepoint(e.pos) if e.type==pygame.MOUSEBUTTONDOWN else True):
                    # We can drag pieces to retry moves
                    self.handle_retry_drag_drop(e)
                    
                if e.type == pygame.MOUSEBUTTONDOWN and e.button == 1:
                    pos = e.pos
                    
                    # Exit Review button
                    if self.btn_menu.collidepoint(pos):
                        self.review_engine.stop_analysis()
                        return "menu"
                        
                    # Tab changes
                    if self.tab_review_btn.collidepoint(pos):
                        self.tab = "review"
                    elif self.tab_summary_btn.collidepoint(pos):
                        self.tab = "summary"
                        
                    # Graph clicks (only when on summary tab)
                    if self.tab == "summary":
                        self.handle_graph_clicks(pos)
                        
                        # Depth config buttons
                        # Check if clicked depth
                        if self.btn_depth_12.collidepoint(pos):
                            self.config_depth = 12
                            self.trigger_reanalysis()
                        elif self.btn_depth_15.collidepoint(pos):
                            self.config_depth = 15
                            self.trigger_reanalysis()
                        elif self.btn_depth_18.collidepoint(pos):
                            self.config_depth = 18
                            self.trigger_reanalysis()
                        elif self.btn_depth_20.collidepoint(pos):
                            self.config_depth = 20
                            self.trigger_reanalysis()
                            
                    # Timeline clicks
                    if self.tab == "review":
                        self.handle_timeline_clicks(pos)
                        
                    # Playback controls
                    if self.btn_first.collidepoint(pos):
                        self.current_idx = -1
                        self.is_playing = False
                        self.retry_board = None
                    elif self.btn_prev.collidepoint(pos):
                        self.current_idx = max(-1, self.current_idx - 1)
                        self.is_playing = False
                        self.retry_board = None
                    elif self.btn_play.collidepoint(pos) or self.btn_auto.collidepoint(pos):
                        self.is_playing = not self.is_playing
                        self.last_playback_tick = tick
                        self.retry_board = None
                    elif self.btn_next.collidepoint(pos):
                        if self.current_idx < len(self.move_history) - 1:
                            self.current_idx += 1
                        self.is_playing = False
                        self.retry_board = None
                    elif self.btn_last.collidepoint(pos):
                        self.current_idx = len(self.move_history) - 1
                        self.is_playing = False
                        self.retry_board = None
                        
                    # Speed buttons
                    elif self.btn_speed_05.collidepoint(pos):
                        self.playback_speed = 0.5
                    elif self.btn_speed_10.collidepoint(pos):
                        self.playback_speed = 1.0
                    elif self.btn_speed_20.collidepoint(pos):
                        self.playback_speed = 2.0
                    elif self.btn_speed_40.collidepoint(pos):
                        self.playback_speed = 4.0
                        
                    # Interactive action buttons
                    elif self.btn_best_line.collidepoint(pos):
                        self.show_best_line = not self.show_best_line
                    elif self.btn_threat.collidepoint(pos):
                        self.show_threat = not self.show_threat
                    elif self.btn_tactical.collidepoint(pos):
                        self.show_tactical = not self.show_tactical
                    elif self.btn_retry.collidepoint(pos):
                        # Toggle or Reset Retry Mode
                        if self.retry_board:
                            self.retry_board = None
                            self.retry_moves = []
                            self.retry_eval = None
                        else:
                            # Start retry mode by cloning current position board
                            self.retry_board = self.get_current_board().copy()
                            self.retry_moves = []
                            self.retry_eval = 0

                if e.type == pygame.KEYDOWN:
                    if e.key == pygame.K_e:
                        from utils import export_to_pgn
                        pgn_text = export_to_pgn(self.move_history, self.initial_fen, "White Player", f"Stockfish Level {self.bot_level_idx+1}", "*")
                        with open("chess7knight_game.pgn", "w") as f_pgn:
                            f_pgn.write(pgn_text)
                        print("Saved game PGN to chess7knight_game.pgn")
                    elif e.key == pygame.K_i:
                        import os
                        if os.path.exists("import.pgn"):
                            with open("import.pgn", "r") as f_pgn:
                                pgn_text = f_pgn.read()
                            from utils import import_from_pgn
                            parsed = import_from_pgn(pgn_text)
                            if parsed:
                                self.move_history = parsed["moves"]
                                self.initial_fen = parsed["initial_fen"]
                                self.current_idx = -1
                                self.is_playing = False
                                self.retry_board = None
                                self.trigger_reanalysis()
                                print("Imported PGN from import.pgn successfully!")
                        else:
                            print("import.pgn not found in project root directory.")
                    elif e.key == pygame.K_f:
                        import os
                        if os.path.exists("import_fen.txt"):
                            with open("import_fen.txt", "r") as f_fen:
                                fen_text = f_fen.read().strip()
                            try:
                                chess.Board(fen_text)
                                self.initial_fen = fen_text
                                self.move_history = []
                                self.current_idx = -1
                                self.is_playing = False
                                self.retry_board = None
                                self.trigger_reanalysis()
                                print("Loaded FEN from import_fen.txt successfully!")
                            except Exception as e_fen:
                                print(f"Invalid FEN: {e_fen}")
                        else:
                            print("import_fen.txt not found in project root directory.")
                    elif e.key == pygame.K_ESCAPE:
                        self.review_engine.stop_analysis()
                        return "menu"
                    elif e.key == pygame.K_LEFT:
                        self.current_idx = max(-1, self.current_idx - 1)
                        self.is_playing = False
                        self.retry_board = None
                    elif e.key == pygame.K_RIGHT:
                        if self.current_idx < len(self.move_history) - 1:
                            self.current_idx += 1
                        self.is_playing = False
                        self.retry_board = None

    def trigger_reanalysis(self):
        """Restart background analysis with a new target depth."""
        self.review_engine.stop_analysis()
        self.review_engine = GameReviewEngine(
            self.move_history, self.initial_fen, self.bot_level_idx, self.config_depth
        )
        self.review_engine.start_analysis(self.config_threads, self.config_hash)

def locate_stockfish():
    """Imported local finder helper."""
    import os, shutil
    local_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "bin", "stockfish", "stockfish-ubuntu-x86-64"))
    if os.path.exists(local_path) and os.access(local_path, os.X_OK):
        return local_path
    return shutil.which("stockfish") or "/usr/games/stockfish"
