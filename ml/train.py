import pandas as pd
import os
import joblib

from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report


# ============================================================
# 1. LOAD DATA
# ============================================================

print(os.getcwd())

df = pd.read_csv("ml/data/train.csv")

print("\nOriginal shape:")
print(df.shape)

df["MatchDate"] = pd.to_datetime(df["MatchDate"])

df = df.sort_values("MatchDate").reset_index(drop=True)


# ============================================================
# 2. TEAM HISTORY
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
        elo_ratings[team] = 1500

    return team_history[team]


# ============================================================
# 3. ELO
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
# 4. CREATE FEATURES
# ============================================================

features = []


for _, match in df.iterrows():

    home = match["HomeTeam"]
    away = match["AwayTeam"]

    h = get_team(home)
    a = get_team(away)


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
    # SAVE PRE-MATCH FEATURES
    # ========================================================

    features.append({

        "HomeTeam": home,
        "AwayTeam": away,

        # Elo
        "HomeElo": home_elo,
        "AwayElo": away_elo,
        "EloDifference": elo_difference,

        # Form
        "HomeAvgPoints": home_avg_points,
        "AwayAvgPoints": away_avg_points,

        "HomeAvgGoalsFor": home_avg_goals_for,
        "AwayAvgGoalsFor": away_avg_goals_for,

        "HomeAvgGoalsAgainst":
            home_avg_goals_against,

        "AwayAvgGoalsAgainst":
            away_avg_goals_against,

        # Rates
        "HomeWinRate": home_win_rate,
        "AwayWinRate": away_win_rate,

        "HomeDrawRate": home_draw_rate,
        "AwayDrawRate": away_draw_rate,

        "HomeLossRate": home_loss_rate,
        "AwayLossRate": away_loss_rate,

        # Home / away
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

        # Home / away shots
        "HomeSpecificShots":
            home_specific_shots,

        "AwaySpecificShots":
            away_specific_shots,

        "HomeSpecificShotsOnTarget":
            home_specific_shots_on_target,

        "AwaySpecificShotsOnTarget":
            away_specific_shots_on_target,

        # Shot accuracy
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
            shot_accuracy_difference,

        # Target
        "Result":
            match["FullTimeResult"]
    })


    # ========================================================
    # UPDATE HISTORY AFTER MATCH
    # ========================================================

    home_goals = match["FullTimeHomeGoals"]
    away_goals = match["FullTimeAwayGoals"]

    home_shots = match["HomeShots"]
    away_shots = match["AwayShots"]

    home_sot = match["HomeShotsOnTarget"]
    away_sot = match["AwayShotsOnTarget"]

    result = match["FullTimeResult"]


    # Points

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

    h["home_goals_for"].append(home_goals)

    h["home_goals_against"].append(away_goals)

    h["home_shots"].append(home_shots)

    h["home_shots_on_target"].append(
        home_sot
    )


    # ========================================================
    # AWAY HISTORY
    # ========================================================

    a["away_points"].append(away_points)

    a["away_goals_for"].append(away_goals)

    a["away_goals_against"].append(home_goals)

    a["away_shots"].append(away_shots)

    a["away_shots_on_target"].append(
        away_sot
    )


    # ========================================================
    # GENERAL SHOT HISTORY
    # ========================================================

    h["shots"].append(home_shots)

    h["shots_on_target"].append(home_sot)

    a["shots"].append(away_shots)

    a["shots_on_target"].append(away_sot)


    # ========================================================
    # UPDATE ELO
    # ========================================================

    update_elo(
        home,
        away,
        result
    )


# ============================================================
# 5. DATAFRAME
# ============================================================

features_df = pd.DataFrame(features)

print("\nVersion 5 dataset:")

print(
    features_df.head(10)
)

print("\nShape:")

print(
    features_df.shape
)

print("\nColumns:")

print(
    features_df.columns.tolist()
)

print("\nResult distribution:")

print(
    features_df["Result"].value_counts()
)


# ============================================================
# 6. X / Y
# ============================================================

X = features_df.drop(
    columns=["Result"]
)

y = features_df["Result"]


# ============================================================
# 7. CHRONOLOGICAL SPLIT
# ============================================================

split_index = int(
    len(X) * 0.8
)

X_train = X.iloc[:split_index]

X_test = X.iloc[split_index:]

y_train = y.iloc[:split_index]

y_test = y.iloc[split_index:]


print("\nTraining samples:")

print(
    len(X_train)
)

print("\nTesting samples:")

print(
    len(X_test)
)


# ============================================================
# 8. FEATURES
# ============================================================

categorical_features = [
    "HomeTeam",
    "AwayTeam"
]


numerical_features = [

    # Elo
    "HomeElo",
    "AwayElo",
    "EloDifference",

    # Form
    "HomeAvgPoints",
    "AwayAvgPoints",

    "HomeAvgGoalsFor",
    "AwayAvgGoalsFor",

    "HomeAvgGoalsAgainst",
    "AwayAvgGoalsAgainst",

    # Rates
    "HomeWinRate",
    "AwayWinRate",

    "HomeDrawRate",
    "AwayDrawRate",

    "HomeLossRate",
    "AwayLossRate",

    # Home / away
    "HomeSpecificPoints",
    "AwaySpecificPoints",

    "HomeSpecificGoalsFor",
    "AwaySpecificGoalsFor",

    "HomeSpecificGoalsAgainst",
    "AwaySpecificGoalsAgainst",

    # Shots
    "HomeAvgShots",
    "AwayAvgShots",

    "HomeAvgShotsOnTarget",
    "AwayAvgShotsOnTarget",

    # Specific shots
    "HomeSpecificShots",
    "AwaySpecificShots",

    "HomeSpecificShotsOnTarget",
    "AwaySpecificShotsOnTarget",

    # Accuracy
    "HomeShotAccuracy",
    "AwayShotAccuracy",

    # Goal difference
    "HomeGoalDifference",
    "AwayGoalDifference",

    # Differences
    "PointsDifference",
    "GoalDifferenceDifference",

    "ShotsDifference",
    "ShotsOnTargetDifference",

    "ShotAccuracyDifference"
]


# ============================================================
# 9. PREPROCESSOR
# ============================================================

preprocessor = ColumnTransformer(

    transformers=[

        (
            "teams",

            OneHotEncoder(
                handle_unknown="ignore"
            ),

            categorical_features
        ),

        (
            "numbers",

            "passthrough",

            numerical_features
        )
    ]
)


# ============================================================
# 10. MODEL
# ============================================================

model = RandomForestClassifier(

    n_estimators=600,

    max_depth=14,

    min_samples_leaf=4,

    class_weight="balanced",

    random_state=42,

    n_jobs=-1
)


# ============================================================
# 11. PIPELINE
# ============================================================

pipeline = Pipeline(

    steps=[

        (
            "preprocessor",
            preprocessor
        ),

        (
            "model",
            model
        )
    ]
)


# ============================================================
# 12. TRAIN
# ============================================================

print(
    "\nTraining Version 5 model..."
)

pipeline.fit(
    X_train,
    y_train
)

print(
    "Training complete!"
)


# ============================================================
# 13. PREDICTIONS
# ============================================================

predictions = pipeline.predict(
    X_test
)


# ============================================================
# 14. EVALUATION
# ============================================================

accuracy = accuracy_score(
    y_test,
    predictions
)

print("\n==============================")

print("VERSION 5 RESULTS")

print("==============================")

print(
    f"\nAccuracy: {accuracy * 100:.2f}%"
)

print(
    "\nClassification Report:"
)

print(
    classification_report(
        y_test,
        predictions
    )
)


# ============================================================
# 15. SAVE MODEL
# ============================================================

os.makedirs(
    "ml",
    exist_ok=True
)

joblib.dump(
    {
        "team_history": team_history,
        "elo_ratings": elo_ratings
    },
    "ml/team_state.pkl"
)

print("Team history saved successfully!")

print(
    "\nModel saved successfully!"
)

print(
    "Location: ml/model.pkl"
)


# ============================================================
# 16. EXAMPLE PREDICTIONS
# ============================================================

probabilities = pipeline.predict_proba(
    X_test.iloc[:5]
)

print(
    "\nExample predictions:"
)

for i in range(5):

    print(
        f"\n{X_test.iloc[i]['HomeTeam']} "
        f"vs "
        f"{X_test.iloc[i]['AwayTeam']}"
    )

    print(
        f"Actual: {y_test.iloc[i]}"
    )

    print(
        f"Predicted: {predictions[i]}"
    )

    for class_name, probability in zip(
        pipeline.classes_,
        probabilities[i]
    ):

        print(
            f"{class_name}: "
            f"{probability * 100:.2f}%"
        )