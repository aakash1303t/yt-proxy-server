import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import { parseStringPromise } from "xml2js"; // Import XML parser

const app = express();
app.use(cors());

app.get("/proxy", async (req, res) => {
    const { channelId } = req.query;
    if (!channelId) {
        return res.status(400).json({ error: "Channel ID is required" });
    }

    try {
        const response = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`);
        if (!response.ok) throw new Error("Failed to fetch data");

        const xml = await response.text();
        const json = await parseStringPromise(xml); // Convert XML to JSON

        res.json(json); // Return JSON response
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
