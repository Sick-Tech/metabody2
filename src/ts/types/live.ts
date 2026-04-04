// ============================================================
// types/live.ts — Live Sessions / Ao Vivo Feature Types
// ============================================================

/**
 * LiveSessionStatus — Estados possíveis da sessão
 * - scheduled: Agendada, ainda não começou
 * - live: Transmissão ao vivo em andamento
 * - ended: Encerrada
 */
export enum LiveSessionStatus {
  SCHEDULED = 'scheduled',
  LIVE = 'live',
  ENDED = 'ended',
}

/**
 * LiveSession — Entidade principal de uma sessão ao vivo
 * Representa uma mentoria, Q&A, encontro ou qualquer sessão em tempo real
 */
export interface LiveSession {
  id: string
  title: string
  description: string
  startsAt: Date | string // ISO 8601 ou Date
  endsAt: Date | string | null
  status: LiveSessionStatus
  roomName: string // Identificador do room (ex: "jitsi-room-001")
  hostName: string // Nome do mentor/facilitador
  hostSubtitle?: string // "Especialista em treino", etc
  badgeLabel?: string // "Exclusivo Pro", "Aberto a todos", etc
  isFeatured: boolean // É a live principal em destaque?
  maxAttendees?: number // Limite de participantes (opcional no MVP)
  createdAt: Date | string
  updatedAt: Date | string
  tags?: string[] // "treino", "nutrição", "mentalidade", etc
  topic?: string // Tópico resumido (ex: "Ajuste de treino e dieta — Perguntas & Respostas")
}

/**
 * LiveReminder — Registro de interesse do usuário em uma sessão
 * Quando clica em "Quero ser notificado", um LiveReminder é criado
 */
export interface LiveReminder {
  id: string
  liveSessionId: string
  userId: string // UUID ou ID do user
  createdAt: Date | string
  updatedAt?: Date | string
}

/**
 * LiveAgendaItem — Item de agenda (pode ser adaptador de LiveSession ou ele próprio)
 * Para o MVP, pode ser o próprio LiveSession
 * Mas mantemos separado para flexibilidade futura
 */
export interface LiveAgendaItem extends LiveSession {
  // No MVP, é apenas um alias de LiveSession
  // Futuro: pode ter fields adicionais específicos de agenda
}

/**
 * LivePageContext — Contexto da página individual de live
 * Usado para passar state e handlers para a página
 */
export interface LivePageContext {
  live: LiveSession
  userHasReminder: boolean
  isLoading: boolean
  error?: string | null
  onReminderToggle?: (liveId: string) => Promise<void>
}

/**
 * LiveListFilters — Filtros para listas de lives
 * Para futura paginação e filtragem
 */
export interface LiveListFilters {
  status?: LiveSessionStatus | LiveSessionStatus[]
  tags?: string[]
  limit?: number
  offset?: number
}
