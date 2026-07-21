# 🌐 Chess7Knight: Full-Stack MERN Web Application

This directory contains the full-stack web-based implementation of Chess7Knight, featuring online Stockfish evaluation, tactical puzzles, interactive drills, study materials, and persistent match logs with performance analytics.

---

## 🗂️ Application Structure

```text
mern-app/
├── backend/                   # Node.js + Express + Mongoose REST API server
│   ├── models/                # MongoDB Schema Models (User, Match)
│   ├── routes/                # Route controllers for authentication & match logging
│   ├── middleware/            # JWT authentication middleware
│   ├── server.js              # Server entry point with MongoDB connection pooling
│   ├── vercel.json            # Serverless deployment configuration for Vercel
│   └── package.json           # Backend npm dependencies and scripts
└── frontend/                  # React (Vite) Single Page Application client
    ├── src/
    │   ├── components/        # UI components (ChessGame, Puzzles, Practice, Learn, etc.)
    │   ├── contexts/          # Context hooks for Theme (light/dark) and Language translation
    │   ├── App.jsx            # Main app shell & router
    │   ├── index.css          # Styling (custom themes, Glassmorphism, animations)
    │   └── main.jsx           # App mounting point
    ├── public/                # Static public assets (logos, icons)
    ├── vite.config.js         # Vite compilation config
    ├── vercel.json            # Frontend single-page-app Vercel configuration
    └── package.json           # Frontend npm dependencies and scripts
```

---

## 🛠️ Tech Stack & Key Libraries

### Backend
* **Runtime / Framework**: Node.js & Express.js
* **Database**: MongoDB via Mongoose ODM
* **Security & Auth**: JWT (`jsonwebtoken`) for session management, `bcryptjs` for secure password hashing
* **CORS**: Enabled for cross-origin client interaction
* **Deployment**: Optimized for serverless functions on Vercel (using MongoDB connection pooling)

### Frontend
* **Build System / Bundler**: Vite
* **Library**: React 19 (Hooks, Contexts, State)
* **Chess engine interaction**: Online [Stockfish API](https://stockfish.online/)
* **Chess mechanics**: `chess.js` for rule validation & move generation; `react-chessboard` for interactive chessboard rendering
* **Routing**: React Router (`react-router-dom`)
* **Styling**: Vanilla CSS featuring customized glassmorphism, animated background pieces, and responsive layouts
* **Localization**: Custom Language Context supporting multi-language translation (English and others)

---

## ⚙️ Development Setup & Installation

Follow these steps to run both the backend and frontend servers locally on your machine.

### Prerequisites
* **Node.js** (v18+ recommended)
* **MongoDB** (Local instance or MongoDB Atlas cluster connection string)

---

### Step 1: Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file from the template:
   ```bash
   cp .env.example .env
   ```
4. Edit the `.env` file with your credentials:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```
5. Start the backend development server:
   ```bash
   node server.js
   ```
   *The backend will run on `http://localhost:5000` (or the port defined in `.env`).*

---

### Step 2: Frontend Setup
1. Open a separate terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. *(Optional)* If pointing to a hosted backend, create a `.env` file in the `frontend` folder and add:
   ```env
   VITE_API_URL=https://your-backend-api.com/api
   ```
   *If no environment variable is provided, the client defaults to requesting `http://localhost:5000/api`.*
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to the URL shown in your terminal (typically `http://localhost:5173`).

---

## ⚡ Features Walkthrough

1. **Dashboard & Auth**:
   * Create an account and sign in.
   * View match summaries (wins, losses, draws), overall ELO rating progression, best opening lines, and recent match list.
   * Forgotten password workflow generates a secure temporary credential for user password updates.

2. **Online Play (`/play`)**:
   * Interactive chessboard with drag-and-drop or select-to-move options.
   * Play against Stockfish with custom depths.
   * Tracks and evaluates each move accuracy relative to optimal engine moves (Book, Best, Excellent, Good, Inaccuracy, Mistake, Miss, Blunder, Brilliant).
   * Displays phase performance (Opening, Middlegame, Endgame) and final game accuracy score.
   * Automatically persists match outcomes, opening names, and PGNs to the MongoDB database.

3. **Curated Puzzles (`/puzzles`)**:
   * Solve 10 specific chess puzzles across checkmate patterns, tactical scenarios, opening responses, and sacrifices.
   * Includes hints, streaks, best score records, and responsive UI.

4. **Interactive Drills (`/practice`)**:
   * Practice categorized modules: **Openings** (Italian Game, Sicilian, Queen's Gambit), **Endgames** (King + Rook Mate, Passed Pawns), and **Tactics** (Forks, Pins).
   * Compares user moves to correct solutions and shows dynamic feedback.

5. **Chess School (`/learn`)**:
   * Reference guide for the move patterns, tips, and special rules of each piece.
   * Strategy tips for controlling the center, developing pieces, castling early, and understanding pawn structures.
