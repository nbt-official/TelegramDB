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
// index.js eke upload route eka mehema wenas karanna
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'File ekak natha!' });

        // Telegram ekata yawana eka loku file ekak nam poddak wela yanawa
        // E nisa 'sendDocument' kiyana eka await karanna
        const sentMessage = await bot.api.sendDocument(
            CHAT_ID, 
            new InputFile(req.file.buffer, req.file.originalname)
        );

       // const fileId = sentMessage.document ? sentMessage.document.file_id : sentMessage.video.file_id;
// Document ekak nam document.file_id, video ekak nam video.file_id
        const fileId = sentMessage.document?.file_id || sentMessage.video?.file_id || sentMessage.photo?.[0]?.file_id;
        return res.json({
            success: true,
            file_name: req.file.originalname,
            telegram_file_id: fileId
        });

    } catch (error) {
        console.error("Telegram Error:", error);
        // Error eka frontend ekata yawanna mokatada une kiyala dana ganna
        return res.status(500).json({ success: false, error: error.message });
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
        const TELEGRAM_BOT_TOKEN = "8747219972:AAFV3_pZVfPjeZTKQR48NireVzKUacSmfoY";
        const downloadUrl = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${file.file_path}`;

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
