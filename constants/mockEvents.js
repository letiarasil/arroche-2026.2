// constants/mockEvents.js
// Modelo de dados (Mock Data) pronto para integração com backend
// Endpoints correspondentes no backend:
// - GET    /api/v1/events/:id          -> Detalhes completos do evento
// - POST   /api/v1/events/:id/subscribe-> Inscrição no evento
// - POST   /api/v1/events/:id/comments -> Adição de comentário / pergunta

export const MOCK_EVENTS = {
  // Trilha do Lemos (Evento padrão exibido no protótipo)
  f1: {
    id: 'f1',
    trailId: 'f1',
    title: 'Trilha do Lemos',
    coverImage: require('../assets/trilhas/lemos.jpg'),
    guide: {
      id: 'g-01',
      name: 'João Lucas',
      role: 'Guia profissional',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    },
    description:
      'A Trilha do Sítio Lemos (ou Trilha da Julieta) é um percurso curto, de fácil acesso e ideal para iniciantes, localizado na zona urbana de Quixadá (CE), a cerca de dois quilômetros do centro e com início próximo ao Remanso da Paz',
    departureLocation: 'Praça José de Barros, Quixadá-CE',
    date: '27/10/2026',
    departureTime: '07:00 AM',
    duration: '22 min',
    distance: '1,5 Km',
    difficulty: 'Fácil',
    remainingSpots: 10,
    totalSpots: 15,
    price: 10.0,
    formattedPrice: 'R$10,00',
    participants: [
      {
        id: 'p1',
        name: 'Camila Rocha',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
      },
      {
        id: 'p2',
        name: 'Lucas Pereira',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      },
      {
        id: 'p3',
        name: 'Mariana Costa',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      },
    ],
    photos: [
      {
        id: 'photo-upload',
        isUploadAction: true,
      },
      {
        id: 'photo-1',
        image: require('../assets/trilhas/lemos.jpg'),
        caption: 'Ponto de partida da subida',
      },
      {
        id: 'photo-2',
        image: require('../assets/trilhas/cabeca-bruxa.jpg'),
        caption: 'Vista dos monólitos ao redor',
      },
      {
        id: 'photo-3',
        image: require('../assets/trilhas/pedra-cruzeiro.jpg'),
        caption: 'Mirante intermediário',
      },
    ],
    comments: [
      {
        id: 'c1',
        userName: 'Raissa Mara',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        text: 'Terá café da manhã compartilhado?',
        createdAt: '10:15',
      },
      {
        id: 'c2',
        userName: 'Luan Araujo',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
        text: 'Não sei se tem mas eu topo fazermos Raissa, posso levar duas garrafas de café.',
        createdAt: '10:20',
      },
    ],
  },

  // Pedra do Cruzeiro
  f2: {
    id: 'f2',
    trailId: 'f2',
    title: 'Pedra do Cruzeiro',
    coverImage: require('../assets/trilhas/pedra-cruzeiro.jpg'),
    guide: {
      id: 'g-02',
      name: 'Carlos Silva',
      role: 'Guia profissional',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    description:
      'A subida até o cruzeiro oferece uma das mais clássicas vistas da cidade de Quixadá. Percurso rápido com escadaria e trecho de trilha sinalizada, excelente para o pôr do sol.',
    departureLocation: 'Pé da serra do Cruzeiro, Quixadá-CE',
    date: '28/10/2026',
    departureTime: '16:30 PM',
    duration: '10 min',
    distance: '300m',
    difficulty: 'Fácil',
    remainingSpots: 8,
    totalSpots: 20,
    price: 15.0,
    formattedPrice: 'R$15,00',
    participants: [
      {
        id: 'p1',
        name: 'Ana Souza',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
      },
      {
        id: 'p2',
        name: 'Rafael Lima',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
      },
    ],
    photos: [
      { id: 'photo-upload', isUploadAction: true },
      { id: 'photo-1', image: require('../assets/trilhas/pedra-cruzeiro.jpg') },
      { id: 'photo-2', image: require('../assets/trilhas/vale-perdido.jpg') },
    ],
    comments: [
      {
        id: 'c1',
        userName: 'Carlos Silva',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
        text: 'Levem água e lanternas para a descida no crepúsculo!',
        createdAt: '09:00',
      },
    ],
  },

  // Vale Perdido
  m1: {
    id: 'm1',
    trailId: 'm1',
    title: 'Vale Perdido',
    coverImage: require('../assets/trilhas/vale-perdido.jpg'),
    guide: {
      id: 'g-01',
      name: 'João Lucas',
      role: 'Guia profissional',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    },
    description:
      'Uma expedição em meio aos vales rochosos do sertão central. Terreno irregular com belas formações geológicas e vegetação típica da caatinga preservada.',
    departureLocation: 'Entrada da Fazenda Magé, Quixadá-CE',
    date: '30/10/2026',
    departureTime: '06:00 AM',
    duration: '2 hr',
    distance: '4km',
    difficulty: 'Médio',
    remainingSpots: 6,
    totalSpots: 12,
    price: 25.0,
    formattedPrice: 'R$25,00',
    participants: [
      {
        id: 'p1',
        name: 'Mariana Costa',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      },
    ],
    photos: [
      { id: 'photo-upload', isUploadAction: true },
      { id: 'photo-1', image: require('../assets/trilhas/vale-perdido.jpg') },
      { id: 'photo-2', image: require('../assets/trilhas/cabeca-bruxa.jpg') },
    ],
    comments: [],
  },

  // Trilha da Cabeça da Bruxa
  m2: {
    id: 'm2',
    trailId: 'm2',
    title: 'Trilha da Cabeça da Bruxa',
    coverImage: require('../assets/trilhas/cabeca-bruxa.jpg'),
    guide: {
      id: 'g-02',
      name: 'Carlos Silva',
      role: 'Guia profissional',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    description:
      'Caminhada em direção à formação rochosa famosa pela silhueta mística que lembra a cabeça de uma bruxa. Vista panorâmica espetacular de todo o vale dos monólitos.',
    departureLocation: 'Posto Sertanejo, Rodovia CE-060',
    date: '02/11/2026',
    departureTime: '07:30 AM',
    duration: '22 min',
    distance: '0,8km',
    difficulty: 'Médio',
    remainingSpots: 5,
    totalSpots: 15,
    price: 20.0,
    formattedPrice: 'R$20,00',
    participants: [
      {
        id: 'p1',
        name: 'Luan Araujo',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
      },
    ],
    photos: [
      { id: 'photo-upload', isUploadAction: true },
      { id: 'photo-1', image: require('../assets/trilhas/cabeca-bruxa.jpg') },
      { id: 'photo-2', image: require('../assets/trilhas/lemos.jpg') },
    ],
    comments: [],
  },
};

/**
 * Função utilitária para obter detalhes do evento por ID ou a partir do item passado via navegação.
 * Se o ID não for encontrado, mescla as informações do item ou retorna o evento padrão (f1 - Trilha do Lemos).
 */
export function getEventDetails(eventId, fallbackTrailItem) {
  if (eventId && MOCK_EVENTS[eventId]) {
    return { ...MOCK_EVENTS[eventId] };
  }

  const defaultEvent = MOCK_EVENTS.f1;

  if (fallbackTrailItem) {
    return {
      ...defaultEvent,
      id: fallbackTrailItem.id || defaultEvent.id,
      trailId: fallbackTrailItem.id || defaultEvent.trailId,
      title: fallbackTrailItem.title || defaultEvent.title,
      coverImage: fallbackTrailItem.image || defaultEvent.coverImage,
      duration: fallbackTrailItem.time || defaultEvent.duration,
      distance: fallbackTrailItem.distance || defaultEvent.distance,
      difficulty: fallbackTrailItem.difficulty || defaultEvent.difficulty,
      guide: {
        ...defaultEvent.guide,
        name: fallbackTrailItem.author || defaultEvent.guide.name,
      },
    };
  }

  return { ...defaultEvent };
}

