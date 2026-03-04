const express = require('express');
const fetch = require('node-fetch');
const app = express();

// The specific stream you provided
const UPSTREAM = 'https://m.mxonlive.xyz/live/16559/crichd/willowusa.m3u8';
const REFERER = 'https://mxonlive.github.io/';
const ORIGIN = 'https://mxonlive.github.io';

app.get('/willow.m3u8', async (req, res) => {
  try {
    const response = await fetch(UPSTREAM, {
      headers: {
        'Referer': REFERER,
        'Origin': ORIGIN,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      return res.status(response.status).send(`Upstream returned ${response.status}`);
    }

    // Standard HLS Mime-Type
    res.set('Content-Type', 'application/vnd.apple.mpegurl');
    
    // Allow your player to access this proxy (CORS)
    res.set('Access-Control-Allow-Origin', '*');

    const body = await response.text();
    res.send(body);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000/willow.m3u8');
});
