# Arquitectura del Sistema Lift Cash

## ⚠️ Aviso de Fase de Prototipo

**Esta documentación describe la implementación actual del prototipo de Lift Cash. Muchos valores y plazos están configurados con fines de prueba y serán diferentes en producción:**

- **Plazos de Prueba**: Las fases de gobernanza actualmente duran 4-6 minutos cada una (en lugar de días/semanas) para prototipado rápido y pruebas
- **Cantidades de Tokens**: La bolsa de premios de 10,000 tokens es un valor de prueba para prototipo, no los parámetros económicos finales
- **Ratios Económicos**: La división 50/50 bloqueado/desbloqueado y las tasas de desbloqueo del 15% son valores de prueba temporales
- **Porcentajes de Participación**: Los porcentajes de reclamación de Encuesta (20%), Voto (70%), Ratificación (10%) son valores de prototipo

**Los valores de producción se determinarán a través de la gobernanza comunitaria y modelado económico.**

## Visión General de la Arquitectura de Alto Nivel

Lift Cash es un **sistema económico cooperativo autogobernado** construido sobre el protocolo Internet Computer (ICP) que permite a los participantes gestionar democráticamente la política fiscal y ganar ingresos en criptomonedas a través de la participación en la gobernanza.

### Resumen de la Arquitectura del Sistema

El sistema sigue una **arquitectura multi-canister** con clara separación de responsabilidades:

- **Community_Backend (Rust)**: Gestiona flujos de trabajo de gobernanza democrática, transiciones de fases y seguimiento de participación de usuarios
- **Economy_Backend (Rust)**: Maneja registros financieros, economía de tokens, distribución de recompensas y gestión de balances entre canisters
- **Lift_Cash_frontend (React/TypeScript)**: Proporciona interfaz de usuario con gestión de estado Redux, autenticación Internet Identity y participación en gobernanza en tiempo real

### Componentes Principales y Responsabilidades

#### 1. Canister Community_Backend
- **Gestión del Ciclo de Vida de la Gobernanza**: Organiza ciclos de gobernanza semanales (Encuesta → Voto → Ratificación → Resultados)
- **Seguimiento de Participación**: Registra el compromiso de usuarios con porcentajes de reclamación (Encuesta: 20%, Voto: 70%, Ratificación: 10% - valores de prueba de prototipo)
- **Toma de Decisiones Democrática**: Agrega las aportaciones de la comunidad usando promedios para deslizadores y votos mayoritarios para opciones
- **Lógica de Transición de Fases**: Fases automatizadas de 4 minutos con períodos de resultados de 2 minutos (plazos de prueba de prototipo)

#### 2. Canister Economy_Backend
- **Gestión de Registros Financieros**: Mantiene balances de usuarios para tokens PROMO, LIFT e ICP
- **Economía de Tokens**: Implementa mecanismo PROMO 50/50 bloqueado/desbloqueado con 15% de desbloqueo por participación (ratios de prueba de prototipo)
- **Distribución de Recompensas**: Distribuye desde la bolsa de premios (10,000 tokens - cantidad de prueba de prototipo) basado en la participación en la gobernanza
- **Integración Entre Canisters**: Llama a Community_Backend para recuperar porcentajes de reclamación de usuarios para cálculos de recompensas

#### 3. Frontend React
- **Gestión de Estado**: Redux Toolkit con actorsSlice (conexiones a canisters) y themeSlice (modo oscuro)
- **Autenticación**: Integración con Internet Identity con modo demo configurable para desarrollo
- **Actualizaciones en Tiempo Real**: Transiciones de fases en vivo con temporizadores de cuenta regresiva y actualizaciones dinámicas de UI
- **Diseño Responsivo**: Tailwind CSS mobile-first con variables CSS personalizadas para temas consistentes

### Interacciones del Sistema

#### Flujo de Comunicación Entre Canisters
1. **Frontend ↔ Community_Backend**: Enviar respuestas de gobernanza, obtener estado de fases y datos de participación
2. **Frontend ↔ Economy_Backend**: Recuperar registros financieros, iniciar operaciones de tokens, verificar elegibilidad de recompensas
3. **Economy_Backend → Community_Backend**: Consultar porcentajes de participación de usuarios para distribución automática de recompensas

#### Flujo de Trabajo de Gobernanza
```
Ciclo Semanal: Encuesta (4min) → Resultados Encuesta (2min) → Voto (4min) → Ratificación (4min) → Resultados Ratificación (2min) → Distribución de Recompensas → Nueva Semana
(Plazos de prueba de prototipo - la producción usará períodos más largos)
```

#### Modos de Desarrollo
- **Modo Demo** (`DEMO_MODE = true`): Desarrollo solo frontend con autenticación simulada y actores de canister
- **Modo Completo** (`DEMO_MODE = false`): Integración ICP completa con canisters reales y operaciones blockchain

### Arquitectura de Economía de Tokens

#### Sistema de Tres Tokens
- **PROMO**: Token de recompensa principal con mecanismo de bloqueo (50% bloqueado inicialmente, se desbloquea basado en participación - ratios de prueba de prototipo)
- **LIFT**: Token de gobernanza y utilidad para operaciones del sistema
- **ICP**: Token nativo de Internet Computer para integración del ecosistema

#### Arquitectura de Implementación de Tokens
- **Token PROMO**: Solo sistema de balance interno (NO cumple con ICRC-1)
  - Almacenado como campos `f64` en registros de usuario del Economy_Backend
  - Gestionado a través de funciones internas del canister
  - Soporta mecánicas complejas de bloqueo/desbloqueo para participación en gobernanza
  - Sin integración con estándares de tokens blockchain externos
- **Token LIFT**: Token blockchain completamente compatible con ICRC-1
  - Despliegue completo de canister ledger ICRC-1/ICRC-2 con funcionalidad estándar
  - Seguimiento de balance interno en registros de usuario para operaciones del sistema y rendimiento
  - ID del canister ledger ICRC-1 externo: `ss2fx-dyaaa-aaaar-qacoq-cai`
  - Soporta integración estándar con billeteras, transferencias usuario-a-usuario y todas las operaciones ICRC
- **Token ICP**: Token blockchain externo con integración estándar de billetera ICP

#### Mecánicas Económicas
- **Gestión de Bolsa de Premios**: Bolsa de 10,000 tokens (cantidad de prueba de prototipo) con porcentaje de emisión semanal determinado por gobernanza
- **Recompensas por Participación**: Distribución proporcional basada en niveles de compromiso con la gobernanza
- **Distribución Automática**: Cálculo de recompensas entre canisters y transferencia de tokens después de cada ciclo

#### Integración de Operaciones de Tokens
- **Integración ICRC-1**: Alcance limitado - usado solo para operaciones específicas de acuñación de tokens vía canister ledger codificado (ss2fx-dyaaa-aaaar-qacoq-cai)
- **Sistema de Balance Interno**: Distribución principal de recompensas y transferencias de tokens manejadas a través de la gestión de balance interno del Economy Backend
- **Soporte Multi-Token**: Balances de tokens PROMO, LIFT e ICP mantenidos dentro del estado del canister

## Diagramas UML Mermaid de Fase de Prototipo

**📋 Aviso de Valores de Diagramas**: Todos los valores numéricos, plazos y porcentajes mostrados en los diagramas a continuación son valores de prueba de prototipo únicamente. Los valores de producción se determinarán a través de la gobernanza comunitaria.

Basándose en el análisis de arquitectura del sistema, los siguientes diagramas Mermaid serían más efectivos para explicar el sistema Lift Cash a nuevos desarrolladores y partes interesadas:

### 1. Diagramas de Arquitectura del Sistema

#### **Diagrama de Contexto C4**
- **Propósito**: Mostrar límites del sistema de alto nivel y actores externos
- **Contenido**: Usuarios, Internet Identity, blockchain ICP, sistemas externos, y el límite del sistema Lift Cash
- **Audiencia**: Partes interesadas ejecutivas, gerentes de producto, arquitectos de sistemas

```mermaid
flowchart TD
    %% Actores Externos
    User[Miembros de la Comunidad<br/>Participantes en gobernanza democrática<br/>Ganar cripto a través de votación]
    Developer[Desarrolladores<br/>Construir y mantener plataforma<br/>Entornos locales y de producción]
    
    %% Sistemas Externos  
    Identity[Internet Identity<br/>Servicio de autenticación ICP<br/>Identificación anónima segura]
    ICP[Protocolo Internet Computer<br/>Infraestructura blockchain<br/>Plataforma de ejecución de canisters]
    ICRC[Ledger ICRC-1<br/>Ledger estándar de tokens<br/>Operaciones específicas de acuñación]
    
    %% Límite del Sistema Lift Cash
    subgraph LiftCash [" Sistema Lift Cash "]
        Frontend[Frontend Lift Cash<br/>SPA React<br/>Interfaz de participación en gobernanza]
        Community[Backend Community<br/>Canister Rust<br/>Fases de gobernanza y participación]
        Economy[Backend Economy<br/>Canister Rust<br/>Economía de tokens y recompensas]
    end
    
    %% Interacciones de Usuario
    User -->|Participa en gobernanza<br/>HTTPS| Frontend
    Developer -->|Desarrolla y despliega<br/>CLI dfx| Frontend
    
    %% Autenticación
    Frontend -->|Autentica usuarios<br/>API Internet Identity| Identity
    
    %% Frontend a Backend
    Frontend -->|Envía respuestas de gobernanza<br/>Interfaz Candid| Community
    Frontend -->|Gestiona tokens y recompensas<br/>Interfaz Candid| Economy
    
    %% Comunicación Entre Canisters
    Community -->|Consulta datos de participación<br/>Llamadas entre canisters| Economy
    Economy -->|Acuña tokens<br/>Estándar ICRC-1| ICRC
    
    %% Dependencias de Infraestructura
    ICP -->|Aloja y ejecuta<br/>Runtime de canisters| LiftCash
    ICP -->|Proporciona servicio de identidad<br/>Infraestructura ICP| Identity
    ICP -->|Gestiona ledgers de tokens<br/>Infraestructura ICP| ICRC
```

#### **Diagrama de Componentes**
- **Propósito**: Ilustrar componentes principales del sistema y sus relaciones
- **Contenido**: Frontend, Community_Backend, Economy_Backend, y sus interfaces
- **Audiencia**: Arquitectos técnicos, desarrolladores senior

```mermaid
C4Component
    title Diagrama de Componentes para Sistema Lift Cash

    Container_Boundary(frontend, "Frontend Lift Cash") {
        Component(ui, "Componentes UI", "React/JSX", "Páginas, modales, formularios para participación en gobernanza")
        Component(redux, "Store Redux", "Redux Toolkit", "Gestión de estado global para actores y tema")
        Component(auth, "Cliente Auth", "JavaScript", "Integración Internet Identity con modo demo")
        Component(actors, "Actores Canister", "TypeScript", "Interfaces generadas para comunicación backend")
    }

    Container_Boundary(community, "Canister Backend Community") {
        Component(governance, "Motor de Gobernanza", "Rust", "Gestión de fases y lógica de transición")
        Component(participation, "Rastreador de Participación", "Rust", "Compromiso de usuarios y cálculo de porcentaje de reclamación")
        Component(voting, "Sistema de Votación", "Rust", "Procesamiento de encuestas, votos y ratificación")
        Component(results, "Agregador de Resultados", "Rust", "Cálculo y almacenamiento de resultados democráticos")
    }

    Container_Boundary(economy, "Canister Backend Economy") {
        Component(records, "Registros de Usuario", "Rust", "Gestión de balances PROMO, LIFT, ICP")
        Component(rewards, "Motor de Recompensas", "Rust", "Distribución de bolsa de premios y asignación de tokens")
        Component(tokens, "Gestor de Tokens", "Rust", "Operaciones de acuñación, quema y transferencia")
        Component(promo, "Pool PROMO", "Rust", "Mecánicas de tokens bloqueados/desbloqueados")
    }

    Container_Ext(identity, "Internet Identity", "Servicio ICP", "Autenticación e identificación de usuarios")
    Container_Ext(icrc, "Ledger ICRC-1", "Servicio ICP", "Operaciones de acuñación de tokens")

    %% Relaciones internas del Frontend
    Rel(ui, redux, "Actualiza estado", "Acciones Redux")
    Rel(redux, actors, "Gestiona conexiones", "Actualizaciones de estado")
    Rel(auth, identity, "Autentica", "API Internet Identity")
    Rel(actors, auth, "Usa identidad", "Acceso Principal")

    %% Relaciones Frontend a Backend
    Rel(ui, governance, "Consultas de fase", "Interfaz Candid")
    Rel(ui, participation, "Envía respuestas", "Interfaz Candid")
    Rel(ui, voting, "Emite votos", "Interfaz Candid")
    Rel(ui, records, "Verifica balances", "Interfaz Candid")
    Rel(ui, rewards, "Reclama recompensas", "Interfaz Candid")

    %% Relaciones internas del Backend Community
    Rel(governance, participation, "Actualiza seguimiento", "Llamadas internas")
    Rel(voting, results, "Almacena resultados", "Llamadas internas")
    Rel(governance, voting, "Control de fases", "Llamadas internas")

    %% Relaciones internas del Backend Economy
    Rel(rewards, records, "Actualiza balances", "Llamadas internas")
    Rel(tokens, promo, "Gestiona pool", "Llamadas internas")
    Rel(rewards, promo, "Distribuye tokens", "Llamadas internas")

    %% Relaciones entre canisters
    Rel(rewards, participation, "Obtiene % reclamación", "Llamadas entre canisters")
    Rel(tokens, icrc, "Acuñación de tokens", "Estándar ICRC-1")

    UpdateElementStyle(ui, $fontColor="white", $bgColor="#3b82f6", $borderColor="#2563eb")
    UpdateElementStyle(redux, $fontColor="white", $bgColor="#3b82f6", $borderColor="#2563eb")
    UpdateElementStyle(auth, $fontColor="white", $bgColor="#3b82f6", $borderColor="#2563eb")
    UpdateElementStyle(actors, $fontColor="white", $bgColor="#3b82f6", $borderColor="#2563eb")
    
    UpdateElementStyle(governance, $fontColor="white", $bgColor="#eb5528", $borderColor="#dc2626")
    UpdateElementStyle(participation, $fontColor="white", $bgColor="#eb5528", $borderColor="#dc2626")
    UpdateElementStyle(voting, $fontColor="white", $bgColor="#eb5528", $borderColor="#dc2626")
    UpdateElementStyle(results, $fontColor="white", $bgColor="#eb5528", $borderColor="#dc2626")
    
    UpdateElementStyle(records, $fontColor="white", $bgColor="#f59e0b", $borderColor="#d97706")
    UpdateElementStyle(rewards, $fontColor="white", $bgColor="#f59e0b", $borderColor="#d97706")
    UpdateElementStyle(tokens, $fontColor="white", $bgColor="#f59e0b", $borderColor="#d97706")
    UpdateElementStyle(promo, $fontColor="white", $bgColor="#f59e0b", $borderColor="#d97706")
```

### 2. Diagramas de Procesos de Gobernanza

#### **Diagrama de Flujo: Ciclo de Vida de la Gobernanza**
- **Propósito**: Visualizar el flujo completo de trabajo de gobernanza desde Encuesta hasta Resultados
- **Contenido**: Transiciones de fases, puntos de decisión y procesos automatizados
- **Audiencia**: Propietarios de producto, participantes en gobernanza, partes interesadas del negocio

```mermaid
flowchart TD
    Start([Comienza Ciclo de Gobernanza Semanal]) --> Survey
    
    Survey[Fase de Encuesta<br/>4 minutos<br/>Recopilar aportaciones de la comunidad<br/>sobre parámetros económicos] --> ST{¿Temporizador<br/>de Encuesta<br/>Completo?}
    ST -->|No| Survey
    ST -->|Sí| SurveyResults
    
    SurveyResults[Fase de Resultados de Encuesta<br/>2 minutos<br/>Mostrar resultados<br/>agregados de encuesta] --> SRT{¿Temporizador<br/>Resultados Encuesta<br/>Completo?}
    SRT -->|No| SurveyResults
    SRT -->|Sí| Vote
    
    Vote[Fase de Votación<br/>4 minutos<br/>Votación democrática sobre<br/>propuestas de encuesta] --> VT{¿Temporizador<br/>de Votación<br/>Completo?}
    VT -->|No| Vote
    VT -->|Sí| Ratify
    
    Ratify[Fase de Ratificación<br/>4 minutos<br/>Confirmación final de<br/>propuestas votadas] --> RT{¿Temporizador<br/>de Ratificación<br/>Completo?}
    RT -->|No| Ratify
    RT -->|Sí| RatifyResults
    
    RatifyResults[Fase de Resultados de Ratificación<br/>2 minutos<br/>Mostrar resultados finales<br/>de ratificación] --> RRT{¿Temporizador<br/>Resultados Ratificación<br/>Completo?}
    RRT -->|No| RatifyResults
    RRT -->|Sí| RewardCalc
    
    RewardCalc[Calcular Recompensas<br/>Proceso Automatizado<br/>Economy Backend consulta<br/>porcentajes de participación] --> RewardDist
    
    RewardDist[Distribuir Recompensas<br/>Proceso Automatizado<br/>Asignar tokens PROMO<br/>desde bolsa de premios] --> NewWeek
    
    NewWeek([Comienza Nuevo Ciclo Semanal]) --> Survey

    %% Seguimiento de participación
    Survey -.-> SP[Participación en Encuesta<br/>+20% porcentaje de reclamación]
    Vote -.-> VP[Participación en Votación<br/>+70% porcentaje de reclamación]
    Ratify -.-> RP[Participación en Ratificación<br/>+10% porcentaje de reclamación]
    
    SP --> ClaimCalc[Cálculo de Reclamación Total<br/>Máximo 100% por semana]
    VP --> ClaimCalc
    RP --> ClaimCalc
    ClaimCalc -.-> RewardCalc

    %% Estilos
    classDef phaseBox fill:#eb5528,stroke:#dc2626,stroke-width:2px,color:white
    classDef timerBox fill:#3b82f6,stroke:#2563eb,stroke-width:2px,color:white
    classDef processBox fill:#059669,stroke:#047857,stroke-width:2px,color:white
    classDef participationBox fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:white
    classDef startEndBox fill:#1f2937,stroke:#374151,stroke-width:2px,color:white

    class Survey,Vote,Ratify,SurveyResults,RatifyResults phaseBox
    class ST,VT,RT,SRT,RRT timerBox
    class RewardCalc,RewardDist processBox
    class SP,VP,RP,ClaimCalc participationBox
    class Start,NewWeek startEndBox
```

### 3. Diagramas de Datos e Integración

#### **Diagrama de Relación de Entidades: Modelo de Datos**
- **Propósito**: Mostrar estructuras de datos y relaciones entre entidades
- **Contenido**: UserRecord, PhaseData, GovernanceResults, y sus relaciones
- **Audiencia**: Desarrolladores backend, diseñadores de bases de datos, analistas de datos

```mermaid
erDiagram
    %% Entidades del Backend Community
    VOTING_SYSTEM {
        u64 current_week PK
        u64 last_week
        u64 iteration_count
        u64 last_stage_timestamp
        Phase current_phase
    }
    
    USER_CLAIM {
        Principal user_principal PK
        u64 week_number PK
        bool has_surveyed
        bool has_voted
        bool has_ratified
        u8 claim_percentage
    }
    
    SURVEY_RESPONSE {
        Principal user_principal PK
        string question_id PK
        SurveyResponseType response_type
        string response_value
    }
    
    VOTE_RESPONSE {
        Principal user_principal PK
        string question_id PK
        u8 percentage_vote
    }
    
    RATIFICATION_RESPONSE {
        Principal user_principal PK
        u64 week_number PK
        bool approved
    }
    
    WEEKLY_SURVEY_RESULTS {
        u64 week_number PK
        string question_id PK
        string aggregated_result
        string result_type
    }
    
    WEEKLY_VOTE_RESULTS {
        u64 week_number PK
        string question_id PK
        u8 average_vote
        u64 participant_count
    }
    
    WEEKLY_RATIFICATION_COUNTS {
        u64 week_number PK
        string result_key PK
        u64 count_value
    }
    
    %% Entidades del Backend Economy
    USER_RECORD {
        Principal user_principal PK
        f64 total_promo
        f64 locked_promo
        f64 unlocked_promo
        f64 lift_token_balance
        f64 last_week_reward
        f64 icp_balance
    }
    
    BURN_HISTORY {
        Principal user_principal PK
        u64 burn_id PK
        f64 amount_burned
        u64 timestamp
    }
    
    PRIZE_POOL {
        string pool_id PK
        f64 current_balance
        f64 initial_balance
        f64 weekly_issuance_percentage
    }
    
    %% Entidad de Referencia Entre Canisters
    PRINCIPAL_USER_MAPPING {
        Principal user_principal PK
        string user_id
        u64 registration_timestamp
    }
    
    %% Estado de Fase de Gobernanza
    STATE {
        Phase current_phase PK
        u64 phase_start_time
        u64 remaining_time
        string phase_description
    }
    
    %% Relaciones
    VOTING_SYSTEM ||--o{ USER_CLAIM : "rastrea participación semanal"
    VOTING_SYSTEM ||--o{ WEEKLY_SURVEY_RESULTS : "agrega por semana"
    VOTING_SYSTEM ||--o{ WEEKLY_VOTE_RESULTS : "agrega por semana"
    VOTING_SYSTEM ||--o{ WEEKLY_RATIFICATION_COUNTS : "agrega por semana"
    
    USER_CLAIM ||--|| PRINCIPAL_USER_MAPPING : "identificado por principal"
    USER_CLAIM ||--o{ SURVEY_RESPONSE : "seguimiento de participación"
    USER_CLAIM ||--o{ VOTE_RESPONSE : "seguimiento de participación"
    USER_CLAIM ||--o{ RATIFICATION_RESPONSE : "seguimiento de participación"
    
    SURVEY_RESPONSE }o--|| WEEKLY_SURVEY_RESULTS : "agregado en"
    VOTE_RESPONSE }o--|| WEEKLY_VOTE_RESULTS : "agregado en"
    RATIFICATION_RESPONSE }o--|| WEEKLY_RATIFICATION_COUNTS : "agregado en"
    
    %% Relaciones entre canisters
    USER_CLAIM ||--|| USER_RECORD : "determina recompensas para"
    PRINCIPAL_USER_MAPPING ||--|| USER_RECORD : "datos financieros para"
    USER_RECORD ||--o{ BURN_HISTORY : "rastrea quemas de tokens"
    
    PRIZE_POOL ||--o{ USER_RECORD : "distribuye recompensas a"
    
    VOTING_SYSTEM ||--|| STATE : "mantiene estado de fase"
    
    %% Relaciones temporales
    WEEKLY_SURVEY_RESULTS ||--|| WEEKLY_VOTE_RESULTS : "resultados de encuesta alimentan votación"
    WEEKLY_VOTE_RESULTS ||--|| WEEKLY_RATIFICATION_COUNTS : "resultados de voto alimentan ratificación"
    
    %% Notas para flujo de datos (valores de prueba de prototipo):
    %% USER_CLAIM: Encuesta: +20 por ciento reclamación, Voto: +70 por ciento reclamación, Ratificación: +10 por ciento reclamación, Máximo: 100 por ciento por semana
    %% USER_RECORD: 50 por ciento bloqueado, 50 por ciento desbloqueado PROMO, 15 por ciento desbloqueo por participación
    %% PRIZE_POOL: 10,000 tokens iniciales, Porcentaje de emisión semanal determinado por gobernanza, Distribución basada en participación
```

### 4. Diagramas de Implementación Técnica

#### **Diagrama de Despliegue: Infraestructura ICP**
- **Propósito**: Mostrar arquitectura de despliegue en Internet Computer
- **Contenido**: Canisters, réplica local, IC mainnet, y entornos de desarrollo
- **Audiencia**: Ingenieros DevOps, desarrolladores blockchain, equipo de infraestructura

```mermaid
C4Deployment
    title Diagrama de Despliegue para Lift Cash en Protocolo Internet Computer

    Deployment_Node(dev, "Máquina de Desarrollador", "Entorno de Desarrollo Local") {
        Deployment_Node(dfx, "Réplica Local dfx", "Simulador Blockchain ICP") {
            Container(local_community, "Community_Backend", "Canister Rust", "Lógica de gobernanza local")
            Container(local_economy, "Economy_Backend", "Canister Rust", "Economía de tokens local")
            Container(local_frontend, "Activos Frontend", "Archivos Estáticos", "Artefactos de construcción React")
            Container(local_ii, "Internet Identity", "Dependencia Externa", "Servicio de autenticación local")
            Container(local_icrc, "Ledger ICRC-1", "Dependencia Externa", "Ledger de tokens local")
        }
        
        Deployment_Node(nodejs, "Runtime Node.js", "Servidor de Desarrollo") {
            Container(vite_dev, "Servidor Dev Vite", "Frontend", "Recarga en caliente, modo demo")
        }
        
        Deployment_Node(scripts, "Scripts de Despliegue", "Automatización") {
            Container(deploy_sh, "deploy.sh", "Script Bash", "Automatización de despliegue de canisters")
            Container(test_sh, "Test.sh", "Script Bash", "Simulación de usuarios y pruebas")
        }
    }


    Deployment_Node(ic_mainnet, "IC Mainnet", "Red de Producción Internet Computer") {
        Deployment_Node(app_subnet, "Subnet de Aplicación", "Infraestructura ICP") {
            Container(prod_community, "Community_Backend", "Canister Rust", "Gobernanza de producción")
            Container(prod_economy, "Economy_Backend", "Canister Rust", "Economía de producción")
            Container(prod_frontend, "Activos Frontend", "Archivos Estáticos", "Frontend de producción")
        }
        
        Deployment_Node(system_subnet, "Subnet de Sistema", "Servicios Centrales ICP") {
            Container(prod_ii, "Internet Identity", "Canister de Sistema", "Autenticación de producción")
            Container(prod_icrc, "Ledger ICRC-1", "Canister de Sistema", "Ledger de tokens de producción")
        }
        
        Deployment_Node(nns_subnet, "Subnet NNS", "Sistema Nervioso de Red") {
            Container(nns, "Canisters NNS", "Gobernanza", "Gobernanza de red IC")
            Container(cycles, "Acuñación de Cycles", "Servicio de Sistema", "Asignación de recursos computacionales")
        }
    }

    Deployment_Node(cdn, "Red de Distribución de Contenido", "Distribución de Activos Estáticos") {
        Container(asset_canister, "Canister de Activos", "Archivos Estáticos", "Alojamiento de frontend distribuido")
    }

    Deployment_Node(monitoring, "Infraestructura de Monitoreo", "Observabilidad") {
        Container(metrics, "Recopilación de Métricas", "Telemetría", "Métricas de rendimiento de canisters")
        Container(logs, "Agregación de Logs", "Registro", "Seguimiento de errores y depuración")
    }

    %% Flujo de Desarrollo
    Rel(deploy_sh, local_community, "Despliega", "dfx deploy")
    Rel(deploy_sh, local_economy, "Despliega", "dfx deploy")
    Rel(deploy_sh, local_frontend, "Construye y Despliega", "npm run build")
    
    Rel(vite_dev, local_frontend, "Sirve", "HTTP")
    Rel(test_sh, local_community, "Prueba", "Llamadas Candid")
    Rel(test_sh, local_economy, "Prueba", "Llamadas Candid")

    %% Dependencias Locales
    Rel(local_community, local_economy, "Llamadas entre canisters", "Interfaz Candid")
    Rel(local_frontend, local_community, "Consultas", "HTTPS/Candid")
    Rel(local_frontend, local_economy, "Consultas", "HTTPS/Candid")
    Rel(local_frontend, local_ii, "Autenticación", "API Internet Identity")
    Rel(local_economy, local_icrc, "Acuñación de tokens", "Estándar ICRC-1")


    %% Despliegue de Producción
    Rel(deploy_sh, prod_community, "Despliega", "dfx deploy --network ic")
    Rel(deploy_sh, prod_economy, "Despliega", "dfx deploy --network ic")
    Rel(deploy_sh, prod_frontend, "Despliega", "dfx deploy --network ic")

    %% Dependencias de Producción
    Rel(prod_community, prod_economy, "Llamadas entre canisters", "Interfaz Candid")
    Rel(prod_frontend, prod_community, "Consultas", "HTTPS/Candid")
    Rel(prod_frontend, prod_economy, "Consultas", "HTTPS/Candid")
    Rel(prod_frontend, prod_ii, "Autenticación", "API Internet Identity")
    Rel(prod_economy, prod_icrc, "Acuñación de tokens", "Estándar ICRC-1")

    %% Dependencias de Infraestructura
    Rel(prod_community, cycles, "Consume", "Cycles de computación")
    Rel(prod_economy, cycles, "Consume", "Cycles de computación")
    Rel(prod_frontend, asset_canister, "Distribuido vía", "CDN")

    %% Monitoreo
    Rel(prod_community, metrics, "Reporta", "Datos de rendimiento")
    Rel(prod_economy, metrics, "Reporta", "Datos de rendimiento")
    Rel(prod_community, logs, "Envía", "Logs de errores")
    Rel(prod_economy, logs, "Envía", "Logs de errores")

    UpdateElementStyle(local_community, $fontColor="white", $bgColor="#3b82f6", $borderColor="#2563eb")
    UpdateElementStyle(local_economy, $fontColor="white", $bgColor="#3b82f6", $borderColor="#2563eb")
    UpdateElementStyle(local_frontend, $fontColor="white", $bgColor="#3b82f6", $borderColor="#2563eb")
    
    UpdateElementStyle(prod_community, $fontColor="white", $bgColor="#eb5528", $borderColor="#dc2626")
    UpdateElementStyle(prod_economy, $fontColor="white", $bgColor="#eb5528", $borderColor="#dc2626")
    UpdateElementStyle(prod_frontend, $fontColor="white", $bgColor="#eb5528", $borderColor="#dc2626")
    
    UpdateElementStyle(local_ii, $fontColor="white", $bgColor="#059669", $borderColor="#047857")
    UpdateElementStyle(local_icrc, $fontColor="white", $bgColor="#059669", $borderColor="#047857")
    UpdateElementStyle(prod_ii, $fontColor="white", $bgColor="#059669", $borderColor="#047857")
    UpdateElementStyle(prod_icrc, $fontColor="white", $bgColor="#059669", $borderColor="#047857")
    UpdateElementStyle(nns, $fontColor="white", $bgColor="#059669", $borderColor="#047857")
    UpdateElementStyle(cycles, $fontColor="white", $bgColor="#059669", $borderColor="#047857")
```

### 5. Diagramas de Procesos de Negocio

#### **Diagrama de Flujo de Economía de Tokens**
- **Propósito**: Visualizar el ciclo de vida de tokens y mecanismos económicos
- **Contenido**: Acuñación de tokens, bloqueo/desbloqueo, distribución de recompensas, y quema
- **Audiencia**: Diseñadores de tokenomics, analistas financieros, economistas de cripto

```mermaid
flowchart TD
    %% Inicialización de Bolsa de Premios
    Start([Inicialización del Sistema]) --> PrizePool[Bolsa de Premios Creada<br/>Balance Inicial: 10,000 PROMO<br/>Emisión Semanal: Porcentaje Determinado por Gobernanza]
    
    %% Ciclo de Gobernanza Semanal
    PrizePool --> WeekStart[Comienza Nueva Semana de Gobernanza<br/>Reiniciar seguimiento de participación<br/>Calcular emisión semanal]
    
    WeekStart --> WeeklyIssuance[Calcular Distribución Semanal<br/>Cantidad = Bolsa de Premios * Porcentaje Votado por Gobernanza<br/>Tasa de emisión determinada por voto comunitario]
    
    %% Participación de Usuario y Acumulación de Reclamaciones
    WeeklyIssuance --> UserParticipation{¿Usuario Participa<br/>en Gobernanza?}
    
    UserParticipation -->|Encuesta| SurveyReward[Participación en Encuesta<br/>+20 por ciento reclamación<br/>Registro en Community Backend]
    UserParticipation -->|Voto| VoteReward[Participación en Votación<br/>+70 por ciento reclamación<br/>Registro en Community Backend]
    UserParticipation -->|Ratificación| RatifyReward[Participación en Ratificación<br/>+10 por ciento reclamación<br/>Registro en Community Backend]
    UserParticipation -->|Sin Participación| NoReward[Sin Porcentaje de Reclamación<br/>0 por ciento elegibilidad de recompensa<br/>Esperar a la próxima semana]
    
    SurveyReward --> ClaimCalc[Calcular Reclamación Total<br/>Máximo 100 por ciento por semana<br/>Encuesta + Voto + Ratificación]
    VoteReward --> ClaimCalc
    RatifyReward --> ClaimCalc
    
    %% Distribución de Recompensas al Final de la Semana
    ClaimCalc --> WeekEnd[Fin de Semana Activado<br/>Distribución automática de recompensas<br/>Comunicación entre canisters]
    NoReward --> WeekEnd
    
    WeekEnd --> IndividualReward[Calcular Recompensa Individual<br/>Recompensa Usuario = Emisión Semanal * Porcentaje Reclamación dividido por 100<br/>Recompensa basada en emisión determinada por gobernanza]
    
    %% Mecanismo de División de Tokens
    IndividualReward --> TokenSplit[Dividir Recompensa 50/50<br/>50% PROMO bloqueado<br/>50% PROMO desbloqueado]
    
    %% Gestión de Tokens Bloqueados
    TokenSplit --> LockedTokens[Agregar a Balance Bloqueado<br/>Almacenamiento Economy Backend<br/>No se puede transferir]
    
    %% Gestión de Tokens Desbloqueados
    TokenSplit --> UnlockedTokens[Agregar a Balance Desbloqueado<br/>Almacenamiento Economy Backend<br/>Disponible para uso]
    
    %% Desbloqueo Basado en Participación
    LockedTokens --> UnlockCheck{¿Participación<br/>Semana Actual?}
    UnlockCheck -->|Sí| UnlockCalc[Calcular Cantidad de Desbloqueo<br/>15 por ciento del balance bloqueado<br/>Bono de participación]
    UnlockCheck -->|No| StayLocked[Tokens Bloqueados Permanecen<br/>Sin desbloqueo sin participación<br/>Incentivo para mantenerse activo]
    
    UnlockCalc --> UnlockTransfer[Transferir 15 por ciento Bloqueado a Desbloqueado<br/>Actualizar balances de usuario<br/>Operación Economy Backend]
    
    %% Utilización de Tokens
    UnlockedTokens --> TokenUse{Opciones de Uso<br/>de Tokens}
    UnlockTransfer --> TokenUse
    
    TokenUse -->|Transferir| TokenTransfer[Transferir a Otros Usuarios<br/>Sistema de balance interno<br/>Transacciones peer-to-peer]
    TokenUse -->|Mantener| TokenHold[Mantener en Balance<br/>Acumular con el tiempo<br/>No se requiere acción]
    TokenUse -->|Quemar| TokenBurn[Quemar Tokens<br/>Remover de circulación<br/>Presión deflacionaria]
    
    %% Gestión de Bolsa de Premios
    IndividualReward --> PoolDeduction[Deducir de Bolsa de Premios<br/>Nuevo Balance = Actual - Distribuido<br/>Cantidad varía según voto de gobernanza]
    
    PoolDeduction --> PoolReplenish{¿Auto-reposición<br/>Habilitada?}
    PoolReplenish -->|Sí| MintNew[Acuñar Nuevos Tokens<br/>Operación ledger ICRC-1<br/>Restaurar balance de bolsa]
    PoolReplenish -->|No| PoolDepleted[Bolsa de Premios Disminuye<br/>Presión deflacionaria natural<br/>Escasez aumenta]
    
    MintNew --> PoolRestore[Restaurar Bolsa de Premios<br/>Reponer a balance objetivo<br/>Economía de tokens sostenible]
    
    %% Economía Multi-Token
    TokenTransfer --> MultiToken[Sistema Multi-Token<br/>PROMO: Sistema de balance interno<br/>LIFT: Token blockchain ICRC-1 completo<br/>ICP: Token blockchain externo]
    
    MultiToken --> PROMOToken[Balance Token PROMO<br/>Almacenamiento f64 interno<br/>Mecánicas bloqueado/desbloqueado<br/>NO estándar ICRC-1]
    MultiToken --> LIFTToken[Balance Token LIFT<br/>Cumplimiento completo ICRC-1/ICRC-2<br/>Token blockchain estándar<br/>Integración con billeteras soportada]
    MultiToken --> ICPToken[Balance Token ICP<br/>Integración blockchain completa<br/>Tarifas de red<br/>Operaciones cross-chain]
    
    %% Ciclos Económicos y Retroalimentación
    StayLocked --> NextWeek[Siguiente Semana de Gobernanza<br/>Oportunidad para participación<br/>Potencial de desbloqueo permanece]
    TokenHold --> NextWeek
    PoolDepleted --> NextWeek
    PoolRestore --> NextWeek
    LIFTToken --> NextWeek
    ICPToken --> NextWeek
    
    NextWeek --> WeekStart
    
    %% Economía de Quema de Tokens
    TokenBurn --> BurnRecord[Registrar Transacción de Quema<br/>Actualizar historial de quema<br/>Remoción permanente de tokens]
    BurnRecord --> DeflatEffect[Efecto Deflacionario<br/>Reducir suministro total<br/>Incrementar valor de escasez]
    DeflatEffect --> NextWeek

    %% Estilos para diferentes flujos económicos
    classDef poolFlow fill:#059669,stroke:#047857,stroke-width:2px,color:white
    classDef rewardFlow fill:#eb5528,stroke:#dc2626,stroke-width:2px,color:white
    classDef tokenFlow fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:white
    classDef burnFlow fill:#dc2626,stroke:#b91c1c,stroke-width:2px,color:white
    classDef decision fill:#3b82f6,stroke:#2563eb,stroke-width:2px,color:white

    class PrizePool,WeeklyIssuance,PoolDeduction,PoolReplenish,MintNew,PoolRestore,PoolDepleted poolFlow
    class SurveyReward,VoteReward,RatifyReward,ClaimCalc,IndividualReward,TokenSplit rewardFlow
    class LockedTokens,UnlockedTokens,UnlockTransfer,TokenTransfer,TokenHold,MultiToken,LIFTToken,ICPToken tokenFlow
    class TokenBurn,BurnRecord,DeflatEffect burnFlow
    class UserParticipation,UnlockCheck,TokenUse,PoolReplenish decision
```