// Team Modal Controller
interface MemberData {
  name: string;
  role: string;
  cref: string;
  photo: string;
  bio: string;
}

const membersData: Record<string, MemberData> = {
  daniel: {
    name: 'Daniel Lino',
    role: 'Especialista em Musculação & Hipertrofia',
    cref: 'CREF 163845-G/SP',
    photo: '/images/team/danielphoto.jpeg',
    bio: `Sou Daniel Lino, profissional de Educação Física formado há 6 anos pela FMU, especialista em musculação, hipertrofia e treinamento aplicado à prevenção e reabilitação de lesões.

Ao longo da minha trajetória, aprofundei meus conhecimentos com especializações e cursos nas áreas de musculação avançada, powerlifting, treinamento funcional, reabilitação e prevenção de doenças crônicas, além de diferentes sistemas de treinamento voltados para potencializar resultados com segurança e eficiência.

Minha atuação é focada em transformação física e qualidade de vida, utilizando estratégias de treinamento baseadas em ciência, prática e individualização. Durante minha carreira, tive a oportunidade de aprender e trabalhar com grandes referências da musculação, incluindo Felipe Franco e Felipe Fonseca, o que contribuiu para aprimorar ainda mais minha visão técnica e estratégica dentro do treinamento.

Até hoje, já participamos da transformação de mais de 200 vidas, ajudando alunos a alcançarem objetivos como hipertrofia, melhora de performance, reabilitação física e construção de hábitos saudáveis e duradouros.

Acredito que cada corpo tem um processo único, e meu compromisso é guiar cada pessoa com conhecimento, estratégia e acompanhamento de qualidade para alcançar o melhor resultado possível.`,
  },
  diego: {
    name: 'Diego Carvalho Redorat',
    role: 'Especialista em Transformação & Evolução',
    cref: 'CREF 185065-G/SP',
    photo: '/images/team/diego.png',
    bio: `Minha jornada com o treinamento começou cedo, aos 15 anos, quando descobri na musculação muito mais do que um exercício físico — encontrei uma ferramenta de transformação pessoal.

Desde então, o treino se tornou parte fundamental da minha vida, não apenas para desenvolver o corpo, mas para construir disciplina, equilíbrio mental e constância. A musculação me ensinou que resultados verdadeiros são construídos com dedicação diária, estratégia e uma mentalidade forte.

Hoje, meu trabalho é ajudar pessoas a evoluírem através do treinamento, desenvolvendo não apenas força e estética, mas também mais energia, foco e qualidade de vida. Acredito que o treino impacta diretamente o desempenho em todas as áreas da vida, desde a saúde até a produtividade no trabalho e na rotina.

Minha abordagem é baseada em acompanhamento próximo, evolução progressiva e na construção de hábitos que gerem resultados duradouros. Cada pessoa tem uma jornada única, e meu compromisso é orientar esse processo com responsabilidade, estratégia e dedicação.

Mais do que treinar corpos, meu objetivo é ajudar pessoas a desenvolverem uma mentalidade de evolução constante, mostrando que a musculação pode ser um dos caminhos mais poderosos para transformar a vida.`,
  },
  gustavo: {
    name: 'Gustavo Saito',
    role: 'Coach de Lifestyle & Mentalidade',
    cref: 'Mentor & Coach',
    photo: '/images/team/gustavosaito.jpeg',
    bio: `Tenho mais de 20 anos liderando e influenciando pessoas rumo ao crescimento e desenvolvimento contínuo. Ao longo dessa trajetória, construí minha caminhada baseada em disciplina, visão estratégica e foco em resultados reais.

Sou esportista desde a infância e praticante de musculação há mais de 5 anos. Vivo na prática os princípios que ensino: constância, mentalidade forte e evolução diária. Acredito que a performance física é reflexo direto de uma mente estruturada e alinhada com propósito.

Como mentor e coach de lifestyle, meu trabalho vai além de treinos e protocolos. Atuo na transformação da mentalidade — o ponto de partida que impacta todas as áreas da vida, principalmente saúde, físico e performance pessoal.

Meu método é fundamentado em mudança de identidade, disciplina estratégica e execução consistente, levando meus mentorados a alcançarem resultados sustentáveis e um novo padrão de vida.`,
  },
};

export class TeamModal {
  private modal: HTMLElement | null;
  private overlay: HTMLElement | null;
  private closeBtn: HTMLElement | null;
  private buttons: NodeListOf<Element>;

  constructor() {
    this.modal = document.getElementById('bioModal');
    this.overlay = document.getElementById('bioModalOverlay');
    this.closeBtn = document.getElementById('bioModalClose');
    this.buttons = document.querySelectorAll('.btn-learn-more');

    this.init();
  }

  private init() {
    // Event listeners para os botões de "Ler mais"
    this.buttons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const member = (e.currentTarget as HTMLElement).dataset.member;
        if (member) {
          this.openModal(member);
        }
      });
    });

    // Fechar modal
    this.closeBtn?.addEventListener('click', () => this.closeModal());
    this.overlay?.addEventListener('click', () => this.closeModal());

    // Fechar com tecla Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal();
      }
    });
  }

  private openModal(memberId: string) {
    const member = membersData[memberId];
    if (!member || !this.modal) return;

    // Atualizar conteúdo do modal
    const photo = this.modal.querySelector('#bioModalPhoto') as HTMLImageElement;
    const name = this.modal.querySelector('#bioModalName');
    const role = this.modal.querySelector('#bioModalRole');
    const cref = this.modal.querySelector('#bioModalCref');
    const text = this.modal.querySelector('#bioModalText');

    if (photo) photo.src = member.photo;
    if (name) name.textContent = member.name;
    if (role) role.textContent = member.role;
    if (cref) cref.textContent = member.cref;
    if (text) {
      // Quebrar bio em parágrafos
      text.innerHTML = member.bio
        .split('\n\n')
        .map((p) => `<p>${p}</p>`)
        .join('');
    }

    // Mostrar modal
    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  private closeModal() {
    if (this.modal) {
      this.modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }
}
