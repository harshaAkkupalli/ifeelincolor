const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);

/**
 * Text-to-Speech Service
 * 
 * This service handles TTS generation using various providers.
 * Currently supports:
 * - Google Cloud Text-to-Speech (recommended)
 * - Web Speech API (client-side fallback)
 * - Custom TTS provider integration
 */

class TTSService {
    constructor() {
        this.audioDir = path.join(__dirname, '../public/tts-audio');
        this.ensureAudioDirectory();
    }

    /**
     * Ensure the audio directory exists
     */
    async ensureAudioDirectory() {
        try {
            if (!fs.existsSync(this.audioDir)) {
                await mkdirAsync(this.audioDir, { recursive: true });
            }
        } catch (error) {
            console.error('Error creating audio directory:', error);
        }
    }

    /**
     * Generate TTS audio from text
     * @param {string} text - The text to convert to speech
     * @param {object} options - Voice options (language, voiceStyle, speechRate, volume)
     * @returns {Promise<string>} - URL to the generated audio file
     */
    async generateTTS(text, options = {}) {
        const {
            language = 'en-US',
            voiceStyle = 'neutral',
            speechRate = 1.0,
            volume = 1.0
        } = options;

        try {
            // Check which TTS provider is configured
            if (process.env.GOOGLE_TTS_API_KEY) {
                return await this.generateGoogleTTS(text, { language, voiceStyle, speechRate, volume });
            } else if (process.env.AZURE_TTS_KEY) {
                return await this.generateAzureTTS(text, { language, voiceStyle, speechRate, volume });
            } else {
                // Fallback: Return a placeholder or use a free service
                console.warn('No TTS provider configured. Using fallback.');
                return await this.generateFallbackTTS(text, options);
            }
        } catch (error) {
            console.error('Error generating TTS:', error);
            throw new Error('Failed to generate text-to-speech audio');
        }
    }

    /**
     * Generate TTS using Google Cloud Text-to-Speech
     */
    async generateGoogleTTS(text, options) {
        const { language, voiceStyle, speechRate } = options;

        // Map voice style to Google voice names
        const voiceNameMap = {
            male: `${language}-Standard-B`,
            female: `${language}-Standard-A`,
            neutral: `${language}-Standard-C`
        };

        const voiceName = voiceNameMap[voiceStyle] || voiceNameMap.neutral;

        const requestBody = {
            input: { text },
            voice: {
                languageCode: language,
                name: voiceName
            },
            audioConfig: {
                audioEncoding: 'MP3',
                speakingRate: speechRate,
                pitch: 0,
                volumeGainDb: 0
            }
        };

        try {
            const response = await axios.post(
                `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GOOGLE_TTS_API_KEY}`,
                requestBody
            );

            const audioContent = response.data.audioContent;
            const fileName = `tts_${Date.now()}_${Math.random().toString(36).substring(7)}.mp3`;
            const filePath = path.join(this.audioDir, fileName);

            // Save the audio file
            await writeFileAsync(filePath, audioContent, 'base64');

            // Return the URL to access the file
            return `/tts-audio/${fileName}`;
        } catch (error) {
            console.error('Google TTS error:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Generate TTS using Azure Cognitive Services
     */
    async generateAzureTTS(text, options) {
        const { language, voiceStyle, speechRate } = options;

        // Map voice style to Azure voice names
        const voiceNameMap = {
            male: `${language}-GuyNeural`,
            female: `${language}-JennyNeural`,
            neutral: `${language}-AriaNeural`
        };

        const voiceName = voiceNameMap[voiceStyle] || voiceNameMap.neutral;

        const ssml = `
            <speak version='1.0' xml:lang='${language}'>
                <voice name='${voiceName}'>
                    <prosody rate='${speechRate}'>
                        ${text}
                    </prosody>
                </voice>
            </speak>
        `;

        try {
            const response = await axios.post(
                `https://${process.env.AZURE_TTS_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`,
                ssml,
                {
                    headers: {
                        'Ocp-Apim-Subscription-Key': process.env.AZURE_TTS_KEY,
                        'Content-Type': 'application/ssml+xml',
                        'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3'
                    },
                    responseType: 'arraybuffer'
                }
            );

            const fileName = `tts_${Date.now()}_${Math.random().toString(36).substring(7)}.mp3`;
            const filePath = path.join(this.audioDir, fileName);

            // Save the audio file
            await writeFileAsync(filePath, Buffer.from(response.data));

            // Return the URL to access the file
            return `/tts-audio/${fileName}`;
        } catch (error) {
            console.error('Azure TTS error:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Fallback TTS generation (placeholder or free service)
     * This can be replaced with a free TTS API or return a placeholder
     */
    async generateFallbackTTS(text, options) {
        // Option 1: Use a free TTS service like ResponsiveVoice or VoiceRSS
        // Option 2: Return null and handle on client-side with Web Speech API
        
        console.log('Fallback TTS requested for:', text);
        
        // For now, return null to indicate client-side TTS should be used
        return null;
    }

    /**
     * Delete TTS audio file
     * @param {string} audioUrl - URL or path to the audio file
     */
    async deleteTTSAudio(audioUrl) {
        try {
            if (!audioUrl || audioUrl.startsWith('http')) {
                // External URL, don't delete
                return;
            }

            const fileName = path.basename(audioUrl);
            const filePath = path.join(this.audioDir, fileName);

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log('Deleted TTS audio:', fileName);
            }
        } catch (error) {
            console.error('Error deleting TTS audio:', error);
        }
    }

    /**
     * Validate voice text length and content
     * @param {string} text - The voice text to validate
     * @returns {object} - Validation result with isValid and message
     */
    validateVoiceText(text) {
        if (!text || text.trim().length === 0) {
            return {
                isValid: false,
                message: 'Voice text cannot be empty'
            };
        }

        if (text.length > 300) {
            return {
                isValid: false,
                message: 'Voice text must be 300 characters or less'
            };
        }

        // Check for special characters that might cause TTS issues
        const problematicChars = /[<>{}[\]\\]/g;
        if (problematicChars.test(text)) {
            return {
                isValid: false,
                message: 'Voice text contains invalid characters'
            };
        }

        return {
            isValid: true,
            message: 'Voice text is valid'
        };
    }

    /**
     * Get available voices for a language
     * @param {string} language - Language code (e.g., 'en-US')
     * @returns {Array} - List of available voices
     */
    getAvailableVoices(language = 'en-US') {
        // This would ideally query the TTS provider's API
        // For now, return a static list
        return [
            { id: 'male', name: 'Male Voice', style: 'male' },
            { id: 'female', name: 'Female Voice', style: 'female' },
            { id: 'neutral', name: 'Neutral Voice', style: 'neutral' }
        ];
    }

    /**
     * Get supported languages
     * @returns {Array} - List of supported languages
     */
    getSupportedLanguages() {
        return [
            { code: 'en-US', name: 'English (US)' },
            { code: 'en-GB', name: 'English (UK)' },
            { code: 'es-ES', name: 'Spanish (Spain)' },
            { code: 'es-MX', name: 'Spanish (Mexico)' },
            { code: 'fr-FR', name: 'French' },
            { code: 'de-DE', name: 'German' },
            { code: 'it-IT', name: 'Italian' },
            { code: 'pt-BR', name: 'Portuguese (Brazil)' },
            { code: 'ja-JP', name: 'Japanese' },
            { code: 'ko-KR', name: 'Korean' },
            { code: 'zh-CN', name: 'Chinese (Simplified)' }
        ];
    }
}

// Export singleton instance
module.exports = new TTSService();







