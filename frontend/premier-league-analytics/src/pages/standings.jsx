import { useEffect, useState, useCallback } from "react";

function Standings() {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");

  const fetchStandings = useCallback(async () => {
    setLoading(true);
    setError("");
    setWarning("");

    try {
      const response = await fetch("http://localhost:5000/api/standings");

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || errorData.error || `Server responded with status ${response.status}`
        );
      }

      const data = await response.json();

      const tableData =
        data.standings?.[0]?.table ||
        data.table ||
        (Array.isArray(data.standings) ? data.standings : null);

      if (!tableData || !Array.isArray(tableData)) {
        throw new Error("Invalid standings data structure received from server.");
      }

      setStandings(tableData);

      if (data.isFallback || data.warning) {
        setWarning(data.warning || "External API issue. Displaying cached Premier League standings.");
      }
    } catch (err) {
      console.error("Fetch standings error:", err);
      setError(err.message || "Unable to load Premier League standings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStandings();
  }, [fetchStandings]);

  if (loading) {
    return (
      <main className="standings-page">
        <div className="page-heading">
          <p className="hero-label">PREMIER LEAGUE</p>
          <h1>Standings</h1>
          <p>Live Premier League table</p>
        </div>
        <div className="standings-state-card">
          <h2>Loading standings...</h2>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="standings-page">
        <div className="page-heading">
          <p className="hero-label">PREMIER LEAGUE</p>
          <h1>Standings</h1>
          <p>Live Premier League table</p>
        </div>
        <div className="standings-state-card error">
          <h2>Unable to load Premier League standings</h2>
          <p className="error-details">{error}</p>
          <button className="retry-btn" onClick={fetchStandings}>
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="standings-page">
      <div className="page-heading">
        <p className="hero-label">PREMIER LEAGUE</p>
        <h1>Standings</h1>
        <p>Live Premier League table</p>
      </div>

      {warning && (
        <div className="standings-notice">
          <span>{warning}</span>
          <button onClick={fetchStandings} className="notice-retry">
            Retry Live Data
          </button>
        </div>
      )}

      <section className="standings-table">
        <div className="standings-header">
          <span>POS</span>
          <span>TEAM</span>
          <span>P</span>
          <span>W</span>
          <span>D</span>
          <span>L</span>
          <span>GF</span>
          <span>GA</span>
          <span>GD</span>
          <span>PTS</span>
        </div>

        {standings.map((team) => (
          <div
            className="standings-row"
            key={team.team?.id || team.position}
          >
            <span className="position">{team.position}</span>

            <div className="standing-team">
              <div className="team-badge">
                <img
                  src={team.team?.crest || "https://crests.football-data.org/PL.png"}
                  alt={`${team.team?.name || "Team"} crest`}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://crests.football-data.org/PL.png";
                  }}
                />
              </div>
              <strong>{team.team?.name || "Unknown Team"}</strong>
            </div>

            <span>{team.playedGames ?? team.played ?? 0}</span>
            <span>{team.won ?? team.wins ?? 0}</span>
            <span>{team.draw ?? team.draws ?? 0}</span>
            <span>{team.lost ?? team.losses ?? 0}</span>
            <span>{team.goalsFor ?? 0}</span>
            <span>{team.goalsAgainst ?? 0}</span>
            <span>
              {(team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference) ?? 0}
            </span>
            <strong>{team.points ?? 0}</strong>
          </div>
        ))}
      </section>
    </main>
  );
}

export default Standings;