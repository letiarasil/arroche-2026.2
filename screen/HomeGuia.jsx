import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { auth } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import {
  getGuideTrails,
  getGuideHistory,
} from '../services/trailService';
import HeaderWithBell from '../components/HeaderWithBell';
import SearchBar from '../components/SearchBar';
import TabSelector from '../components/TabSelector';
import GuideTrailCard from '../components/GuideTrailCard';
import MenuGuia from '../components/MenuGuia';

const TABS = [
  { id: 'cadastradas', label: 'Cadastradas' },
  { id: 'historico', label: 'Histórico' },
];

export default function HomeGuia({ navigation, route }) {
  const { user, userProfile, guideProfile, isGuide } = useAuth();

  // Proteção de rota para guias
  useEffect(() => {
    if (!isGuide) {
      Alert.alert(
        'Acesso Restrito',
        'Esta área é exclusiva para guias credenciados.',
        [
          {
            text: 'OK',
            onPress: () => {
              if (navigation?.canGoBack()) {
                navigation.goBack();
              } else {
                navigation?.replace('Trilhas');
              }
            },
          },
        ]
      );
    }
  }, [isGuide, navigation]);

  // Identificação do guia autenticado real
  const guideId = auth.currentUser?.uid || user?.uid;
  const guideName =
    guideProfile?.name ||
    userProfile?.name ||
    'Guia';

  // Estados principais
  const initialTab = route?.params?.initialTab || 'cadastradas';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [trails, setTrails] = useState([]);
  const [historyTrails, setHistoryTrails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Carrega as trilhas e o histórico do Firestore
  const loadGuideData = useCallback(async (isPullToRefresh = false) => {
    if (!guideId) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    if (!isPullToRefresh) setLoading(true);

    try {
      // Busca do Cloud Firestore as trilhas vinculadas exclusivamente a este guia autenticado
      const [fetchedTrails, fetchedHistory] = await Promise.all([
        getGuideTrails(guideId, guideName),
        getGuideHistory(guideId),
      ]);

      setTrails(fetchedTrails || []);
      setHistoryTrails(fetchedHistory || []);
    } catch (err) {
      console.error('Erro ao carregar dados do guia no Firestore:', err?.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [guideId, guideName]);

  // Recarrega sempre que a tela ganha foco (útil após cadastrar/editar/cancelar)
  useEffect(() => {
    const unsubscribe = navigation?.addListener?.('focus', () => {
      loadGuideData(true);
    });
    return unsubscribe;
  }, [navigation, loadGuideData]);

  useEffect(() => {
    loadGuideData();
  }, [loadGuideData]);

  // Atualiza via arrastar para baixo (Pull to Refresh)
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadGuideData(true);
  }, [loadGuideData]);

  // Filtra as trilhas cadastradas pela pesquisa
  const filteredTrails = useMemo(() => {
    if (!searchQuery.trim()) return trails;
    const q = searchQuery.toLowerCase().trim();
    return trails.filter(
      (t) =>
        t.title?.toLowerCase().includes(q) ||
        t.name?.toLowerCase().includes(q) ||
        t.difficulty?.toLowerCase().includes(q) ||
        t.departureLocation?.toLowerCase().includes(q)
    );
  }, [trails, searchQuery]);

  // Filtra os itens do histórico pela pesquisa
  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) return historyTrails;
    const q = searchQuery.toLowerCase().trim();
    return historyTrails.filter(
      (h) =>
        h.title?.toLowerCase().includes(q) ||
        h.guideName?.toLowerCase().includes(q) ||
        h.date?.toLowerCase().includes(q)
    );
  }, [historyTrails, searchQuery]);

  // Abrir tela de edição dedicada
  const handleOpenEdit = (item) => {
    navigation?.navigate('EditarEventoGuia', {
      trailId: item.id,
      item,
    });
  };

  // Abrir tela de gerenciamento e visualização da trilha do guia (NÃO a tela do trilheiro)
  const handleOpenDetails = (item, isHistory = false) => {
    navigation?.navigate('GerenciarTrilhaGuia', {
      trailId: item.id,
      item,
      isHistory,
    });
  };

  // Abrir tela de cadastro de evento
  const handleOpenCadastrarEvento = () => {
    navigation?.navigate('CadastrarEvento');
  };

  if (!isGuide) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header Superior com Logo e Notificações */}
      <HeaderWithBell onBellPress={() => navigation?.navigate('Notificacoes')} />

      {/* Barra de Pesquisa */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder={
          activeTab === 'cadastradas'
            ? 'Pesquisar minhas trilhas'
            : 'Pesquisar Histórico'
        }
        onFilterPress={() => {}}
      />

      {/* Seletor de Abas: Cadastradas | Histórico */}
      <TabSelector
        tabs={TABS}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Carregando trilhas do guia...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
            />
          }
        >
          {/* ======================================================== */}
          {/* ABA 1: CADASTRADAS (HOME DO GUIA) */}
          {/* ======================================================== */}
          {activeTab === 'cadastradas' && (
            <View style={styles.cadastradasContainer}>
              {filteredTrails.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Feather name="compass" size={42} color="#9CA3AF" />
                  <Text style={styles.emptyTitle}>
                    {searchQuery
                      ? 'Nenhuma trilha encontrada'
                      : 'Nenhuma trilha cadastrada ainda'}
                  </Text>
                  <Text style={styles.emptySubtitle}>
                    {searchQuery
                      ? 'Tente pesquisar por outros termos.'
                      : 'Cadastre sua primeira trilha para conectar-se com trilheiros!'}
                  </Text>
                  {!searchQuery && (
                    <TouchableOpacity
                      style={styles.emptyButton}
                      onPress={handleOpenCadastrarEvento}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.emptyButtonText}>+ Cadastrar Evento</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <View style={styles.gridContainer}>
                  {filteredTrails.map((item) => (
                    <GuideTrailCard
                      key={item.id}
                      item={item}
                      onEdit={handleOpenEdit}
                      onPress={(trail) => handleOpenDetails(trail, false)}
                    />
                  ))}
                </View>
              )}
            </View>
          )}

          {/* ======================================================== */}
          {/* ABA 2: HISTÓRICO */}
          {/* ======================================================== */}
          {activeTab === 'historico' && (
            <View style={styles.historyContainer}>
              {filteredHistory.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Feather name="clock" size={42} color="#9CA3AF" />
                  <Text style={styles.emptyTitle}>
                    {searchQuery
                      ? 'Nenhum histórico encontrado'
                      : 'Nenhum histórico registrado'}
                  </Text>
                  <Text style={styles.emptySubtitle}>
                    {searchQuery
                      ? 'Nenhum resultado para os termos pesquisados.'
                      : 'As trilhas e eventos já concluídos serão listados aqui.'}
                  </Text>
                </View>
              ) : (
                filteredHistory.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.historyCard}
                    activeOpacity={0.88}
                    onPress={() => handleOpenDetails(item, true)}
                  >
                    {/* Cabeçalho do Card: Data */}
                    <View style={styles.historyCardTop}>
                      <Text style={styles.historyDateLabel}>Data:</Text>
                      <Text style={styles.historyDateValue}>
                        {item.date || '27/10/2026'}
                      </Text>
                    </View>

                    {/* Corpo do Card: Miniatura Circular + Informações */}
                    <View style={styles.historyCardBody}>
                      <View
                        style={[
                          styles.historyAvatarWrapper,
                          { borderColor: item.borderColor || '#2E7D32' },
                        ]}
                      >
                        <Image
                          source={
                            typeof item.image === 'string'
                              ? { uri: item.image }
                              : item.image || { uri: 'https://via.placeholder.com/150' }
                          }
                          style={styles.historyAvatarImage}
                        />
                      </View>

                      <View style={styles.historyTrailInfo}>
                        <Text style={styles.historyTrailTitle} numberOfLines={1}>
                          {item.title || item.name}
                        </Text>
                        <Text style={styles.historyGuideName} numberOfLines={1}>
                          Guia {item.guideName || guideName}
                        </Text>
                      </View>
                    </View>

                    {/* Linha Divisória Pontilhada */}
                    <View style={styles.dashedDividerWrapper}>
                      <View style={styles.dashedDivider} />
                    </View>

                    {/* Rodapé do Card: Detalhes com Chevron Verde */}
                    <View style={styles.historyCardFooter}>
                      <Text style={styles.historyDetailsText}>Detalhes</Text>
                      <Feather name="chevron-right" size={18} color="#2E7D32" />
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}
        </ScrollView>
      )}

      {/* Botão Flutuante Centralizado: + Cadastrar Evento (Exibido na aba Cadastradas) */}
      {activeTab === 'cadastradas' && (
        <View style={styles.floatingButtonWrapper} pointerEvents="box-none">
          <TouchableOpacity
            style={styles.floatingButton}
            activeOpacity={0.88}
            onPress={handleOpenCadastrarEvento}
          >
            <Text style={styles.floatingButtonText}>+ Cadastrar Evento</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Menu Inferior do Guia */}
      <MenuGuia activeTab="Trilhas" navigation={navigation} />
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
    paddingBottom: 90,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  cadastradasContainer: {
    paddingHorizontal: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  historyContainer: {
    paddingHorizontal: 20,
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  historyCardTop: {
    marginBottom: 10,
  },
  historyDateLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  historyDateValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '700',
    marginTop: 2,
  },
  historyCardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  historyAvatarWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    padding: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  historyAvatarImage: {
    width: 37,
    height: 37,
    borderRadius: 18.5,
  },
  historyTrailInfo: {
    marginLeft: 12,
    flex: 1,
  },
  historyTrailTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },
  historyGuideName: {
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
  historyCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  historyDetailsText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2E7D32',
  },
  floatingButtonWrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 74 : 64,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
  },
  floatingButton: {
    backgroundColor: colors.primary,
    paddingVertical: 13,
    paddingHorizontal: 28,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  floatingButtonText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    padding: 32,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginTop: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13.5,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 19,
  },
  emptyButton: {
    marginTop: 18,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '600',
  },
});
