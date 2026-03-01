const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/api/get-stream', async (req, res) => {
    const channelId = req.query.id || 'star1in';
    const targetUrl = `https://profamouslife.com/premium.php?player=mobile&live=${channelId}`;

    try {
        // 1. Page eka fetch karanawa
        const response = await axios.get(targetUrl, {
            headers: {
                'Referer': 'https://streamcrichd.com',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
            }
        });

        const html = response.data;

        // 2. Regex eken update wena array eka extract karanawa
        // ["h","t","t","p",...] wage thiyena ona ma array ekak meken gannawa
        const arrayRegex = /const\s+\w+\s*=\s*(\["h",\s*"t",.+?\]);/;
        const match = html.match(arrayRegex);

        if (!match) {
            return res.status(404).json({ 
                success: false, 
                message: "Array eka hambune ne! Site eke structure eka wenas wela wenna puluwan." 
            });
        }

        // 3. String array eka join karala streaming link eka hadanawa
        const streamArray = JSON.parse(match[1]);
        const finalStreamingUrl = streamArray.join("");

        // Result eka JSON widiyata denawa
        res.json({
            success: true,
            channel: channelId,
            url: finalStreamingUrl
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Streaming Link API is live: http://localhost:${PORT}`);
});
