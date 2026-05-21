$ErrorActionPreference = "Stop"
$gh = "C:\Program Files\GitHub CLI\gh.exe"
$repo = "JacoboSolarte/BIOMEDICTRACK_FINAL"
$owner = "JacoboSolarte"
$proj_num = 3

Write-Host "Creating Custom Fields for Project..."
& $gh project field-create $proj_num --owner $owner --name "Priority" --data-type "SINGLE_SELECT" --single-select-options "Alta,Media,Baja"
& $gh project field-create $proj_num --owner $owner --name "Story Points" --data-type "NUMBER"
& $gh project field-create $proj_num --owner $owner --name "Epic" --data-type "SINGLE_SELECT" --single-select-options "Auth,Equipos,Mantenimientos,Alertas,Dashboard,Documentación,Calidad"
& $gh project field-create $proj_num --owner $owner --name "Type" --data-type "SINGLE_SELECT" --single-select-options "Historia,Tarea,Bug,Documentación,Prueba"
& $gh project field-create $proj_num --owner $owner --name "Responsable Scrum" --data-type "TEXT"
& $gh project field-create $proj_num --owner $owner --name "Estado Académico" --data-type "SINGLE_SELECT" --single-select-options "Evidencia pendiente,Evidencia lista,Presentado"

Write-Host "Creating Milestones..."
& $gh api -X POST repos/$repo/milestones -f title="Sprint 0 - Planeación" -f due_on="2026-02-14T23:59:59Z"
& $gh api -X POST repos/$repo/milestones -f title="Sprint 1 - Seguridad y base" -f due_on="2026-03-14T23:59:59Z"
& $gh api -X POST repos/$repo/milestones -f title="Sprint 2 - Núcleo funcional" -f due_on="2026-04-11T23:59:59Z"
& $gh api -X POST repos/$repo/milestones -f title="Sprint 3 - Cierre y entrega" -f due_on="2026-05-15T23:59:59Z"

Write-Host "Creating Issues..."

function Create-Issue {
    param($title, $body, $labels, $milestone)
    Write-Host "Creating issue: $title"
    # Create the issue and get the URL
    $issueUrl = & $gh issue create --repo $repo --title $title --body $body --label $labels --milestone $milestone
    Write-Host "Created issue: $issueUrl"
    
    # Add issue to project
    & $gh project item-add $proj_num --owner $owner --url $issueUrl
}

$issues = @(
    @{
        title = "Issue 1: Configurar repositorio GitHub y estructura inicial Scrum"
        body = "Descripción: Crear repositorio GitHub, subir el proyecto y configurar estructura base de trabajo Scrum.`n`n**Checklist técnico:**`n- [ ] Inicializar Git en el proyecto.`n- [ ] Crear repositorio remoto.`n- [ ] Subir frontend y backend.`n- [ ] Excluir node_modules, .venv, __pycache__, .env y dist en .gitignore.`n- [ ] Crear ramas main, develop.`n- [ ] Crear Project Board."
        labels = "type:task,role:scrum,priority:alta,sprint-0"
        milestone = "Sprint 0 - Planeación"
    },
    @{
        title = "Issue 2: Definir backlog inicial y épicas del proyecto"
        body = "Descripción: Documentar épicas, historias de usuario, criterios de aceptación y prioridades.`n`n**Checklist técnico:**`n- [ ] Crear épicas.`n- [ ] Crear historias de usuario.`n- [ ] Asignar prioridad.`n- [ ] Asignar story points.`n- [ ] Asociar historias a sprints."
        labels = "type:story,role:scrum,priority:alta,sprint-0"
        milestone = "Sprint 0 - Planeación"
    },
    @{
        title = "Issue 3: Implementar autenticación con login y JWT"
        body = "Descripción: Permitir autenticación segura mediante correo, contraseña y token JWT.`n`n**Checklist técnico:**`n- [ ] Crear endpoint /api/auth/login.`n- [ ] Validar credenciales.`n- [ ] Generar token JWT.`n- [ ] Consumir login desde frontend.`n- [ ] Guardar token en cliente."
        labels = "epic:auth,type:story,role:backend,priority:alta,sprint-1"
        milestone = "Sprint 1 - Seguridad y base"
    },
    @{
        title = "Issue 4: Implementar verificación 2FA local"
        body = "Descripción: Agregar paso de verificación 2FA durante el inicio de sesión.`n`n**Checklist técnico:**`n- [ ] Crear endpoint /api/auth/verify-2fa.`n- [ ] Definir código local de desarrollo.`n- [ ] Validar expiración del código.`n- [ ] Integrar pantalla de verificación en frontend."
        labels = "epic:auth,type:story,role:backend,priority:alta,sprint-1"
        milestone = "Sprint 1 - Seguridad y base"
    },
    @{
        title = "Issue 5: Crear rutas protegidas y contexto de autenticación"
        body = "Descripción: Proteger vistas internas y manejar sesión del usuario en React.`n`n**Checklist técnico:**`n- [ ] Crear AuthContext.`n- [ ] Validar token y usuario en rutas privadas.`n- [ ] Redirigir usuarios no autenticados al login.`n- [ ] Mantener navegación posterior al login."
        labels = "epic:auth,type:task,role:frontend,priority:alta,sprint-1"
        milestone = "Sprint 1 - Seguridad y base"
    },
    @{
        title = "Issue 6: Implementar recuperación de contraseña"
        body = "Descripción: Permitir recuperación y restablecimiento de contraseña por token.`n`n**Checklist técnico:**`n- [ ] Crear endpoint /api/auth/recover.`n- [ ] Crear endpoint /api/auth/reset-password.`n- [ ] Crear pantalla de recuperación.`n- [ ] Crear pantalla de nueva contraseña."
        labels = "epic:auth,type:story,priority:media,sprint-1"
        milestone = "Sprint 1 - Seguridad y base"
    },
    @{
        title = "Issue 7: Crear CRUD backend de equipos biomédicos"
        body = "Descripción: Implementar endpoints para crear, listar, consultar, editar y eliminar equipos.`n`n**Checklist técnico:**`n- [ ] Crear modelo Equipo.`n- [ ] Crear schemas Pydantic.`n- [ ] Crear servicio de equipos.`n- [ ] Crear rutas /api/equipos.`n- [ ] Aplicar permisos por rol biomédico."
        labels = "epic:equipos,type:story,role:backend,priority:alta,sprint-2"
        milestone = "Sprint 2 - Núcleo funcional"
    },
    @{
        title = "Issue 8: Crear vistas frontend de equipos"
        body = "Descripción: Implementar listado, detalle, creación y edición de equipos.`n`n**Checklist técnico:**`n- [ ] Crear vista Equipos.`n- [ ] Crear vista EquipoDetalle.`n- [ ] Crear vista NuevoEquipo.`n- [ ] Conectar servicios API.`n- [ ] Validar navegación."
        labels = "epic:equipos,type:story,role:frontend,priority:alta,sprint-2"
        milestone = "Sprint 2 - Núcleo funcional"
    },
    @{
        title = "Issue 9: Implementar CRUD de mantenimientos"
        body = "Descripción: Gestionar mantenimientos preventivos y correctivos.`n`n**Checklist técnico:**`n- [ ] Crear modelo Mantenimiento.`n- [ ] Crear endpoints /api/mantenimientos.`n- [ ] Asociar mantenimiento a equipo.`n- [ ] Asociar mantenimiento a usuario creador.`n- [ ] Conectar vista frontend."
        labels = "epic:mantenimientos,type:story,role:backend,priority:alta,sprint-2"
        milestone = "Sprint 2 - Núcleo funcional"
    },
    @{
        title = "Issue 10: Implementar dashboard estadístico"
        body = "Descripción: Mostrar métricas generales del inventario y mantenimiento.`n`n**Checklist técnico:**`n- [ ] Crear endpoint /api/dashboard/stats.`n- [ ] Calcular total de equipos.`n- [ ] Calcular equipos por estado.`n- [ ] Calcular alertas activas.`n- [ ] Mostrar datos en frontend."
        labels = "epic:dashboard,type:story,priority:alta,sprint-2"
        milestone = "Sprint 2 - Núcleo funcional"
    },
    @{
        title = "Issue 11: Crear migraciones Alembic y seed de datos"
        body = "Descripción: Preparar base de datos reproducible para sustentación.`n`n**Checklist técnico:**`n- [ ] Crear migración inicial.`n- [ ] Crear migración de recuperación de contraseña.`n- [ ] Crear script seed.py.`n- [ ] Documentar credenciales de prueba."
        labels = "type:task,role:backend,priority:alta,sprint-2"
        milestone = "Sprint 2 - Núcleo funcional"
    },
    @{
        title = "Issue 12: Implementar módulo de alertas"
        body = "Descripción: Mostrar y gestionar alertas del sistema.`n`n**Checklist técnico:**`n- [ ] Crear modelo Alerta.`n- [ ] Crear endpoints /api/alertas.`n- [ ] Marcar alerta como leída.`n- [ ] Marcar todas como leídas.`n- [ ] Crear vista Alertas."
        labels = "epic:alertas,type:story,priority:alta,sprint-3"
        milestone = "Sprint 3 - Cierre y entrega"
    },
    @{
        title = "Issue 13: Implementar scheduler de alertas de mantenimiento"
        body = "Descripción: Generar alertas por mantenimiento próximo o vencido.`n`n**Checklist técnico:**`n- [ ] Crear servicio scheduler.`n- [ ] Ejecutar scheduler al iniciar FastAPI.`n- [ ] Evitar duplicados de alertas.`n- [ ] Validar alertas con datos seed."
        labels = "epic:alertas,type:task,role:backend,priority:alta,sprint-3"
        milestone = "Sprint 3 - Cierre y entrega"
    },
    @{
        title = "Issue 14: Implementar bitácora de actividades"
        body = "Descripción: Registrar y consultar acciones relevantes sobre equipos.`n`n**Checklist técnico:**`n- [ ] Crear modelo Bitacora.`n- [ ] Crear endpoint /api/bitacora.`n- [ ] Registrar acciones desde servicios.`n- [ ] Crear vista Bitacora."
        labels = "type:story,role:backend,priority:alta,sprint-3"
        milestone = "Sprint 3 - Cierre y entrega"
    },
    @{
        title = "Issue 15: Implementar vistas de criticidad y reportes"
        body = "Descripción: Permitir análisis visual de criticidad y reportes del sistema.`n`n**Checklist técnico:**`n- [ ] Crear vista Criticidad.`n- [ ] Crear vista Reportes.`n- [ ] Validar navegación protegida.`n- [ ] Preparar capturas para presentación."
        labels = "type:story,role:frontend,priority:media,sprint-3"
        milestone = "Sprint 3 - Cierre y entrega"
    },
    @{
        title = "Issue 16: Validar build frontend y compilación backend"
        body = "Descripción: Generar evidencia técnica de que el proyecto compila.`n`n**Checklist técnico:**`n- [ ] Ejecutar npm.cmd run build.`n- [ ] Guardar captura o log del build exitoso.`n- [ ] Ejecutar python -m compileall app.`n- [ ] Guardar captura o log de compilación backend."
        labels = "type:test,priority:alta,sprint-3"
        milestone = "Sprint 3 - Cierre y entrega"
    },
    @{
        title = "Issue 17: Documentar instalación y ejecución del proyecto"
        body = "Descripción: Completar README profesional para evaluación.`n`n**Checklist técnico:**`n- [ ] Crear README raíz.`n- [ ] Documentar stack.`n- [ ] Documentar instalación backend.`n- [ ] Documentar instalación frontend.`n- [ ] Documentar variables de entorno.`n- [ ] Documentar credenciales seed.`n- [ ] Documentar pruebas realizadas."
        labels = "epic:documentacion,type:documentation,priority:alta,sprint-3"
        milestone = "Sprint 3 - Cierre y entrega"
    },
    @{
        title = "Issue 18: Preparar evidencias finales y presentación"
        body = "Descripción: Organizar capturas, tablero, demo y explicación Scrum.`n`n**Checklist técnico:**`n- [ ] Capturar Project Board.`n- [ ] Capturar backlog.`n- [ ] Capturar milestones.`n- [ ] Capturar issues cerrados.`n- [ ] Capturar Swagger.`n- [ ] Capturar login, dashboard, equipos, mantenimientos, alertas y bitácora.`n- [ ] Preparar presentación final."
        labels = "type:documentation,role:scrum,priority:alta,sprint-3"
        milestone = "Sprint 3 - Cierre y entrega"
    }
)

foreach ($issue in $issues) {
    Create-Issue -title $issue.title -body $issue.body -labels $issue.labels -milestone $issue.milestone
}
Write-Host "All issues created and added to the project."
