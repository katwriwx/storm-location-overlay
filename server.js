const express = require("express");
const axios = require("axios");

const app = express();

app.use(express.json());
app.use(express.static("public"));

let currentLocation = {
  town: "Waiting...",
  state: ""
};

// Receive GPS coordinates
app.post("/update-location", async (req, res) => {
  const { lat, lon } = req.body;

  try {
    const result = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      {
        headers: {
          "User-Agent": "StormOverlay"
        }
      }
    );

    const address = result.data.address;

    currentLocation = {
      town: address.city || address.town || address.village || "Unknown",
      state: address.state || ""
    };

    res.json(currentLocation);

  } catch (err) {
    res.status(500).send("Error");
  }
});

// OBS reads this endpoint
app.get("/current-location", (req, res) => {
  res.json(currentLocation);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Running on ${PORT}`);
});
