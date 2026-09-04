const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

// Load .env relative to current file location so it works regardless of CWD
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const FOOTBALL_API_TOKEN = process.env.FOOTBALL_API_TOKEN || "";

const footballAPI = axios.create({
  baseURL: "https://api.football-data.org/v4",
  headers: {
    "X-Auth-Token": FOOTBALL_API_TOKEN
  }
});

// Fallback Standings Data (used if external API is rate-limited, unavailable, or offline)
const FALLBACK_STANDINGS = [
  { position: 1, team: { id: 65, name: "Manchester City FC", shortName: "Man City", crest: "https://crests.football-data.org/65.png" }, playedGames: 38, won: 28, draw: 7, lost: 3, goalsFor: 96, goalsAgainst: 34, goalDifference: 62, points: 91 },
  { position: 2, team: { id: 61, name: "Arsenal FC", shortName: "Arsenal", crest: "https://crests.football-data.org/61.png" }, playedGames: 38, won: 28, draw: 5, lost: 5, goalsFor: 91, goalsAgainst: 29, goalDifference: 62, points: 89 },
  { position: 3, team: { id: 64, name: "Liverpool FC", shortName: "Liverpool", crest: "https://crests.football-data.org/64.png" }, playedGames: 38, won: 24, draw: 10, lost: 4, goalsFor: 86, goalsAgainst: 41, goalDifference: 45, points: 82 },
  { position: 4, team: { id: 66, name: "Aston Villa FC", shortName: "Aston Villa", crest: "https://crests.football-data.org/66.png" }, playedGames: 38, won: 20, draw: 8, lost: 10, goalsFor: 76, goalsAgainst: 61, goalDifference: 15, points: 68 },
  { position: 5, team: { id: 73, name: "Tottenham Hotspur FC", shortName: "Tottenham", crest: "https://crests.football-data.org/73.svg" }, playedGames: 38, won: 20, draw: 6, lost: 12, goalsFor: 74, goalsAgainst: 61, goalDifference: 13, points: 66 },
  { position: 6, team: { id: 62, name: "Chelsea FC", shortName: "Chelsea", crest: "https://crests.football-data.org/62.png" }, playedGames: 38, won: 18, draw: 9, lost: 11, goalsFor: 77, goalsAgainst: 63, goalDifference: 14, points: 63 },
  { position: 7, team: { id: 67, name: "Newcastle United FC", shortName: "Newcastle", crest: "https://crests.football-data.org/67.png" }, playedGames: 38, won: 18, draw: 6, lost: 14, goalsFor: 85, goalsAgainst: 62, goalDifference: 23, points: 60 },
  { position: 8, team: { id: 63, name: "Manchester United FC", shortName: "Man United", crest: "https://crests.football-data.org/63.png" }, playedGames: 38, won: 18, draw: 6, lost: 14, goalsFor: 57, goalsAgainst: 58, goalDifference: -1, points: 60 },
  { position: 9, team: { id: 563, name: "West Ham United FC", shortName: "West Ham", crest: "https://crests.football-data.org/563.png" }, playedGames: 38, won: 14, draw: 10, lost: 14, goalsFor: 60, goalsAgainst: 74, goalDifference: -14, points: 52 },
  { position: 10, team: { id: 397, name: "Brighton & Hove Albion FC", shortName: "Brighton", crest: "https://crests.football-data.org/397.svg" }, playedGames: 38, won: 12, draw: 12, lost: 14, goalsFor: 55, goalsAgainst: 62, goalDifference: -7, points: 48 },
  { position: 11, team: { id: 402, name: "Brentford FC", shortName: "Brentford", crest: "https://crests.football-data.org/402.png" }, playedGames: 38, won: 13, draw: 9, lost: 16, goalsFor: 56, goalsAgainst: 65, goalDifference: -9, points: 48 },
  { position: 12, team: { id: 55, name: "Everton FC", shortName: "Everton", crest: "https://crests.football-data.org/55.pt.png" }, playedGames: 38, won: 13, draw: 9, lost: 16, goalsFor: 40, goalsAgainst: 51, goalDifference: -11, points: 48 },
  { position: 13, team: { id: 354, name: "Crystal Palace FC", shortName: "Crystal Palace", crest: "https://crests.football-data.org/354.png" }, playedGames: 38, won: 13, draw: 10, lost: 15, goalsFor: 57, goalsAgainst: 58, goalDifference: -1, points: 49 },
  { position: 14, team: { id: 76, name: "Wolverhampton Wanderers FC", shortName: "Wolves", crest: "https://crests.football-data.org/76.png" }, playedGames: 38, won: 13, draw: 7, lost: 18, goalsFor: 50, goalsAgainst: 65, goalDifference: -15, points: 46 },
  { position: 15, team: { id: 351, name: "Nottingham Forest FC", shortName: "Nottingham", crest: "https://crests.football-data.org/351.png" }, playedGames: 38, won: 9, draw: 9, lost: 20, goalsFor: 49, goalsAgainst: 67, goalDifference: -18, points: 36 },
  { position: 16, team: { id: 340, name: "Southampton FC", shortName: "Southampton", crest: "https://crests.football-data.org/340.png" }, playedGames: 38, won: 6, draw: 7, lost: 25, goalsFor: 36, goalsAgainst: 74, goalDifference: -38, points: 25 },
  { position: 17, team: { id: 356, name: "Sheffield United FC", shortName: "Sheffield Utd", crest: "https://crests.football-data.org/356.png" }, playedGames: 38, won: 3, draw: 7, lost: 28, goalsFor: 35, goalsAgainst: 104, goalDifference: -69, points: 16 },
  { position: 18, team: { id: 328, name: "Burnley FC", shortName: "Burnley", crest: "https://crests.football-data.org/328.png" }, playedGames: 38, won: 5, draw: 9, lost: 24, goalsFor: 41, goalsAgainst: 78, goalDifference: -37, points: 24 },
  { position: 19, team: { id: 357, name: "Luton Town FC", shortName: "Luton", crest: "https://crests.football-data.org/357.png" }, playedGames: 38, won: 6, draw: 8, lost: 24, goalsFor: 52, goalsAgainst: 85, goalDifference: -33, points: 26 },
  { position: 20, team: { id: 394, name: "Leicester City FC", shortName: "Leicester", crest: "https://crests.football-data.org/394.png" }, playedGames: 38, won: 9, draw: 7, lost: 22, goalsFor: 51, goalsAgainst: 68, goalDifference: -17, points: 34 }
];

const router = express.Router();

// TEST ROUTE
router.get("/", (req, res) => {
  res.json({
    message: "Premier League API backend is running"
  });
});

// STANDINGS ROUTE
router.get("/standings", async (req, res) => {
  try {
    const response = await footballAPI.get("/competitions/PL/standings");
    res.json(response.data);
  } catch (error) {
    const statusCode = error.response?.status;
    const errorDetails = error.response?.data || error.message;
    console.error("STANDINGS API ERROR:", statusCode, errorDetails);

    // If external API returns error (e.g. rate limit 429, restricted 403, network issue),
    // return fallback data formatted exactly as expected by the frontend
    res.json({
      isFallback: true,
      warning: "External Football API limit reached or service unavailable. Showing cached standings.",
      error: errorDetails,
      standings: [
        {
          stage: "REGULAR_SEASON",
          type: "TOTAL",
          table: FALLBACK_STANDINGS
        }
      ]
    });
  }
});

const FALLBACK_MATCHES = [
  { id: 1, utcDate: "2024-05-19T15:00:00Z", homeTeam: { name: "Manchester City FC" }, awayTeam: { name: "West Ham United FC" }, status: "FINISHED", score: { fullTime: { home: 3, away: 1 } } },
  { id: 2, utcDate: "2024-05-19T15:00:00Z", homeTeam: { name: "Arsenal FC" }, awayTeam: { name: "Everton FC" }, status: "FINISHED", score: { fullTime: { home: 2, away: 1 } } },
  { id: 3, utcDate: "2024-05-19T15:00:00Z", homeTeam: { name: "Liverpool FC" }, awayTeam: { name: "Wolverhampton Wanderers FC" }, status: "FINISHED", score: { fullTime: { home: 2, away: 0 } } },
  { id: 4, utcDate: "2024-05-19T15:00:00Z", homeTeam: { name: "Brighton & Hove Albion FC" }, awayTeam: { name: "Manchester United FC" }, status: "FINISHED", score: { fullTime: { home: 0, away: 2 } } },
  { id: 5, utcDate: "2024-05-19T15:00:00Z", homeTeam: { name: "Chelsea FC" }, awayTeam: { name: "AFC Bournemouth" }, status: "FINISHED", score: { fullTime: { home: 2, away: 1 } } }
];

const FALLBACK_SCORERS = [
  { player: { id: 1, name: "Erling Haaland" }, team: { name: "Manchester City FC" }, playedMatches: 31, goals: 27, assists: 5 },
  { player: { id: 2, name: "Cole Palmer" }, team: { name: "Chelsea FC" }, playedMatches: 34, goals: 22, assists: 11 },
  { player: { id: 3, name: "Alexander Isak" }, team: { name: "Newcastle United FC" }, playedMatches: 30, goals: 21, assists: 2 },
  { player: { id: 4, name: "Ollie Watkins" }, team: { name: "Aston Villa FC" }, playedMatches: 37, goals: 19, assists: 13 },
  { player: { id: 5, name: "Dominic Solanke" }, team: { name: "AFC Bournemouth" }, playedMatches: 38, goals: 19, assists: 3 },
  { player: { id: 6, name: "Mohamed Salah" }, team: { name: "Liverpool FC" }, playedMatches: 32, goals: 18, assists: 10 }
];

const FALLBACK_TEAMS = FALLBACK_STANDINGS.map((item) => ({
  id: item.team.id,
  name: item.team.name,
  shortName: item.team.shortName,
  crest: item.team.crest
}));

// MATCHES ROUTE
router.get("/matches", async (req, res) => {
  try {
    const response = await footballAPI.get("/competitions/PL/matches");
    console.log("Matches fetched:", response.data.matches?.length);
    res.json(response.data);
  } catch (error) {
    console.error("MATCH API ERROR:", error.response?.status, error.response?.data || error.message);
    res.json({
      isFallback: true,
      warning: "External Football API limit reached or service unavailable. Showing cached matches.",
      matches: FALLBACK_MATCHES
    });
  }
});

// SCORERS ROUTE
router.get("/scorers", async (req, res) => {
  try {
    const response = await footballAPI.get("/competitions/PL/scorers");
    res.json(response.data);
  } catch (error) {
    console.error("SCORERS API ERROR:", error.response?.status, error.response?.data || error.message);
    res.json({
      isFallback: true,
      warning: "External Football API limit reached or service unavailable. Showing cached top scorers.",
      scorers: FALLBACK_SCORERS
    });
  }
});

// TEAMS ROUTE
router.get("/teams", async (req, res) => {
  try {
    const response = await footballAPI.get("/competitions/PL/teams");
    res.json(response.data);
  } catch (error) {
    console.error("TEAMS API ERROR:", error.response?.status, error.response?.data || error.message);
    res.json({
      isFallback: true,
      warning: "External Football API limit reached or service unavailable. Showing cached teams.",
      teams: FALLBACK_TEAMS
    });
  }
});

app.use("/api", router);
app.use("/.netlify/functions/api", router);
app.use("/", router);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
  });
}

module.exports = app;