const express = require("express");
const axios = require("axios");

const app = express();

app.use(express.json());
app.use(express.static("public"));

let currentLocation = {
  town: "Waiting...",
  state: ""
};

/**
 * Receive GPS data from Traccar
 */
app.post("/update-location", async (req, res) => {
  console.log("DATA RECEIVED:", req.body);

  const lat = req.body.lat || req.body.latitude;
  const lon = req.body.lon || req.body.longitude;

  if (!lat || !lon) {
    return res.status(400).json({
      error: "Missing lat/lon",
      received: req.body
    });
  }

  try {
    // Reverse geocode (lat/lon → town/state)
    const result = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      {
        headers: {
          "User-Agent": "StormOverlay"
        }
      }
    );

    const address = result.data.address || {};

    currentLocation = {
      town:
        address.city ||
        address.town ||
        address.village ||
        address.hamlet ||
        "Unknown",
      state: address.state || ""
    };

    res.json(currentLocation);

  } catch (err) {
    console.log("Geocode error:", err.message);

    // fallback so overlay still works
    currentLocation = {
      town: `LAT ${lat}`,
      state: `LON ${lon}`
    };

    res.json(currentLocation);
  }
});

/**
 * OBS overlay reads this
 */
app.get("/current-location", (req, res) => {
  res.json(currentLocation);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
