const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/api/get-stream', async (req, res) => {
    const channelId = req.query.id || 'star1in';
    const targetUrl = `https://profamouslife.com/premium.php?player=mobile&live=${channelId}`;

    try {
        const response = await axios.get(targetUrl, {
            headers: {
                'authority': 'profamouslife.com',
                'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'accept-language': 'en-US,en;q=0.9',
                'referer': 'https://streamcrichd.com/',
                'sec-ch-ua': '"Chromium";v="120", "Not?A_Brand";v="8"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'iframe',
                'sec-fetch-mode': 'navigate',
                'sec-fetch-site': 'cross-site',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        const html = response.data;
        
        // Regex eka thawa tikak "Flexible" kala array eka hoyanna
        const arrayRegex = /const\s+\w+\s*=\s*(\[[^\]]+\]);/;
        const match = html.match(arrayRegex);

        if (!match) {
            return res.status(404).json({ 
                success: false, 
                message: "Array eka hambune ne! Site eke security wadi karala athi." 
            });
        }

        const streamArray = JSON.parse(match[1]);
        const finalStreamingUrl = streamArray.join("");

        res.json({
            success: true,
            channel: channelId,
            url: finalStreamingUrl
        });

    } catch (error) {
        // Status code 403 error eka handle kirima
        res.status(error.response?.status || 500).json({ 
            success: false, 
            status: error.response?.status,
            message: "Request blocked by site (403). Headers update karanna wenawa.",
            error: error.message 
        });
    }
});

app.listen(PORT, () => {
    console.log(`API is running: http://localhost:${PORT}`);
});
