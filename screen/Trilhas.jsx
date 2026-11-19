import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { MOCK_TRAILS } from '../constants/mockTrails';
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
  const [savedTrails, setSavedTrails] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulties, setSelectedDifficulties] = useState([]);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  // Alterna o salvamento de uma trilha
  const toggleSave = (id) => {
    setSavedTrails((prev) => ({ ...prev, [id]: !prev[id] }));
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

  // Filtra as trilhas combinando busca por nome e filtro de dificuldade
  const filteredSections = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const hasDiffFilter = selectedDifficulties.length > 0;

    const filterList = (list, diffLabel) => {
      // Se houver filtro de dificuldade e este grupo não estiver selecionado, oculta
      if (hasDiffFilter && !selectedDifficulties.includes(diffLabel)) {
        return [];
      }
      // Se houver busca por texto, filtra pelo nome da trilha
      if (!query) {
        return list;
      }
      return list.filter((trail) =>
        trail.title.toLowerCase().includes(query)
      );
    };

    return {
      facil: filterList(MOCK_TRAILS.facil, 'Fácil'),
      medio: filterList(MOCK_TRAILS.medio, 'Médio'),
      dificil: filterList(MOCK_TRAILS.dificil, 'Difícil'),
    };
  }, [searchQuery, selectedDifficulties]);

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

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header com Logo e Sino */}
        <HeaderWithBell onBellPress={() => {}} />

        {/* Search Bar com botão de filtro funcional */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Pesquisar por trilhas"
          onFilterPress={() => setIsFilterModalVisible(true)}
        />

        {/* Pílulas / Chips de Dificuldade da Referência 1 */}
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
          onSelectTab={setActiveTab}
        />

        {/* Seção Fácil */}
        {renderSection('Fácil', filteredSections.facil)}

        {/* Replant Banner (exibido quando não há filtro vazio de fácil ou no fluxo padrão) */}
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
