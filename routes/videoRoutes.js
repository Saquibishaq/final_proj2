const express = require('express');
const { generateVideo } = require('../services/videoService');
const router = express.Router();

// POST /api/videos/generate
router.post('/generate', async (req, res) => {
    try {
        const { text, duration, topic } = req.body;
        const videoPath = await generateVideo(text, duration, topic);
        res.json({ videoPath });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Video generation failed' });
    }
});

module.exports = router;
