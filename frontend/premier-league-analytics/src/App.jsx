import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/navbar";

import Dashboard from "./pages/dashboard";
import Standings from "./pages/standings";
import Scorers from "./pages/scorers";
import Teams from "./pages/teams";
import Predictor from "./pages/predictor";
import Matches from "./pages/matches";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/matches" element={<Matches />} />
        <Route path="/standings" element={<Standings />} />
        <Route path="/scorers" element={<Scorers />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/predictor" element={<Predictor />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;