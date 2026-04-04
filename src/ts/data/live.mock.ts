// ============================================================
// data/live.mock.ts — Mock Data for Live Sessions
// ============================================================

import type {
  LiveSession,
  LiveReminder,
  LiveSessionStatus,
} from '../types/live'
import { LiveSessionStatus as Status } from '../types/live'

/**
 * LIVE_SESSIONS_MOCK — Dados de exemplo para testes e desenvolvimento
 * Incluem:
 * - 1 live em destaque (ao vivo agora)
 * - 3+ lives futuras (agenda)
 * - 1 live encerrada (para testar estado)
 */
export const LIVE_SESSIONS_MOCK: LiveSession[] = [
  // ── LIVE EM DESTAQUE (AGORA AO VIVO)
  {
    id: 'live-001-featured',
    title: 'Mentoria Ao Vivo: Ajuste de Treino e Dieta — Perguntas & Respostas',
    description:
      'Nosso especialista em periodização e nutrição esportiva responde suas dúvidas em tempo real. Traga suas dúvidas sobre ajustes de treino, progressão de carga e estratégia de alimentação.',
    startsAt: new Date(Date.now()), // Agora
    endsAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hora depois
    status: Status.LIVE,
    roomName: 'metabody-mentoria-001',
    hostName: 'Lucas Mendes',
    hostSubtitle: 'Especialista em Periodização & Nutrição',
    badgeLabel: 'Aberto a Todos',
    isFeatured: true,
    maxAttendees: 500,
    createdAt: new Date('2026-04-04T10:00:00Z'),
    updatedAt: new Date('2026-04-04T14:00:00Z'),
    tags: ['treino', 'nutrição', 'qa'],
    topic: 'Ajuste de treino e dieta — Perguntas & Respostas',
  },

  // ── LIVE FUTURA 1 (PRÓXIMA)
  {
    id: 'live-002-upcoming-1',
    title: 'Q&A Nutrição Esportiva: Suplementação Inteligente',
    description:
      'Saiba como escolher os suplementos corretos, dosagens, timing ideal e como conciliar com sua alimentação real. Aberto para todas as dúvidas sobre suplementação.',
    startsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Daqui 2 dias
    endsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000), // 45 min
    status: Status.SCHEDULED,
    roomName: 'metabody-qa-nutricao-001',
    hostName: 'Beatriz Costa',
    hostSubtitle: 'Nutricionista Esportiva',
    badgeLabel: 'Exclusivo Pro',
    isFeatured: false,
    maxAttendees: 300,
    createdAt: new Date('2026-04-01T08:00:00Z'),
    updatedAt: new Date('2026-04-01T08:00:00Z'),
    tags: ['nutrição', 'suplementação', 'qa'],
    topic: 'Suplementação Inteligente',
  },

  // ── LIVE FUTURA 2
  {
    id: 'live-003-upcoming-2',
    title: 'Treino Funcional Ao Vivo: Sessão Prática',
    description:
      'Pratique conosco uma sessão completa de treino funcional com foco em mobilidade, força e condicionamento. Leve seu corpo ao desafio! Material necessário: tapete e sua disposição.',
    startsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 dias
    endsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // 1 hora
    status: Status.SCHEDULED,
    roomName: 'metabody-treino-funcional-001',
    hostName: 'Rafael Silva',
    hostSubtitle: 'Personal Trainer & Coach de Mobilidade',
    badgeLabel: 'Aberto a Todos',
    isFeatured: false,
    maxAttendees: 200,
    createdAt: new Date('2026-04-01T09:00:00Z'),
    updatedAt: new Date('2026-04-01T09:00:00Z'),
    tags: ['treino', 'funcional', 'prático'],
    topic: 'Treino Funcional — Sessão Prática',
  },

  // ── LIVE FUTURA 3
  {
    id: 'live-004-upcoming-3',
    title: 'Encerramento Mensal com Avaliações de Progresso',
    description:
      'Você recebe feedback detalhado sobre seu progresso no mês. Discutimos seus resultados, próximos passos e ajustes na estratégia. Exclusivo para membros Pro.',
    startsAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 dias
    endsAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 75 * 60 * 1000), // 1h 15min
    status: Status.SCHEDULED,
    roomName: 'metabody-monthly-review-001',
    hostName: 'Time MetaBody Completo',
    hostSubtitle: 'Consultores de Treino & Nutrição',
    badgeLabel: 'Exclusivo Pro',
    isFeatured: false,
    createdAt: new Date('2026-04-01T10:00:00Z'),
    updatedAt: new Date('2026-04-01T10:00:00Z'),
    tags: ['avaliação', 'progresso', 'pro'],
    topic: 'Encerramento Mensal com Avaliações',
  },

  // ── LIVE ENCERRADA (para testar estado)
  {
    id: 'live-005-ended',
    title: 'Mentoria Anterior: Ajustes de Rotina e Consistência',
    description:
      'Sessão encerrada. Tema: Como manter a consistência em treino mesmo com rotina apertada.',
    startsAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 dias atrás
    endsAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // 1 hora
    status: Status.ENDED,
    roomName: 'metabody-mentoria-002',
    hostName: 'Lucas Mendes',
    hostSubtitle: 'Especialista em Periodização & Nutrição',
    badgeLabel: 'Aberto a Todos',
    isFeatured: false,
    createdAt: new Date('2026-04-01T11:00:00Z'),
    updatedAt: new Date('2026-04-01T11:00:00Z'),
    tags: ['treino', 'rotina', 'consistência'],
    topic: 'Ajustes de Rotina e Consistência',
  },
]

/**
 * LIVE_REMINDERS_MOCK — Mock de lembretes salvos
 * Para testar a funcionalidade de notificação
 */
export const LIVE_REMINDERS_MOCK: LiveReminder[] = [
  {
    id: 'reminder-001',
    liveSessionId: 'live-002-upcoming-1',
    userId: 'user-demo-001',
    createdAt: new Date('2026-04-04T12:00:00Z'),
  },
  {
    id: 'reminder-002',
    liveSessionId: 'live-003-upcoming-2',
    userId: 'user-demo-001',
    createdAt: new Date('2026-04-04T12:05:00Z'),
  },
]

/**
 * Função auxiliar para obter dados
 * No futuro, isso virá de um API real
 */
export function getAllLiveSessions(): LiveSession[] {
  return LIVE_SESSIONS_MOCK
}

export function getLiveSessionById(id: string): LiveSession | undefined {
  return LIVE_SESSIONS_MOCK.find((live) => live.id === id)
}

export function getLiveRemindersByUserId(userId: string): LiveReminder[] {
  return LIVE_REMINDERS_MOCK.filter((reminder) => reminder.userId === userId)
}
