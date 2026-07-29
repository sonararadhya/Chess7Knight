# ♞ Chess7Knight: Multi-Platform Chess Ecosystem

Welcome to **Chess7Knight**, a comprehensive chess gaming and learning ecosystem. This project comprises two separate applications: a fully-featured local desktop app and a modern full-stack web application.

---

## 📂 Project Structure

```text
Chess7Knight/
├── python-app/                  # Desktop Application (Python, Pygame, Stockfish)
│   ├── main.py                  # Entrypoint for the Pygame application
│   ├── README.md                # Desktop-specific README documentation
│   ├── assets/                  # Chess piece sprites and graphics
│   └── Screenshots/             # Application screenshots
└── mern-app/                    # Full-Stack Web Application (MongoDB, Express, React, Node.js)
    ├── README.md                # Web-specific README documentation
    ├── backend/                 # Express & Mongoose API server
    └── frontend/                # React (Vite) SPA client
```

---

## 🚀 Applications Overview

### 1. 🖥️ Desktop App (`python-app`)
A responsive, high-performance offline desktop chess client designed for local gameplay and analytics.
* **Tech Stack**: Python 3.9+, Pygame, `python-chess`, Stockfish Engine.
* **Key Features**:
  * **11 Calibrated AI Levels**: Play against Stockfish ranging from ELO 400 (Beginner) to 1950 (Grandmaster).
  * **Real-time Engine Analysis**: Live vertical centipawn evaluation bar.
  * **Performance Analytics**: Real-time centipawn-loss formula for move accuracy scoring (0–100%) and dynamic ELO rating adjustment.
  * **Tactical Indicators**: Toggleable legal move dots (Tutor Mode) and danger square highlighting.
  * **Local persistence**: Automatic match history and statistics saved locally to JSON.
  * **Theming**: Four customizable visual themes (Midnight, Forest, Ivory, Neon) cycles on keypress.

*For detailed setup and controls, please see the [Desktop README](./python-app/README.md).*

---

### 2. 🌐 MERN Web App (`mern-app`)
A modern, responsive full-stack web portal for playing chess, completing drills, solving puzzles, and reviewing match statistics.
* **Tech Stack**:
  * **Frontend**: React (Vite), `react-chessboard`, `chess.js`, Axios, React Router, Custom CSS (Glassmorphism & animated backgrounds).
  * **Backend**: Node.js, Express, MongoDB (Mongoose), JWT Authentication, Bcrypt.
  * **Engine**: Integrated online Stockfish API (`stockfish.online`) for real-time move evaluation.
* **Key Features**:
  * **User Accounts & Authentication**: Secure sign-up, sign-in, and password update routines with JWT security.
  * **Detailed Match Analytics**: Post-game accuracy calculations, opening detection, game phase performance (opening, middlegame, endgame), and move classification (brilliant, great, best, excellent, inaccuracy, blunder, etc.).
  * **Tactical Puzzles**: Play and solve curated chess puzzles across categories (Checkmate, Tactics, Openings, Strategy, Sacrifices, Endgames) with hints and streak tracking.
  * **Interactive Drills**: Practice specific openings (Italian Game, Sicilian, Queen's Gambit), endgames (King + Rook mate, passed pawns), and tactics (forks, pins) with instant evaluation.
  * **Chess School (Learn)**: Dynamic guide covering piece movements, special rules (Castling, En Passant, Promotion), and essential strategic concepts.
  * **Dashboard & Profile**: View rating progression, win/loss/draw records, opening statistics, and complete historical match logs.
  * **Localizations**: Multilingual support managed via a client-side Language Context.

*For detailed setup instructions, API endpoints, and structure, please see the [MERN Web README](./mern-app/README.md).*

---

## ⚙️ Quick Start

To run either of the applications, navigate into their respective directories and follow their guides:

### Run the Desktop App
1. Go to the directory: `cd python-app`
2. Set up virtual environment and install dependencies:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install pygame python-chess
   ```
3. Install Stockfish on your machine and configure the path in `main.py`.
4. Run: `python main.py`

### Run the Web App (MERN)
1. Go to the directory: `cd mern-app`
2. Follow the detailed steps in [mern-app/README.md](./mern-app/README.md) to set up the MongoDB environment, initialize the Express server (`backend/`), and build/start the React client (`frontend/`).

---

## 🏆 Credits

Built with ❤️ by **Aradhya Sonar**.

---
*📝 Last maintained: July 29, 2026 at 19:51 UTC*
