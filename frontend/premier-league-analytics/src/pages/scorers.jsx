import { useEffect, useState } from "react";

function Scorers() {
  const [players, setPlayers] = useState([]);
  const [search, setSearch] = useState("");
  const [team, setTeam] = useState("All");
  const [sortBy, setSortBy] = useState("goals");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchScorers = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/scorers"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch scorers");
        }

        const data = await response.json();

        setPlayers(data.scorers || []);

      } catch (err) {
        console.error(err);
        setError("Unable to load top scorers.");
      } finally {
        setLoading(false);
      }
    };

    fetchScorers();
  }, []);

  const teams = [
    "All",
    ...new Set(
      players.map((player) => player.team.name)
    )
  ];

  const filteredPlayers = [...players]
    .filter((player) =>
      player.player.name
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .filter((player) =>
      team === "All"
        ? true
        : player.team.name === team
    )
    .sort(
      (a, b) =>
        (b[sortBy] || 0) - (a[sortBy] || 0)
    );

  if (loading) {
    return (
      <main className="scorers-page">
        <h1>Loading top scorers...</h1>
      </main>
    );
  }

  if (error) {
    return (
      <main className="scorers-page">
        <h1>{error}</h1>
      </main>
    );
  }

  return (
    <main className="scorers-page">

      <div className="page-heading">

        <p className="hero-label">
          PLAYER STATISTICS
        </p>

        <h1>Top Scorers</h1>

        <p>
          Premier League attacking performance
        </p>

      </div>


      {/* FILTERS */}

      <section className="filters">

        <input
          type="text"
          placeholder="Search player..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        <select
          value={team}
          onChange={(e) =>
            setTeam(e.target.value)
          }
        >
          {teams.map((teamName) => (
            <option
              key={teamName}
              value={teamName}
            >
              {teamName}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) =>
            setSortBy(e.target.value)
          }
        >
          <option value="goals">
            Sort by Goals
          </option>

          <option value="assists">
            Sort by Assists
          </option>
        </select>

      </section>


      {/* TABLE */}

      <section className="scorers-table">

        <div className="table-header">

          <span>#</span>
          <span>PLAYER</span>
          <span>TEAM</span>
          <span>APPEARANCES</span>
          <span>GOALS</span>
          <span>ASSISTS</span>

        </div>


        {filteredPlayers.map((player, index) => (

          <div
            className="table-row"
            key={player.player.id}
          >

            <span className="rank">
              {index + 1}
            </span>

            <strong>
              {player.player.name}
            </strong>

            <span>
              {player.team.name}
            </span>

            <span>
              {player.playedMatches ?? "-"}
            </span>

            <strong className="goals">
              {player.goals ?? 0}
            </strong>

            <span>
              {player.assists ?? 0}
            </span>

          </div>

        ))}

      </section>


      {filteredPlayers.length === 0 && (

        <div className="no-results">
          No players found.
        </div>

      )}

    </main>
  );
}

export default Scorers;