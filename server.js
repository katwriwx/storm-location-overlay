const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

// This variable will hold your latest location text in memory
let latestLocationText = "Awaiting GPS Fix...";

// Middleware to parse incoming phone data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// -------------------------------------------------------------
// PAGE 1: THE DATA CATCHER (Where your Traccar app sends data)
// -------------------------------------------------------------
app.get('/api/gps', async (req, res) => {
    // Traccar app sends data as URL query parameters: ?lat=XXX&lon=YYY
    const lat = req.query.lat;
    const lon = req.query.lon;

    if (!lat || !lon) {
        return res.status(400).send("Missing coordinates.");
    }

    try {
        // Send coordinates to the free OpenStreetMap mapping API
        // User-Agent is required by OpenStreetMap rules
        const mapResponse = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`, {
            headers: { 'User-Agent': 'ChaserHUDPrototype/1.0' }
        });

        const address = mapResponse.data.address;
        
        if (address) {
            // Extract the pieces needed for Option B
            const county = address.county || "Unknown County";
            const state = address.state || "";
            
            // Try to find a highway, major road, or fallback road
            const road = address.road || address.construction || "Local Road";

            // Format State name to standard 2-letter abbreviation if possible
            let stateAbbr = state;
            if (state.toLowerCase() === "oklahoma") stateAbbr = "OK";
            if (state.toLowerCase() === "texas") stateAbbr = "TX";
            if (state.toLowerCase() === "kansas") stateAbbr = "KS";
            // (You can expand this list later, keeping it simple for testing)

            // Format the final Option B string
            latestLocationText = `LOCATION: ${county}, ${stateAbbr} [${road}]`;
            console.log("Updated location:", latestLocationText);
        }

    } catch (error) {
        console.error("Error communicating with Map API:", error.message);
    }

    // Always tell the phone app "OK, I got the data"
    res.send("OK");
});

// -------------------------------------------------------------
// PAGE 2: THE OVERLAY LINK (What you paste into OBS)
// -------------------------------------------------------------
app.get('/overlay', (req, res) => {
    // This sends a minimalist, transparent webpage back to OBS.
    // It includes a tiny script that refreshes the page automatically every 5 seconds.
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Chaser HUD Overlay</title>
            <style>
                body {
                    background-color: transparent; /* Makes background clear in OBS */
                    color: #ffffff;               /* Clean white text */
                    font-family: 'Courier New', monospace; /* Heavy, tactical command center font */
                    font-size: 24px;
                    font-weight: bold;
                    text-shadow: 2px 2px 4px #000000; /* Drop shadow so it stands out against bright storm skies */
                    margin: 20px;
                    padding: 0;
                }
            </style>
            <script>
                // Auto-refresh the page content every 5 seconds to get the newest live location
                setInterval(() => {
                    window.location.reload();
                }, 5000);
            </script>
        </head>
        <body>
            <div>${latestLocationText}</div>
        </body>
        </html>
    `);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
