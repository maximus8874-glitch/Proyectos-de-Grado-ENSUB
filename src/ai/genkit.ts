import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

/**
 * Configuración central de Genkit.
 * Se asegura de capturar la API Key desde diferentes posibles variables de entorno
 * para maximizar la compatibilidad con el entorno de despliegue.
 */
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
    })
  ],
  model: 'googleai/gemini-1.5-flash',
});
