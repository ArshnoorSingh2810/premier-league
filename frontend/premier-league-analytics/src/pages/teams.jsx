import { useEffect, useState } from "react";
import API_BASE_URL from "../api/config";

function Teams() {
  const [teams, setTeams] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/teams`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch teams");
        }

        const data = await response.json();

        setTeams(data.teams || []);

      } catch (err) {
        console.error(err);
        setError("Unable to load teams.");
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const filteredTeams = teams.filter((team) =>
    team.name
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <main className="teams-page">
        <h1>Loading teams...</h1>
      </main>
    );
  }

  if (error) {
    return (
      <main className="teams-page">
        <h1>{error}</h1>
      </main>
    );
  }

  return (
    <main className="teams-page">

      <div className="page-heading">

        <p className="hero-label">
          PREMIER LEAGUE
        </p>

        <h1>Teams</h1>

        <p>
          Explore Premier League clubs.
        </p>

      </div>


      <div className="team-search">

        <input
          type="text"
          placeholder="Search team..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

      </div>


      <section className="team-grid">

        {filteredTeams.map((team) => (

          <div
            className="team-card"
            key={team.id}
          >

            <div className="team-badge">
  <img
    src={team.crest}
    alt={`${team.name} crest`}
  />
</div>

            <div className="team-card-info">

              <h2>
                {team.name}
              </h2>

              <p>
                {team.shortName}
              </p>

            </div>

          </div>

        ))}

      </section>


      {filteredTeams.length === 0 && (
        <p className="no-results">
          No teams found.
        </p>
      )}

    </main>
  );
}

export default Teams;