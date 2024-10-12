const axios = require('axios');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const googleTTS = require('google-tts-api');

// Pexels API Key (you can move this to an env variable)
const PEXELS_API_KEY = 'H1Z6bHv1l3etmP1J3wQl9Q1l3JNaL5PoypRPlQ9YNu9klqVOjGOVFWys';

async function fetchVideos(query, numVideos = 5) {
    const response = await axios.get(`https://api.pexels.com/videos/search?query=${query}&per_page=${numVideos}`, {
        headers: { Authorization: PEXELS_API_KEY }
    });
    return response.data.videos.map(video => video.video_files[0].link);
}

async function downloadVideo(url, index) {
    const response = await axios.get(url, { responseType: 'stream' });
    const filePath = `video_${index}.mp4`;
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);
    
    return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve(filePath));
        writer.on('error', reject);
    });
}

async function generateVoice(text) {
    const url = googleTTS.getAudioUrl(text, {
        lang: 'en',
        slow: false,
        host: 'https://translate.google.com',
    });
    const response = await axios.get(url, { responseType: 'stream' });
    const filePath = 'voice.mp3';
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);
    
    return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve(filePath));
        writer.on('error', reject);
    });
}

function createFinalVideo(videoFiles, voiceFile, duration) {
    return new Promise((resolve, reject) => {
        const output = 'final_video.mp4';
        const command = ffmpeg();

        // Add video files to the ffmpeg command
        videoFiles.forEach(file => {
            command.input(file);
        });

        // Add audio (voice) to the command
        command.input(voiceFile);

        // Set the output and processing parameters
        command
            .outputOptions('-map', '0:v:0', '-map', '1:a:0')
            .duration(duration * 60)
            .on('end', () => resolve(output))
            .on('error', reject)
            .save(output);
    });
}

async function generateVideo(text, duration, topic) {
    const videoLinks = await fetchVideos(topic, 5);
    const videoFiles = await Promise.all(videoLinks.map(downloadVideo));

    const voiceFile = await generateVoice(text);
    
    return await createFinalVideo(videoFiles, voiceFile, duration);
}

module.exports = { generateVideo };
