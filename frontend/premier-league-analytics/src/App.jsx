import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import Dashboard from "./pages/Dashboard";
import Standings from "./pages/Standings";
import Scorers from "./pages/Scorers";
import Teams from "./pages/Teams";
import Predictor from "./pages/Predictor";
import Matches from "./pages/Matches";

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