// ============================================================
// utils/live.ts — Live Sessions Utility Functions
// ============================================================

import type { LiveSession, LiveSessionStatus } from '../types/live'
import { LiveSessionStatus as Status } from '../types/live'

/**
 * isLiveNow — Verifica se uma sessão está ao vivo AGORA
 * @param live — LiveSession
 * @returns true se está em transmissão
 */
export function isLiveNow(live: LiveSession): boolean {
  return live.status === Status.LIVE
}

/**
 * isScheduled — Verifica se uma sessão está agendada para o futuro
 * @param live — LiveSession
 * @returns true se está agendada
 */
export function isScheduled(live: LiveSession): boolean {
  return live.status === Status.SCHEDULED
}

/**
 * isEnded — Verifica se uma sessão foi encerrada
 * @param live — LiveSession
 * @returns true se finalizou
 */
export function isEnded(live: LiveSession): boolean {
  return live.status === Status.ENDED
}

/**
 * getStatusLabel — Retorna rótulo em português para o status
 * @param status — Status da live
 * @returns Label legível em PT-BR
 */
export function getStatusLabel(status: LiveSessionStatus): string {
  switch (status) {
    case Status.SCHEDULED:
      return 'Agendada'
    case Status.LIVE:
      return 'Ao Vivo'
    case Status.ENDED:
      return 'Encerrada'
    default:
      return 'Desconhecido'
  }
}

/**
 * formatDateTime — Formata data/hora para exibição legível
 * @param dateStr — Data em ISO string ou Date
 * @returns String formatada "DD/MM HH:mm"
 */
export function formatDateTime(dateStr: Date | string): string {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr
  
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')

  return `${day}/${month} ${hour}:${minute}`
}

/**
 * formatDateTimeWithDay — Formata data/hora com nome do dia
 * @param dateStr — Data em ISO string ou Date
 * @returns String formatada "Seg, DD/MM HH:mm" ou equivalente
 */
export function formatDateTimeWithDay(dateStr: Date | string): string {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr
  
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']
  const dayName = days[date.getDay()]
  
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')

  return `${dayName}, ${day}/${month} ${hour}:${minute}`
}

/**
 * getFeaturedLive — Obtém a live em destaque (primeira com isFeatured = true)
 * @param lives — Array de LiveSession
 * @returns LiveSession com isFeatured=true ou undefined
 */
export function getFeaturedLive(lives: LiveSession[]): LiveSession | undefined {
  return lives.find((live) => live.isFeatured === true)
}

/**
 * getUpcomingLives — Obtém todas as lives agendadas (futuras)
 * @param lives — Array de LiveSession
 * @returns Array de LiveSession com status SCHEDULED
 */
export function getUpcomingLives(lives: LiveSession[]): LiveSession[] {
  return lives.filter((live) => isScheduled(live)).sort((a, b) => {
    const dateA = typeof a.startsAt === 'string' ? new Date(a.startsAt).getTime() : a.startsAt.getTime()
    const dateB = typeof b.startsAt === 'string' ? new Date(b.startsAt).getTime() : b.startsAt.getTime()
    return dateA - dateB
  })
}

/**
 * getLiveNow — Obtém a live que está acontecendo agora (status LIVE)
 * @param lives — Array de LiveSession
 * @returns LiveSession com status LIVE ou undefined
 */
export function getLiveNow(lives: LiveSession[]): LiveSession | undefined {
  return lives.find((live) => isLiveNow(live))
}

/**
 * getEndedLives — Obtém todas as lives encerradas
 * @param lives — Array de LiveSession
 * @returns Array de LiveSession com status ENDED
 */
export function getEndedLives(lives: LiveSession[]): LiveSession[] {
  return lives.filter((live) => isEnded(live)).sort((a, b) => {
    const dateA = typeof a.endsAt === 'string' ? new Date(a.endsAt).getTime() : (a.endsAt?.getTime() ?? 0)
    const dateB = typeof b.endsAt === 'string' ? new Date(b.endsAt).getTime() : (b.endsAt?.getTime() ?? 0)
    return dateB - dateA // Decrescente (mais recentes primeiro)
  })
}

/**
 * getNextUpcomingLive — Obtém a próxima live agendada
 * @param lives — Array de LiveSession
 * @returns LiveSession mais próxima ou undefined
 */
export function getNextUpcomingLive(lives: LiveSession[]): LiveSession | undefined {
  const upcoming = getUpcomingLives(lives)
  return upcoming.length > 0 ? upcoming[0] : undefined
}

/**
 * getMonthAgenda — Obtém agora para exibição em agenda mensal
 * Para o MVP, retorna apenas futuras + ao vivo
 * @param lives — Array de LiveSession
 * @returns Array ordenado de LiveSession para agenda
 */
export function getMonthAgenda(lives: LiveSession[]): LiveSession[] {
  const live = getLiveNow(lives) || []
  const upcoming = getUpcomingLives(lives)
  
  return Array.isArray(live) ? upcoming : [live, ...upcoming]
}

/**
 * getDurationInMinutes — Calcula duração em minutos
 * @param live — LiveSession
 * @returns Número de minutos ou 0 se não conseguir calcular
 */
export function getDurationInMinutes(live: LiveSession): number {
  const start = typeof live.startsAt === 'string' ? new Date(live.startsAt) : live.startsAt
  const end = live.endsAt ? (typeof live.endsAt === 'string' ? new Date(live.endsAt) : live.endsAt) : null

  if (!end) return 0

  const diff = end.getTime() - start.getTime()
  return Math.round(diff / (1000 * 60))
}

/**
 * hasUserReminder — Verifica se usuário tem lembrete para uma live (mockado)
 * @param liveId — ID da live
 * @param reminders — Array de lembretes do usuário
 * @returns true se tem lembrete
 */
export function hasUserReminder(liveId: string, reminders: any[]): boolean {
  return reminders.some((reminder) => reminder.liveSessionId === liveId)
}

/**
 * canUserJoinLive — Valida se usuário pode entrar na live (MVP: todos podem)
 * Futuramente: verificar plano, horário, etc
 * @param live — LiveSession
 * @returns true se pode entrar
 */
export function canUserJoinLive(live: LiveSession): boolean {
  // MVP: todos podem entrar em lives ao vivo, agendadas ou encerradas
  // Futuramente: adicionar validação de plano, acesso, etc
  return true
}

/**
 * getStatusBadgeColor — Retorna cor para o badge de status
 * @param status — Status da live
 * @returns Cor CSS (HEX, RGB ou classe)
 */
export function getStatusBadgeColor(status: LiveSessionStatus): string {
  switch (status) {
    case Status.LIVE:
      return '#FF5555' // Vermelho vivo
    case Status.SCHEDULED:
      return '#76C442' // Verde claro
    case Status.ENDED:
      return '#4A7A9B' // Azul suave
    default:
      return '#C8DDE8'
  }
}
