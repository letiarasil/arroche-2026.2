import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import HeaderWithBell from '../components/HeaderWithBell';
import SearchBar from '../components/SearchBar';
import TabSelector from '../components/TabSelector';
import Menu from '../components/Menu';
import { useSubscriptions } from '../contexts/SubscriptionsContext';

const TABS = [
  { id: 'disponiveis', label: 'Trilhas Disponíveis' },
  { id: 'minhas', label: 'Minhas Trilhas' },
];

export default function MinhasTrilhas({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const { scheduledTrails, historyTrails } = useSubscriptions();

  // Filtragem pela busca
  const filterQuery = searchQuery.trim().toLowerCase();

  const filteredScheduled = scheduledTrails.filter((trail) => {
    if (!filterQuery) return true;
    const matchTitle = trail.title?.toLowerCase().includes(filterQuery);
    const matchGuide = trail.guideName?.toLowerCase().includes(filterQuery);
    return matchTitle || matchGuide;
  });

  const filteredHistory = historyTrails.filter((trail) => {
    if (!filterQuery) return true;
    const matchTitle = trail.title?.toLowerCase().includes(filterQuery);
    const matchGuide = trail.guideName?.toLowerCase().includes(filterQuery);
    return matchTitle || matchGuide;
  });

  const handleOpenDetails = (item, isHistory = false) => {
    navigation?.navigate('DetalhesEvento', {
      eventId: item.id || item.trailId,
      item: item.eventData || item,
      isHistory: isHistory,
    });
  };

  const handleSelectTab = (tabId) => {
    if (tabId === 'disponiveis') {
      navigation?.navigate('Trilhas');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Superior com Logo e Notificações */}
        <HeaderWithBell onBellPress={() => navigation?.navigate('Notificacoes')} />

        {/* Barra de Pesquisa */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Pesquisar por trilhas"
          onFilterPress={() => {}}
        />

        {/* Abas Superiores (Trilhas Disponíveis | Minhas Trilhas) */}
        <TabSelector
          tabs={TABS}
          activeTab="minhas"
          onSelectTab={handleSelectTab}
        />

        {/* ============================================================ */}
        {/* SEÇÃO 1: AGENDADAS */}
        {/* ============================================================ */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Agendadas</Text>

          {filteredScheduled.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery
                  ? 'Nenhuma trilha encontrada.'
                  : 'Você não possui trilhas agendadas no momento.'}
              </Text>
              {!searchQuery && (
                <TouchableOpacity
                  style={styles.exploreButton}
                  onPress={() => navigation?.navigate('Trilhas')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.exploreButtonText}>Explorar Trilhas</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            filteredScheduled.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                activeOpacity={0.88}
                onPress={() => handleOpenDetails(item)}
              >
                {/* Cabeçalho do Card: Data */}
                <View style={styles.cardTop}>
                  <Text style={styles.dateLabel}>Data:</Text>
                  <Text style={styles.dateValue}>{item.date}</Text>
                </View>

                {/* Corpo do Card: Avatar do Guia + Informações da Trilha */}
                <View style={styles.cardBody}>
                  <View
                    style={[
                      styles.avatarWrapper,
                      { borderColor: item.borderColor || '#2E7D32' },
                    ]}
                  >
                    <Image
                      source={
                        typeof item.guideAvatar === 'string'
                          ? { uri: item.guideAvatar }
                          : item.guideAvatar
                      }
                      style={styles.avatarImage}
                    />
                  </View>

                  <View style={styles.trailInfo}>
                    <Text style={styles.trailTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.guideName} numberOfLines={1}>
                      Guia {item.guideName}
                    </Text>
                  </View>
                </View>

                {/* Linha Divisória Pontilhada */}
                <View style={styles.dashedDividerWrapper}>
                  <View style={styles.dashedDivider} />
                </View>

                {/* Rodapé do Card: Botão Detalhes com Chevron Verde */}
                <View style={styles.cardFooter}>
                  <Text style={styles.detailsGreenText}>Detalhes</Text>
                  <Feather name="chevron-right" size={18} color="#2E7D32" />
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* ============================================================ */}
        {/* SEÇÃO 2: HISTÓRICO */}
        {/* ============================================================ */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Histórico</Text>

          {filteredHistory.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery
                  ? 'Nenhum histórico encontrado.'
                  : 'Nenhum histórico de trilhas realizadas.'}
              </Text>
            </View>
          ) : (
            filteredHistory.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                activeOpacity={0.88}
                onPress={() => handleOpenDetails(item, true)}
              >
                {/* Cabeçalho do Card: Data */}
                <View style={styles.cardTop}>
                  <Text style={styles.dateLabel}>Data:</Text>
                  <Text style={styles.dateValue}>{item.date}</Text>
                </View>

                {/* Corpo do Card: Avatar do Guia + Informações da Trilha */}
                <View style={styles.cardBody}>
                  <View
                    style={[
                      styles.avatarWrapper,
                      { borderColor: item.borderColor || '#78350F' },
                    ]}
                  >
                    <Image
                      source={
                        typeof item.guideAvatar === 'string'
                          ? { uri: item.guideAvatar }
                          : item.guideAvatar
                      }
                      style={styles.avatarImage}
                    />
                  </View>

                  <View style={styles.trailInfo}>
                    <Text style={styles.trailTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.guideName} numberOfLines={1}>
                      Guia {item.guideName}
                    </Text>
                  </View>
                </View>

                {/* Linha Divisória Pontilhada */}
                <View style={styles.dashedDividerWrapper}>
                  <View style={styles.dashedDivider} />
                </View>

                {/* Rodapé do Card: Botão Detalhes com Chevron Cinza */}
                <View style={styles.cardFooter}>
                  <Text style={styles.detailsGrayText}>Detalhes</Text>
                  <Feather name="chevron-right" size={18} color="#6B7280" />
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Menu Inferior Fixo de Navegação */}
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
  scrollContent: {
    paddingBottom: 24,
  },
  sectionContainer: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    marginBottom: 18,
    // Sombra suave
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardTop: {
    marginBottom: 12,
  },
  dateLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  dateValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '700',
    marginTop: 2,
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    padding: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  avatarImage: {
    width: 37,
    height: 37,
    borderRadius: 18.5,
  },
  trailInfo: {
    marginLeft: 12,
    flex: 1,
  },
  trailTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },
  guideName: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  dashedDividerWrapper: {
    height: 1,
    overflow: 'hidden',
    marginBottom: 10,
  },
  dashedDivider: {
    height: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  detailsGreenText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2E7D32',
  },
  detailsGrayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  exploreButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
