# NetFinder — SE Michigan Tennis & Pickleball Courts

Real-time court availability platform for 115+ courts across Southeast Michigan.

## Quick Start

### 1. Set up Mapbox token

```bash
cp client/.env.example client/.env
# Edit client/.env — paste your public token from mapbox.com
```

### 2. Start the backend

```bash
cd server
npm install
npm run dev       # or: node index.js
# Runs on http://localhost:3001
# SQLite DB auto-created + seeded with 115 courts on first run
```

### 3. Start the frontend

```bash
cd client
npm install
npm run dev
# Opens http://localhost:5173
```

### 4. (Optional) Train the ML model

```bash
cd ml
pip install -r requirements.txt
python train_model.py
# Trains Random Forest on 2000 synthetic records
# 5-fold CV R² printed to console
# Outputs model.joblib
```

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/courts` | All courts (filters: `type`, `surface`, `lights`, `indoor`, `availability`, `sort`) |
| GET | `/api/courts/:id` | Single court with 24h busyness predictions |
| GET | `/api/courts/:id/predict` | ML predictions for next 24 hours |
| POST | `/api/courts/:id/report` | Submit `{ status: "open"\|"busy"\|"full", reporter_name? }` |
| GET | `/api/submissions/recent` | Last 20 community reports (live feed) |
| POST | `/api/predict` | Raw ML endpoint `{ court_id, hour, day_of_week }` |

## Features

- **115 real courts** across Ann Arbor, Canton, Plymouth, Novi, Livonia, Farmington Hills, Troy, Royal Oak, Birmingham, Berkley, Ypsilanti, Monroe, Saline, Wayne, Westland, Sterling Heights, Warren, Macomb Township, and more
- **Mapbox GL dark map** with animated pulsing markers (green/amber/red by availability)
- **Cluster + explode** on zoom in/out
- **Random Forest ML** predicting busyness by hour, day, surface, lights, and court type
- **Community reports** — anyone can submit current status (rate-limited 10/10min by IP)
- **Live feed ticker** at bottom showing recent reports
- **Geolocation** with radius circle and distance-sorted results
- **Responsive** — command-center layout on desktop, drag-up bottom sheet on mobile
- **PWA** — installable on mobile
- **Heatmap easter egg** — click the NETFINDER logo 3 times fast

## Retrain the ML Model

```bash
cd ml
python train_model.py
# Generates 2000 synthetic training records with realistic SE Michigan patterns
# Reports 5-fold CV R² scores
# Saves model to ml/model.joblib
```

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite 5 + Mapbox GL JS v3 |
| Styling | Custom CSS (glassmorphism, Bebas Neue + IBM Plex Mono) |
| Backend | Node.js + Express 4 + better-sqlite3 |
| ML | Python 3 + scikit-learn Random Forest |
| Data | 115 real SE Michigan courts in `/data/courts.json` |

© 2026 Aadi Huria. All rights reserved.

