// ============================================================
// live.ts — Live Sessions Feature Class
// Manages state, rendering, and interactions for the live feature
// ============================================================

import type { LiveSession, LiveReminder } from './types/live'
import { getAllLiveSessions, getLiveRemindersByUserId } from './data/live.mock'
import {
  getFeaturedLive,
  getUpcomingLives,
  getLiveNow,
  getMonthAgenda,
  hasUserReminder,
  formatDateTimeWithDay,
  getStatusLabel,
  isLiveNow,
  isScheduled,
  isEnded,
} from './utils/live'

/**
 * Live — Gerenciador da feature "Ao Vivo"
 * Responsabilidades:
 * - Carregar e gerenciar lives
 * - Renderizar seções
 * - Gerenciar lembretes
 * - Integrar com o resto da aplicação
 */
export class Live {
  private lives: LiveSession[] = []
  private reminders: LiveReminder[] = []
  private currentUserId: string = 'user-demo-001' // Mock user ID
  private containerSelector: string = ''

  constructor(containerSelector?: string) {
    this.containerSelector = containerSelector || '.live-sessions-mockup'
    this.init()
  }

  /**
   * init — Inicializa o módulo
   */
  private init(): void {
    this.loadData()
    this.setupEventListeners()
    this.render()
  }

  /**
   * loadData — Carrega dados das lives e lembretes (mockado)
   * Futuramente: chamará API real
   */
  private loadData(): void {
    this.lives = getAllLiveSessions()
    this.reminders = getLiveRemindersByUserId(this.currentUserId)
  }

  /**
   * setupEventListeners — Configura listeners de eventos
   */
  private setupEventListeners(): void {
    // Delegação de eventos para botões de reminder
    document.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement
      
      if (target.classList.contains('live-reminder-btn')) {
        const liveId = target.getAttribute('data-live-id')
        if (liveId) {
          this.toggleReminder(liveId)
        }
      }

      // Clique em um card de live (futuro: navegar para página)
      if (target.closest('.live-session-item')) {
        const item = target.closest('.live-session-item') as HTMLElement
        const liveId = item.getAttribute('data-live-id')
        if (liveId) {
          this.navigateToLive(liveId)
        }
      }
    })
  }

  /**
   * render — Renderiza a seção de lives
   * Para agora, apenas atualiza a seção existente
   */
  private render(): void {
    const container = document.querySelector(this.containerSelector)
    if (!container) {
      console.warn(`Container ${this.containerSelector} não encontrado`)
      return
    }

    container.innerHTML = this.renderAgendaItems()
  }

  /**
   * renderAgendaItems — Renderiza items da agenda
   */
  private renderAgendaItems(): string {
    const agenda = getMonthAgenda(this.lives)
    
    return agenda
      .slice(0, 6) // Limite de 6 items por enquanto
      .map((live) => this.renderLiveItem(live))
      .join('')
  }

  /**
   * renderLiveItem — Renderiza um single item de live
   */
  private renderLiveItem(live: LiveSession): string {
    const statusLabel = getStatusLabel(live.status)
    const dateTime = formatDateTimeWithDay(live.startsAt)
    const hasReminder = hasUserReminder(live.id, this.reminders)
    const badgeClass = this.getStatusBadgeClass(live.status)

    let reminderBtn = ''
    if (isScheduled(live)) {
      reminderBtn = `
        <button 
          class="live-reminder-btn ${hasReminder ? 'active' : ''}" 
          data-live-id="${live.id}"
          title="${hasReminder ? 'Lembrete ativo' : 'Quero ser notificado'}"
        >
          <span class="reminder-icon">🔔</span>
          ${hasReminder ? 'Notificação ativa' : 'Quero ser notificado'}
        </button>
      `
    }

    return `
      <div class="live-session-item" data-live-id="${live.id}">
        <div class="session-badge ${badgeClass}">
          <span class="status-label">${statusLabel}</span>
        </div>
        <div class="session-info">
          <div class="session-title">${live.title}</div>
          <div class="session-meta">
            <span class="session-day">${dateTime}</span>
            ${live.hostName ? `<span class="session-host">com ${live.hostName}</span>` : ''}
          </div>
          ${live.topic ? `<div class="session-topic">${live.topic}</div>` : ''}
        </div>
        ${reminderBtn}
      </div>
    `
  }

  /**
   * getStatusBadgeClass — Retorna classe CSS para o badge de status
   */
  private getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'live':
        return 'live-badge'
      case 'scheduled':
        return 'scheduled-badge'
      case 'ended':
        return 'ended-badge'
      default:
        return ''
    }
  }

  /**
   * toggleReminder — Ativa/desativa lembrete para uma live
   * @param liveId — ID da live
   */
  async toggleReminder(liveId: string): Promise<void> {
    const hasReminder = hasUserReminder(liveId, this.reminders)

    if (hasReminder) {
      // Remove lembrete
      this.reminders = this.reminders.filter((r) => r.liveSessionId !== liveId)
      console.log(`Lembrete removido para live ${liveId}`)
    } else {
      // Adiciona lembrete (mockado)
      const newReminder: LiveReminder = {
        id: `reminder-${Date.now()}`,
        liveSessionId: liveId,
        userId: this.currentUserId,
        createdAt: new Date(),
      }
      this.reminders.push(newReminder)
      console.log(`Lembrete ativado para live ${liveId}`)
    }

    // Re-render apenas o button (otimizado)
    this.updateReminderButton(liveId)
  }

  /**
   * updateReminderButton — Atualiza apenas o botão após ação
   */
  private updateReminderButton(liveId: string): void {
    const btn = document.querySelector(
      `.live-reminder-btn[data-live-id="${liveId}"]`
    ) as HTMLElement
    if (!btn) return

    const hasReminder = hasUserReminder(liveId, this.reminders)
    btn.classList.toggle('active', hasReminder)
    btn.textContent = hasReminder ? '🔔 Notificação ativa' : '🔔 Quero ser notificado'
  }

  /**
   * navigateToLive — Navega para página individual da live
   * @param liveId — ID da live
   */
  private navigateToLive(liveId: string): void {
    window.location.href = `/live.html?id=${liveId}`
  }

  // ── PUBLIC API

  /**
   * getFeatured — Retorna live em destaque
   */
  public getFeatured(): LiveSession | undefined {
    return getFeaturedLive(this.lives)
  }

  /**
   * getUpcoming — Retorna lives futuras
   */
  public getUpcoming(): LiveSession[] {
    return getUpcomingLives(this.lives)
  }

  /**
   * getLiveById — Retorna uma live por ID
   */
  public getLiveById(id: string): LiveSession | undefined {
    return this.lives.find((live) => live.id === id)
  }

  /**
   * getCurrentLive — Retorna live que está acontecendo agora
   */
  public getCurrentLive(): LiveSession | undefined {
    return getLiveNow(this.lives)
  }

  /**
   * getAllLives — Retorna todas as lives
   */
  public getAllLives(): LiveSession[] {
    return this.lives
  }

  /**
   * getUserReminders — Retorna lembretes do usuário
   */
  public getUserReminders(): LiveReminder[] {
    return this.reminders
  }
}
