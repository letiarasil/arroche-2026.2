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
  TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
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
import FilterModal from '../components/FilterModal';
import Menu from '../components/Menu';

const TABS = [
  { id: 'disponiveis', label: 'Trilhas Disponíveis' },
  { id: 'minhas', label: 'Minhas Trilhas' },
];

const DIFFICULTY_OPTIONS = ['Fácil', 'Médio', 'Difícil'];

export default function Trilhas({ navigation }) {
  const [activeTab, setActiveTab] = useState('disponiveis');
  const [savedTrails, setSavedTrails] = useState({}); // Mapeamento { [trailId]: true/false }
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulties, setSelectedDifficulties] = useState([]);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
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
      const [firestoreTrails, savedIds] = await Promise.all([
        getActiveTrails(),
        userId ? getUserSavedTrailIds(userId) : Promise.resolve([]),
      ]);

      const savedMap = (savedIds || []).reduce((acc, id) => {
        acc[id] = true;
        return acc;
      }, {});
      setSavedTrails(savedMap);

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

  // Alterna a seleção rápida de uma dificuldade via pills
  const toggleDifficultyPill = (diff) => {
    setSelectedDifficulties((prev) =>
      prev.includes(diff) ? prev.filter((d) => d !== diff) : [...prev, diff]
    );
  };

  // Limpa todos os filtros e a busca
  const handleClearFilters = () => {
    setSelectedDifficulties([]);
    setSearchQuery('');
  };

  // Filtra os dados reais do Firestore combinando busca por texto e dificuldade
  const filteredSections = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const hasDiffFilter = selectedDifficulties.length > 0;

    const filterList = (list, diffLabel) => {
      if (hasDiffFilter && !selectedDifficulties.includes(diffLabel)) {
        return [];
      }
      if (!query) {
        return list;
      }
      return list.filter(
        (item) =>
          item.title?.toLowerCase().includes(query) ||
          item.location?.toLowerCase().includes(query) ||
          item.name?.toLowerCase().includes(query)
      );
    };

    return {
      facil: filterList(trailsData.facil, 'Fácil'),
      medio: filterList(trailsData.medio, 'Médio'),
      dificil: filterList(trailsData.dificil, 'Difícil'),
    };
  }, [trailsData, searchQuery, selectedDifficulties]);

  const totalResults =
    filteredSections.facil.length +
    filteredSections.medio.length +
    filteredSections.dificil.length;

  const isFiltered = searchQuery.trim().length > 0 || selectedDifficulties.length > 0;

  const renderSection = (title, data) => {
    if (!data || data.length === 0) return null;

    return (
      <View key={title} style={styles.sectionContainer}>
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
        {/* Header com Logo e Sino */}
        <HeaderWithBell onBellPress={() => navigation?.navigate('Notificacoes')} />

        {/* Search Bar com botão de filtro funcional */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Pesquisar por trilhas"
          onFilterPress={() => setIsFilterModalVisible(true)}
        />

        {/* Pílulas / Chips de Dificuldade */}
        <View style={styles.difficultyPillsRow}>
          {DIFFICULTY_OPTIONS.map((diff) => {
            const isSelected = selectedDifficulties.includes(diff);
            return (
              <TouchableOpacity
                key={diff}
                style={[
                  styles.difficultyPill,
                  isSelected && styles.difficultyPillSelected,
                ]}
                onPress={() => toggleDifficultyPill(diff)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.difficultyPillText,
                    isSelected && styles.difficultyPillTextSelected,
                  ]}
                >
                  {diff}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Sub Header Tabs (Disponíveis / Minhas) */}
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
            {/* Seção Fácil */}
            {renderSection('Fácil', filteredSections.facil)}

            {/* Replant Banner */}
            {(!isFiltered || filteredSections.facil.length > 0) && (
              <ReplantBanner onPress={() => {}} />
            )}

            {/* Seção Médio */}
            {renderSection('Médio', filteredSections.medio)}

            {/* Seção Difícil */}
            {renderSection('Difícil', filteredSections.dificil)}

            {/* Estado Vazio quando nenhum resultado for encontrado */}
            {totalResults === 0 && (
              <View style={styles.emptyContainer}>
                <Feather name="search" size={38} color="#9CA3AF" style={styles.emptyIcon} />
                <Text style={styles.emptyTitle}>Nenhuma trilha encontrada</Text>
                <Text style={styles.emptyDescription}>
                  Não encontramos trilhas que correspondam aos filtros ou termos buscados.
                </Text>
                {isFiltered && (
                  <TouchableOpacity
                    style={styles.clearFilterButton}
                    onPress={handleClearFilters}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.clearFilterButtonText}>Limpar filtros</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </>
        )}

        {/* Footer Logo Banner */}
        <FooterLogoBanner />
      </ScrollView>

      {/* Modal / Bottom Sheet de Filtros */}
      <FilterModal
        visible={isFilterModalVisible}
        selectedDifficulties={selectedDifficulties}
        onApply={(diffs) => setSelectedDifficulties(diffs)}
        onClear={() => setSelectedDifficulties([])}
        onClose={() => setIsFilterModalVisible(false)}
      />

      {/* Menu Bar at Bottom */}
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
  difficultyPillsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 10,
    marginTop: -2,
  },
  difficultyPill: {
    paddingHorizontal: 22,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  difficultyPillSelected: {
    borderColor: colors.primary,
    backgroundColor: '#EBF3ED',
  },
  difficultyPillText: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '500',
  },
  difficultyPillTextSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  sectionContainer: {
    marginBottom: 6,
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
  emptyIcon: {
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  clearFilterButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  clearFilterButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});