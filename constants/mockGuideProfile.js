// constants/mockGuideProfile.js
// Modelo de dados fictícios para o Perfil do Guia Turístico (Backend-Ready)
// Endpoints correspondentes no backend para integração futura:
// - GET    /api/v1/guides/:id              -> Informações completas do guia
// - GET    /api/v1/guides/:id/trails       -> Trilhas sob responsabilidade do guia
// - GET    /api/v1/guides/:id/photos       -> Galeria de fotos do guia
// - GET    /api/v1/guides/:id/comments     -> Avaliações e comentários recebidos
// - POST   /api/v1/guides/:id/comments     -> Adicionar novo depoimento/experiência

export const MOCK_GUIDE_PROFILE = {
  id: 'g-01',
  name: 'João Lucas Silva',
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
    {
      id: 'sp1',
      image: require('../assets/trilhas/cabeca-bruxa.jpg'),
    },
    {
      id: 'sp2',
      image: require('../assets/trilhas/pedra-cruzeiro.jpg'),
    },
    {
      id: 'sp3',
      image: require('../assets/trilhas/vale-perdido.jpg'),
    },
    {
      id: 'sp4',
      image: require('../assets/trilhas/lemos.jpg'),
    },
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
};

