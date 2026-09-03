const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 5000;

const footballAPI = axios.create({
  baseURL: "https://api.football-data.org/v4",
  headers: {
    "X-Auth-Token": process.env.FOOTBALL_API_TOKEN
  }
});


// TEST ROUTE

app.get("/", (req, res) => {
  res.json({
    message: "Premier League API backend is running"
  });
});


// STANDINGS

app.get("/api/standings", async (req, res) => {

  try {

    const response = await footballAPI.get(
      "/competitions/PL/standings"
    );

    res.json(response.data);

  } catch (error) {

    console.error(
      error.response?.data || error.message
    );

    res.status(
      error.response?.status || 500
    ).json({
      message: "Failed to fetch standings"
    });

  }

});
app.get("/api/matches", async (req, res) => {
  try {
    const response = await footballAPI.get(
      "/competitions/PL/matches"
    );

    console.log("Matches fetched:", response.data.matches.length);

    res.json(response.data);

  } catch (error) {
    console.error("MATCH API ERROR:");
    console.error("Status:", error.response?.status);
    console.error("Data:", error.response?.data);
    console.error("Message:", error.message);

    res.status(error.response?.status || 500).json({
      message: "Failed to fetch matches",
      error: error.response?.data || error.message
    });
  }
});
app.get("/api/scorers", async (req, res) => {
  try {
    const response = await footballAPI.get(
      "/competitions/PL/scorers"
    );

    res.json(response.data);

  } catch (error) {
    console.error("SCORERS API ERROR:");
    console.error("Status:", error.response?.status);
    console.error("Data:", error.response?.data);

    res.status(error.response?.status || 500).json({
      message: "Failed to fetch scorers",
      error: error.response?.data || error.message
    });
  }
});
app.get("/api/teams", async (req, res) => {
  try {
    const response = await footballAPI.get(
      "/competitions/PL/teams"
    );

    res.json(response.data);

  } catch (error) {
    console.error("TEAMS API ERROR:");
    console.error("Status:", error.response?.status);
    console.error("Data:", error.response?.data);

    res.status(error.response?.status || 500).json({
      message: "Failed to fetch teams",
      error: error.response?.data || error.message
    });
  }
});


app.listen(PORT, () => {

  console.log(
    `Backend running on http://localhost:${PORT}`
  );

});