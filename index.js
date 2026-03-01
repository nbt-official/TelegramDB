const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/api/get-stream', async (req, res) => {
    const channelId = req.query.id || 'star1in';
    const targetUrl = `https://profamouslife.com/premium.php?player=mobile&live=${channelId}`;

    let browser;
    try {
        browser = await puppeteer.launch({
            headless: "new",
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox',
                '--disable-blink-features=AutomationControlled' // Automation detect wena eka adu karanawa
            ]
        });

        const page = await browser.newPage();

        // Real mobile browser ekaka look eka denawa
        await page.setUserAgent('Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Mobile Safari/537.36');
        
        await page.setExtraHTTPHeaders({
            'Referer': 'https://streamcrichd.com/'
        });

        // 1. Page ekata yanawa
        await page.goto(targetUrl, { 
            waitUntil: 'networkidle2', 
            timeout: 60000 
        });

        // 2. JavaScript function eka load wenakam thawa thappara 2-3 k innamu
        await new Promise(r => setTimeout(r, 3000)); 

        // 3. Function eka thiyeda kiyala check karala eka run karanawa
        const finalUrl = await page.evaluate(() => {
            // function eka thiyenawada balamu
            if (typeof lgterHUttp === 'function') {
                return lgterHUttp();
            }
            
            // function eka neththam, source eke thiyena array eka regex walin mehema ganna puluwan
            const scripts = Array.from(document.querySelectorAll('script'));
            for (let script of scripts) {
                const content = script.innerText;
                if (content.includes('lgterHUttp')) {
                    // Array extraction logic inside browser context
                    const match = content.match(/return\(\s*(\["h","t",.+?\])\.join\(""\)/);
                    if (match) {
                        const baseUrl = JSON.parse(match[1]).join("");
                        const spanMatch = content.match(/document\.getElementById\("(.+?)"\)\.innerHTML/);
                        if (spanMatch) {
                            const token = document.getElementById(spanMatch[1])?.innerHTML || "";
                            return baseUrl + token;
                        }
                    }
                }
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
            // Debugging walata page source eka console eke dagamu function eka nethnam
            const content = await page.content();
            console.log("Function not found. Page length:", content.length);
            res.status(404).json({ success: false, message: "Streaming logic not found on page." });
        }

    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        if (browser) await browser.close();
    }
});

app.listen(PORT, () => console.log(`API running on port ${PORT}`));
