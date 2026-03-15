# Planejamento: Sistema de Agendamento de Eventos (Secretaria de Saúde)

## Overview
Sistema web administrativo completo para registro, organização e acompanhamento de eventos institucionais (reuniões, campanhas, capacitações). O sistema abrangerá controle de agendas, logística (coffee break, materiais), gestão de documentos vinculados (CI, ofícios), e inteligência de dados (dashboards e relatórios).

## Project Type
WEB

## Success Criteria
- [ ] Usuários podem logar com perfis de acesso definidos (RBAC).
- [ ] Formulário unificado de Cadastro de Eventos salva com sucesso informações básicas, controle logístico e materiais.
- [ ] Documentos administrativos podem ser anexados/registrados no contexto de um evento.
- [ ] O Dashboard exibe métricas corretas (total eventos, coffee breaks, etc.) e o Calendário funciona perfeitamente.
- [ ] Mudanças de status disparam notificações de e-mail corretamente.
- [ ] Relatórios e exportação funcionam conforme especificado.

## Tech Stack
- **Frontend**: React (SPA via Vite) + Tailwind CSS (Agilidade e componentização p/ UI administrativa moderna).
- **Backend**: Node.js com Express (Serviço dedicado para as regras de negócio e integrações).
- **Banco de Dados**: PostgreSQL / SQLite usando **Prisma ORM** (Tipagem segura e fácil manutenção do esquema).
- **Autenticação**: JWT com perfis (Administrador, View-Only, etc.).
- **Mensageria**: Nodemailer (via SMTP) para disparo de notificações de status para responsáveis/participantes.

## File Structure
```
/
├── backend/
│   ├── prisma/             # Schema do banco de dados
│   ├── src/
│   │   ├── controllers/    # Lógica HTTP (Eventos, Auth, Documentos)
│   │   ├── middlewares/    # Validação JWT, Roles
│   │   ├── routes/         # Definição de rotas
│   │   └── services/       # Regras de Negócio e E-mail
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/     # UI Reutilizável (Layout, Inputs, Tables)
    │   ├── pages/          # Views (Dashboard, EventList, EventForm)
    │   ├── services/       # Clientes Axios / API calls
    │   └── utils/          # Helpers (formatação de datas, etc)
    └── package.json
```

## Task Breakdown

### 1. Configuração Inicial e Banco de Dados (P0)
- **Agent**: `database-architect` / `backend-specialist`
- **Skill**: `database-design`
- **Priority**: P0
- **INPUT**: Estrutura de dados necessária para Eventos, Logística, Materiais, Docs e Users.
- **OUTPUT**: Projeto Node configurado e tabelas criadas no banco de dados.
- **VERIFY**: `npx prisma migrate dev` executa com sucesso e gera as tabelas corretamente.

### 2. Autenticação e Perfis de Acesso (P1)
- **Agent**: `backend-specialist` / `security-auditor`
- **Skill**: `api-patterns`
- **Priority**: P1
- **INPUT**: Modelo de User e Roles.
- **OUTPUT**: Endpoints de Login/Register e Middleware de autorização.
- **VERIFY**: Rotas protegidas recusam acesso sem token JWT válido.

### 3. API Completa de Eventos e Logística (P1)
- **Agent**: `backend-specialist`
- **Skill**: `api-patterns`
- **Priority**: P1
- **INPUT**: Rotas REST para CRUD de Eventos, Logistica e Materiais + Geração de Relatórios/Dashboard.
- **OUTPUT**: Endpoints servindo JSON. O endpoint de edição de status dispara e-mail se necessário.
- **VERIFY**: Testes de requisição HTTP retornam dados corretos e status 200/201.

### 4. Setup do Frontend e Autenticação UI (P2)
- **Agent**: `frontend-specialist`
- **Skill**: `frontend-design`, `react-best-practices`
- **Priority**: P2
- **INPUT**: Layout e login requeridos.
- **OUTPUT**: Projeto Vite React com Tailwind, React Router e Tela de Login funcional usando context/zustand.
- **VERIFY**: O login armazena o token e redireciona para o Dashboard protegido.

### 5. UI: Dashboard e Calendário (P2)
- **Agent**: `frontend-specialist`
- **Skill**: `frontend-design`
- **Priority**: P2
- **INPUT**: Dados analíticos da API e lista de eventos.
- **OUTPUT**: Dashboard com painel de métricas modernas e calendário interativo.
- **VERIFY**: Componentes renderizam sem erros e exibem números dinâmicos.

### 6. UI: Formulários e Gestão do Evento (P2)
- **Agent**: `frontend-specialist`
- **Skill**: `frontend-design`
- **Priority**: P2
- **INPUT**: Escopo do cadastro unificado (dados, logística, materiais, documentos).
- **OUTPUT**: Telas de formulário com validações fluídas e listagem com filtros/exportação.
- **VERIFY**: Criar um evento pela UI preenche o banco de dados corretamente através da API.

## ✅ Phase X: Verification
- [ ] Script Audit (Security, Lint, UX, Lighthouse)
- [ ] Revisão de Código para Clean Code e Semântica
- [ ] Testes de Fluxo Principais (E2E básico)
- [ ] Build de Produção sem erros
