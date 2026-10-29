// constants/mockEvents.js
import { MOCK_GUIDES_LIST } from './mockGuideProfile';

export const MOCK_EVENTS = {
  // Trilha do Lemos (Evento padrão exibido no protótipo)
  f1: {
    id: 'f1',
    trailId: 'f1',
    title: 'Trilha do Lemos',
    coverImage: require('../assets/trilhas/lemos.jpg'),
    guide: {
      id: 'g-04',
      name: 'Raissa Mara',
      role: 'Guia de Ecoturismo',
      avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&auto=format&fit=crop&q=80',
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
      id: 'g-05',
      name: 'Ana Meireles',
      role: 'Guia de Aventura',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
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
        userName: 'Ana Meireles',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
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
      role: 'Guia Profissional',
      avatar: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=400&auto=format&fit=crop&q=80',
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
      name: 'Miguel Almeida',
      role: 'Guia Especialista em Trekking',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
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

  // Trilha da Cabeça da Bruxa (Difícil)
  d1: {
    id: 'd1',
    trailId: 'd1',
    title: 'Trilha da Cabeça da Bruxa',
    coverImage: require('../assets/trilhas/cabeca-bruxa.jpg'),
    guide: {
      id: 'g-06',
      name: 'Pedro Paulo',
      role: 'Instrutor de Escalada & Guia',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    },
    description:
      'Percurso avançado e técnico subindo pelas fendas e paredões da Cabeça da Bruxa. Recomendado para aventureiros com bom preparo físico e equipamentos adequados.',
    departureLocation: 'Posto Sertanejo, Rodovia CE-060',
    date: '05/11/2026',
    departureTime: '06:00 AM',
    duration: '22 min',
    distance: '0,8km',
    difficulty: 'Difícil',
    remainingSpots: 4,
    totalSpots: 8,
    price: 35.0,
    formattedPrice: 'R$35,00',
    participants: [],
    photos: [
      { id: 'photo-1', image: require('../assets/trilhas/cabeca-bruxa.jpg') },
    ],
    comments: [],
  },

  // Vale Perdido (Difícil)
  d2: {
    id: 'd2',
    trailId: 'd2',
    title: 'Vale Perdido',
    coverImage: require('../assets/trilhas/vale-perdido.jpg'),
    guide: {
      id: 'g-03',
      name: 'Luiza Teixeira',
      role: 'Guia de Ecoturismo & Camping',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    },
    description:
      'Travessia desafiadora pelo coração do Vale Perdido com acampamento selvagem e travessia de trechos íngremes sob o céu estrelado do sertão.',
    departureLocation: 'Entrada da Fazenda Magé, Quixadá-CE',
    date: '08/11/2026',
    departureTime: '05:30 AM',
    duration: '2 hr',
    distance: '4km',
    difficulty: 'Difícil',
    remainingSpots: 5,
    totalSpots: 10,
    price: 30.0,
    formattedPrice: 'R$30,00',
    participants: [],
    photos: [
      { id: 'photo-1', image: require('../assets/trilhas/vale-perdido.jpg') },
    ],
    comments: [],
  },

  // Trilha da Galinha Choca (Histórico de trilha concluída)
  'hist-galinha-choca': {
    id: 'hist-galinha-choca',
    trailId: 'hist-galinha-choca',
    title: 'Trilha da Galinha Choca',
    coverImage: require('../assets/trilhas/cabeca-bruxa.jpg'),
    guide: {
      id: 'g-07',
      name: 'Luiz Martins',
      role: 'Guia Histórico e Cultural',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    },
    description:
      'A Trilha da Galinha Choca é um dos destinos mais famosos de Quixadá. O percurso contorna os monólitos históricos em direção à imponente formação da Galinha Choca junto ao Açude do Cedro.',
    departureLocation: 'Açude do Cedro, Quixadá-CE',
    date: '10/07/2026',
    departureTime: '06:30 AM',
    duration: '2 hr 30 min',
    distance: '3,5 km',
    difficulty: 'Médio',
    remainingSpots: 0,
    totalSpots: 15,
    price: 20.0,
    formattedPrice: 'R$20,00',
    participants: [],
    photos: [
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
    const authorName = fallbackTrailItem.author || fallbackTrailItem.guideName;
    const matchedGuide = MOCK_GUIDES_LIST.find(
      (g) => g.name === authorName || g.displayName === authorName
    );

    return {
      ...defaultEvent,
      id: fallbackTrailItem.id || defaultEvent.id,
      trailId: fallbackTrailItem.id || defaultEvent.trailId,
      title: fallbackTrailItem.title || defaultEvent.title,
      coverImage: fallbackTrailItem.image || defaultEvent.coverImage,
      duration: fallbackTrailItem.time || defaultEvent.duration,
      distance: fallbackTrailItem.distance || defaultEvent.distance,
      difficulty: fallbackTrailItem.difficulty || defaultEvent.difficulty,
      guide: matchedGuide
        ? {
            id: matchedGuide.id,
            name: matchedGuide.displayName || matchedGuide.name,
            role: matchedGuide.role,
            avatar: matchedGuide.avatar,
          }
        : {
            ...defaultEvent.guide,
            name: authorName || defaultEvent.guide.name,
          },
    };
  }

  return { ...defaultEvent };
}

