# ♞ Chess7Knight: A Comprehensive Chess Ecosystem

Welcome to **Chess7Knight**, a holistic chess gaming and educational platform. This project encompasses two distinct applications: a fully-featured local desktop application and a modern full-stack web application.

---

## 📂 Project Structure

```text
Chess7Knight/
├── python-app/                  # Desktop Application (Python, Pygame, Stockfish)
│   ├── main.py                  # Entry point for the Pygame application
│   ├── README.md                # README documentation specific to the desktop application
│   ├── assets/                  # Chess piece sprites and graphics
│   └── Screenshots/             # Screenshots of the application
└── mern-app/                    # Full-Stack Web Application (MongoDB, Express, React, Node.js)
    ├── README.md                # README documentation specific to the web application
    ├── backend/                 # Express & Mongoose API server
    └── frontend/                # React (Vite) Single Page Application client
```

---

## 🚀 Applications Overview

### 1. 🖥️ Desktop Application (`python-app`)
A responsive and high-performance offline chess client designed for local gameplay and analytics.
* **Technology Stack**: Python 3.9+, Pygame, `python-chess`, Stockfish Engine.
* **Key Features**:
  * **11 Calibrated AI Levels**: Compete against Stockfish, ranging from ELO 400 (Beginner) to 1950 (Grandmaster).
  * **Real-time Engine Analysis**: Live vertical centipawn evaluation bar for move assessment.
  * **Performance Analytics**: Real-time centipawn-loss formula for scoring move accuracy (0–100%) and dynamic ELO rating adjustments.
  * **Tactical Indicators**: Toggleable legal move dots (Tutor Mode) and highlighting of danger squares.
  * **Local Persistence**: Automatic saving of match history and statistics in JSON format.
  * **Theming Options**: Four customizable visual themes (Midnight, Forest, Ivory, Neon) that cycle on keypress.

*For comprehensive setup and control instructions, please refer to the [Desktop README](./python-app/README.md).*

---

### 2. 🌐 MERN Web Application (`mern-app`)
A modern and responsive full-stack web portal for playing chess, completing drills, solving puzzles, and reviewing match statistics.
* **Technology Stack**:
  * **Frontend**: React (Vite), `react-chessboard`, `chess.js`, Axios, React Router, Custom CSS (Glassmorphism & animated backgrounds).
  * **Backend**: Node.js, Express, MongoDB (Mongoose), JWT Authentication, Bcrypt.
  * **Engine**: Integrated online Stockfish API (`stockfish.online`) for real-time move evaluation.
* **Key Features**:
  * **User Accounts & Authentication**: Secure sign-up, sign-in, and password update processes utilizing JWT security.
  * **Detailed Match Analytics**: Post-game accuracy calculations, opening detection, game phase performance (opening, middlegame, endgame), and move classification (brilliant, great, best, excellent, inaccuracy, blunder, etc.).
  * **Tactical Puzzles**: Engage with and solve curated chess puzzles across various categories (Checkmate, Tactics, Openings, Strategy, Sacrifices, Endgames) with hints and streak tracking.
  * **Interactive Drills**: Practice specific openings (Italian Game, Sicilian, Queen's Gambit), endgames (King + Rook mate, passed pawns), and tactics (forks, pins) with instant evaluation.
  * **Chess School (Learn)**: A dynamic guide covering piece movements, special rules (Castling, En Passant, Promotion), and essential strategic concepts.
  * **Dashboard & Profile**: Monitor rating progression, win/loss/draw records, opening statistics, and access complete historical match logs.
  * **Localizations**: Multilingual support managed through a client-side Language Context.

*For detailed setup instructions, API endpoints, and structure, please consult the [MERN Web README](./mern-app/README.md).*

---

## ⚙️ Quick Start

To run either of the applications, navigate to their respective directories and follow the provided guides:

### Running the Desktop Application
1. Navigate to the directory: `cd python-app`
2. Set up a virtual environment and install dependencies:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install pygame python-chess
   ```
3. Install Stockfish on your machine and configure the path in `main.py`.
4. Execute: `python main.py`

### Running the Web Application (MERN)
1. Navigate to the directory: `cd mern-app`
2. Follow the detailed steps in [mern-app/README.md](./mern-app/README.md) to set up the MongoDB environment, initialize the Express server (`backend/`), and build/start the React client (`frontend/`).

---

## 🏆 Credits

Created with ❤️ by **Aradhya Sonar**.

---
*📝 Last maintained: August 28, 2026 at 20:17 UTC*
