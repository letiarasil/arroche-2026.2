// constants/mockGuideProfile.js
// Modelo de dados fictícios para Profissionais / Guias Turísticos (Backend-Ready)
// Endpoints correspondentes no backend para integração futura:
// - GET    /api/v1/guides                  -> Listagem completa de guias
// - GET    /api/v1/guides/:id              -> Informações completas de um guia
// - GET    /api/v1/guides/:id/trails       -> Trilhas sob responsabilidade do guia
// - GET    /api/v1/guides/:id/photos       -> Galeria de fotos do guia
// - GET    /api/v1/guides/:id/comments     -> Avaliações e comentários recebidos
// - POST   /api/v1/guides/:id/comments     -> Adicionar novo depoimento/experiência

export const MOCK_GUIDES_LIST = [
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
    coverImage: require('../assets/back-arroche.png'),
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
        image: require('../assets/trilhas/lemos.jpg'),
      },
      {
        id: 'f2',
        title: 'Pedra do Cruzeiro',
        author: 'João Lucas',
        time: '10 min',
        distance: '300m',
        difficulty: 'Médio',
        image: require('../assets/trilhas/pedra-cruzeiro.jpg'),
      },
      {
        id: 'm1',
        title: 'Vale Perdido',
        author: 'João Lucas',
        time: '2 hr',
        distance: '4km',
        difficulty: 'Médio',
        image: require('../assets/trilhas/vale-perdido.jpg'),
      },
    ],
    sharedPhotos: [
      { id: 'sp1', image: require('../assets/trilhas/cabeca-bruxa.jpg') },
      { id: 'sp2', image: require('../assets/trilhas/pedra-cruzeiro.jpg') },
      { id: 'sp3', image: require('../assets/trilhas/vale-perdido.jpg') },
      { id: 'sp4', image: require('../assets/trilhas/lemos.jpg') },
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
    coverImage: require('../assets/trilhas/vale-perdido.jpg'),
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
        image: require('../assets/trilhas/vale-perdido.jpg'),
      },
      {
        id: 'm2',
        title: 'Trilha da Cabeça da Bruxa',
        author: 'Miguel Almeida',
        time: '22 min',
        distance: '0,8km',
        difficulty: 'Médio',
        image: require('../assets/trilhas/cabeca-bruxa.jpg'),
      },
    ],
    sharedPhotos: [
      { id: 'sp1', image: require('../assets/trilhas/vale-perdido.jpg') },
      { id: 'sp2', image: require('../assets/trilhas/pedra-cruzeiro.jpg') },
      { id: 'sp3', image: require('../assets/trilhas/cabeca-bruxa.jpg') },
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
    coverImage: require('../assets/trilhas/cabeca-bruxa.jpg'),
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
        image: require('../assets/trilhas/lemos.jpg'),
      },
      {
        id: 'm2',
        title: 'Trilha da Cabeça da Bruxa',
        author: 'Luiza Teixeira',
        time: '22 min',
        distance: '0,8km',
        difficulty: 'Médio',
        image: require('../assets/trilhas/cabeca-bruxa.jpg'),
      },
    ],
    sharedPhotos: [
      { id: 'sp1', image: require('../assets/trilhas/cabeca-bruxa.jpg') },
      { id: 'sp2', image: require('../assets/trilhas/lemos.jpg') },
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
    coverImage: require('../assets/trilhas/lemos.jpg'),
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
        image: require('../assets/trilhas/lemos.jpg'),
      },
      {
        id: 'f2',
        title: 'Pedra do Cruzeiro',
        author: 'Raissa Mara',
        time: '10 min',
        distance: '300m',
        difficulty: 'Fácil',
        image: require('../assets/trilhas/pedra-cruzeiro.jpg'),
      },
    ],
    sharedPhotos: [
      { id: 'sp1', image: require('../assets/trilhas/lemos.jpg') },
      { id: 'sp2', image: require('../assets/trilhas/pedra-cruzeiro.jpg') },
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
    coverImage: require('../assets/trilhas/pedra-cruzeiro.jpg'),
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
        image: require('../assets/trilhas/pedra-cruzeiro.jpg'),
      },
      {
        id: 'm1',
        title: 'Vale Perdido',
        author: 'Ana Meireles',
        time: '2 hr',
        distance: '4km',
        difficulty: 'Médio',
        image: require('../assets/trilhas/vale-perdido.jpg'),
      },
    ],
    sharedPhotos: [
      { id: 'sp1', image: require('../assets/trilhas/pedra-cruzeiro.jpg') },
      { id: 'sp2', image: require('../assets/trilhas/vale-perdido.jpg') },
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
    coverImage: require('../assets/trilhas/vale-perdido.jpg'),
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
        image: require('../assets/trilhas/vale-perdido.jpg'),
      },
      {
        id: 'm2',
        title: 'Trilha da Cabeça da Bruxa',
        author: 'Pedro Paulo',
        time: '22 min',
        distance: '0,8km',
        difficulty: 'Difícil',
        image: require('../assets/trilhas/cabeca-bruxa.jpg'),
      },
    ],
    sharedPhotos: [
      { id: 'sp1', image: require('../assets/trilhas/vale-perdido.jpg') },
      { id: 'sp2', image: require('../assets/trilhas/cabeca-bruxa.jpg') },
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
    coverImage: require('../assets/trilhas/cabeca-bruxa.jpg'),
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
        image: require('../assets/trilhas/cabeca-bruxa.jpg'),
      },
    ],
    sharedPhotos: [
      { id: 'sp1', image: require('../assets/trilhas/cabeca-bruxa.jpg') },
      { id: 'sp2', image: require('../assets/trilhas/lemos.jpg') },
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

// Perfil padrão para retrocompatibilidade
export const MOCK_GUIDE_PROFILE = MOCK_GUIDES_LIST[0];

/**
 * Função utilitária para buscar um guia por ID
 */
export function getGuideById(guideId) {
  if (!guideId) return MOCK_GUIDE_PROFILE;
  return MOCK_GUIDES_LIST.find((g) => g.id === guideId) || MOCK_GUIDE_PROFILE;
}
