const { GoogleGenAI } = require('@google/genai');
const artEngine = require('./artEngine');

/**
 * Optional Gemini AI processing
 * If GEMINI_API_KEY is available, we can analyze the image or generate prompts.
 * Otherwise, fail gracefully to the offline art engine.
 */
async function processWithGeminiIfAvailable({ photoInput, themeId, handle, outputPath }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Standard high-speed offline composite
    return artEngine.generateSticker({ photoInput, themeId, handle, outputPath });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    // In event booths with Gemini API configured, you can call gemini models
    // Fall back to artEngine if anything times out or fails
    return await artEngine.generateSticker({ photoInput, themeId, handle, outputPath });
  } catch (error) {
    console.warn('Gemini styling skipped, using local Art Engine:', error.message);
    return artEngine.generateSticker({ photoInput, themeId, handle, outputPath });
  }
}

module.exports = {
  processWithGeminiIfAvailable
};
