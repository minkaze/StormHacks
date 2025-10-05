import express from 'express';
import { VertexAI } from '@google-cloud/vertexai';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

// Resolve the absolute path for credentials using the project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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
  console.error('Credentials file not found or path invalid:', credentialsPath);
}

// Initialize Vertex AI client with credentials or fallback to ADC
const vertexAI = new VertexAI({
  project: process.env.GOOGLE_CLOUD_PROJECT || 'storm-hacks',
  location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1',
  credentials: credentials || undefined,
});

// Fallback: Log ADC attempt with instructions
if (!credentials) {
  console.warn('No valid credentials file found. Attempting to use ADC. Run the following commands if needed:');
  console.warn('1. Install Google Cloud SDK: https://cloud.google.com/sdk/docs/install');
  console.warn('2. Run: gcloud init');
  console.warn('3. Run: gcloud auth application-default login');
}

router.post('/ai-response', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message required' });
    }

    // Check for email request and apply silly styles
    let style = '';
    if (message.toLowerCase().includes('email')) {
      const styles = [
        'moody teen who misinterprets everything dramatically',
        'overly professional corporate writer who misinterprets everything formally',
        'clueless robot who misunderstands basic human concepts'
      ];
      style = styles[Math.floor(Math.random() * styles.length)];
    }

    // Randomly choose between short (10-15 words) and average (25-30 words) responses
    const isShort = Math.random() < 0.5; // 50% chance for short
    const wordLimit = isShort ? 30 : 100;
    const lengthDescription = isShort ? 'short (under 30 words)' : 'average (under 100 words)';

    // Construct prompt for concise, hilarious email generation
    let prompt = `Write a complete, hilarious email based on the request: ${message}. Do not ask for clarification—generate the email immediately with a ${lengthDescription} subject and body (under ${wordLimit} words total). Make it funny, absurd, and brief.`;
    if (style) {
      prompt += ` Use the tone of a ${style}.`;
    }

    const generativeModel = vertexAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const request = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    };
    const result = await generativeModel.generateContent(request);
    const aiReply = result.response?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';

    // Truncate to the random word limit
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

export default router;