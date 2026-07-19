import pygame
import math

class ChessCharts:
    def __init__(self, theme):
        self.theme = theme

    def get_quality_color(self, classification):
        """Map move classification to a color according to Chess.com's system."""
        colors = {
            "Brilliant": (30, 196, 180),     # Cyan/Bright blue
            "Great": (40, 120, 220),         # Dark blue
            "Best": (38, 166, 91),           # Dark Green
            "Excellent": (46, 204, 113),     # Light Green
            "Good": (140, 190, 80),          # Green-Yellow
            "Book": (196, 154, 108),         # Brown/Beige
            "Forced": (120, 120, 120),       # Slate gray
            "Only Move": (0, 180, 140),      # Teal
            "Inaccuracy": (241, 196, 15),     # Yellow
            "Mistake": (230, 126, 34),       # Orange
            "Blunder": (231, 76, 60),        # Red
            "Missed Win": (155, 89, 182),     # Magenta/Purple
            "Missed Draw": (255, 105, 180)   # Pink
        }
        return colors.get(classification, (150, 150, 150))

    def draw_line_graph(self, screen, rect, data, min_val, max_val, title, active_idx=None, draw_zero=True):
        """Draw a line graph inside a bounding rect and return a list of clickable points."""
        x, y, w, h = rect
        t = self.theme
        
        # Draw background container
        pygame.draw.rect(screen, t["panel_bg"], rect, border_radius=10)
        pygame.draw.rect(screen, t["border"], rect, width=1, border_radius=10)
        
        # Title
        font_tiny = pygame.font.SysFont(None, 12)
        font_small = pygame.font.SysFont(None, 14)
        font_title = pygame.font.SysFont(None, 15, bold=True)
        
        screen.blit(font_title.render(title, True, t["accent"]), (x + 12, y + 8))
        
        if not data:
            # Empty state
            lbl = font_small.render("No data available", True, t["dim"])
            screen.blit(lbl, (x + w//2 - lbl.get_width()//2, y + h//2 - lbl.get_height()//2))
            return []

        # Graph area (padded)
        gx = x + 35
        gy = y + 28
        gw = w - 45
        gh = h - 44
        
        # Zero line (middle)
        if draw_zero and min_val < 0 < max_val:
            # Map 0 to pixel y
            zero_k = (0 - min_val) / (max_val - min_val)
            zero_y = gy + gh - int(zero_k * gh)
            pygame.draw.line(screen, (*t["border"][:3], 120), (gx, zero_y), (gx + gw, zero_y), 1)
            screen.blit(font_tiny.render("0", True, t["dim"]), (gx - 14, zero_y - 5))

        # Min / Max labels
        screen.blit(font_tiny.render(str(max_val), True, t["dim"]), (gx - 28, gy))
        screen.blit(font_tiny.render(str(min_val), True, t["dim"]), (gx - 28, gy + gh - 8))
        
        # Calculate points
        pts = []
        n = len(data)
        dx = gw / (n - 1) if n > 1 else gw
        
        for i, val in enumerate(data):
            # Clamp value
            val_clamped = max(min_val, min(max_val, val))
            k = (val_clamped - min_val) / (max_val - min_val)
            
            px = gx + int(i * dx)
            py = gy + gh - int(k * gh)
            pts.append((px, py))
            
        # Draw lines connecting points
        if len(pts) > 1:
            pygame.draw.lines(screen, t["accent"], False, pts, 2)
            
        # Draw points and highlight active index
        click_zones = []
        for i, (px, py) in enumerate(pts):
            is_active = (i == active_idx)
            r = 4 if is_active else 2
            col = t["accent2"] if is_active else t["accent"]
            
            pygame.draw.circle(screen, col, (px, py), r)
            if is_active:
                pygame.draw.circle(screen, t["text"], (px, py), r, 1)
                
            # Define click zone rect
            cz = pygame.Rect(px - 6, py - 6, 12, 12)
            click_zones.append((cz, i))
            
        return click_zones

    def draw_interactive_timeline(self, screen, rect, move_details, active_idx=None):
        """Draw a horizontal move timeline showing move classifications as colored blocks.
        
        Returns a list of tuples (rect, move_index) for mouse hit detection.
        """
        x, y, w, h = rect
        t = self.theme
        
        # Draw background container
        pygame.draw.rect(screen, t["panel_bg"], rect, border_radius=8)
        pygame.draw.rect(screen, t["border"], rect, width=1, border_radius=8)
        
        n = len(move_details)
        if n == 0:
            font = pygame.font.SysFont(None, 14)
            lbl = font.render("Timeline empty", True, t["dim"])
            screen.blit(lbl, (x + w//2 - lbl.get_width()//2, y + h//2 - lbl.get_height()//2))
            return []
            
        # Available drawing area
        padding = 6
        tx = x + padding
        ty = y + padding
        tw = w - padding * 2
        th = h - padding * 2
        
        # Width of each move block
        block_w = tw / n
        
        # If block width is too small (e.g. less than 1 pixel), we can clamp it or group them.
        # But games are usually 30-80 moves, so on a 250px timeline block_w is ~3-8px, which is perfect.
        click_zones = []
        for i, move in enumerate(move_details):
            classification = move.get("classification", "Good")
            col = self.get_quality_color(classification)
            
            bx = tx + i * block_w
            # Draw White moves on top half, Black moves on bottom half?
            # Or draw sequentially? Let's draw White/Black sequentially.
            # Alternately, stack them: White moves in top row, Black in bottom row. That's extremely clear!
            # Since white is index 0, 2, 4... and black is 1, 3, 5...
            # We can stack White and Black plies!
            # Let's check who made the move.
            is_white = (move["turn"] == 1)  # chess.WHITE
            
            bh_half = th // 2 - 2
            by = ty + (0 if is_white else th // 2 + 1)
            
            r_block = pygame.Rect(int(bx), int(by), max(1, int(block_w) - 1), int(bh_half))
            pygame.draw.rect(screen, col, r_block, border_radius=1)
            
            if i == active_idx:
                # Draw a white outline for the active move
                pygame.draw.rect(screen, t["text"], r_block, width=1, border_radius=1)
                
            # Keep click zone slightly larger than the block for easy clicking
            cz = pygame.Rect(int(bx) - 2, int(by) - 2, max(4, int(block_w) + 3), int(bh_half) + 4)
            click_zones.append((cz, i))
            
        return click_zones
