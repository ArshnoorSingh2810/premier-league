import { useEffect, useState } from "react";
import API_BASE_URL from "../api/config";

function Matches() {

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {

    const fetchMatches = async () => {

      try {

        const response = await fetch(
          `${API_BASE_URL}/matches`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch matches");
        }

        const data = await response.json();

        setMatches(data.matches);

      } catch (err) {

        console.error(err);

        setError("Unable to load matches.");

      } finally {

        setLoading(false);

      }

    };

    fetchMatches();

  }, []);


  if (loading) {
    return (
      <main className="matches-page">
        <h1>Loading matches...</h1>
      </main>
    );
  }


  if (error) {
    return (
      <main className="matches-page">
        <h1>{error}</h1>
      </main>
    );
  }


  return (
    <main className="matches-page">

      <div className="page-heading">

        <p className="hero-label">
          PREMIER LEAGUE
        </p>

        <h1>Matches</h1>

        <p>
          Premier League fixtures and results
        </p>

      </div>


      <section className="matches-list">

        {matches.map((match) => (

          <div
            className="match-card"
            key={match.id}
          >

            <div className="match-date">

              {new Date(
                match.utcDate
              ).toLocaleDateString()}

            </div>


            <div className="match-teams">

              <strong>
                {match.homeTeam.name}
              </strong>

              <span>VS</span>

              <strong>
                {match.awayTeam.name}
              </strong>

            </div>


            <div className="match-score">

              {match.status === "FINISHED"
                ? `${match.score.fullTime.home} - ${match.score.fullTime.away}`
                : match.status}

            </div>

          </div>

        ))}

      </section>

    </main>
  );
}

export default Matches;