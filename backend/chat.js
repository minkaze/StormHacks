const express = require('express');
const { VertexAI } = require('@google-cloud/vertexai');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Resolve the absolute path for credentials
const projectRoot = path.resolve(__dirname, '../..');
const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
  ? path.resolve(projectRoot, process.env.GOOGLE_APPLICATION_CREDENTIALS)
  : undefined;
let credentials = undefined;
if (credentialsPath && fs.existsSync(credentialsPath)) {
  try {
    credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
  } catch (parseError) {
    console.error('Failed to parse credentials file:', parseError.message);
  }
} else {
  console.error();
}

const vertexAI = new VertexAI({
  project: process.env.GOOGLE_CLOUD_PROJECT || 'storm-hacks',
  location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1',
  credentials: credentials || undefined,
});

router.post('/ai-response', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message required' });
    }

    let style = '';
    if (message.toLowerCase().includes('email')) {
      const styles = [
        'moody teen who misinterprets everything dramatically',
        'overly professional corporate writer who misinterprets everything formally',
        'clueless robot who misunderstands basic human concepts'
      ];
      style = styles[Math.floor(Math.random() * styles.length)];
    }

    const isShort = Math.random() < 0.5;
    const wordLimit = isShort ? 30 : 100;
    const lengthDescription = isShort ? 'short (under 30 words)' : 'average (under 100 words)';

    // Revised prompt for clearer structure
    let prompt = `Generate a hilarious email with a strict format: start with '
    Subject:' followed by the subject text on the same line, then start a new 
    line with the body text. Base the content on: ${message}. Do not include clarification—produce 
    the email immediately. Keep the total word count ${lengthDescription} (under ${wordLimit} words), 
    Sensuring the subject is concise and the body is funny, absurd, and brief.`;
    if (style) {
      prompt += ` Use a ${style} tone.`;
    }

    const generativeModel = vertexAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await generativeModel.generateContent({ contents: [{ role: 'user', parts: [{ text: prompt }] }] });
    let aiReply = result.response?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';

    const words = aiReply.split(/\s+/);
    const truncatedReply = words.slice(0, wordLimit).join(' ') + (words.length > wordLimit ? '...' : '');

    res.json({ reply: truncatedReply });
  } catch (error) {
    console.error('Vertex AI Error Details:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      details: error.details,
    });
    res.status(500).json({ error: 'AI generation failed', details: error.message });
  }
});

module.exports = router;