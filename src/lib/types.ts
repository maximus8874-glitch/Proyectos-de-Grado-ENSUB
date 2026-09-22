
export type ProjectStatus = 'Borrador' | 'Pendiente' | 'En Revisión' | 'En Curso' | 'Corregir' | 'Defendido' | 'Completado' | 'Rechazado';

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  dueDate: string;
  completionDate?: string;
  status: 'Pending' | 'Submitted' | 'Approved' | 'Rejected' | 'Needs Revision';
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  projectId: string;
  authorId: string;
  authorName: string;
  authorRole: 'student' | 'advisor' | 'admin';
  content: string;
  createdAt: string;
  targetEntityType: 'Project' | 'Milestone' | 'DocumentVersion';
  targetEntityId: string;
}

export interface DegreeProject {
  id: string;
  studentId: string;
  advisorIds: string[];
  title: string;
  
  // --- FASE 1: PROPUESTA DE TRABAJO DE GRADO (EDUCA-FT-093-JINEN-V03) ---
  facultad: string;
  programa: string;
  curso: string;
  researchGroup: string;
  researchArea: string;
  researchLine: string;
  researchSubLine: string;
  
  proponent1Name: string;
  proponent1Id: string;
  proponent1Email: string;
  proponent1Phone: string;
  
  proponent2Name: string;
  proponent2Id: string;
  proponent2Email: string;
  proponent2Phone: string;
  
  proposedDirectorName: string;
  directorSignature: string;
  evaluator1Name: string;
  evaluator2Name: string;
  
  deliveryDay: string;
  deliveryMonth: string;
  deliveryYear: string;

  problemStatement: string; // 2.1 Descripción
  problemFormulation: string; // 2.2 Formulación
  justification: string; // 2.3 Justificación
  generalObjective: string; // 3.1 General
  specificObjectives: string; // 3.2 Específicos
  methodology: string; // 4.1 Diseño Metodológico
  expectedResults: string; // 4.2 Resultados Esperados
  summary: string;
  bibliography: string; // 5. Referencias Bibliográficas
  
  // --- FASE 2: PROYECTO DE GRADO FINAL (APA V1 - 130821) ---
  thesisTitle: string;
  thesisIntroduction: string;
  
  // Preliminares
  thesisDedication: string;
  thesisAcknowledgments: string;
  thesisAbstract: string;
  thesisAbstractEnglish: string;
  thesisGlossary: string;

  thesisBackground: string; // Antecedentes
  thesisTheoreticalFramework: string; // Marco Teórico
  thesisConceptualFramework: string; // Marco Conceptual
  thesisLegalFramework: string; // Marco Legal
  
  // Metodología detallada APA
  thesisMethodologyDesign: string; 
  thesisMethodologyPopulation: string;
  thesisMethodologySample: string;
  thesisMethodologyInstruments: string;
  
  thesisResults: string; // Resultados y Análisis
  thesisDiscussion: string; // Discusión
  thesisConclusions: string; // Conclusiones
  thesisRecommendations: string; // Recomendaciones
  thesisReferences: string; // Referencias Bibliográficas APA
  thesisAnnexes: string; // Anexos y Apéndices

  // --- ARTÍCULO CIENTÍFICO (ENSUB) ---
  articleTitle: string;          // Título en español
  articleTitleEn: string;        // Título en inglés
  articleAuthors: string;        // Autor(es): GN1, GN
  articleAffiliation: string;    // Afiliación institucional (nota al pie)
  articleResumen: string;        // Resumen (150-250 palabras)
  articleAbstract: string;       // Abstract (traducción fiel)
  articleIntroduccion: string;   // 1. Introducción (contexto, justificación, objetivos, fases)
  articleMetodologia: string;    // 2. Metodología (tipo invest., diseño experimental)
  articleResultados: string;     // 3. Resultados (presentación objetiva, figuras, datos)
  articleConclusiones: string;   // 4. Conclusiones
  articleBibliografia: string;   // 5. Bibliografía (formato APA)

  status: ProjectStatus;
  correcciones?: string;
  proposalDate: string;
  progressPercent: number;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'student' | 'advisor' | 'admin';

export type AuditActionType =
  | 'AUTH_REGISTER'
  | 'AUTH_LOGIN'
  | 'PROJECT_CREATE'
  | 'PROJECT_UPDATE'
  | 'PROJECT_STATUS_CHANGE'
  | 'PROJECT_FEEDBACK'
  | 'PROJECT_DELETE_DRAFT'
  | 'ADVISOR_ASSIGNED'
  | 'SECURITY_PIN_VALIDATED'
  | 'PASSWORD_RESET_REQUESTED';

export interface AuditLogEntry {
  id: string;
  actorId: string;
  actorEmail: string;
  actorName: string;
  actorRole: UserRole | string;
  actionType: AuditActionType | string;
  entityType: 'User' | 'Project' | 'Comment' | 'Auth' | 'Security';
  entityId?: string;
  projectTitle?: string;
  details: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  actorId: string;
  actorName: string;
  projectId: string;
  actionType: string;
  details: string;
  createdAt: string;
}

