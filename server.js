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
app.post("/update-location", (req, res) => {
  console.log("DATA RECEIVED:", req.body);

  const lat = req.body.lat || req.body.latitude;
  const lon = req.body.lon || req.body.longitude;

  currentLocation = {
    town: lat ? `LAT ${lat}` : "NO LAT",
    state: lon ? `LON ${lon}` : "NO LON"
  };

  res.json(currentLocation);
});

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
