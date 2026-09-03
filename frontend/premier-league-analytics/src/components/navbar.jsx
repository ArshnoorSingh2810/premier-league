import { NavLink } from "react-router-dom";
import { Trophy } from "lucide-react";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">
        <Trophy size={28} />
        <span>PL ANALYTICS</span>
      </div>

      <div className="nav-links">
        <NavLink to="/">Dashboard</NavLink>
        <NavLink to="/matches">Matches</NavLink> 
        <NavLink to="/standings">Standings</NavLink>
        <NavLink to="/scorers">Top Scorers</NavLink>
        <NavLink to="/teams">Teams</NavLink>
        <NavLink to="/predictor">Predictor</NavLink>
      </div>
    </nav>
  );
}

export default Navbar;