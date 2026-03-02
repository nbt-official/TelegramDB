const express require("express");
const fetch require("node-fetch");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/proxy", async (req, res) => {
  try {
    const { url, referer, origin } = req.query;

    if (!url) {
      return res.status(400).send("No url provided");
    }

    const headers = {
      "User-Agent": "Mozilla/5.0"
    };

    if (referer) headers["Referer"] = referer;
    if (origin) headers["Origin"] = origin;

    const response = await fetch(url, { headers });

    if (!response.ok) {
      return res.status(response.status).send("Upstream error");
    }

    // Forward content type
    res.set("Content-Type", response.headers.get("content-type"));
    res.set("Access-Control-Allow-Origin", "*");

    // Stream directly
    response.body.pipe(res);

  } catch (err) {
    console.error(err);
    res.status(500).send("Proxy error");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
