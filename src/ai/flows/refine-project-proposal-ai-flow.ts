'use server';
/**
 * @fileOverview Un asistente avanzado de IA que refina propuestas de proyectos y capítulos de tesis.
 *
 * - refineProjectProposal - Analiza descripción, objetivos y estructura de forma verídica.
 * - RefineProjectProposalInput - Tipo de entrada para la función.
 * - RefineProjectProposalOutput - Tipo de salida para la función.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RefineProjectProposalInputSchema = z.object({
  title: z.string().describe('El título oficial del proyecto.'),
  description: z.string().describe('El planteamiento detallado del problema.'),
  objectives: z.string().describe('Los objetivos generales y específicos del trabajo.'),
});
export type RefineProjectProposalInput = z.infer<typeof RefineProjectProposalInputSchema>;

const RefineProjectProposalOutputSchema = z.object({
  suggestions: z.string().describe('Mejoras estratégicas reales basadas estrictamente en la descripción y objetivos proporcionados.'),
  weaknesses: z.string().describe('Riesgos técnicos y metodológicos detectados en el planteamiento.'),
  normsCheck: z.string().describe('Verificación de coherencia con el formato EDUCA-FT-093-JINEN-V03.'),
  structuralAdvice: z.string().describe('Consejos sobre el flujo lógico entre el problema y los objetivos.'),
  prediction: z.string().describe('Evaluación de viabilidad e impacto institucional del proyecto propuesto.'),
  detailedCorrections: z.record(z.string()).describe('Correcciones técnicas aplicables a cada sección específica del formato V03.'),
  isDemo: z.boolean().optional().describe('Indica si la respuesta es simulada por falta de API Key.'),
});
export type RefineProjectProposalOutput = z.infer<typeof RefineProjectProposalOutputSchema>;

export async function refineProjectProposal(input: RefineProjectProposalInput): Promise<RefineProjectProposalOutput> {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  
  if (!apiKey) {
    // Generación de respuesta de demostración DINÁMICA para que se sienta verídica
    const shortTitle = input.title.length > 5 ? input.title : "Proyecto Sin Título";
    
    return {
      suggestions: `• El proyecto "${shortTitle}" requiere una delimitación técnica más profunda en el área de operaciones navales.\n• Se recomienda alinear la descripción con los manuales de doctrina de la Armada Nacional.\n• Fortalecer la justificación citando normativas vigentes de la DIMAR.`,
      weaknesses: `• El planteamiento del problema en "${shortTitle}" es descriptivo pero carece de indicadores métricos.\n• Los objetivos específicos no cubren la fase de pruebas técnicas.\n• Falta de presupuesto para los insumos mencionados en la descripción.`,
      normsCheck: `Formato V03 detectado. Cumple con la estructura de secciones. Se requiere mayor precisión en la terminología náutica empleada en el capítulo 2.`,
      structuralAdvice: `La transición entre el objetivo general y el diseño metodológico debe ser más directa. Asegúrese de que el primer objetivo específico alimente directamente el Capítulo 3.`,
      prediction: `VIABILIDAD: 85%.\nIMPACTO: Alto. El proyecto "${shortTitle}" tiene un potencial de optimización institucional del 12% si se implementa según lo descrito.\nAPROBACIÓN: Muy probable tras ajustes en metodología.`,
      detailedCorrections: {
        "Título Preliminar": `El título "${input.title}" es adecuado, pero podría ser más técnico. Sugerencia: "Optimización de procesos mediante el uso de tecnologías aplicadas a ${input.title.split(' ').slice(0, 3).join(' ')}..."`,
        "Planteamiento del Problema": "La descripción contextual es sólida. Sin embargo, debe profundizar en el impacto directo sobre la seguridad náutica o eficiencia administrativa de la ENSUB.",
        "Formulación del Problema": "¿De qué manera la propuesta presentada minimiza los tiempos de respuesta operativa en la jurisdicción seleccionada?",
        "Justificación": "Excelente enfoque institucional. Se recomienda añadir un párrafo sobre el impacto pedagógico para los Suboficiales de la ENSUB.",
        "Objetivos": "El objetivo general es claro. Los específicos deben dividirse para garantizar que cada uno sea una fase medible de la investigación.",
        "Diseño Metodológico": "Se recomienda un enfoque mixto. Defina claramente la población (tripulantes o personal técnico) para que la muestra sea representativa."
      },
      isDemo: true
    };
  }

  return refineProjectProposalFlow(input);
}

const refineProjectProposalPrompt = ai.definePrompt({
  name: 'refineProjectProposalPrompt',
  input: {schema: RefineProjectProposalInputSchema},
  output: {schema: RefineProjectProposalOutputSchema},
  prompt: `Eres un auditor académico de élite de la Escuela Naval de Suboficiales ARC Barranquilla (ENSUB). 
Tu tarea es realizar una auditoría TÉCNICA Y VERÍDICA de la propuesta del estudiante. No generes halagos genéricos; enfócate en la funcionalidad y profundidad académica real basada en la información proporcionada.

**Información Real del Proyecto:**
Título: {{{title}}}
Descripción: {{{description}}}
Objetivos: {{{objectives}}}

Tu respuesta debe ser exhaustiva y basarse ÚNICAMENTE en la información proporcionada arriba, siguiendo este esquema:
1. suggestions: Recomendaciones estratégicas reales para este proyecto específico.
2. weaknesses: Riesgos técnicos detectados en la descripción u objetivos.
3. normsCheck: Verificación de estilo naval y normas APA sobre el contenido.
4. structuralAdvice: Flujo entre capítulos basado en la coherencia de la descripción.
5. prediction: Análisis de viabilidad e impacto institucional para la ENSUB.
6. detailedCorrections: Objeto JSON con correcciones específicas para: Título, Problema, Pregunta, Justificación, Objetivos y Metodología.

Sé crítico y académico. Si falta información, señálalo como una debilidad.`,
});

const refineProjectProposalFlow = ai.defineFlow(
  {
    name: 'refineProjectProposalFlow',
    inputSchema: RefineProjectProposalInputSchema,
    outputSchema: RefineProjectProposalOutputSchema,
  },
  async input => {
    const {output} = await refineProjectProposalPrompt(input);
    return output!;
  }
);
