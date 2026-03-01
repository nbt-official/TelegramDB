const express = require('express');
const multer = require('multer');
const { Bot, InputFile } = require('grammy');
const path = require('path');

const app = express();
const upload = multer({ storage: multer.memoryStorage() }); // File eka RAM eke thiyagannawa process karana kan

// Telegram Bot Setup
const bot = new Bot("8747219972:AAFV3_pZVfPjeZTKQR48NireVzKUacSmfoY");
const CHAT_ID = "-1002061373128";

app.use(express.static('public')); // Frontend files danna folder eka

// 1. Upload API
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).send('File ekak natha!');

        // Telegram ekata yawamu
        const sentMessage = await bot.api.sendDocument(
            CHAT_ID, 
            new InputFile(req.file.buffer, req.file.originalname)
        );

        // File eke details labenawa
        const fileId = sentMessage.document.file_id;

        res.json({
            success: true,
            file_name: req.file.originalname,
            telegram_file_id: fileId,
            message: "File uploaded successfully to Telegram Cloud!"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Telegram ekata yawanna beri una!" });
    }
});
// 2. Download API (Direct link ekakata redirect kirima)
app.get('/download/:fileId', async (req, res) => {
    try {
        const { fileId } = req.params;

        // Telegram eken file eka thiyena path eka gannawa
        const file = await bot.api.getFile(fileId);
        
        // Telegram file server eke link eka hadanawa
        // Meka thama direct download link eka
        const downloadUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;

        // User wa e link ekata yawamu (Redirect)
        res.redirect(downloadUrl);

    } catch (error) {
        console.error(error);
        res.status(404).send("File eka hoyaganna baha hari link eka expire wela!");
    }
});
// Port eka Render eken thiranaya karai
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
