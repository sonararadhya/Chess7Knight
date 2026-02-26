import pygame
import chess
import chess.engine
import sys

# ---------------- CONFIG ----------------
WIDTH, HEIGHT = 900, 640
BOARD_SIZE = 640
SQ = BOARD_SIZE // 8
FPS = 60

APP_NAME = "Chess7Knight"
USERNAME = "aradhyasonar"

pygame.init()
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption(APP_NAME)
clock = pygame.time.Clock()

font = pygame.font.SysFont("segoeui",20)
bigfont = pygame.font.SysFont("segoeui",52)
medfont = pygame.font.SysFont("segoeui",28)

engine = chess.engine.SimpleEngine.popen_uci("/usr/games/stockfish")

# ---------------- STATE ----------------
board = chess.Board()
dragging=None
mouse=None
last_move=None
move_history=[]
difficulty=0.5
theme_dark=False

white_time=600
black_time=600

# ---------------- LOAD PIECES ----------------
IMAGES={}
def load():
    pieces=['wp','wr','wn','wb','wq','wk','bp','br','bn','bb','bq','bk']
    for p in pieces:
        IMAGES[p]=pygame.transform.scale(
            pygame.image.load(f"assets/pieces/{p}.png"),(SQ,SQ))

# ---------------- COLORS ----------------
def colors():
    if theme_dark:
        return [(70,70,70),(30,30,30)]
    return [(240,217,181),(181,136,99)]

# ---------------- BOARD ----------------
def draw_board():
    c=colors()
    for r in range(8):
        for col in range(8):
            pygame.draw.rect(screen,c[(r+col)%2],
                             (col*SQ,r*SQ,SQ,SQ))

# ---------------- LAST MOVE ----------------
def lastmove():
    if last_move:
        for sq in [last_move.from_square,last_move.to_square]:
            r=7-chess.square_rank(sq)
            c=chess.square_file(sq)
            s=pygame.Surface((SQ,SQ))
            s.set_alpha(120)
            s.fill((255,255,0))
            screen.blit(s,(c*SQ,r*SQ))

# ---------------- CHECK ----------------
def check():
    if board.is_check():
        sq=board.king(board.turn)
        r=7-chess.square_rank(sq)
        c=chess.square_file(sq)
        s=pygame.Surface((SQ,SQ))
        s.set_alpha(160)
        s.fill((255,0,0))
        screen.blit(s,(c*SQ,r*SQ))

# ---------------- MOVES GLOW ----------------
def show_moves(sq):
    if sq is None:return
    for m in board.legal_moves:
        if m.from_square==sq:
            r=7-chess.square_rank(m.to_square)
            c=chess.square_file(m.to_square)
            center=(c*SQ+SQ//2,r*SQ+SQ//2)
            pygame.draw.circle(screen,(170,0,255),center,16)
            pygame.draw.circle(screen,(255,180,255),center,8)

# ---------------- PIECES ----------------
def pieces(skip=None):
    for sq in chess.SQUARES:
        if sq==skip:continue
        p=board.piece_at(sq)
        if p:
            r=7-chess.square_rank(sq)
            c=chess.square_file(sq)
            code=('w' if p.color else 'b')+p.symbol().lower()
            screen.blit(IMAGES[code],(c*SQ,r*SQ))

# ---------------- ANIMATE ----------------
def animate(m):
    sr=7-chess.square_rank(m.from_square)
    sc=chess.square_file(m.from_square)
    er=7-chess.square_rank(m.to_square)
    ec=chess.square_file(m.to_square)

    p=board.piece_at(m.from_square)
    code=('w' if p.color else 'b')+p.symbol().lower()

    dr=er-sr
    dc=ec-sc
    frames=max(abs(dr),abs(dc))*10

    for f in range(frames+1):
        r=sr+dr*f/frames
        c=sc+dc*f/frames
        draw_board(); lastmove(); check(); pieces(skip=m.from_square)
        screen.blit(IMAGES[code],(c*SQ,r*SQ))
        pygame.display.flip()
        clock.tick(FPS)

# ---------------- AI ----------------
def ai():
    global last_move
    res=engine.play(board,chess.engine.Limit(time=difficulty))
    animate(res.move)
    board.push(res.move)
    last_move=res.move
    move_history.append(res.move)

# ---------------- SIDE PANEL ----------------
def panel():
    pygame.draw.rect(screen,(35,35,35),(640,0,260,640))

    screen.blit(font.render(APP_NAME,True,(255,255,255)),(660,10))
    screen.blit(font.render("User: "+USERNAME,True,(180,180,255)),(660,35))

    y=80
    screen.blit(font.render("Moves:",True,(255,255,255)),(660,y))
    y+=30

    for m in move_history[-20:]:
        screen.blit(font.render(str(m),True,(230,230,230)),(660,y))
        y+=20

    screen.blit(font.render(f"White: {int(white_time)}",True,(255,255,255)),(660,520))
    screen.blit(font.render(f"Black: {int(black_time)}",True,(255,255,255)),(660,550))

    screen.blit(font.render("R Restart",True,(200,200,200)),(660,590))
    screen.blit(font.render("U Undo",True,(200,200,200)),(660,610))
    screen.blit(font.render("T Theme",True,(200,200,200)),(660,630))

# ---------------- MENU ----------------
def button(text,y,hover):
    rect=pygame.Rect(300,y,300,60)
    color=(120,0,200) if hover else (70,0,120)
    pygame.draw.rect(screen,color,rect,border_radius=12)
    label=medfont.render(text,True,(255,255,255))
    screen.blit(label,(rect.x+rect.width//2-label.get_width()//2,
                       rect.y+15))
    return rect

def menu():
    global difficulty
    while True:
        mx,my=pygame.mouse.get_pos()

        # gradient background
        for i in range(HEIGHT):
            pygame.draw.line(screen,
                             (20+i//8,20,40+i//5),
                             (0,i),(WIDTH,i))

        title=bigfont.render(APP_NAME,True,(255,255,255))
        screen.blit(title,(WIDTH//2-title.get_width()//2,120))

        user=font.render("Player: "+USERNAME,True,(200,200,255))
        screen.blit(user,(WIDTH//2-user.get_width()//2,190))

        b1=button("Easy AI",300,300<my<360)
        b2=button("Medium AI",380,380<my<440)
        b3=button("Hard AI",460,460<my<520)

        pygame.display.flip()

        for e in pygame.event.get():
            if e.type==pygame.QUIT: sys.exit()
            if e.type==pygame.MOUSEBUTTONDOWN:
                if b1.collidepoint(e.pos): difficulty=0.2; return
                if b2.collidepoint(e.pos): difficulty=0.5; return
                if b3.collidepoint(e.pos): difficulty=1.0; return

# ---------------- GAME LOOP ----------------
def game():
    global dragging,mouse,last_move,theme_dark,white_time,black_time

    while True:
        dt=clock.tick(FPS)/1000

        if board.turn==chess.WHITE:white_time-=dt
        else:black_time-=dt

        draw_board(); lastmove(); check(); show_moves(dragging); pieces(skip=dragging); panel()

        if dragging and mouse:
            p=board.piece_at(dragging)
            code=('w' if p.color else 'b')+p.symbol().lower()
            screen.blit(IMAGES[code],(mouse[0]-SQ//2,mouse[1]-SQ//2))

        pygame.display.flip()

        if board.turn==chess.BLACK and not board.is_game_over():
            ai()

        for e in pygame.event.get():
            if e.type==pygame.QUIT: sys.exit()

            if e.type==pygame.KEYDOWN:
                if e.key==pygame.K_r:
                    board.reset(); move_history.clear()
                if e.key==pygame.K_u and len(move_history)>=2:
                    board.pop(); board.pop()
                    move_history.pop(); move_history.pop()
                if e.key==pygame.K_t:
                    theme_dark=not theme_dark

            if e.type==pygame.MOUSEBUTTONDOWN:
                if board.turn==chess.WHITE:
                    x,y=pygame.mouse.get_pos()
                    if x<640:
                        col=x//SQ; row=y//SQ
                        sq=chess.square(col,7-row)
                        p=board.piece_at(sq)
                        if p and p.color:
                            dragging=sq; mouse=(x,y)

            if e.type==pygame.MOUSEMOTION:
                mouse=e.pos

            if e.type==pygame.MOUSEBUTTONUP:
                if dragging:
                    x,y=pygame.mouse.get_pos()
                    col=x//SQ; row=y//SQ
                    target=chess.square(col,7-row)

                    for m in board.legal_moves:
                        if m.from_square==dragging and m.to_square==target:
                            animate(m)
                            board.push(m)
                            last_move=m
                            move_history.append(m)
                            break
                    dragging=None

# ---------------- START ----------------
load()
menu()
game()
