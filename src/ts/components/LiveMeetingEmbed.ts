// ============================================================
// components/LiveMeetingEmbed.ts — Jitsi Meet Integration
// ============================================================

import type { LiveSession } from '../types/live'

/**
 * Jitsi External API type definition
 * Declara as interfaces globais esperadas da API do Jitsi
 */
declare global {
  interface Window {
    JitsiMeetExternalAPI: any
  }
}

/**
 * LiveMeetingEmbed — Gerenciador de embed do Jitsi Meet
 * Responsabilidades:
 * - Carregar external_api.js de forma segura
 * - Instanciar a reunião usando a IFrame API
 * - Gerenciar o ciclo de vida (criar, destruir)
 * - Evitar duplicação de script carregado
 * - Tratar erros e fallbacks
 */
export class LiveMeetingEmbed {
  private containerElement: HTMLElement | null = null
  private jitsiApi: any = null
  private isScriptLoaded: boolean = false
  private isScriptLoading: boolean = false
  private scriptLoadPromise: Promise<void> | null = null

  constructor(
    private containerId: string,
    private live: LiveSession,
    private options?: {
      displayName?: string
      lang?: string
      onReady?: () => void
      onError?: (error: Error) => void
    }
  ) {}

  /**
   * render — Renderiza o embed do Jitsi
   * Retorna uma promise que resolve quando a API está pronta
   */
  async render(): Promise<void> {
    try {
      // 1. Garantir que a API do Jitsi está carregada
      await this.ensureJitsiScriptLoaded()

      // 2. Obter o container
      this.containerElement = document.getElementById(this.containerId)
      if (!this.containerElement) {
        throw new Error(`Container com ID "${this.containerId}" não encontrado`)
      }

      // 3. Limpar container (remover qualquer conteúdo anterior)
      this.containerElement.innerHTML = ''

      // 4. Criar o embed do Jitsi
      this.createJitsiMeeting()

      // 5. Chamar callback de sucesso
      this.options?.onReady?.()
    } catch (error) {
      console.error('[LiveMeetingEmbed] Erro ao renderizar:', error)
      this.options?.onError?.(error as Error)
      throw error
    }
  }

  /**
   * ensureJitsiScriptLoaded — Carrega o script da API do Jitsi uma única vez
   * Garante que o script não seja carregado multiplas vezes
   */
  private async ensureJitsiScriptLoaded(): Promise<void> {
    // Se já está carregado, retorna imediatamente
    if (this.isScriptLoaded) {
      return
    }

    // Se está carregando, aguarda a promise existente
    if (this.isScriptLoading && this.scriptLoadPromise) {
      return this.scriptLoadPromise
    }

    // Início do carregamento
    this.isScriptLoading = true
    this.scriptLoadPromise = new Promise((resolve, reject) => {
      // Verifica se o script já foi carregado globalmente
      if (window.JitsiMeetExternalAPI) {
        this.isScriptLoaded = true
        this.isScriptLoading = false
        resolve()
        return
      }

      // Cria a tag script
      const script = document.createElement('script')
      script.src = 'https://meet.jit.si/external_api.js'
      script.type = 'text/javascript'
      script.async = true

      // Listeners
      script.onload = () => {
        this.isScriptLoaded = true
        this.isScriptLoading = false
        resolve()
      }

      script.onerror = () => {
        this.isScriptLoading = false
        const error = new Error('Falha ao carregar Jitsi external_api.js')
        reject(error)
      }

      // Adiciona o script no head
      document.head.appendChild(script)
    })

    return this.scriptLoadPromise
  }

  /**
   * createJitsiMeeting — Instancia a reunião do Jitsi
   */
  private createJitsiMeeting(): void {
    if (!this.containerElement) {
      throw new Error('Container não existe')
    }

    if (!window.JitsiMeetExternalAPI) {
      throw new Error('Jitsi API não está carregada')
    }

    try {
      const domain = 'meet.jit.si'
      const roomName = this.sanitizeRoomName(this.live.roomName)

      // Configurações da reunião
      const options = {
        // Tamanho
        width: '100%',
        height: '100%',

        // Room e host
        roomName: roomName,
        parentNode: this.containerElement,

        // Informações do usuário (anônimo por enquanto)
        userInfo: {
          displayName: this.options?.displayName || 'Participante MetaBody',
        },

        // Idioma
        lang: this.options?.lang || 'pt-BR',

        // Configurações de interface
        interfaceConfigOverwrite: {
          // Remover elementos não essenciais
          SHOW_CHROME_EXTENSION_BANNER: false,
          MOBILE_APP_PROMO: false,

          // Manter essenciais
          SHOW_WATERMARK: false,
          TOOLBOX_ALWAYS_VISIBLE: false,
          DEFAULT_REMOTE_DISPLAY_NAME: 'Participante',

          // Badges de participante ocultos (simples UX)
          SHOW_BRAND_WATERMARK: false,
        },

        // Configurações de comportamento
        configOverwrite: {
          // Audio/Video
          disableAudioLevels: false,
          startAudioOnly: false,
          startWithAudioMuted: false,
          startWithVideoMuted: false,

          // Features
          disableSimulcast: false,
          enableLayerSuspension: true,

          // Segurança e privacidade
          p2p: {
            enabled: true,
          },

          // Analytics (desabilitar para privar)
          analytics: {
            disabled: true,
          },

          // LocalRecording (mock, sem gravação real)
          localRecording: {
            enabled: false,
          },
        },
      }

      // Instancia a API
      this.jitsiApi = new window.JitsiMeetExternalAPI(domain, options)

      // Listeners para eventos da API
      this.setupJitsiEventListeners()
    } catch (error) {
      console.error('[LiveMeetingEmbed] Erro ao instanciar Jitsi:', error)
      throw error
    }
  }

  /**
   * setupJitsiEventListeners — Configura escuta de eventos do Jitsi
   */
  private setupJitsiEventListeners(): void {
    if (!this.jitsiApi) return

    // Listener para desconexão
    this.jitsiApi.addEventListener('readyToClose', () => {
      console.log('[Jitsi] Reunião fechada pelo usuário')
      this.cleanup()
    })

    // Listener para erro
    this.jitsiApi.addEventListener('onError', (error: any) => {
      console.error('[Jitsi] Erro na reunião:', error)
    })

    // Log de conectado
    this.jitsiApi.addEventListener('videoConferenceJoined', () => {
      console.log('[Jitsi] Entrou na sala')
    })

    // Log de saída
    this.jitsiApi.addEventListener('videoConferenceLeft', () => {
      console.log('[Jitsi] Saiu da sala')
    })
  }

  /**
   * sanitizeRoomName — Sanitiza o nome da sala para formato válido Jitsi
   * Jitsi aceita: a-z, 0-9, hífens, underscores
   * @param roomName — Nome da sala original
   * @returns Nome sanitizado
   */
  private sanitizeRoomName(roomName: string): string {
    // Remove caracteres especiais, converte para minúsculas
    return roomName
      .toLowerCase()
      .replace(/[^a-z0-9\-_]/g, '-')
      .replace(/--+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 100) // Limit de tamanho razoável
  }

  /**
   * destroy — Destrói a instância do Jitsi e limpa recursos
   */
  destroy(): void {
    try {
      if (this.jitsiApi) {
        // Tenta desconectar
        this.jitsiApi.dispose()
        this.jitsiApi = null
      }

      this.cleanup()
    } catch (error) {
      console.warn('[LiveMeetingEmbed] Erro ao destruir Jitsi:', error)
    }
  }

  /**
   * cleanup — Limpa o container
   */
  private cleanup(): void {
    if (this.containerElement) {
      this.containerElement.innerHTML = ''
    }
  }

  /**
   * getApi — Retorna a instância da API do Jitsi (para uso avançado)
   */
  getApi(): any {
    return this.jitsiApi
  }

  /**
   * isReady — Verifica se o embed está pronto
   */
  isReady(): boolean {
    return this.jitsiApi !== null
  }
}
