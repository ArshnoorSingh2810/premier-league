from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import joblib
import os


# ============================================================
# 1. APP
# ============================================================

app = FastAPI(
    title="Premier League Match Predictor",
    description="ML API for Premier League match result prediction",
    version="1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# 2. PATHS
# ============================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(
    BASE_DIR,
    "model.pkl"
)

DATA_PATH = os.path.join(
    BASE_DIR,
    "data",
    "train.csv"
)


# ============================================================
# 3. LOAD MODEL
# ============================================================

print("Loading model...")

model = joblib.load(MODEL_PATH)

print("Model loaded successfully!")


# ============================================================
# 4. LOAD HISTORICAL DATA
# ============================================================

print("Loading historical data...")

df = pd.read_csv(DATA_PATH)

df["MatchDate"] = pd.to_datetime(df["MatchDate"])

df = df.sort_values(
    "MatchDate"
).reset_index(drop=True)

print("Historical data loaded!")
print("Rows:", len(df))


# ============================================================
# 5. TEAM HISTORY
# ============================================================

team_history = {}
elo_ratings = {}


def create_team():

    return {

        # Results
        "points": [],
        "goals_for": [],
        "goals_against": [],
        "wins": [],
        "draws": [],
        "losses": [],

        # Home / away
        "home_points": [],
        "away_points": [],

        "home_goals_for": [],
        "home_goals_against": [],

        "away_goals_for": [],
        "away_goals_against": [],

        # Match performance
        "shots": [],
        "shots_on_target": [],

        "home_shots": [],
        "home_shots_on_target": [],

        "away_shots": [],
        "away_shots_on_target": []
    }


def get_team(team):

    if team not in team_history:
        team_history[team] = create_team()

    if team not in elo_ratings:
        elo_ratings[team] = 1500.0

    return team_history[team]


# ============================================================
# 6. ELO
# ============================================================

def expected_result(home_elo, away_elo):

    return 1 / (
        1 + 10 ** ((away_elo - home_elo) / 400)
    )


def update_elo(home, away, result):

    home_elo = elo_ratings[home]
    away_elo = elo_ratings[away]

    # Home advantage
    adjusted_home_elo = home_elo + 60

    expected_home = expected_result(
        adjusted_home_elo,
        away_elo
    )

    expected_away = 1 - expected_home

    if result == "H":

        actual_home = 1
        actual_away = 0

    elif result == "D":

        actual_home = 0.5
        actual_away = 0.5

    else:

        actual_home = 0
        actual_away = 1

    K = 20

    elo_ratings[home] = (
        home_elo +
        K * (actual_home - expected_home)
    )

    elo_ratings[away] = (
        away_elo +
        K * (actual_away - expected_away)
    )


# ============================================================
# 7. BUILD HISTORICAL TEAM DATA
# ============================================================

print("Building team history...")

for _, match in df.iterrows():

    home = str(match["HomeTeam"]).strip()
    away = str(match["AwayTeam"]).strip()

    h = get_team(home)
    a = get_team(away)

    result = match["FullTimeResult"]

    home_goals = int(match["FullTimeHomeGoals"])
    away_goals = int(match["FullTimeAwayGoals"])

    home_shots = int(match["HomeShots"])
    away_shots = int(match["AwayShots"])

    home_sot = int(match["HomeShotsOnTarget"])
    away_sot = int(match["AwayShotsOnTarget"])


    # ========================================================
    # POINTS
    # ========================================================

    if result == "H":

        home_points = 3
        away_points = 0

        home_win = 1
        away_win = 0

        home_draw = 0
        away_draw = 0

        home_loss = 0
        away_loss = 1

    elif result == "D":

        home_points = 1
        away_points = 1

        home_win = 0
        away_win = 0

        home_draw = 1
        away_draw = 1

        home_loss = 0
        away_loss = 0

    else:

        home_points = 0
        away_points = 3

        home_win = 0
        away_win = 1

        home_draw = 0
        away_draw = 0

        home_loss = 1
        away_loss = 0


    # ========================================================
    # GENERAL HISTORY
    # ========================================================

    h["points"].append(home_points)
    a["points"].append(away_points)

    h["goals_for"].append(home_goals)
    h["goals_against"].append(away_goals)

    a["goals_for"].append(away_goals)
    a["goals_against"].append(home_goals)

    h["wins"].append(home_win)
    a["wins"].append(away_win)

    h["draws"].append(home_draw)
    a["draws"].append(away_draw)

    h["losses"].append(home_loss)
    a["losses"].append(away_loss)


    # ========================================================
    # HOME HISTORY
    # ========================================================

    h["home_points"].append(home_points)

    h["home_goals_for"].append(
        home_goals
    )

    h["home_goals_against"].append(
        away_goals
    )

    h["home_shots"].append(
        home_shots
    )

    h["home_shots_on_target"].append(
        home_sot
    )


    # ========================================================
    # AWAY HISTORY
    # ========================================================

    a["away_points"].append(
        away_points
    )

    a["away_goals_for"].append(
        away_goals
    )

    a["away_goals_against"].append(
        home_goals
    )

    a["away_shots"].append(
        away_shots
    )

    a["away_shots_on_target"].append(
        away_sot
    )


    # ========================================================
    # GENERAL SHOT HISTORY
    # ========================================================

    h["shots"].append(
        home_shots
    )

    h["shots_on_target"].append(
        home_sot
    )

    a["shots"].append(
        away_shots
    )

    a["shots_on_target"].append(
        away_sot
    )


    # ========================================================
    # UPDATE ELO
    # ========================================================

    update_elo(
        home,
        away,
        result
    )


print("Team history built successfully!")
print("Teams found:", len(team_history))


# ============================================================
# 8. REQUEST MODEL
# ============================================================

class MatchRequest(BaseModel):

    home_team: str
    away_team: str


# ============================================================
# 9. FIND CANONICAL TEAM NAME
# ============================================================

def find_team(team_name):

    team_name = team_name.strip().lower()

    for team in team_history.keys():

        if team.lower() == team_name:
            return team

    return None


# ============================================================
# 10. RECENT AVERAGE
# ============================================================

def recent_average(values, n=5):

    if len(values) == 0:
        return 0.0

    recent = values[-n:]

    return sum(recent) / len(recent)


# ============================================================
# 11. CREATE VERSION 5 FEATURES
# ============================================================

def create_features(home, away):

    h = team_history[home]
    a = team_history[away]


    # ========================================================
    # ELO
    # ========================================================

    home_elo = elo_ratings[home]
    away_elo = elo_ratings[away]

    elo_difference = (
        home_elo - away_elo
    )


    # ========================================================
    # HOME OVERALL FORM
    # ========================================================

    if len(h["points"]) > 0:

        n = min(5, len(h["points"]))

        home_avg_points = sum(
            h["points"][-5:]
        ) / n

        home_avg_goals_for = sum(
            h["goals_for"][-5:]
        ) / n

        home_avg_goals_against = sum(
            h["goals_against"][-5:]
        ) / n

        home_win_rate = sum(
            h["wins"][-5:]
        ) / n

        home_draw_rate = sum(
            h["draws"][-5:]
        ) / n

        home_loss_rate = sum(
            h["losses"][-5:]
        ) / n

    else:

        home_avg_points = 0
        home_avg_goals_for = 0
        home_avg_goals_against = 0

        home_win_rate = 0
        home_draw_rate = 0
        home_loss_rate = 0


    # ========================================================
    # AWAY OVERALL FORM
    # ========================================================

    if len(a["points"]) > 0:

        n = min(5, len(a["points"]))

        away_avg_points = sum(
            a["points"][-5:]
        ) / n

        away_avg_goals_for = sum(
            a["goals_for"][-5:]
        ) / n

        away_avg_goals_against = sum(
            a["goals_against"][-5:]
        ) / n

        away_win_rate = sum(
            a["wins"][-5:]
        ) / n

        away_draw_rate = sum(
            a["draws"][-5:]
        ) / n

        away_loss_rate = sum(
            a["losses"][-5:]
        ) / n

    else:

        away_avg_points = 0
        away_avg_goals_for = 0
        away_avg_goals_against = 0

        away_win_rate = 0
        away_draw_rate = 0
        away_loss_rate = 0


    # ========================================================
    # HOME-SPECIFIC FORM
    # ========================================================

    if len(h["home_points"]) > 0:

        n = min(5, len(h["home_points"]))

        home_specific_points = sum(
            h["home_points"][-5:]
        ) / n

        home_specific_goals_for = sum(
            h["home_goals_for"][-5:]
        ) / n

        home_specific_goals_against = sum(
            h["home_goals_against"][-5:]
        ) / n

    else:

        home_specific_points = 0
        home_specific_goals_for = 0
        home_specific_goals_against = 0


    # ========================================================
    # AWAY-SPECIFIC FORM
    # ========================================================

    if len(a["away_points"]) > 0:

        n = min(5, len(a["away_points"]))

        away_specific_points = sum(
            a["away_points"][-5:]
        ) / n

        away_specific_goals_for = sum(
            a["away_goals_for"][-5:]
        ) / n

        away_specific_goals_against = sum(
            a["away_goals_against"][-5:]
        ) / n

    else:

        away_specific_points = 0
        away_specific_goals_for = 0
        away_specific_goals_against = 0


    # ========================================================
    # SHOTS — LAST 5
    # ========================================================

    if len(h["shots"]) > 0:

        n = min(5, len(h["shots"]))

        home_avg_shots = sum(
            h["shots"][-5:]
        ) / n

        home_avg_shots_on_target = sum(
            h["shots_on_target"][-5:]
        ) / n

    else:

        home_avg_shots = 0
        home_avg_shots_on_target = 0


    if len(a["shots"]) > 0:

        n = min(5, len(a["shots"]))

        away_avg_shots = sum(
            a["shots"][-5:]
        ) / n

        away_avg_shots_on_target = sum(
            a["shots_on_target"][-5:]
        ) / n

    else:

        away_avg_shots = 0
        away_avg_shots_on_target = 0


    # ========================================================
    # HOME SHOTS
    # ========================================================

    if len(h["home_shots"]) > 0:

        n = min(5, len(h["home_shots"]))

        home_specific_shots = sum(
            h["home_shots"][-5:]
        ) / n

        home_specific_shots_on_target = sum(
            h["home_shots_on_target"][-5:]
        ) / n

    else:

        home_specific_shots = 0
        home_specific_shots_on_target = 0


    # ========================================================
    # AWAY SHOTS
    # ========================================================

    if len(a["away_shots"]) > 0:

        n = min(5, len(a["away_shots"]))

        away_specific_shots = sum(
            a["away_shots"][-5:]
        ) / n

        away_specific_shots_on_target = sum(
            a["away_shots_on_target"][-5:]
        ) / n

    else:

        away_specific_shots = 0
        away_specific_shots_on_target = 0


    # ========================================================
    # SHOT ACCURACY
    # ========================================================

    if home_avg_shots > 0:

        home_shot_accuracy = (
            home_avg_shots_on_target /
            home_avg_shots
        )

    else:

        home_shot_accuracy = 0


    if away_avg_shots > 0:

        away_shot_accuracy = (
            away_avg_shots_on_target /
            away_avg_shots
        )

    else:

        away_shot_accuracy = 0


    # ========================================================
    # GOAL DIFFERENCE
    # ========================================================

    home_goal_difference = (
        home_avg_goals_for -
        home_avg_goals_against
    )

    away_goal_difference = (
        away_avg_goals_for -
        away_avg_goals_against
    )


    # ========================================================
    # DIFFERENCES
    # ========================================================

    points_difference = (
        home_avg_points -
        away_avg_points
    )

    goal_difference_difference = (
        home_goal_difference -
        away_goal_difference
    )

    shots_difference = (
        home_avg_shots -
        away_avg_shots
    )

    shots_on_target_difference = (
        home_avg_shots_on_target -
        away_avg_shots_on_target
    )

    shot_accuracy_difference = (
        home_shot_accuracy -
        away_shot_accuracy
    )


    # ========================================================
    # RETURN EXACT SAME FEATURES AS TRAIN.PY
    # ========================================================

    return pd.DataFrame([{

        "HomeTeam": home,
        "AwayTeam": away,

        # Elo
        "HomeElo": home_elo,
        "AwayElo": away_elo,
        "EloDifference": elo_difference,

        # Form
        "HomeAvgPoints": home_avg_points,
        "AwayAvgPoints": away_avg_points,

        "HomeAvgGoalsFor":
            home_avg_goals_for,

        "AwayAvgGoalsFor":
            away_avg_goals_for,

        "HomeAvgGoalsAgainst":
            home_avg_goals_against,

        "AwayAvgGoalsAgainst":
            away_avg_goals_against,

        # Rates
        "HomeWinRate":
            home_win_rate,

        "AwayWinRate":
            away_win_rate,

        "HomeDrawRate":
            home_draw_rate,

        "AwayDrawRate":
            away_draw_rate,

        "HomeLossRate":
            home_loss_rate,

        "AwayLossRate":
            away_loss_rate,

        # Home / Away
        "HomeSpecificPoints":
            home_specific_points,

        "AwaySpecificPoints":
            away_specific_points,

        "HomeSpecificGoalsFor":
            home_specific_goals_for,

        "AwaySpecificGoalsFor":
            away_specific_goals_for,

        "HomeSpecificGoalsAgainst":
            home_specific_goals_against,

        "AwaySpecificGoalsAgainst":
            away_specific_goals_against,

        # Shots
        "HomeAvgShots":
            home_avg_shots,

        "AwayAvgShots":
            away_avg_shots,

        "HomeAvgShotsOnTarget":
            home_avg_shots_on_target,

        "AwayAvgShotsOnTarget":
            away_avg_shots_on_target,

        # Specific shots
        "HomeSpecificShots":
            home_specific_shots,

        "AwaySpecificShots":
            away_specific_shots,

        "HomeSpecificShotsOnTarget":
            home_specific_shots_on_target,

        "AwaySpecificShotsOnTarget":
            away_specific_shots_on_target,

        # Accuracy
        "HomeShotAccuracy":
            home_shot_accuracy,

        "AwayShotAccuracy":
            away_shot_accuracy,

        # Goal difference
        "HomeGoalDifference":
            home_goal_difference,

        "AwayGoalDifference":
            away_goal_difference,

        # Differences
        "PointsDifference":
            points_difference,

        "GoalDifferenceDifference":
            goal_difference_difference,

        "ShotsDifference":
            shots_difference,

        "ShotsOnTargetDifference":
            shots_on_target_difference,

        "ShotAccuracyDifference":
            shot_accuracy_difference

    }])


# ============================================================
# 12. HOME ROUTE
# ============================================================

@app.get("/")
def home():

    return {
        "message": "Premier League ML API is running!",
        "model": "Version 5"
    }


# ============================================================
# 13. TEAMS ROUTE
# ============================================================

@app.get("/teams")
def get_teams():

    teams = sorted(
        team_history.keys()
    )

    return {
        "count": len(teams),
        "teams": teams
    }


# ============================================================
# 14. PREDICTION ROUTE
# ============================================================

@app.post("/predict")
def predict_match(match: MatchRequest):

    home_input = match.home_team
    away_input = match.away_team


    # ========================================================
    # FIND CANONICAL TEAM NAMES
    # ========================================================

    home = find_team(home_input)
    away = find_team(away_input)


    # ========================================================
    # VALIDATE
    # ========================================================

    if home is None:

        raise HTTPException(
            status_code=400,
            detail=f"Unknown home team: {home_input}"
        )


    if away is None:

        raise HTTPException(
            status_code=400,
            detail=f"Unknown away team: {away_input}"
        )


    if home == away:

        raise HTTPException(
            status_code=400,
            detail="Home team and away team cannot be the same."
        )


    # ========================================================
    # CREATE FEATURES
    # ========================================================

    features = create_features(
        home,
        away
    )


    # ========================================================
    # DEBUG
    # ========================================================

    print("\nPrediction request:")
    print(home, "vs", away)

    print("\nFeatures sent to model:")
    print(features.columns.tolist())

    print("\nFeature count:")
    print(len(features.columns))


    # ========================================================
    # PREDICTION
    # ========================================================

    try:

        prediction = model.predict(
            features
        )[0]

        probabilities = model.predict_proba(
            features
        )[0]

    except Exception as e:

        print("\nMODEL ERROR:")
        print(e)

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


    # ========================================================
    # PROBABILITIES
    # ========================================================

    probability_map = {

        class_name: round(
            float(probability) * 100,
            2
        )

        for class_name, probability
        in zip(
            model.classes_,
            probabilities
        )
    }


    # ========================================================
    # RESULT NAMES
    # ========================================================

    result_names = {

        "H": "Home Win",
        "D": "Draw",
        "A": "Away Win"

    }


    # ========================================================
    # RESPONSE
    # ========================================================

    return {

        "home_team": home,

        "away_team": away,

        "prediction":
            result_names.get(
                prediction,
                prediction
            ),

        "prediction_code":
            prediction,

        "probabilities": {

            "home_win":
                probability_map.get(
                    "H",
                    0
                ),

            "draw":
                probability_map.get(
                    "D",
                    0
                ),

            "away_win":
                probability_map.get(
                    "A",
                    0
                )

        }

    }