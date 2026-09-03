import { useEffect, useState } from "react";

function Standings() {

  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {

    const fetchStandings = async () => {

      try {

        const response = await fetch(
          "http://localhost:5000/api/standings"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch standings");
        }

        const data = await response.json();

        setStandings(
          data.standings[0].table
        );

      } catch (err) {

        console.error(err);

        setError(
          "Unable to load Premier League standings."
        );

      } finally {

        setLoading(false);

      }

    };

    fetchStandings();

  }, []);


  if (loading) {
    return (
      <main className="standings-page">
        <h1>Loading standings...</h1>
      </main>
    );
  }


  if (error) {
    return (
      <main className="standings-page">
        <h1>{error}</h1>
      </main>
    );
  }


  return (
    <main className="standings-page">

      <div className="page-heading">

        <p className="hero-label">
          PREMIER LEAGUE
        </p>

        <h1>Standings</h1>

        <p>
          Live Premier League table
        </p>

      </div>


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
            key={team.team.id}
          >

            <span className="position">
              {team.position}
            </span>

            <div className="standing-team">
              <div className="team-badge">
  <img
    src={team.team.crest}
    alt={`${team.name} crest`}
  />
</div>
<strong> {team.team.name}
    </strong>
</div>
            

            <span>{team.playedGames}</span>

            <span>{team.won}</span>

            <span>{team.draw}</span>

            <span>{team.lost}</span>

            <span>{team.goalsFor}</span>

            <span>{team.goalsAgainst}</span>

            <span>
              {team.goalDifference > 0
                ? `+${team.goalDifference}`
                : team.goalDifference}
            </span>

            <strong>
              {team.points}
            </strong>

          </div>

        ))}

      </section>

    </main>
  );
}

export default Standings;