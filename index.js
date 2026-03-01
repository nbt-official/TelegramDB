const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/api/get-stream', async (req, res) => {
    const channelId = req.query.id || 'star1in';
    const targetUrl = `https://profamouslife.com/premium.php?player=mobile&live=${channelId}`;

    let browser;
    try {
        // 1. Browser එක background එකේ launch කරනවා
        browser = await puppeteer.launch({
            headless: "new", // Browser window එක පේන්නේ නැති වෙන්න
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        // 2. Real Browser එකක් වගේ Headers සෙට් කරනවා
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');
        await page.setExtraHTTPHeaders({
            'Referer': 'https://streamcrichd.com/'
        });

        // 3. Page එකට යනවා (Cloudflare check එක ඉවර වෙනකම් wait වෙනවා)
        await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 30000 });

        // 4. Page එක ඇතුළේ තියෙන JavaScript එක run කරලා link එක ගන්නවා
        // මෙතනදී අපි 'lgterHUttp' function එක browser එක ඇතුළෙම call කරනවා
        const finalUrl = await page.evaluate(() => {
            if (typeof lgterHUttp === 'function') {
                return lgterHUttp();
            }
            return null;
        });

        if (finalUrl) {
            res.json({
                success: true,
                channel: channelId,
                url: finalUrl
            });
        } else {
            res.status(404).json({ success: false, message: "Could not find the link inside the page." });
        }

    } catch (error) {
        console.error("Puppeteer Error:", error.message);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        if (browser) {
            await browser.close(); // අනිවාර්යයෙන්ම browser එක වහන්න ඕන memory ඉතිරි කරගන්න
        }
    }
});

app.listen(PORT, () => {
    console.log(`Puppeteer API is running: http://localhost:${PORT}`);
});
