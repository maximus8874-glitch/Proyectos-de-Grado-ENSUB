import { Firestore, collection, addDoc } from "firebase/firestore";
import { AuditActionType, AuditLogEntry, UserRole } from "@/lib/types";

export interface CreateAuditLogParams {
  actorId: string;
  actorEmail: string;
  actorName: string;
  actorRole: UserRole | string;
  actionType: AuditActionType;
  entityType: 'User' | 'Project' | 'Comment' | 'Auth' | 'Security';
  entityId?: string;
  projectTitle?: string;
  details: string;
  metadata?: Record<string, any>;
}

/**
 * Registra un evento de auditoría inmutable en la colección global `audit_logs`.
 * Las reglas de Firestore impiden que estos registros sean modificados o eliminados.
 */
export async function recordAuditLog(
  db: Firestore | null | undefined,
  params: CreateAuditLogParams
): Promise<string | null> {
  if (!db) {
    console.warn("Audit logger: Firestore instance not available.");
    return null;
  }

  try {
    const userAgent = typeof window !== "undefined" ? window.navigator.userAgent : "server";
    const logData: Omit<AuditLogEntry, "id"> = {
      actorId: params.actorId || "anonymous",
      actorEmail: params.actorEmail || "unknown",
      actorName: params.actorName || "Desconocido",
      actorRole: params.actorRole || "student",
      actionType: params.actionType,
      entityType: params.entityType,
      entityId: params.entityId || "",
      projectTitle: params.projectTitle || "",
      details: params.details,
      metadata: params.metadata || {},
      userAgent,
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, "audit_logs"), logData);
    return docRef.id;
  } catch (error) {
    console.error("Error al registrar auditoría inmutable:", error);
    return null;
  }
}
