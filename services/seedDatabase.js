import { db } from './firebase.js';
import { doc, setDoc, getDocs, collection, serverTimestamp } from 'firebase/firestore';

// Dados estruturados e prontos para o Firestore
export const SEED_TRAILS = [
  {
    id: 'f1',
    title: 'Trilha do Lemos',
    author: 'Raissa Mara',
    time: '1 hr',
    distance: '2km',
    rating: '4.4',
    reviews: '90',
    difficulty: 'Fácil',
    imageKey: 'lemos',
    isActive: true,
  },
  {
    id: 'f2',
    title: 'Pedra do Cruzeiro',
    author: 'Ana Meireles',
    time: '10 min',
    distance: '300m',
    rating: '4.5',
    reviews: '200',
    difficulty: 'Fácil',
    imageKey: 'pedra-cruzeiro',
    isActive: true,
  },
  {
    id: 'm1',
    title: 'Vale Perdido',
    author: 'João Lucas',
    time: '2 hr',
    distance: '4km',
    rating: '4.8',
    reviews: '150',
    difficulty: 'Médio',
    imageKey: 'vale-perdido',
    isActive: true,
  },
  {
    id: 'm2',
    title: 'Trilha da Cabeça da Bruxa',
    author: 'Miguel Almeida',
    time: '22 min',
    distance: '0,8km',
    rating: '4.2',
    reviews: '85',
    difficulty: 'Médio',
    imageKey: 'cabeca-bruxa',
    isActive: true,
  },
  {
    id: 'd1',
    title: 'Trilha da Cabeça da Bruxa',
    author: 'Pedro Paulo',
    time: '22 min',
    distance: '0,8km',
    rating: '3.5',
    reviews: '45',
    difficulty: 'Difícil',
    imageKey: 'cabeca-bruxa',
    isActive: true,
  },
  {
    id: 'd2',
    title: 'Vale Perdido',
    author: 'Luiza Teixeira',
    time: '2 hr',
    distance: '4km',
    rating: '4.1',
    reviews: '190',
    difficulty: 'Difícil',
    imageKey: 'vale-perdido',
    isActive: true,
  },
];

export const SEED_GUIDES = [
  {
    id: 'g-01',
    name: 'João Lucas Silva',
    displayName: 'João Lucas',
    role: 'Guia Profissional',
    specialties: 'Trilhas • Turismo de aventura • Grupos iniciantes',
    bioPrefix: 'Guia de trilhas em Quixadá, ',
    bioHighlight: 'com 5 anos de experiência',
    bioSuffix:
      '. Especializado em trilhas para iniciantes e turismo de aventura, com foco em segurança e acompanhamento durante o percurso.',
    trailsCount: 42,
    coverImageKey: 'lemos',
    avatar:
      'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=400&auto=format&fit=crop&q=80',
    availableTrails: [
      {
        id: 'f1',
        title: 'Trilha do Lemos',
        author: 'João Lucas',
        time: '1 hr',
        distance: '2km',
        difficulty: 'Fácil',
        imageKey: 'lemos',
      },
      {
        id: 'f2',
        title: 'Pedra do Cruzeiro',
        author: 'João Lucas',
        time: '10 min',
        distance: '300m',
        difficulty: 'Médio',
        imageKey: 'pedra-cruzeiro',
      },
      {
        id: 'm1',
        title: 'Vale Perdido',
        author: 'João Lucas',
        time: '2 hr',
        distance: '4km',
        difficulty: 'Médio',
        imageKey: 'vale-perdido',
      },
    ],
    sharedPhotos: [
      { id: 'sp1', imageKey: 'cabeca-bruxa' },
      { id: 'sp2', imageKey: 'pedra-cruzeiro' },
      { id: 'sp3', imageKey: 'vale-perdido' },
      { id: 'sp4', imageKey: 'lemos' },
    ],
    comments: [
      {
        id: 'c1',
        name: 'Lis Almeida',
        avatar:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        text: 'Foi minha primeira trilha e o João explicou tudo com muita calma. Me senti seguro durante todo o percurso.',
      },
      {
        id: 'c2',
        name: 'Luan Araujo',
        avatar:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        text: 'Gostei bastante da experiência. O João conhece muito bem a região e tornou a trilha tranquila mesmo para quem não tinha experiência.',
      },
    ],
  },
  {
    id: 'g-02',
    name: 'Miguel Almeida',
    displayName: 'Miguel Almeida',
    role: 'Guia Especialista em Trekking',
    specialties: 'Trekking • Natureza • Grupos pequenos',
    bioPrefix: 'Especialista em expedições e trekking técnico, ',
    bioHighlight: 'com mais de 7 anos de atuação',
    bioSuffix:
      ' pelas serras e formações rochosas do Ceará, priorizando pequenos grupos e imersão na natureza.',
    trailsCount: 58,
    coverImageKey: 'vale-perdido',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    availableTrails: [
      {
        id: 'm1',
        title: 'Vale Perdido',
        author: 'Miguel Almeida',
        time: '2 hr',
        distance: '4km',
        difficulty: 'Médio',
        imageKey: 'vale-perdido',
      },
      {
        id: 'm2',
        title: 'Trilha da Cabeça da Bruxa',
        author: 'Miguel Almeida',
        time: '22 min',
        distance: '0,8km',
        difficulty: 'Médio',
        imageKey: 'cabeca-bruxa',
      },
    ],
    sharedPhotos: [
      { id: 'sp1', imageKey: 'vale-perdido' },
      { id: 'sp2', imageKey: 'pedra-cruzeiro' },
      { id: 'sp3', imageKey: 'cabeca-bruxa' },
    ],
    comments: [
      {
        id: 'c1',
        name: 'Camila Rocha',
        avatar:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        text: 'O Miguel é super atencioso e conhece as melhores trilhas para quem busca contato profundo com a natureza.',
      },
    ],
  },
  {
    id: 'g-03',
    name: 'Luiza Teixeira',
    displayName: 'Luiza Teixeira',
    role: 'Guia de Ecoturismo & Camping',
    specialties: 'Trilhas • Camping',
    bioPrefix: 'Bióloga e guia certificada, ',
    bioHighlight: 'com 4 anos de experiência',
    bioSuffix:
      ' em acampamentos e travessias ecológicas, focando na sustentabilidade e contemplação da fauna e flora sertaneja.',
    trailsCount: 36,
    coverImageKey: 'cabeca-bruxa',
    avatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    availableTrails: [
      {
        id: 'f1',
        title: 'Trilha do Lemos',
        author: 'Luiza Teixeira',
        time: '1 hr',
        distance: '2km',
        difficulty: 'Fácil',
        imageKey: 'lemos',
      },
      {
        id: 'm2',
        title: 'Trilha da Cabeça da Bruxa',
        author: 'Luiza Teixeira',
        time: '22 min',
        distance: '0,8km',
        difficulty: 'Médio',
        imageKey: 'cabeca-bruxa',
      },
    ],
    sharedPhotos: [
      { id: 'sp1', imageKey: 'cabeca-bruxa' },
      { id: 'sp2', imageKey: 'lemos' },
    ],
    comments: [
      {
        id: 'c1',
        name: 'Mariana Costa',
        avatar:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        text: 'Experiência de acampamento inesquecível com a Luiza! Muito organizada e responsável.',
      },
    ],
  },
  {
    id: 'g-04',
    name: 'Raissa Mara',
    displayName: 'Raissa Mara',
    role: 'Guia de Ecoturismo',
    specialties: 'Trilhas • Ecoturismo • Grupos iniciantes',
    bioPrefix: 'Apaixonada pela caatinga e sertão central, ',
    bioHighlight: 'com 3 anos guiando iniciantes',
    bioSuffix:
      ' com muita calma, didática histórica e foco na segurança para todas as idades e famílias.',
    trailsCount: 29,
    coverImageKey: 'lemos',
    avatar:
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&auto=format&fit=crop&q=80',
    availableTrails: [
      {
        id: 'f1',
        title: 'Trilha do Lemos',
        author: 'Raissa Mara',
        time: '1 hr',
        distance: '2km',
        difficulty: 'Fácil',
        imageKey: 'lemos',
      },
      {
        id: 'f2',
        title: 'Pedra do Cruzeiro',
        author: 'Raissa Mara',
        time: '10 min',
        distance: '300m',
        difficulty: 'Fácil',
        imageKey: 'pedra-cruzeiro',
      },
    ],
    sharedPhotos: [
      { id: 'sp1', imageKey: 'lemos' },
      { id: 'sp2', imageKey: 'pedra-cruzeiro' },
    ],
    comments: [
      {
        id: 'c1',
        name: 'Rafael Lima',
        avatar:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        text: 'A Raissa é fantástica! Nos levou na Trilha do Lemos com muitas explicações sobre a história local.',
      },
    ],
  },
  {
    id: 'g-05',
    name: 'Ana Meireles',
    displayName: 'Ana Meireles',
    role: 'Guia de Aventura',
    specialties: 'Trilhas • Turismo de aventura • Grupos iniciantes',
    bioPrefix: 'Condutora de turismo de aventura, ',
    bioHighlight: 'com formação em primeiros socorros',
    bioSuffix:
      ' em áreas remotas e especializada em roteiros fotográficos e contemplativos em Quixadá.',
    trailsCount: 34,
    coverImageKey: 'pedra-cruzeiro',
    avatar:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    availableTrails: [
      {
        id: 'f2',
        title: 'Pedra do Cruzeiro',
        author: 'Ana Meireles',
        time: '10 min',
        distance: '300m',
        difficulty: 'Médio',
        imageKey: 'pedra-cruzeiro',
      },
      {
        id: 'm1',
        title: 'Vale Perdido',
        author: 'Ana Meireles',
        time: '2 hr',
        distance: '4km',
        difficulty: 'Médio',
        imageKey: 'vale-perdido',
      },
    ],
    sharedPhotos: [
      { id: 'sp1', imageKey: 'pedra-cruzeiro' },
      { id: 'sp2', imageKey: 'vale-perdido' },
    ],
    comments: [
      {
        id: 'c1',
        name: 'Lucas Pereira',
        avatar:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        text: 'Excelente guia! As paradas para foto foram nos melhores pontos.',
      },
    ],
  },
  {
    id: 'g-06',
    name: 'Pedro Paulo',
    displayName: 'Pedro Paulo',
    role: 'Instrutor de Escalada & Guia',
    specialties: 'Escalada • Turismo de aventura • Experiência ao ar livre',
    bioPrefix: 'Escalador experiente e guia de montanhismo, ',
    bioHighlight: 'com mais de 8 anos de rocha',
    bioSuffix:
      ' e vivência prática nos monólitos e paredões mais desafiadores do sertão central.',
    trailsCount: 65,
    coverImageKey: 'vale-perdido',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    availableTrails: [
      {
        id: 'm1',
        title: 'Vale Perdido',
        author: 'Pedro Paulo',
        time: '2 hr',
        distance: '4km',
        difficulty: 'Médio',
        imageKey: 'vale-perdido',
      },
      {
        id: 'm2',
        title: 'Trilha da Cabeça da Bruxa',
        author: 'Pedro Paulo',
        time: '22 min',
        distance: '0,8km',
        difficulty: 'Difícil',
        imageKey: 'cabeca-bruxa',
      },
    ],
    sharedPhotos: [
      { id: 'sp1', imageKey: 'vale-perdido' },
      { id: 'sp2', imageKey: 'cabeca-bruxa' },
    ],
    comments: [
      {
        id: 'c1',
        name: 'Camila Rocha',
        avatar:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        text: 'O Pedro domina todas as técnicas de segurança em rocha. Recomendo muito!',
      },
    ],
  },
  {
    id: 'g-07',
    name: 'Luiz Martins',
    displayName: 'Luiz Martins',
    role: 'Guia Histórico e Cultural',
    specialties: 'Trilhas históricas • Patrimônio • Monólitos',
    bioPrefix: 'Historiador e condutor local em Quixadá, ',
    bioHighlight: 'com mais de 6 anos de experiência',
    bioSuffix:
      ' conduzindo grupos às formações mais emblemáticas do sertão central e narrando a rica história da região.',
    trailsCount: 45,
    coverImageKey: 'cabeca-bruxa',
    avatar:
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    availableTrails: [
      {
        id: 'hist-galinha-choca',
        title: 'Trilha da Galinha Choca',
        author: 'Luiz Martins',
        time: '2 hr 30 min',
        distance: '3,5km',
        difficulty: 'Médio',
        imageKey: 'cabeca-bruxa',
      },
    ],
    sharedPhotos: [
      { id: 'sp1', imageKey: 'cabeca-bruxa' },
      { id: 'sp2', imageKey: 'lemos' },
    ],
    comments: [
      {
        id: 'c1',
        name: 'Mariana Costa',
        avatar:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        text: 'Excelente guia para a Trilha da Galinha Choca! Muito atencioso e conhecedor da história local.',
      },
    ],
  },
];

export const SEED_EVENTS = [
  {
    id: 'f1',
    trailId: 'f1',
    title: 'Trilha do Lemos',
    imageKey: 'lemos',
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
      { id: 'photo-upload', isUploadAction: true },
      { id: 'photo-1', imageKey: 'lemos', caption: 'Ponto de partida da subida' },
      { id: 'photo-2', imageKey: 'cabeca-bruxa', caption: 'Vista dos monólitos ao redor' },
      { id: 'photo-3', imageKey: 'pedra-cruzeiro', caption: 'Mirante intermediário' },
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
  {
    id: 'f2',
    trailId: 'f2',
    title: 'Pedra do Cruzeiro',
    imageKey: 'pedra-cruzeiro',
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
      { id: 'photo-1', imageKey: 'pedra-cruzeiro' },
      { id: 'photo-2', imageKey: 'vale-perdido' },
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
  {
    id: 'm1',
    trailId: 'm1',
    title: 'Vale Perdido',
    imageKey: 'vale-perdido',
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
      { id: 'photo-1', imageKey: 'vale-perdido' },
      { id: 'photo-2', imageKey: 'cabeca-bruxa' },
    ],
    comments: [],
  },
  {
    id: 'm2',
    trailId: 'm2',
    title: 'Trilha da Cabeça da Bruxa',
    imageKey: 'cabeca-bruxa',
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
      { id: 'photo-1', imageKey: 'cabeca-bruxa' },
      { id: 'photo-2', imageKey: 'lemos' },
    ],
    comments: [],
  },
  {
    id: 'd1',
    trailId: 'd1',
    title: 'Trilha da Cabeça da Bruxa',
    imageKey: 'cabeca-bruxa',
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
      { id: 'photo-1', imageKey: 'cabeca-bruxa' },
    ],
    comments: [],
  },
  {
    id: 'd2',
    trailId: 'd2',
    title: 'Vale Perdido',
    imageKey: 'vale-perdido',
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
      { id: 'photo-1', imageKey: 'vale-perdido' },
    ],
    comments: [],
  },
  {
    id: 'hist-galinha-choca',
    trailId: 'hist-galinha-choca',
    title: 'Trilha da Galinha Choca',
    imageKey: 'cabeca-bruxa',
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
      { id: 'photo-1', imageKey: 'cabeca-bruxa' },
      { id: 'photo-2', imageKey: 'lemos' },
    ],
    comments: [],
  },
];

/**
 * Função para popular/sincronizar os dados com o Firestore
 */
export async function seedDatabase(forceOverwrite = false) {
  console.log('Iniciando sincronização com o banco de dados Firestore...');

  try {
    // 1. Sincronizar Trilhas ('trails')
    for (const trail of SEED_TRAILS) {
      const trailRef = doc(db, 'trails', trail.id);
      await setDoc(trailRef, {
        ...trail,
        updatedAt: serverTimestamp(),
      }, { merge: !forceOverwrite });
      console.log(`[Firestore] Trilha sincronizada: ${trail.id} - ${trail.title}`);
    }

    // 2. Sincronizar Guias ('guides')
    for (const guide of SEED_GUIDES) {
      const guideRef = doc(db, 'guides', guide.id);
      await setDoc(guideRef, {
        ...guide,
        updatedAt: serverTimestamp(),
      }, { merge: !forceOverwrite });
      console.log(`[Firestore] Guia sincronizado: ${guide.id} - ${guide.name}`);
    }

    // 3. Sincronizar Eventos ('events')
    for (const event of SEED_EVENTS) {
      const eventRef = doc(db, 'events', event.id);
      await setDoc(eventRef, {
        ...event,
        updatedAt: serverTimestamp(),
      }, { merge: !forceOverwrite });
      console.log(`[Firestore] Evento sincronizado: ${event.id} - ${event.title}`);
    }

    console.log('Sincronização concluída com sucesso!');
    return { success: true };
  } catch (error) {
    console.error('Erro na sincronização com o Firestore:', error);
    return { success: false, error };
  }
}
