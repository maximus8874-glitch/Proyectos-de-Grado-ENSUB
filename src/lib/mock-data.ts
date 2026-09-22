
import { DegreeProject } from "./types";

export const MOCK_PROJECTS: DegreeProject[] = [
  {
    id: "1",
    title: "Implementación de IA en la Optimización de Rutas Urbanas",
    studentName: "Juan Pérez",
    advisorName: "Dr. Roberto Gómez",
    status: "En Curso",
    description: "Este proyecto busca desarrollar un algoritmo de aprendizaje reforzado para mejorar el flujo de tráfico en zonas metropolitanas densas.",
    objectives: "1. Diseñar el modelo de IA. 2. Recolectar datos de sensores urbanos. 3. Simular escenarios de tráfico real.",
    summary: "Una investigación sobre movilidad urbana inteligente.",
    milestones: [
      { id: "m1", title: "Propuesta Inicial", dueDate: "2024-03-01", completed: true },
      { id: "m2", title: "Revisión de Literatura", dueDate: "2024-04-15", completed: true },
      { id: "m3", title: "Diseño del Algoritmo", dueDate: "2024-06-01", completed: false },
    ],
    comments: [
      { id: "c1", authorName: "Dr. Roberto Gómez", authorRole: "advisor", content: "Excelente enfoque inicial, pero revisa la sección de metodología.", timestamp: "2024-03-05 10:30" }
    ],
    documents: ["Propuesta_v1.pdf", "Bibliografia.pdf"]
  },
  {
    id: "2",
    title: "Estudio de Impacto Ambiental de Microplásticos en Costas Locales",
    studentName: "María López",
    advisorName: "Dra. Elena Ruiz",
    status: "Pendiente",
    description: "Análisis cualitativo y cuantitativo de la presencia de microplásticos en muestras de arena y agua de las playas locales.",
    objectives: "Determinar la concentración de polímeros y su origen probable.",
    summary: "Investigación ecológica sobre contaminación marina.",
    milestones: [
      { id: "m4", title: "Muestreo de Campo", dueDate: "2024-05-20", completed: false }
    ],
    comments: [],
    documents: ["Plan_Muestreo.docx"]
  }
];
