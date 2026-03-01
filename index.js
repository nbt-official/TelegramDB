const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = 0414;

app.get('/api/match.m3u8', async (req, res) => {
    const channelId = req.query.id || 'star1in';
    const targetUrl = `https://profamouslife.com/premium.php?player=mobile&live=${channelId}`;

    try {
        const response = await axios.get(targetUrl, {
            headers: {
                'Referer': 'https://streamcrichd.com',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        const html = response.data;
        const $ = cheerio.load(html);

        // Scrape the character array
        const arrayRegex = /\[\s*"h"\s*,\s*"t"\s*,\s*"t"[\s\S]*?\]/;
        const match = html.match(arrayRegex);
        
        if (!match) throw new Error("Stream array not found.");

        const baseUrl = JSON.parse(match[0]).join("");
        const dynamicToken = $('#atsfSahernkiBigtcu').text().trim();
        const finalStreamUrl = baseUrl + dynamicToken;

        // Fetch the M3U8 content
        const streamResponse = await axios.get(finalStreamUrl, {
            headers: {
                'Origin': 'https://profamouslife.com',
                'Referer': 'https://profamouslife.com/'
            }
        });

        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
        res.setHeader('Access-Control-Allow-Origin', '*'); 
        res.send(streamResponse.data);

    } catch (error) {
        res.status(500).send("Error fetching stream.");
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
