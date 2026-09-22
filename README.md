
# NAVAL SCHOOL "ENSUB" - Gestión de Proyectos de Grado

Este es el sistema oficial de gestión de trabajos de grado de la Escuela Naval de Suboficiales "ARC BARRANQUILLA".

## Características Principales
- **Formato V03:** Gestión integral de propuestas bajo la normativa EDUCA-FT-093-JINEN-V03.
- **Tesis APA V1:** Módulo de redacción final siguiendo estándares institucionales.
- **Auditoría IA Verídica:** Motor de análisis que proporciona correcciones detalladas por sección y predicciones de impacto.
- **Roles Independientes:** Portales dedicados para Estudiantes, Docentes Asesores y Administradores.

## 🚀 Instrucciones de Exportación (Google Antigravity / Local)
Para continuar el desarrollo en un entorno externo, siga estos pasos:

1. **Descarga:** Descargue el proyecto completo como un archivo ZIP desde el explorador de archivos.
2. **Instalación:** Extraiga el contenido y ejecute `npm install` en la terminal.
3. **Configuración de IA:** 
   - Cree o edite el archivo `.env`.
   - Añada su clave de API: `GOOGLE_GENAI_API_KEY=SU_CLAVE_AQUI`.
4. **Ejecución:** Inicie el servidor de desarrollo:
   ```bash
   npm run dev
   ```
5. **Firebase:** El proyecto ya incluye la configuración en `src/firebase/config.ts`. Asegúrese de que las reglas de `firestore.rules` se apliquen en su nueva consola de Firebase.

## Estructura del Proyecto
- `/src/app`: Rutas y páginas del sistema (Dashboard, Login, Registro).
- `/src/ai`: Lógica de los flujos de Inteligencia Artificial con Genkit.
- `/src/components`: Componentes de UI (Shadcn) e institucionales (Escudo ENSUB, Auditoría).
- `/src/firebase`: Configuración y hooks de conexión con la base de datos.

---
© 2024 Escuela Naval de Suboficiales "ARC BARRANQUILLA".
