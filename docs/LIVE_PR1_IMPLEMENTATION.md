
# Live Sessions / Ao Vivo Feature - PR1 Implementation

## 📋 Overview

Implementação da base estrutural para a funcionalidade "Ao Vivo" (Live Sessions) no MetaBody Club. Este PR **não integra Jitsi** ainda, mas prepara toda a arquitetura para a próxima fase.

## 📁 Arquivos Criados/Modificados

### Novos Arquivos

#### Types & Data
- **`src/ts/types/live.ts`** - Tipos e interfaces centralizadas
  - `LiveSessionStatus` (enum: scheduled, live, ended)
  - `LiveSession` (entidade principal)
  - `LiveReminder` (registro de interesse)
  - `LiveAgendaItem` (item de agenda)
  - `LivePageContext` (contexto da página)
  - `LiveListFilters` (filtros futuros)

- **`src/ts/data/live.mock.ts`** - Mock data realista
  - 1 live ao vivo agora (Mentoria - Lucas Mendes)
  - 3+ lives futuras (Q&A Nutrição, Treino Funcional, Encerramento Mensal)
  - 1 live encerrada (para teste de estado)
  - Helpers para obter dados

#### Logic & Utilities
- **`src/ts/utils/live.ts`** - Funções utilitárias para lógica de estado
  - `isLiveNow()`, `isScheduled()`, `isEnded()`
  - `getFeaturedLive()`, `getUpcomingLives()`, `getLiveNow()`
  - `getMonthAgenda()`, `getNextUpcomingLive()`
  - Formatação de datas: `formatDateTime()`, `formatDateTimeWithDay()`
  - Status helpers: `getStatusLabel()`, `getStatusBadgeColor()`

#### Main Class
- **`src/ts/live.ts`** - Classe Live (gerenciador da feature)
  - Carrega dados mockados
  - Renderiza agenda de lives
  - Gerencia lembretes (mockado)
  - Navegação para página individual
  - Public API para acesso aos dados

#### Styling
- **`src/styles/_live.scss`** - Estilos completos para a feature
  - `.live-sessions-mockup` - Container da lista
  - `.live-session-item` - Card individual
  - `.session-badge` - Badge de status (live, scheduled, ended)
  - `.live-reminder-btn` - Botão "Quero ser notificado"
  - `.live-featured-card` - Card em destaque
  - `.live-jitsi-placeholder` - Placeholder para Jitsi
  - Animações (pulse para live, hover effects)
  - Responsivo (mobile-first)

#### Pages
- **`live.html`** - Página individual da live
  - Suporta 3 estados: scheduled, live, ended
  - Exibe metadados (data, host, especialidade, acesso)
  - Placeholder para integração Jitsi
  - Botão "Quero ser notificado" (mockado)
  - Styling completo e responsivo

### Arquivos Modificados

- **`src/ts/types.ts`** - Added `export * from './types/live'`
- **`src/ts/main.ts`** - Added `new Live()` ao bootstrap
- **`src/styles/main.scss`** - Added `@use 'live'`
- **`index.html`** - Reformatado container `.live-sessions-mockup` para consumir dados do módulo
- Link "Ver Agenda Completa" agora aponta para `./live.html`

## 🏗️ Arquitetura

```
src/
├── ts/
│   ├── types/
│   │   └── live.ts              # Tipos centralizados
│   ├── data/
│   │   └── live.mock.ts         # Mock data realista
│   ├── utils/
│   │   └── live.ts              # Funções utilitárias
│   ├── live.ts                  # Classe gerenciadora
│   ├── types.ts                 # Export centralizado (updated)
│   └── main.ts                  # Entry point (updated)
├── styles/
│   ├── _live.scss               # Estilos da feature
│   └── main.scss                # (updated)
└── live.html                    # Página individual da live
```

## 🎯 Funcionalidades Implementadas

### ✅ Base Funcional
- [x] Modelo de dados completo (LiveSession, LiveReminder, LiveSessionStatus)
- [x] Mock data realista com 5 lives de exemplo
- [x] Utilitários para lógica de estado
- [x] Classe Live para gerenciamento

### ✅ UI & Rendering
- [x] Renderização da agenda na página principal
- [x] Cards individuais com status visual (live, agendada, encerrada)
- [x] Botão "Quero ser notificado" estruturado
- [x] Página individual da live com 3 estados
- [x] Estilos completos e responsivos

### ✅ Interações
- [x] Toggle de lembretes (mockado, local storage ready)
- [x] Navegação para página individual
- [x] Formatação de datas/horas legível
- [x] Animações (pulse, hover, transitions)

### ⏳ Preparado para Próxima Fase
- [x] Placeholder para Jitsi (pronto para integração)
- [x] Estrutura preparada para API real
- [x] Adapter pattern pronto para dados Backend
- [x] Tipos preparados para novos campos

## 🔌 Estados da Live

### Scheduled (Agendada)
```
Status: "Agendado"
Badge: Verde
Botão: "Quero ser notificado"
Jitsi: Não visível
```

### Live (Ao Vivo)
```
Status: "Ao Vivo" (pulsing animation)
Badge: Vermelho pulsante
Botão: Não aparece
Jitsi: Placeholder visível
```

### Ended (Encerrada)
```
Status: "Encerrada"
Badge: Cinza/Desaturado
Botão: Não aparece
Jitsi: Não visível
```

## 🧪 Como Testar

### Na Página Principal (index.html)
1. Seção "Sessões Ao Vivo" agora mostra lives baseadas no mock data
2. Clique em um card para ir para a página individual
3. Clique em "Quero ser notificado" (só aparece em agendadas)
4. A live ao vivo tem animação pulsante no badge

### Página Individual (live.html?id=<live-id>)
1. Visite `live.html?id=live-001-featured` (live ao vivo)
2. Visite `live.html?id=live-002-upcoming-1` (agendada)
3. Visite `live.html?id=live-005-ended` (encerrada)

IDs disponíveis no mock data:
- `live-001-featured` - Live ao vivo (Mentoria)
- `live-002-upcoming-1` - Agendada (Q&A Nutrição)
- `live-003-upcoming-2` - Agendada (Treino Funcional)
- `live-004-upcoming-3` - Agendada (Encerramento Mensal)
- `live-005-ended` - Encerrada

## 🛣️ Roadmap para PR2+

### PR Next: Integração Jitsi
- [ ] Embutir Jitsi Meet
- [ ] Gerenciar room de calls
- [ ] Status real de transmissão

### PR After: Backend Integration
- [ ] Conectar ao Supabase
- [ ] Queries de lives
- [ ] Salvar lembretes no DB
- [ ] Autenticação real

### Future: Advanced Features
- [ ] Gravação/Replay
- [ ] Controle por plano (Pro vs Free)
- [ ] Notificações reais (email, push, WhatsApp)
- [ ] Chat ao vivo
- [ ] Painel admin

## 📝 Conventions Seguidas

✅ **TypeScript**: Strong typing, interfaces bem definidas
✅ **Naming**: camelCase para variáveis/funções, PascalCase para classes/interfaces
✅ **Organization**: Separação clara de concerns (types, data, utils, classes)
✅ **SCSS**: BEM-like notation, variáveis centralizadas, comentários estruturados
✅ **HTML**: Semantic markup, data attributes para JS integration
✅ **Documentation**: Comments em funções complexas, README atualizado

## 🚀 Próximos Passos

Este PR deixa a base preparada. Para avançar:

1. **PR2**: Integrar Jitsi (sem gravação, sem replay)
2. **PR3**: Conectar ao Backend real (Supabase)
3. **PR4**: Features avançadas (chat, notificações, etc)

A arquitetura é escalável e reutilizável. Nenhum refactor maior será necessário.

---

**Status**: ✅ Pronto para revisão e merge
**Breaking Changes**: Nenhum
**Dependências Novas**: Nenhuma
**Migration Required**: Não
