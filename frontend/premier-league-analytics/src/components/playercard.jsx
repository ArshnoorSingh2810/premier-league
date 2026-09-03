function PlayerCard({ player }) {
  return (
    <div className="player-card">

      <div className="player-image-container">

        <img
          src={player.image}
          alt={player.name}
          className="player-image"
        />

        <img
          src={player.logo}
          alt={player.team}
          className="team-logo"
        />

      </div>


      <div className="player-info">

        <h3>{player.name}</h3>

        <p>{player.team}</p>

      </div>


      <div className="player-stats">

        <div>
          <strong>{player.goals}</strong>
          <span>Goals</span>
        </div>

        <div>
          <strong>{player.assists}</strong>
          <span>Assists</span>
        </div>

      </div>

    </div>
  );
}

export default PlayerCard;