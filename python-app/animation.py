import pygame
import chess
import math
from utils import SQ, sq_to_px, BOARD_LEFT, BOARD_TOP, BOARD_PX, draw_filled_rect, draw_outline_rect

def blit_alpha(target, source, location, opacity):
    """Blit a surface with a custom opacity (0 to 255)."""
    x, y = location
    temp = pygame.Surface((source.get_width(), source.get_height()), pygame.SRCALPHA)
    temp.blit(source, (0, 0))
    temp.fill((255, 255, 255, opacity), special_flags=pygame.BLEND_RGBA_MULT)
    target.blit(temp, (x, y))

def draw_static_board(screen, board, theme, flipped, skip_squares=None):
    """Draw the board grid and pieces, skipping specified squares (for moving/captured pieces)."""
    if skip_squares is None:
        skip_squares = set()
        
    # Draw squares
    for sr in range(8):
        for sc in range(8):
            rank = sr if flipped else 7 - sr
            file = 7 - sc if flipped else sc
            light = (file + rank) % 2 == 1
            col = theme["sq_light"] if light else theme["sq_dark"]
            pygame.draw.rect(screen, col, (BOARD_LEFT + sc*SQ, BOARD_TOP + sr*SQ, SQ, SQ))
            
    # Draw rank & file labels
    for i in range(8):
        fl = chr(ord('a') + (7-i if flipped else i))
        rn = str(i+1 if flipped else 8-i)
        lf = pygame.font.SysFont(None, 12).render(fl, True, theme["dim"])
        lr = pygame.font.SysFont(None, 12).render(rn, True, theme["dim"])
        screen.blit(lf, (BOARD_LEFT + i*SQ + SQ - lf.get_width() - 2,
                          BOARD_TOP + BOARD_PX - lf.get_height() - 1))
        screen.blit(lr, (BOARD_LEFT + 2, BOARD_TOP + i*SQ + 2))

    # Draw check highlight if in check
    if board.is_check():
        sq = board.king(board.turn)
        if sq not in skip_squares:
            px, py = sq_to_px(sq, flipped)
            s = pygame.Surface((SQ, SQ), pygame.SRCALPHA)
            s.fill(theme.get("chk", (255, 55, 55, 160)))
            screen.blit(s, (px, py))

    # Draw pieces
    for sq in chess.SQUARES:
        if sq in skip_squares:
            continue
        p = board.piece_at(sq)
        if p:
            code = ('w' if p.color else 'b') + p.symbol().lower()
            # Note: Caller provides preloaded IMAGES dict
            pass

def animate_chess_move(screen, board, move, flipped, theme, images, panel_draw_callback, clock, fps=60):
    """Animate a chess move on screen smoothly, handling castling, en passant, promotion, and captures."""
    # Find start and end positions
    spx, spy = sq_to_px(move.from_square, flipped)
    epx, epy = sq_to_px(move.to_square, flipped)
    
    # Identify moving piece
    p_moving = board.piece_at(move.from_square)
    if not p_moving:
        return
        
    code_moving = ('w' if p_moving.color else 'b') + p_moving.symbol().lower()
    
    # Calculate animation duration based on distance
    dist = math.hypot(epx - spx, epy - spy)
    frames = max(8, int((dist / SQ) * 6))
    
    # Set up skip squares
    skip_squares = {move.from_square}
    
    # Castling check
    is_castle = board.is_castling(move)
    rook_move = None
    if is_castle:
        # Determine rook squares
        if move.to_square == chess.G1:  # White Kingside
            rook_from, rook_to = chess.H1, chess.F1
        elif move.to_square == chess.C1:  # White Queenside
            rook_from, rook_to = chess.A1, chess.D1
        elif move.to_square == chess.G8:  # Black Kingside
            rook_from, rook_to = chess.H8, chess.F8
        elif move.to_square == chess.C8:  # Black Queenside
            rook_from, rook_to = chess.A8, chess.D8
        else:
            is_castle = False
            
        if is_castle:
            rook_move = (rook_from, rook_to)
            skip_squares.add(rook_from)
            p_rook = board.piece_at(rook_from)
            code_rook = ('w' if p_rook.color else 'b') + p_rook.symbol().lower()
            rspx, rspy = sq_to_px(rook_from, flipped)
            repx, repy = sq_to_px(rook_to, flipped)
            
    # En Passant check
    is_ep = board.is_en_passant(move)
    ep_captured_sq = None
    if is_ep:
        # The captured pawn is on the same file as to_square, same rank as from_square
        ep_captured_sq = chess.square(chess.square_file(move.to_square), chess.square_rank(move.from_square))
        skip_squares.add(ep_captured_sq)
        p_captured = board.piece_at(ep_captured_sq)
        code_captured = ('w' if p_captured.color else 'b') + p_captured.symbol().lower()
        cap_px, cap_py = sq_to_px(ep_captured_sq, flipped)
        
    # Regular Capture check
    is_cap = board.is_capture(move) and not is_ep
    captured_piece = None
    if is_cap:
        captured_piece = board.piece_at(move.to_square)
        skip_squares.add(move.to_square)
        code_captured = ('w' if captured_piece.color else 'b') + captured_piece.symbol().lower()
        cap_px, cap_py = sq_to_px(move.to_square, flipped)
        
    # Promotion check
    is_promo = move.promotion is not None
    
    # Run animation loop
    for f in range(frames + 1):
        k = f / frames
        
        # Draw background and static board
        screen.fill(theme["bg"])
        
        # Draw board squares
        for sr in range(8):
            for sc in range(8):
                rank = sr if flipped else 7 - sr
                file = 7 - sc if flipped else sc
                light = (file + rank) % 2 == 1
                col = theme["sq_light"] if light else theme["sq_dark"]
                pygame.draw.rect(screen, col, (BOARD_LEFT + sc*SQ, BOARD_TOP + sr*SQ, SQ, SQ))
                
        # Draw rank/file labels
        for i in range(8):
            fl = chr(ord('a') + (7-i if flipped else i))
            rn = str(i+1 if flipped else 8-i)
            lf = pygame.font.SysFont(None, 12).render(fl, True, theme["dim"])
            lr = pygame.font.SysFont(None, 12).render(rn, True, theme["dim"])
            screen.blit(lf, (BOARD_LEFT + i*SQ + SQ - lf.get_width() - 2,
                              BOARD_TOP + BOARD_PX - lf.get_height() - 1))
            screen.blit(lr, (BOARD_LEFT + 2, BOARD_TOP + i*SQ + 2))
            
        # Draw highlight of move squares (yellowish transparency)
        rgba = theme.get("hi", (255, 220, 50, 105))
        for sq in [move.from_square, move.to_square]:
            px, py = sq_to_px(sq, flipped)
            s = pygame.Surface((SQ, SQ), pygame.SRCALPHA)
            s.fill(rgba[:3] + (rgba[3],))
            screen.blit(s, (px, py))

        # Check highlight
        if board.is_check():
            ksq = board.king(board.turn)
            if ksq not in skip_squares:
                px, py = sq_to_px(ksq, flipped)
                s = pygame.Surface((SQ, SQ), pygame.SRCALPHA)
                s.fill(theme.get("chk", (255, 55, 55, 160)))
                screen.blit(s, (px, py))

        # Draw static pieces
        for sq in chess.SQUARES:
            if sq in skip_squares:
                continue
            p = board.piece_at(sq)
            if p:
                code = ('w' if p.color else 'b') + p.symbol().lower()
                screen.blit(images[code], sq_to_px(sq, flipped))
                
        # Draw captured piece fading out
        if (is_cap or is_ep) and k < 1.0:
            opacity = int(255 * (1.0 - k))
            blit_alpha(screen, images[code_captured], (cap_px, cap_py), opacity)
            
        # Draw moving piece(s)
        curr_x = spx + (epx - spx) * k
        curr_y = spy + (epy - spy) * k
        
        if is_promo and k >= 0.95:
            # Draw promotion piece scaling up/morphic change
            promo_pt = move.promotion
            code_promo = ('w' if p_moving.color else 'b') + chess.piece_symbol(promo_pt).lower()
            screen.blit(images[code_promo], (curr_x, curr_y))
        else:
            screen.blit(images[code_moving], (curr_x, curr_y))
            
        # If castling, draw rook sliding too
        if is_castle:
            rcurr_x = rspx + (repx - rspx) * k
            rcurr_y = rspy + (repy - rspy) * k
            screen.blit(images[code_rook], (rcurr_x, rcurr_y))
            
        # Draw panel and player bars
        panel_draw_callback()
        
        pygame.display.flip()
        clock.tick(fps)
