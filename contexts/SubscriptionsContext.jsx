import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc, arrayRemove } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { useAuth } from './AuthContext';
import { getTrailsByIds, cancelTrailSubscription } from '../services/trailService';

const SubscriptionsContext = createContext();

const INITIAL_SCHEDULED = [];
const INITIAL_HISTORY = [];

function mapTrailToScheduledEntry(event, ticketCount = 1) {
  const trailId = String(event.id || event.trailId);
  return {
    id: trailId,
    trailId,
    title: event.title || event.name || 'Trilha',
    date: event.date || '27/10/2026',
    guideName:
      event.guide?.name ||
      event.guideName ||
      (event.author ? event.author.replace('Riassa', 'Raissa') : 'Raissa Mara'),
    guideRole: event.guide?.role || 'Guia profissional',
    guideAvatar:
      event.guide?.avatar ||
      event.guideAvatar ||
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80',
    coverImage:
      event.coverImage ||
      event.image ||
      require('../assets/trilhas/lemos.jpg'),
    status: event.status || 'agendada',
    borderColor: '#2E7D32',
    ticketCount,
    eventData: { ...event, id: trailId },
  };
}

export const SubscriptionsProvider = ({ children }) => {
  const { user, isLoggedIn } = useAuth();
  const [scheduledTrails, setScheduledTrails] = useState(INITIAL_SCHEDULED);
  const [historyTrails, setHistoryTrails] = useState(INITIAL_HISTORY);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(false);

  const activeUserId = auth.currentUser?.uid || user?.uid || null;

  const refreshSubscriptions = useCallback(async () => {
    const uid = auth.currentUser?.uid || user?.uid || null;
    if (!uid || !isLoggedIn) {
      setScheduledTrails([]);
      setHistoryTrails([]);
      return;
    }

    setLoadingSubscriptions(true);
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      const enrolledIds = userSnap.exists() && Array.isArray(userSnap.data()?.enrolledTrails)
        ? Array.from(new Set(userSnap.data().enrolledTrails.map(String)))
        : [];

      if (enrolledIds.length === 0) {
        setScheduledTrails([]);
        return;
      }

      const trails = await getTrailsByIds(enrolledIds);
      const activeEntries = trails
        .filter((t) => t && t.status !== 'cancelada' && t.status !== 'concluida')
        .map((t) => mapTrailToScheduledEntry(t, 1));

      setScheduledTrails((prev) => {
        const merged = new Map();
        // Mantém informações locais extras (como ticketCount) se já existirem no estado
        prev.forEach((item) => {
          merged.set(String(item.id || item.trailId), item);
        });
        activeEntries.forEach((entry) => {
          const existing = merged.get(String(entry.id));
          merged.set(String(entry.id), {
            ...entry,
            ticketCount: existing?.ticketCount || entry.ticketCount || 1,
          });
        });
        // Filtra apenas os IDs que ainda estão em enrolledIds do banco
        return Array.from(merged.values()).filter((item) =>
          enrolledIds.includes(String(item.id || item.trailId))
        );
      });
    } catch (err) {
      console.warn('Erro ao carregar trilhas inscritas do usuário:', err?.message);
    } finally {
      setLoadingSubscriptions(false);
    }
  }, [user?.uid, isLoggedIn]);

  useEffect(() => {
    refreshSubscriptions();
  }, [activeUserId, isLoggedIn, refreshSubscriptions]);

  const subscribeToTrail = useCallback((event, options = {}) => {
    if (!event) return;
    const trailId = String(event.id || event.trailId || `trail_${Date.now()}`);

    setScheduledTrails((prev) => {
      const existingIndex = prev.findIndex(
        (item) => String(item.id) === trailId || String(item.trailId) === trailId
      );
      if (existingIndex >= 0) {
        return prev;
      }

      const newEntry = mapTrailToScheduledEntry(event, options.ticketCount || 1);
      return [newEntry, ...prev];
    });
  }, []);

  const cancelSubscription = useCallback(
    async (trailId, ticketCount = 1) => {
      if (!trailId) return;
      const targetId = String(trailId);

      setScheduledTrails((prev) =>
        prev.filter((item) => String(item.id) !== targetId && String(item.trailId) !== targetId)
      );

      const uid = auth.currentUser?.uid || user?.uid || null;
      if (uid) {
        try {
          const userRef = doc(db, 'users', uid);
          await setDoc(
            userRef,
            {
              enrolledTrails: arrayRemove(targetId),
            },
            { merge: true }
          );
        } catch (err) {
          console.warn('Erro ao remover trilha de enrolledTrails:', err?.message);
        }

        try {
          await cancelTrailSubscription(targetId, uid, ticketCount);
        } catch (_e) {}
      }
    },
    [user?.uid]
  );

  const isSubscribed = useCallback(
    (trailId) => {
      if (!trailId) return false;
      const targetId = String(trailId);
      return scheduledTrails.some(
        (item) => String(item.id) === targetId || String(item.trailId) === targetId
      );
    },
    [scheduledTrails]
  );

  return (
    <SubscriptionsContext.Provider
      value={{
        scheduledTrails,
        historyTrails,
        loadingSubscriptions,
        subscribeToTrail,
        cancelSubscription,
        isSubscribed,
        refreshSubscriptions,
      }}
    >
      {children}
    </SubscriptionsContext.Provider>
  );
};

export const useSubscriptions = () => useContext(SubscriptionsContext);