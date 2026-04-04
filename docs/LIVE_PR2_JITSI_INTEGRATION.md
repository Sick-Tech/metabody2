<!-- ============================================================
     LIVE_PR2_JITSI_INTEGRATION.md
     MIT Metabody — Ao Vivo / Live Sessions Feature
     ============================================================ -->

# Live Sessions PR2: Jitsi Integration 🎥

## Overview

**PR2** integra o **Jitsi Meet** na feature "Ao Vivo" do MetaBody, permitindo transmissões ao vivo embutidas na página individual da sessão.

### Scope
- ✅ Integração oficial Jitsi via IFrame API
- ✅ Carregamento seguro do `external_api.js`
- ✅ Renderização condicional por status (scheduled/live/ended)
- ✅ Componente reutilizável e desacoplado
- ✅ UX responsiva (desktop, tablet, mobile)
- ✅ Loading state e error handling
- ❌ Gravação/Replay (out of scope)
- ❌ Backend real (futura integração)

---

## Architecture

### File Structure

```
p:\metabody2-main\
├── live.html                           # Página individual (refatorada)
├── src/ts/components/
│   └── LiveMeetingEmbed.ts            # ✨ Novo: Wrapper Jitsi
└── (PR1 files mantidos sem alterações)
```

### Flow Diagram

```
live.html (?id=live-001)
    ↓
    ├─ fetch live data (mock)
    ├─ renderLivePage(live)
    │   ├─ if status === 'live'
    │   │   └─ renderJitsiEmbed(live)
    │   │       └─ new LiveMeetingEmbed()
    │   │           ├─ ensureJitsiScriptLoaded()
    │   │           │   └─ fetch https://meet.jit.si/external_api.js
    │   │           └─ createJitsiMeeting()
    │   │               └─ new JitsiMeetExternalAPI(domain, options)
    │   │
    │   ├─ if status === 'scheduled'
    │   │   └─ show "Quero ser notificado" button
    │   │
    │   └─ if status === 'ended'
    │       └─ show "Sessão encerrada" message
    │
    └─ mount display
```

---

## Components

### 1. LiveMeetingEmbed (Nova classe)

**Arquivo:** `src/ts/components/LiveMeetingEmbed.ts`

**Responsabilidades:**
- Garante carregamento único do script Jitsi
- Instancia sala via IFrame API
- Gerencia ciclo de vida (create, destroy)
- Configura listeners de eventos
- Trata erros com fallbacks

**Public API:**
```typescript
constructor(containerId: string, live: LiveSession, options?: {...})
async render(): Promise<void>
destroy(): void
getApi(): any
isReady(): boolean
```

**Config Jitsi:**
```javascript
{
  domain: 'meet.jit.si',           // Domínio público
  roomName: 'metabody-...',        // Sanitizado (lowercase, sem especiais)
  width: '100%',
  height: '100%',
  lang: 'pt-BR',                   // Idioma
  userInfo: {
    displayName: 'Participante MetaBody'
  },
  interfaceConfigOverwrite: {      // UI limpa
    SHOW_CHROME_EXTENSION_BANNER: false,
    MOBILE_APP_PROMO: false,
    SHOW_WATERMARK: false,
    TOOLBOX_ALWAYS_VISIBLE: false,
    SHOW_BRAND_WATERMARK: false,
  },
  configOverwrite: {               // Comportamento
    disableAudioLevels: false,
    startAudioOnly: false,
    p2p: { enabled: true },
    analytics: { disabled: true },
    localRecording: { enabled: false },
  }
}
```

### 2. live.html (Refatorada)

**Mudanças:**

#### Script Inline
- Classe `LiveMeetingEmbed` definida inline (sem dependência de módulos)
- Funções de renderização por status
- Controle cleaner do ciclo de vida

#### Renderização por Status

```javascript
if (live.status === 'live') {
  // Renderiza <div id="live-jitsi-embed"> com Jitsi
  renderJitsiEmbed(live)
}

if (live.status === 'scheduled') {
  // Mostra botão "Quero ser notificado" com badge Verde
  showReminderButton()
}

if (live.status === 'ended') {
  // Mostra mensagem "Sessão encerrada" com link para home
  showEndedMessage()
}
```

#### Loading State
```html
<div class="jitsi-loading">
  <div class="loading-spinner"></div>
  <p>Conectando à sala...</p>
</div>
```
(Mostrado enquanto `external_api.js` carrega e Jitsi inicializa)

#### Error Fallback
```html
<div class="jitsi-error">
  <p><strong>Não foi possível conectar à sala ao vivo</strong></p>
  <p>Tente recarregar a página...</p>
</div>
```
(Se script falhar ou instância não criada)

#### Cleanup
```javascript
window.addEventListener('beforeunload', () => {
  if (currentJitsiEmbed) {
    currentJitsiEmbed.destroy()  // Libera recursos
  }
})
```

---

## Data Updates

### Mock roomNames

Atualizados para serem mais descritivos e sanitáveis:

```javascript
{
  id: 'live-001-featured',
  title: '...',
  roomName: 'metabody-mentoria-ajuste-treino-dieta',  // ← Novo formato
  status: 'live',
  // ...
}
```

**Regra de sanitização:**
- Lowercase
- Remove chars especiais → hífen
- Remove hífens duplicados
- Limite 100 chars

Exemplo: `"Mentoria: Ajuste™"` → `"mentoria-ajuste"`

---

## Styling (Consolidated)

**Arquivo:** `live.html` `<style>` inline

### Key Classes

```css
/* Container */
.live-jitsi-section { margin-bottom: 2rem; }

.jitsi-embed-container {
  aspect-ratio: 16 / 9;
  min-height: 400px;        /* Desktop */
  background: gradiente premium;
  border: 1px solid cyan;
  border-radius: 12px;
  overflow: hidden;
}

/* Loading */
.jitsi-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 1rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(41, 168, 212, 0.2);
  border-top-color: var(--cyan-mid);
  animation: spin 0.8s linear infinite;
}

/* Error */
.jitsi-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  text-align: center;
  padding: 2rem;
}

/* Ended */
.live-ended-message {
  margin-top: 2rem;
  padding: 1.5rem;
  background: rgba(74, 122, 155, 0.1);
  border-radius: 12px;
  text-align: center;
}
```

### Responsive

| Breakpoint | Changes |
|-----------|---------|
| Desktop | `aspect-ratio: 16/9`, `min-height: 400px` |
| Tablet (768px) | Grid meta → 1 col, button full-width |
| Mobile (480px) | `min-height: 300px`, padding ajustado |

---

## Event Listeners

### Jitsi API Events

```javascript
jitsiApi.addEventListener('videoConferenceJoined', () => {
  console.log('[Jitsi] Entrou na sala')
})

jitsiApi.addEventListener('videoConferenceLeft', () => {
  console.log('[Jitsi] Saiu da sala')
})

jitsiApi.addEventListener('readyToClose', () => {
  console.log('[Jitsi] Reunião fechada pelo usuário')
  embed.cleanup()
})

jitsiApi.addEventListener('onError', (error) => {
  console.error('[Jitsi] Erro:', error)
  // Mostrar mensagem de erro ao usuário
})
```

---

## Testing

### Manual Tests

#### Test 1: Live Session
```
1. Acesse: live.html?id=live-001-featured
2. Status deve ser "Ao Vivo" (badge pulsante vermelho)
3. Jitsi embed deve carregar
4. Loading spinner → desaparece quando Jitsi ready
5. Sala deve ser: "metabody-mentoria-ajuste-treino-dieta"
6. Áudio/vídeo funcional
7. Botão "Quero ser notificado" ausente
```

#### Test 2: Scheduled Session
```
1. Acesse: live.html?id=live-002-upcoming-1
2. Status deve ser "Agendada" (badge verde)
3. Jitsi embed não deve aparecer
4. Botão "Quero ser notificado" visível
5. Clique no botão → muda para "✔️ Notificação ativa"
6. Meta info exibindo corretamente
```

#### Test 3: Ended Session
```
1. Acesse: live.html?id=live-005-ended
2. Status deve ser "Encerrada" (badge cinza)
3. Jitsi embed não deve aparecer
4. Botão "Quero ser notificado" ausente
5. Mensagem "Sessão encerrada" visível com link para home
```

#### Test 4: Error Handling
```
1. Simulate erro: edite live.html, troque domain para "invalid.domain"
2. Reload: live.html?id=live-001-featured
3. Jitsi error message deve aparecer
4. Página deve permanecer utilizável
```

#### Test 5: Responsiveness
```
Desktop (1920x1080):
  - Embed 16:9 full width até 900px, centered
  - Meta grid 4 cols
  - Button inline

Tablet (768x1024):
  - Embed responsive, height ajustada
  - Meta grid 1 col
  - Button full-width

Mobile (375x667):
  - Embed min-height 300px
  - All text readable
  - Button centered
  - Sem scroll horizontal
```

---

## Future Considerations (PR3+)

### PR3: Backend Integration
- Conectar lives ao Supabase real
- API endpoints:
  - `GET /api/lives` → fetch do BD
  - `POST /api/reminders` → salvar notificação
  - `GET /api/reminders/:userId` → verificar interesse

### PR4: Advanced Features
- Chat durante transmissão (Jitsi event handlers)
- Real notifications (email, push, WhatsApp)
- Analytics (quem entrou, duração, etc)
- Recording infrastructure (opcional)

### Domain Flexibility
Como roomName é sanitizado e domínio é centralizado na classe:
```javascript
const domain = 'meet.jit.si'  // Trocar aqui
// OU para self-hosted
const domain = 'jitsi.metabody.com'
```

---

## Approval Criteria ✅

- ✅ Live "live" abre Jitsi dentro da página
- ✅ Scheduled não abre sala (apenas botão)
- ✅ Ended não abre sala (apenas mensagem)
- ✅ Integração limpa e reutilizável
- ✅ Mobile não quebra
- ✅ Coerente com PR1
- ✅ IFrame API oficial Jitsi
- ✅ meet.jit.si como domínio
- ✅ Loading e error states
- ✅ Cleanup de recursos

---

## Git Commit

```
feat(live): Implement PR2 Jitsi integration

- Add LiveMeetingEmbed component for Jitsi embed management
- Refactor live.html with conditional rendering by status
- Implement loading state and error fallback
- Add responsive styling (desktop, tablet, mobile)
- Update roomName in mock data for clarity
- Consolidate styles and cleanup
- Ready for backend integration in PR3

Files:
  - src/ts/components/LiveMeetingEmbed.ts (new)
  - live.html (refactored)
  - docs/LIVE_PR2_JITSI_INTEGRATION.md (new)
```

---

## Notes

- **No breaking changes** to PR1 structure
- **Drop-in replacement** for placeholder Jitsi
- **Isomorphic class** (can be imported in TS or inlined in HTML)
- **Performance**: Script loaded once, reused for multiple sessions
- **Accessibility**: Jitsi handles WCAG compliance internally
