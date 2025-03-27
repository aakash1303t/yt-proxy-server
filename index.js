import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import { parseStringPromise } from "xml2js";

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
        const json = await parseStringPromise(xml);

        // Extract channel info
        const channelTitle = json.feed.title[0];
        const channelUrl = json.feed.link.find(link => link.$.rel === "alternate").$.href;

        // Extract latest videos
        const videos = json.feed.entry.map(entry => ({
            videoId: entry["yt:videoId"][0],
            title: entry.title[0],
            link: entry.link[0].$.href,
            thumbnail: entry["media:group"][0]["media:thumbnail"][0].$.url,
            published: entry.published[0],
            description: entry["media:group"][0]["media:description"][0]
        }));

        res.json({
            channel: {
                title: channelTitle,
                url: channelUrl
            },
            videos
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
