import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  StatusBar,
  Platform,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { auth } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import {
  getTrailById,
  getTrailSubscriptions,
  listenTrailSubscriptions,
  toggleParticipantAttendance,
  getTrailQuestions,
  addTrailQuestion,
  cancelGuideTrail,
} from '../services/trailService';
import { resolveTrailImage } from '../services/trailImages';
import MenuGuia from '../components/MenuGuia';
import TabSelector from '../components/TabSelector';

const TABS = [
  { id: 'trilha', label: 'Trilha' },
  { id: 'inscricoes', label: 'Inscrições' },
];

export default function GerenciarTrilhaGuia({ navigation, route }) {
  const { user, userProfile, guideProfile } = useAuth();
  const guideId = user?.uid || auth.currentUser?.uid;

  const routeParams = route?.params || {};
  const trailId = routeParams.trailId || routeParams.eventId || routeParams.item?.id;
  const initialItem = routeParams.item;

  const [activeTab, setActiveTab] = useState(routeParams.initialTab || 'trilha');
  const [trail, setTrail] = useState(initialItem || null);
  const [loading, setLoading] = useState(!initialItem);

  // Inscrições / Participantes dinâmicos do Firestore
  const [subscriptions, setSubscriptions] = useState([]);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(true);

  // Quadro de Avisos / Perguntas
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSendingComment, setIsSendingComment] = useState(false);

  const mainScrollRef = useRef(null);

  // Carrega os dados da trilha, inscrições e perguntas do Firestore
  const loadData = useCallback(async () => {
    if (!trailId) return;

    try {
      // 1. Busca dados da trilha
      const fetchedTrail = await getTrailById(trailId);
      if (fetchedTrail) {
        setTrail(fetchedTrail);
      }

      // 2. Busca inscrições reais do Firestore
      const fetchedSubs = await getTrailSubscriptions(trailId);
      setSubscriptions(fetchedSubs || []);

      // 3. Busca perguntas do quadro
      const fetchedQuestions = await getTrailQuestions(trailId);
      if (fetchedQuestions && fetchedQuestions.length > 0) {
        setComments(fetchedQuestions);
      } else if (fetchedTrail?.comments) {
        setComments(fetchedTrail.comments);
      }
    } catch (err) {
      console.warn('Erro ao carregar dados da trilha:', err?.message);
    } finally {
      setLoading(false);
      setLoadingSubscriptions(false);
    }
  }, [trailId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Listener em tempo real para Inscrições e Lista de Frequência no Firestore
  useEffect(() => {
    if (!trailId) return;

    setLoadingSubscriptions(true);
    const unsubscribe = listenTrailSubscriptions(
      trailId,
      (subsList) => {
        setSubscriptions(subsList || []);
        setLoadingSubscriptions(false);
      },
      (error) => {
        console.warn('Erro na sincronização da lista de inscritos:', error?.message);
        setLoadingSubscriptions(false);
      }
    );

    return () => unsubscribe();
  }, [trailId]);

  // Alternar presença do participante na Lista de Frequência
  const handleToggleAttendance = async (participantId, currentPresent) => {
    const nextPresent = !currentPresent;

    // Atualização otimista na tela do guia
    setSubscriptions((prev) =>
      prev.map((p) => (p.id === participantId ? { ...p, present: nextPresent } : p))
    );

    try {
      await toggleParticipantAttendance(trailId, participantId, nextPresent);
    } catch (err) {
      // Reverte estado em caso de falha
      setSubscriptions((prev) =>
        prev.map((p) => (p.id === participantId ? { ...p, present: currentPresent } : p))
      );
      Alert.alert('Erro', 'Não foi possível salvar o status de presença.');
    }
  };

  // Enviar nova mensagem no Quadro de Avisos
  const handleSendComment = async () => {
    const textTrimmed = newComment.trim();
    if (!textTrimmed || !trailId) return;

    const senderName = guideProfile?.name || userProfile?.name || 'Guia';

    setIsSendingComment(true);
    try {
      const added = await addTrailQuestion(trailId, {
        userName: senderName,
        text: textTrimmed,
      });

      setComments((prev) => [...prev, added]);
      setNewComment('');
      Keyboard.dismiss();
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível enviar a mensagem no quadro.');
    } finally {
      setIsSendingComment(false);
    }
  };

  // Botão Cancelar Trilha (evita exclusões acidentais com confirmação)
  const handleConfirmCancelTrail = () => {
    Alert.alert(
      'Cancelar Trilha',
      'Tem certeza que deseja cancelar esta trilha? Ela não aparecerá mais como ativa e os participantes serão notificados.',
      [
        { text: 'Não, manter', style: 'cancel' },
        {
          text: 'Sim, cancelar trilha',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelGuideTrail(trailId, guideId);
              Alert.alert('Trilha Cancelada', 'A trilha foi cancelada com sucesso.', [
                {
                  text: 'OK',
                  onPress: () => navigation?.navigate('HomeGuia'),
                },
              ]);
            } catch (err) {
              Alert.alert('Erro', err?.message || 'Não foi possível cancelar a trilha.');
            }
          },
        },
      ]
    );
  };

  // Botão Editar
  const handleGoToEdit = () => {
    navigation?.navigate('EditarEventoGuia', {
      trailId,
      item: trail,
    });
  };

  if (loading || !trail) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Carregando informações da trilha...</Text>
      </View>
    );
  }

  const coverSource = resolveTrailImage(trail.coverImageKey || trail.imageKey || trail.coverImage || trail.image);
  const guideDisplayName = trail.guideName || guideProfile?.name || userProfile?.name || 'João Lucas';
  const totalCapacity = trail.capacity || trail.totalSpots || 12;
  const totalBookedSpots = subscriptions.reduce(
    (sum, s) => sum + (parseInt(s.ticketCount, 10) || 1),
    0
  );
  const filledCount = subscriptions.length > 0 ? totalBookedSpots : (trail.filledSpots || 0);
  const presentCount = subscriptions.filter((s) => s.present).length;
  const priceDisplay = trail.formattedPrice || (trail.price ? `R$ ${Number(trail.price).toFixed(2).replace('.', ',')}` : 'R$ 10,00');

  return (
    <View style={styles.screenContainer}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={mainScrollRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header com Foto de Capa da Trilha */}
          <View style={styles.heroContainer}>
            <Image source={coverSource} style={styles.heroImage} resizeMode="cover" />

            {/* Botão circular de fechar (X) no topo direito */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                if (navigation?.canGoBack()) {
                  navigation.goBack();
                } else {
                  navigation.navigate('HomeGuia');
                }
              }}
              activeOpacity={0.8}
            >
              <Feather name="x" size={20} color="#111827" />
            </TouchableOpacity>
          </View>

          {/* Cartão Branco Sobreposto */}
          <View style={styles.sheetCard}>
            {/* Seletor de Abas: Trilha | Inscrições */}
            <TabSelector
              tabs={TABS}
              activeTab={activeTab}
              onSelectTab={setActiveTab}
            />

            {/* ======================================================== */}
            {/* ABA 1: TRILHA */}
            {/* ======================================================== */}
            {activeTab === 'trilha' && (
              <View style={styles.tabContent}>
                {/* Nome da Trilha */}
                <Text style={styles.trailTitle}>{trail.title || trail.name}</Text>

                {/* Identificação do Guia */}
                <View style={styles.guideRow}>
                  <View style={styles.guideAvatar}>
                    <Feather name="user" size={14} color="#FFFFFF" />
                  </View>
                  <Text style={styles.guideNameText}>
                    {guideDisplayName} - Guia profissional
                  </Text>
                </View>

                {/* Seção Descrição */}
                <Text style={styles.sectionHeaderGreen}>Descrição</Text>
                <Text style={styles.descriptionText}>
                  {trail.description ||
                    'A Trilha do Sítio Lemos (ou Trilha da Julieta) é um percurso curto, de fácil acesso e ideal para iniciantes, localizado na zona urbana de Quixadá (CE), a cerca de dois quilômetros do centro e com início próximo ao Remanso da Paz.'}
                </Text>

                {/* Seção Local de Saída */}
                <Text style={styles.sectionHeaderGreen}>Local de Saída</Text>
                <Text style={styles.locationText}>
                  {trail.departureLocation || 'Praça José de Barros, Quixadá-CE'}
                </Text>

                {/* Linha com 4 Metadados: Data, Horário, Duração, Distância */}
                <View style={styles.statsRow}>
                  <View style={styles.statCol}>
                    <Text style={styles.statLabel}>Data</Text>
                    <Text style={styles.statValue}>{trail.date || '27/10/2026'}</Text>
                  </View>

                  <View style={styles.statCol}>
                    <Text style={styles.statLabel}>Horário de saída</Text>
                    <Text style={styles.statValue}>{trail.departureTime || '07:00 AM'}</Text>
                  </View>

                  <View style={styles.statCol}>
                    <Text style={styles.statLabel}>Duração</Text>
                    <Text style={styles.statValue}>{trail.duration || trail.time || '22 min'}</Text>
                  </View>

                  <View style={styles.statCol}>
                    <Text style={styles.statLabel}>Distância</Text>
                    <Text style={styles.statValue}>{trail.distance || '1,5 Km'}</Text>
                  </View>
                </View>

                {/* Galeria de Fotos */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.galleryScroll}
                >
                  <TouchableOpacity
                    style={styles.galleryUploadBox}
                    activeOpacity={0.8}
                    onPress={handleGoToEdit}
                  >
                    <Feather name="upload" size={24} color="#9CA3AF" />
                  </TouchableOpacity>

                  <Image
                    source={coverSource}
                    style={styles.galleryImage}
                    resizeMode="cover"
                  />
                </ScrollView>

                {/* Seção Quadro de Avisos / Perguntas */}
                <Text style={[styles.sectionHeaderGreen, { marginTop: 18 }]}>
                  Quadro de Avisos/ Perguntas
                </Text>

                {comments.length === 0 ? (
                  <Text style={styles.emptyCommentsText}>
                    Nenhuma mensagem registrada no quadro ainda.
                  </Text>
                ) : (
                  comments.map((c, index) => (
                    <View key={c.id || index} style={styles.commentRow}>
                      <View style={styles.commentAvatar}>
                        <Feather name="user" size={16} color={colors.primary} />
                      </View>
                      <View style={styles.commentBody}>
                        <Text style={styles.commentAuthor}>{c.userName || c.name || 'Aventureiro'}</Text>
                        <Text style={styles.commentText}>{c.text}</Text>
                      </View>
                    </View>
                  ))
                )}

                {/* Campo para digitar e enviar mensagens */}
                <View style={styles.commentInputBox}>
                  <TextInput
                    style={styles.commentInput}
                    placeholder="Digite..."
                    placeholderTextColor="#9CA3AF"
                    value={newComment}
                    onChangeText={setNewComment}
                    onSubmitEditing={handleSendComment}
                  />
                  <TouchableOpacity
                    style={styles.sendButton}
                    onPress={handleSendComment}
                    activeOpacity={0.7}
                    disabled={isSendingComment || !newComment.trim()}
                  >
                    {isSendingComment ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                      <Feather
                        name="send"
                        size={18}
                        color={newComment.trim() ? colors.primary : '#9CA3AF'}
                      />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* ======================================================== */}
            {/* ABA 2: INSCRIÇÕES E LISTA DE FREQUÊNCIA */}
            {/* ======================================================== */}
            {activeTab === 'inscricoes' && (
              <View style={styles.tabContent}>
                {/* Cabeçalho da Lista de Frequência com Indicador de Tempo Real */}
                <View style={styles.frequenciaHeader}>
                  <View>
                    <Text style={styles.vagasTitle}>Lista de Frequência</Text>
                    <Text style={styles.frequenciaSubtitle}>
                      Controle e conferência de aventureiros em tempo real
                    </Text>
                  </View>
                  <View style={styles.liveBadge}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveText}>Ao vivo</Text>
                  </View>
                </View>

                {/* Métricas da Lista de Frequência */}
                <View style={styles.frequenciaMetricsGrid}>
                  <View style={styles.metricCard}>
                    <Text style={styles.metricNumber}>{filledCount}/{totalCapacity}</Text>
                    <Text style={styles.metricLabel}>Vagas Ocupadas</Text>
                  </View>
                  <View style={styles.metricCard}>
                    <Text style={styles.metricNumber}>{subscriptions.length}</Text>
                    <Text style={styles.metricLabel}>Inscritos</Text>
                  </View>
                  <View style={styles.metricCard}>
                    <Text style={[styles.metricNumber, { color: '#2E7D32' }]}>{presentCount}</Text>
                    <Text style={styles.metricLabel}>Presentes</Text>
                  </View>
                </View>

                {/* Divisor */}
                <View style={styles.horizontalDivider} />

                {/* Lista de Pessoas Inscritas (Carregadas do Firebase em Tempo Real) */}
                {loadingSubscriptions ? (
                  <View style={{ paddingVertical: 30, alignItems: 'center' }}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={styles.loadingText}>Sincronizando participantes...</Text>
                  </View>
                ) : subscriptions.length === 0 ? (
                  <View style={styles.emptySubscriptionsContainer}>
                    <Feather name="users" size={38} color="#9CA3AF" />
                    <Text style={styles.emptySubsTitle}>Nenhum participante inscrito</Text>
                    <Text style={styles.emptySubsSubtitle}>
                      Assim que os aventureiros se inscreverem nesta trilha pelo app, os nomes aparecerão aqui em tempo real.
                    </Text>
                  </View>
                ) : (
                  subscriptions.map((participant) => {
                    const isPresent = Boolean(participant.present);
                    const spots = participant.ticketCount || 1;

                    return (
                      <View key={participant.id} style={styles.participantCard}>
                        <View style={styles.participantAvatarWrapper}>
                          {participant.avatar ? (
                            <Image
                              source={{ uri: participant.avatar }}
                              style={styles.participantAvatarImg}
                            />
                          ) : (
                            <Feather name="user" size={18} color={colors.primary} />
                          )}
                        </View>

                        <View style={styles.participantInfo}>
                          <Text style={styles.participantName}>{participant.name || 'Aventureiro'}</Text>
                          <Text style={styles.participantEmail} numberOfLines={1}>
                            {participant.email || 'Email não informado'}
                          </Text>
                          <View style={styles.participantBadgesRow}>
                            <View style={styles.spotsBadge}>
                              <Feather name="tag" size={10} color="#2E7D32" style={{ marginRight: 3 }} />
                              <Text style={styles.spotsBadgeText}>
                                {spots} vaga{spots > 1 ? 's' : ''}
                              </Text>
                            </View>
                            <View style={styles.statusConfirmadoBadge}>
                              <Text style={styles.statusConfirmadoText}>Confirmada</Text>
                            </View>
                          </View>
                        </View>

                        {/* Botão de Marcar / Desmarcar Presença para o Guia */}
                        <TouchableOpacity
                          style={[
                            styles.attendanceBtn,
                            isPresent && styles.attendanceBtnPresent,
                          ]}
                          activeOpacity={0.75}
                          onPress={() => handleToggleAttendance(participant.id, isPresent)}
                        >
                          <Feather
                            name={isPresent ? 'check-circle' : 'circle'}
                            size={14}
                            color={isPresent ? '#FFFFFF' : '#4B5563'}
                            style={{ marginRight: 4 }}
                          />
                          <Text
                            style={[
                              styles.attendanceBtnText,
                              isPresent && styles.attendanceBtnTextPresent,
                            ]}
                          >
                            {isPresent ? 'Presente' : 'Check-in'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })
                )}
              </View>
            )}

            {/* BOTÕES DE AÇÃO: EDITAR e CANCELAR (Presentes em ambas as abas) */}
            <View style={styles.actionButtonsRow}>
              {/* Botão Editar */}
              <TouchableOpacity
                style={styles.editActionButton}
                onPress={handleGoToEdit}
                activeOpacity={0.88}
              >
                <Feather name="edit-2" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.editActionText}>Editar</Text>
              </TouchableOpacity>

              {/* Botão Cancelar */}
              <TouchableOpacity
                style={styles.cancelActionButton}
                onPress={handleConfirmCancelTrail}
                activeOpacity={0.88}
              >
                <Feather name="x" size={16} color="#DC2626" style={{ marginRight: 4 }} />
                <Text style={styles.cancelActionText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Menu Inferior do Guia */}
      <MenuGuia activeTab="Trilhas" navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  heroContainer: {
    width: '100%',
    height: 250,
    position: 'relative',
    backgroundColor: '#E5E7EB',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'android' ? (StatusBar.currentHeight || 20) + 12 : 46,
    right: 18,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },
  sheetCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -30,
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  tabContent: {
    marginTop: 8,
  },
  trailTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  guideRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  guideAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  guideNameText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  sectionHeaderGreen: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 12.5,
    lineHeight: 18,
    color: '#374151',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 13,
    color: '#111827',
    marginBottom: 14,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginBottom: 14,
  },
  statCol: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#111827',
  },
  galleryScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  galleryUploadBox: {
    width: 130,
    height: 120,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },
  galleryImage: {
    width: 140,
    height: 120,
    borderRadius: 12,
  },
  emptyCommentsText: {
    fontSize: 13,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginVertical: 8,
  },
  commentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 6,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EBF3ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  commentBody: {
    flex: 1,
  },
  commentAuthor: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#111827',
  },
  commentText: {
    fontSize: 12,
    color: '#374151',
    marginTop: 1,
  },
  commentInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    marginTop: 10,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  commentInput: {
    flex: 1,
    fontSize: 13,
    color: '#111827',
  },
  sendButton: {
    padding: 6,
  },
  /* ABA 2: Inscrições e Lista de Frequência */
  frequenciaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  frequenciaSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
    marginRight: 5,
  },
  liveText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
  },
  frequenciaMetricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 8,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  metricNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  metricLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '500',
  },
  vagasTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  inscricoesMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metaSubLabel: {
    fontSize: 12.5,
    color: '#4B5563',
    fontWeight: '600',
  },
  metaSubValue: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '700',
    marginTop: 2,
  },
  horizontalDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 16,
  },
  participantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  participantAvatarWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#EBF3ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  participantAvatarImg: {
    width: '100%',
    height: '100%',
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  participantEmail: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  participantBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  spotsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  spotsBadgeText: {
    fontSize: 11,
    color: '#374151',
    fontWeight: '600',
  },
  statusConfirmadoBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusConfirmadoText: {
    fontSize: 10.5,
    color: '#15803D',
    fontWeight: '700',
  },
  attendanceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
  attendanceBtnPresent: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  attendanceBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  attendanceBtnTextPresent: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  emptySubscriptionsContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  emptySubsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginTop: 10,
  },
  emptySubsSubtitle: {
    fontSize: 12.5,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  /* BOTÕES DE AÇÃO: EDITAR e CANCELAR */
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
    marginBottom: 10,
  },
  editActionButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 10,
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  editActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  cancelActionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#DC2626',
    borderRadius: 10,
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelActionText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '700',
  },
});
