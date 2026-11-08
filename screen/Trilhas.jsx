import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Platform,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { colors } from '../constants/colors';
import { getActiveTrails } from '../services/trailService';
import { toggleSaveTrailInFirestore, getUserSavedTrailIds } from '../services/userService';
import HeaderWithBell from '../components/HeaderWithBell';
import SearchBar from '../components/SearchBar';
import TabSelector from '../components/TabSelector';
import TrailCard from '../components/TrailCard';
import ReplantBanner from '../components/ReplantBanner';
import FooterLogoBanner from '../components/FooterLogoBanner';
import Menu from '../components/Menu';

const TABS = [
  { id: 'disponiveis', label: 'Trilhas Disponíveis' },
  { id: 'minhas', label: 'Minhas Trilhas' },
];

export default function Trilhas({ navigation }) {
  const [activeTab, setActiveTab] = useState('disponiveis');
  const [savedTrails, setSavedTrails] = useState({}); // Mapeamento { [trailId]: true/false }
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Obtém a instância e UID do usuário autenticado
  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  const [trailsData, setTrailsData] = useState({
    facil: [],
    medio: [],
    dificil: [],
  });

  // Busca as trilhas ativas e os IDs favoritados pelo usuário do Firestore
  const loadData = useCallback(async (isPullToRefresh = false) => {
    if (!isPullToRefresh) setLoading(true);

    try {
      // Executa busca paralela das trilhas ativas e dos IDs salvos
      const [firestoreTrails, savedIds] = await Promise.all([
        getActiveTrails(),
        userId ? getUserSavedTrailIds(userId) : Promise.resolve([]),
      ]);

      // Converte a lista de IDs de favoritos em um mapa para leitura rápida
      const savedMap = (savedIds || []).reduce((acc, id) => {
        acc[id] = true;
        return acc;
      }, {});
      setSavedTrails(savedMap);

      // Separa as trilhas por nível de dificuldade
      if (firestoreTrails) {
        const facil = [];
        const medio = [];
        const dificil = [];

        firestoreTrails.forEach((t) => {
          const diff = (t.difficulty || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');

          if (diff.includes('dificil')) {
            dificil.push(t);
          } else if (diff.includes('medio')) {
            medio.push(t);
          } else {
            // Padrão Fácil para garantir que todas as trilhas criadas apareçam
            facil.push(t);
          }
        });

        setTrailsData({ facil, medio, dificil });
      }
    } catch (err) {
      console.error('Erro ao carregar dados do Firestore:', err?.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  // Recarrega sempre que a tela ganha foco (ex: volta após cadastro pelo guia)
  useEffect(() => {
    const unsubscribe = navigation?.addListener?.('focus', () => {
      loadData(true);
    });
    return unsubscribe;
  }, [navigation, loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData(true);
  }, [loadData]);

  // Função para favoritar/desfavoritar com persistência no Firestore
  const toggleSave = async (id) => {
    if (!userId) {
      Alert.alert('Atenção', 'Você precisa estar autenticado para favoritar trilhas.');
      return;
    }

    const isCurrentlySaved = !!savedTrails[id];

    // 1. Atualização Otimista da Interface
    setSavedTrails((prev) => ({
      ...prev,
      [id]: !isCurrentlySaved,
    }));

    try {
      // 2. Persiste a alteração no Firestore do Usuário
      await toggleSaveTrailInFirestore(userId, id, isCurrentlySaved);
    } catch (error) {
      // Reverte o estado na UI caso falhe
      setSavedTrails((prev) => ({
        ...prev,
        [id]: isCurrentlySaved,
      }));
      Alert.alert('Erro', 'Não foi possível salvar a trilha no momento.');
      console.error('Erro ao salvar no Firestore:', error);
    }
  };

  const filterTrails = (trailsList) => {
    if (!searchQuery.trim()) return trailsList;
    const query = searchQuery.toLowerCase();
    return trailsList.filter(
      (item) =>
        item.title?.toLowerCase().includes(query) ||
        item.location?.toLowerCase().includes(query) ||
        item.name?.toLowerCase().includes(query)
    );
  };

  const filteredFacil = useMemo(() => filterTrails(trailsData.facil), [trailsData.facil, searchQuery]);
  const filteredMedio = useMemo(() => filterTrails(trailsData.medio), [trailsData.medio, searchQuery]);
  const filteredDificil = useMemo(() => filterTrails(trailsData.dificil), [trailsData.dificil, searchQuery]);

  const renderSection = (title, data) => {
    if (!data || data.length === 0) return null;

    return (
      <View key={title}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScrollContent}
        >
          {data.map((item) => (
            <TrailCard
              key={item.id}
              item={item}
              isSaved={!!savedTrails[item.id]}
              onToggleSave={toggleSave}
              onPressVerMais={(trailItem) =>
                navigation?.navigate('DetalhesEvento', {
                  eventId: trailItem.id,
                  item: trailItem,
                })
              }
            />
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary || '#2e7d32']}
          />
        }
      >
        <HeaderWithBell onBellPress={() => navigation?.navigate('Notificacoes')} />

        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Pesquisar por trilhas"
          onFilterPress={() => {}}
        />

        <TabSelector
          tabs={TABS}
          activeTab={activeTab}
          onSelectTab={(tabId) => {
            if (tabId === 'minhas') {
              navigation?.navigate('MinhasTrilhas');
            } else {
              setActiveTab(tabId);
            }
          }}
        />

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary || '#2e7d32'} />
          </View>
        ) : (
          <>
            {renderSection('Fácil', filteredFacil)}
            <ReplantBanner onPress={() => {}} />
            {renderSection('Médio', filteredMedio)}
            {renderSection('Difícil', filteredDificil)}
          </>
        )}

        <FooterLogoBanner />
      </ScrollView>

      <Menu activeTab="Trilhas" navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 20 : 40,
  },
  scrollView: {
    flex: 1,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  horizontalScrollContent: {
    paddingLeft: 20,
    paddingRight: 8,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});