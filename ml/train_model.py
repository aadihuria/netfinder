"""
Train a Random Forest model for court busyness prediction.
Run: python train_model.py
Outputs: model.joblib
"""
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import cross_val_score
from sklearn.preprocessing import LabelEncoder
import joblib
import json
import os

np.random.seed(42)
N = 2000

hours = np.random.randint(0, 24, N)
days = np.random.randint(0, 7, N)
months = np.random.randint(1, 13, N)
is_weekend = ((days == 0) | (days == 6)).astype(int)
court_types = np.random.choice(['tennis', 'pickleball', 'both'], N)
lights = np.random.choice([0, 1], N, p=[0.4, 0.6])
surfaces = np.random.choice(['hard', 'clay', 'grass'], N, p=[0.7, 0.2, 0.1])

def busyness(h, d, m, iw, ct, lt, sf):
    score = 0.25
    if 17 <= h <= 20: score += 0.35
    elif 6 <= h <= 9: score += 0.22
    elif 11 <= h <= 14: score += 0.18
    elif h < 6 or h > 21: score -= 0.18
    if iw: score += 0.12
    if m in [6, 7, 8]: score += 0.08
    if ct == 'pickleball': score += 0.05
    if lt: score += 0.04
    if sf == 'clay': score -= 0.04
    score += np.random.normal(0, 0.08)
    return float(np.clip(score, 0, 1))

busyness_scores = np.array([
    busyness(hours[i], days[i], months[i], is_weekend[i],
             court_types[i], lights[i], surfaces[i])
    for i in range(N)
])

le_ct = LabelEncoder().fit(['tennis', 'pickleball', 'both'])
le_sf = LabelEncoder().fit(['hard', 'clay', 'grass'])

X = np.column_stack([
    hours, days, months, is_weekend,
    le_ct.transform(court_types),
    lights,
    le_sf.transform(surfaces)
])
y = busyness_scores

model = RandomForestRegressor(n_estimators=200, max_depth=10, random_state=42, n_jobs=-1)
scores = cross_val_score(model, X, y, cv=5, scoring='r2')
print(f"5-fold CV R² scores: {scores}")
print(f"Mean R²: {scores.mean():.3f} (+/- {scores.std() * 2:.3f})")

model.fit(X, y)

out_path = os.path.join(os.path.dirname(__file__), 'model.joblib')
joblib.dump({
    'model': model,
    'label_encoders': {'court_type': le_ct, 'surface': le_sf},
    'accuracy': float(scores.mean()),
    'feature_names': ['hour', 'day_of_week', 'month', 'is_weekend', 'court_type', 'lights', 'surface']
}, out_path)
print(f"Model saved to {out_path}")
