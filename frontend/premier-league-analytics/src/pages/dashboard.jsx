import StatCard from "../components/StatCard";

import {
  stats,
  standings,
  topScorers
} from "../data/dummyData";

function Dashboard() {
  return (
    <main className="dashboard">

      {/* HERO */}

      <section className="hero">

        <div>
          <p className="hero-label">
            PREMIER LEAGUE ANALYTICS
          </p>

          <h1>
            Football data.
            <br />
            <span>Made intelligent.</span>
          </h1>

          <p className="hero-description">
            Explore Premier League statistics,
            player performance and machine
            learning predictions.
          </p>
        </div>

      </section>


      {/* STATS */}

      <section className="stats-grid">

        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            subtitle={stat.subtitle}
          />
        ))}

      </section>


      {/* TWO COLUMNS */}

      <section className="dashboard-grid">

        {/* STANDINGS */}

        <div className="dashboard-card">

          <div className="card-header">
            <h2>Current Standings</h2>

            <button>View All</button>
          </div>

          <div className="standings-list">

            {standings.map((team) => (

              <div
                className="standing-row"
                key={team.position}
              >

                <span className="position">
                  {team.position}
                </span>

                <span className="team-name">
                  {team.team}
                </span>

                <strong>
                  {team.points}
                </strong>

              </div>

            ))}

          </div>

        </div>


        {/* TOP SCORERS */}

        <div className="dashboard-card">

          <div className="card-header">

            <h2>Top Scorers</h2>

            <button>View All</button>

          </div>


          <div className="scorers-list">

            {topScorers.map((player) => (

              <div
                className="scorer-row"
                key={player.name}
              >

                <div>

                  <strong>
                    {player.name}
                  </strong>

                  <span>
                    {player.team}
                  </span>

                </div>

                <strong>
                   {player.goals}
                </strong>

              </div>

            ))}

          </div>

        </div>

      </section>


      {/* PREDICTOR */}

      <section className="predictor-card">

        <div>

          <p className="hero-label">
            MACHINE LEARNING
          </p>

          <h2>
            Predict the next match
          </h2>

          <p>
            Our ML model will analyze team
            performance, form, goals and
            historical results.
          </p>

        </div>

        <button className="predict-button">
          Open Predictor →
        </button>

      </section>

    </main>
  );
}

export default Dashboard;