import { useEffect, useState } from "react";
import { ML_API_BASE_URL } from "../api/config";
import "./predictor.css";

function Predictor() {
  const [homeTeam, setHomeTeam] = useState("");
  const [awayTeam, setAwayTeam] = useState("");
  const [teams, setTeams] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Get teams from FastAPI
  useEffect(() => {
    fetch(`${ML_API_BASE_URL}/teams`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Could not connect to ML API");
        }

        return response.json();
      })
      .then((data) => {
        setTeams(data.teams);
      })
      .catch((error) => {
        console.error(error);
        setError("Could not connect to the ML API");
      });
  }, []);

  const handlePredict = async () => {
    if (!homeTeam || !awayTeam) {
      alert("Please select both teams");
      return;
    }

    if (homeTeam === awayTeam) {
      alert("Home and Away teams cannot be the same");
      return;
    }

    setLoading(true);
    setPrediction(null);
    setError("");

    try {
      const response = await fetch(`${ML_API_BASE_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          home_team: homeTeam,
          away_team: awayTeam,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Prediction failed");
      }

      setPrediction(data);
    } catch (error) {
      console.error(error);
      setError(error.message || "Could not connect to the ML API");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="predictor-page">
      <div className="predictor-container">

        <div className="predictor-header">
          <span className="predictor-badge">
            AI POWERED
          </span>

          <h1>Match Predictor</h1>

          <p>
            Select two Premier League teams and predict the match result.
          </p>
        </div>

        <div className="predictor-card">

          <div className="team-selection">

            <div className="team-box">
              <label>HOME TEAM</label>

              <select
                value={homeTeam}
                onChange={(e) => setHomeTeam(e.target.value)}
              >
                <option value="">
                  Select Home Team
                </option>

                {teams.map((team) => (
                  <option key={team} value={team}>
                    {team}
                  </option>
                ))}
              </select>
            </div>

            <div className="vs">
              VS
            </div>

            <div className="team-box">
              <label>AWAY TEAM</label>

              <select
                value={awayTeam}
                onChange={(e) => setAwayTeam(e.target.value)}
              >
                <option value="">
                  Select Away Team
                </option>

                {teams.map((team) => (
                  <option key={team} value={team}>
                    {team}
                  </option>
                ))}
              </select>
            </div>

          </div>

          <button
            className="predict-btn"
            onClick={handlePredict}
            disabled={loading}
          >
            {loading ? "Predicting..." : "Predict Match"}
          </button>

          {error && (
            <div className="prediction-error">
              {error}
            </div>
          )}

          {prediction && (
            <div className="prediction-result">

              <span>Predicted Result</span>

              <h2>
                {prediction.prediction}
              </h2>

              <div className="probabilities">

                <div>
                  <span>Home Win</span>
                  <strong>
                    {prediction.probabilities.home_win}%
                  </strong>
                </div>

                <div>
                  <span>Draw</span>
                  <strong>
                    {prediction.probabilities.draw}%
                  </strong>
                </div>

                <div>
                  <span>Away Win</span>
                  <strong>
                    {prediction.probabilities.away_win}%
                  </strong>
                </div>

              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default Predictor;

