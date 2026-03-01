const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/api/get-stream', async (req, res) => {
    const channelId = req.query.id || 'star1in';
    const targetUrl = `https://profamouslife.com/premium.php?player=mobile&live=${channelId}`;

    try {
        const response = await axios.get(targetUrl, {
            headers: {
                'Referer': 'https://streamcrichd.com/',
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Upgrade-Insecure-Requests': '1'
            }
        });

        const html = response.data;
        const $ = cheerio.load(html);

        // 1. lgterHUttp() function eka athule thiyena array eka extract kireema
        // Regex eka: function lgterHUttp() { return([...].join("") + ... }
        const urlArrayRegex = /return\(\s*(\["h","t",.+?\])\.join\(""\)/;
        const arrayMatch = html.match(urlArrayRegex);

        if (!arrayMatch) {
            return res.status(404).json({ success: false, message: "Streaming array not found." });
        }

        // 2. Array eka join karala URL eke mul kotasa gannawa
        const baseUrl = JSON.parse(arrayMatch[1]).join("");

        // 3. Span eka athule thiyena dynamic key eka gannawa
        // Source eke thiyenne: document.getElementById("cnatitrisBghSakuef").innerHTML
        // Api kelinma 'cnatitrisBghSakuef' span eken gannawa
        const dynamicSpanId = "cnatitrisBghSakuef"; 
        const dynamicToken = $(`#${dynamicSpanId}`).text().trim() || "";

        // 4. Anthima link eka (Base URL + Token)
        const finalUrl = baseUrl + dynamicToken;

        res.json({
            success: true,
            channel: channelId,
            url: finalUrl
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
