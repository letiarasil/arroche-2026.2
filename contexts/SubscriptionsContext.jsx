import React, { createContext, useState, useContext } from 'react';

const SubscriptionsContext = createContext();

const INITIAL_SCHEDULED = [
  {
    id: 'f1',
    trailId: 'f1',
    title: 'Trilha do Lemos',
    date: '27/10/2026',
    guideName: 'Raissa Mara',
    guideRole: 'Guia profissional',
    guideAvatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80',
    coverImage: require('../assets/trilhas/lemos.jpg'),
    status: 'agendada',
    borderColor: '#2E7D32',
  },
];

const INITIAL_HISTORY = [
  {
    id: 'hist-galinha-choca',
    trailId: 'hist-galinha-choca',
    title: 'Trilha da Galinha Choca',
    date: '10/07/2026',
    guideName: 'Luiz Martins',
    guideRole: 'Guia profissional',
    guideAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    coverImage: require('../assets/trilhas/cabeca-bruxa.jpg'),
    status: 'concluida',
    borderColor: '#78350F',
  },
];

export const SubscriptionsProvider = ({ children }) => {
  const [scheduledTrails, setScheduledTrails] = useState(INITIAL_SCHEDULED);
  const [historyTrails, setHistoryTrails] = useState(INITIAL_HISTORY);

  const subscribeToTrail = (event, options = {}) => {
    if (!event) return;
    const trailId = event.id || event.trailId || `trail_${Date.now()}`;

    setScheduledTrails((prev) => {
      // Se já estiver na lista, apenas mantém ou atualiza
      const existingIndex = prev.findIndex(
        (item) => item.id === trailId || item.trailId === trailId
      );
      if (existingIndex >= 0) {
        return prev;
      }

      const newEntry = {
        id: trailId,
        trailId: trailId,
        title: event.title || 'Trilha',
        date: event.date || '27/10/2026',
        guideName:
          event.guide?.name ||
          (event.author ? event.author.replace('Riassa', 'Raissa') : 'Raissa Mara'),
        guideRole: event.guide?.role || 'Guia profissional',
        guideAvatar:
          event.guide?.avatar ||
          'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80',
        coverImage:
          event.coverImage ||
          event.image ||
          require('../assets/trilhas/lemos.jpg'),
        status: 'agendada',
        borderColor: '#2E7D32',
        ticketCount: options.ticketCount || 1,
        eventData: event,
      };

      return [newEntry, ...prev];
    });
  };

  const cancelSubscription = (trailId) => {
    if (!trailId) return;
    setScheduledTrails((prev) =>
      prev.filter((item) => item.id !== trailId && item.trailId !== trailId)
    );
  };

  const isSubscribed = (trailId) => {
    if (!trailId) return false;
    return scheduledTrails.some(
      (item) => item.id === trailId || item.trailId === trailId
    );
  };

  return (
    <SubscriptionsContext.Provider
      value={{
        scheduledTrails,
        historyTrails,
        subscribeToTrail,
        cancelSubscription,
        isSubscribed,
      }}
    >
      {children}
    </SubscriptionsContext.Provider>
  );
};

export const useSubscriptions = () => useContext(SubscriptionsContext);
