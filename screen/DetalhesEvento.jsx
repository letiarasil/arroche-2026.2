import React, { useState, useEffect } from 'react';
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
  Alert,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  BackHandler,
} from 'react-native';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { getEventDetails } from '../constants/mockEvents';
import Menu from '../components/Menu';

/**
 * Componente utilitário de Avatar com fallback automático caso a URL falhe
 * ou esteja sem conexão com a internet.
 */
function UserAvatar({ source, name = 'U', size = 36, style }) {
  const [hasError, setHasError] = useState(false);

  if (!source || hasError) {
    const initial = name ? name.charAt(0).toUpperCase() : '?';
    return (
      <View
        style={[
          styles.avatarFallback,
          { width: size, height: size, borderRadius: size / 2 },
          style,
        ]}
      >
        <Text style={[styles.avatarInitial, { fontSize: size * 0.42 }]}>
          {initial}
        </Text>
      </View>
    );
  }

  const imageSource = typeof source === 'string' ? { uri: source } : source;
  return (
    <Image
      source={imageSource}
      style={[{ width: size, height: size, borderRadius: size / 2 }, style]}
      onError={() => setHasError(true)}
    />
  );
}

export default function DetalhesEvento({ navigation, route }) {
  // Parâmetros passados via rota (ex: ao clicar em 'Ver mais' no TrailCard ou voltar do Pagamento)
  const routeParams = route?.params || {};
  const eventId = routeParams.eventId || routeParams.item?.id || 'f1';
  const initialItem = routeParams.item;

  // Carrega os dados mockados baseados no ID ou item de fallback (Backend-Ready)
  const [event, setEvent] = useState(() => getEventDetails(eventId, initialItem));

  // Estados funcionais da tela
  const [ticketCount, setTicketCount] = useState(1);
  const [remainingSpots, setRemainingSpots] = useState(event.remainingSpots || 10);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Estados dos modais solicitados
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Estados para o Quadro de Avisos / Perguntas
  const [comments, setComments] = useState(event.comments || []);
  const [newComment, setNewComment] = useState('');

  // Sincroniza estado caso volte da tela de pagamento com inscrição concluída
  useEffect(() => {
    if (routeParams.justSubscribed) {
      setIsSubscribed(true);
      setShowConfirmationModal(true);
      const bookedCount = routeParams.ticketCount || ticketCount;
      setRemainingSpots((prev) => Math.max(0, prev - bookedCount));
    }
  }, [routeParams.justSubscribed, routeParams.ticketCount]);

  // Garante que o botão voltar nativo do dispositivo retorne sempre para a tela Trilhas
  useEffect(() => {
    const onBackPress = () => {
      navigation?.navigate('Trilhas');
      return true;
    };

    const backHandlerSubscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress
    );

    return () => backHandlerSubscription.remove();
  }, [navigation]);

  // Aumentar / diminuir quantidade de vagas
  const handleDecrement = () => {
    if (ticketCount > 1) {
      setTicketCount((prev) => prev - 1);
    }
  };

  const handleIncrement = () => {
    if (ticketCount < remainingSpots) {
      setTicketCount((prev) => prev + 1);
    } else {
      Alert.alert('Limite de vagas', `Restam apenas ${remainingSpots} vagas disponíveis.`);
    }
  };

  // Abre a simulação de pagamento "Pagamento da Trilha"
  const handleOpenPayment = () => {
    if (remainingSpots <= 0) {
      Alert.alert('Esgotado', 'Desculpe, não há mais vagas disponíveis para este evento.');
      return;
    }

    if (ticketCount > remainingSpots) {
      Alert.alert('Aviso', `Só restam ${remainingSpots} vagas.`);
      return;
    }

    // Navega para a tela de Pagamento da Trilha
    navigation?.navigate('PagamentoTrilha', {
      event,
      ticketCount,
      totalPrice: (event.price * ticketCount).toFixed(2).replace('.', ','),
    });
  };

  // Confirmar cancelamento da participação
  const handleConfirmCancellation = () => {
    setIsCancelling(true);

    // BACKEND INTEGRATION:
    // POST /api/v1/events/:id/cancel-subscription
    // Payload: { eventId: event.id }
    setTimeout(() => {
      setIsCancelling(false);
      setShowCancelModal(false);
      setIsSubscribed(false);
      setRemainingSpots((prev) => prev + ticketCount);

      Alert.alert(
        'Inscrição Cancelada',
        'Sua participação foi cancelada com sucesso. O valor pago será estornado em até 3 dias úteis.'
      );
    }, 600);
  };

  // Envio de nova pergunta / aviso no quadro
  const handleSendComment = () => {
    const textTrimmed = newComment.trim();
    if (!textTrimmed) return;

    // BACKEND INTEGRATION:
    // POST /api/v1/events/:id/comments
    const newEntry = {
      id: `c_${Date.now()}`,
      userName: 'Você',
      avatar: null,
      text: textTrimmed,
      createdAt: 'Agora',
    };

    setComments((prev) => [...prev, newEntry]);
    setNewComment('');
  };

  // Botão de upload de fotos da trilha
  const handlePhotoUploadPress = () => {
    Alert.alert(
      'Enviar Foto',
      'Deseja enviar uma foto desta trilha? (Integração pronta para galeria do dispositivo e endpoint de upload)',
      [{ text: 'Cancelar', style: 'cancel' }, { text: 'Simular Envio', onPress: () => Alert.alert('Sucesso', 'Foto simulada enviada com sucesso!') }]
    );
  };

  const handleClose = () => {
    navigation?.navigate('Trilhas');
  };

  // Exibe dicas da trilha e fecha o modal de confirmação
  const handleShowTips = () => {
    setShowConfirmationModal(false);
    Alert.alert(
      'Dicas e Informações Importantes',
      `Recomendações para a ${event.title}:\n\n` +
        '1. Hidratação: Leve pelo menos 1,5L de água.\n' +
        '2. Calçado: Use tênis ou bota com sola aderente.\n' +
        '3. Proteção: Aplique protetor solar e repelente.\n' +
        '4. Horário: Chegue 15 minutos antes ao ponto de encontro.\n' +
        '5. Preservação: Não deixe lixo na trilha.',
      [{ text: 'Entendido', style: 'default' }]
    );
  };

  // Valor total formatado
  const totalPrice = (event.price * ticketCount).toFixed(2).replace('.', ',');

  return (
    <View style={styles.screenContainer}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header com Imagem de Capa do Evento */}
          <View style={styles.heroContainer}>
            <Image
              source={event.coverImage}
              style={styles.heroImage}
              resizeMode="cover"
            />

            {/* Botão circular de fechar (X) no topo direito */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              activeOpacity={0.8}
            >
              <Feather name="x" size={20} color="#111827" />
            </TouchableOpacity>
          </View>

          {/* Cartão Branco Principal Sobreposto */}
          <View style={styles.cardContainer}>
            {/* Título do Evento e Badge INSCRITO (quando inscrito) */}
            <View style={styles.titleRow}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              {isSubscribed && (
                <Text style={styles.subscribedBadge}>INSCRITO</Text>
              )}
            </View>

            {/* Avaliação em estrelas */}
            <View style={styles.ratingRow}>
              <FontAwesome name="star" size={13} color="#264A31" />
              <Text style={styles.ratingText}>
                {event.rating || '4.3'} ({event.reviews || '190'})
              </Text>
            </View>

            {/* Informações do Guia */}
            <View style={styles.guideRow}>
              <UserAvatar
                source={event.guide?.avatar}
                name={event.guide?.name}
                size={26}
                style={styles.guideAvatar}
              />
              <Text style={styles.guideText}>
                {event.guide?.name} - {event.guide?.role}
              </Text>
            </View>

            {/* Seção Descrição */}
            <Text style={styles.sectionHeaderGreen}>Descrição</Text>
            <Text style={styles.descriptionText}>{event.description}</Text>

            {/* Local de Saída */}
            <View style={styles.departureBox}>
              <Text style={styles.departureLabel}>Local de Saída</Text>
              <Text style={styles.departureValue}>{event.departureLocation}</Text>
            </View>

            {/* Grid com Informações do Evento (Data, Horário, Duração, Distância) */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Data</Text>
                <Text style={styles.statValue}>{event.date}</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Horário de saída</Text>
                <Text style={styles.statValue}>{event.departureTime}</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Duração</Text>
                <Text style={styles.statValue}>{event.duration}</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Distância</Text>
                <Text style={styles.statValue}>{event.distance}</Text>
              </View>
            </View>

            {/* Badge de Vagas Restantes com Avatares Sobrepostos */}
            <View style={styles.spotsBadge}>
              <View style={styles.overlappingAvatars}>
                {(event.participants || []).slice(0, 3).map((participant, index) => (
                  <UserAvatar
                    key={participant.id || index}
                    source={participant.avatar}
                    name={participant.name}
                    size={22}
                    style={[
                      styles.participantAvatar,
                      { marginLeft: index === 0 ? 0 : -8, zIndex: 3 - index },
                    ]}
                  />
                ))}
              </View>
              <Text style={styles.spotsBadgeText}>
                RESTAM {remainingSpots} VAGAS
              </Text>
            </View>

            {/* Galeria de Fotos */}
            <View style={styles.gallerySection}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.galleryScrollContent}
              >
                {/* Primeiro Card: Botão de Enviar Foto */}
                <TouchableOpacity
                  style={styles.uploadCard}
                  onPress={handlePhotoUploadPress}
                  activeOpacity={0.8}
                >
                  <View style={styles.uploadIconCircle}>
                    <Feather name="upload" size={22} color="#6B7280" />
                  </View>
                </TouchableOpacity>

                {/* Cards de Fotos da Trilha */}
                {(event.photos || [])
                  .filter((p) => !p.isUploadAction)
                  .map((photo, index) => (
                    <View key={photo.id || index} style={styles.photoCard}>
                      <Image
                        source={photo.image}
                        style={styles.galleryImage}
                        resizeMode="cover"
                      />
                      {index === 0 && (
                        <View style={styles.galleryNextIndicator}>
                          <Feather name="chevron-right" size={14} color="#374151" />
                        </View>
                      )}
                    </View>
                  ))}
              </ScrollView>
            </View>

            {/* Quadro de Avisos / Perguntas */}
            <View style={styles.commentsSection}>
              <Text style={styles.sectionHeaderGreen}>
                Quadro de Avisos/ Perguntas
              </Text>

              {/* Lista de Mensagens / Perguntas */}
              {comments.map((comment, index) => (
                <View key={comment.id || index}>
                  <View style={styles.commentItem}>
                    <UserAvatar
                      source={comment.avatar}
                      name={comment.userName}
                      size={42}
                      style={styles.commentAvatar}
                    />
                    <View style={styles.commentBody}>
                      <Text style={styles.commentAuthor}>{comment.userName}</Text>
                      <Text style={styles.commentText}>{comment.text}</Text>
                    </View>
                  </View>
                  {index < comments.length - 1 && (
                    <View style={styles.commentDivider} />
                  )}
                </View>
              ))}

              {/* Campo para Digitar e Enviar Mensagem */}
              <View style={styles.commentInputContainer}>
                <TextInput
                  style={styles.commentTextInput}
                  placeholder="Digite..."
                  placeholderTextColor="#9CA3AF"
                  value={newComment}
                  onChangeText={setNewComment}
                  onSubmitEditing={handleSendComment}
                  returnKeyType="send"
                />
                <TouchableOpacity
                  style={styles.sendButton}
                  onPress={handleSendComment}
                  activeOpacity={0.7}
                  disabled={!newComment.trim()}
                >
                  <Feather
                    name="send"
                    size={18}
                    color={newComment.trim() ? colors.primary : '#9CA3AF'}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Barra de Ação Inferior: Alterna entre Inscrição e Cancelar Inscrição */}
            {isSubscribed ? (
              // TELA DEPOIS DE INSCRITO: Botão Cancelar Inscrição
              <TouchableOpacity
                style={styles.cancelSubscriptionButton}
                onPress={() => setShowCancelModal(true)}
                activeOpacity={0.8}
              >
                <Feather name="x" size={16} color="#C85A17" style={{ marginRight: 6 }} />
                <Text style={styles.cancelSubscriptionText}>Cancelar Inscrição</Text>
              </TouchableOpacity>
            ) : (
              // TELA ANTES DE INSCRITO: Stepper + Botão Inscrever-se com valor total
              <View style={styles.registrationBar}>
                {/* Stepper de Quantidade (- 1 +) */}
                <View style={styles.stepperContainer}>
                  <TouchableOpacity
                    style={styles.stepperButton}
                    onPress={handleDecrement}
                    disabled={ticketCount <= 1}
                    activeOpacity={0.6}
                  >
                    <Feather
                      name="minus"
                      size={16}
                      color={ticketCount <= 1 ? '#9CA3AF' : '#1F2937'}
                    />
                  </TouchableOpacity>

                  <Text style={styles.stepperValue}>{ticketCount}</Text>

                  <TouchableOpacity
                    style={styles.stepperButton}
                    onPress={handleIncrement}
                    disabled={ticketCount >= remainingSpots}
                    activeOpacity={0.6}
                  >
                    <Feather
                      name="plus"
                      size={16}
                      color={ticketCount >= remainingSpots ? '#9CA3AF' : '#1F2937'}
                    />
                  </TouchableOpacity>
                </View>

                {/* Botão de Inscrição que direciona para Pagamento da Trilha */}
                <TouchableOpacity
                  style={[
                    styles.subscribeButton,
                    remainingSpots <= 0 && styles.subscribeButtonDisabled,
                  ]}
                  onPress={handleOpenPayment}
                  activeOpacity={0.85}
                  disabled={remainingSpots <= 0}
                >
                  <Text style={styles.subscribeButtonText}>Inscrever-se</Text>
                  <Text style={styles.subscribeButtonPrice}>R${totalPrice}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Menu Inferior Fixo de Navegação */}
      <Menu activeTab="Trilhas" navigation={navigation} />

      {/* ============================================================ */}
      {/* MODAL DE CONFIRMAÇÃO DA TRILHA (Image 3) */}
      {/* ============================================================ */}
      <Modal
        visible={showConfirmationModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmationModalCard}>
            {/* Botão circular de fechar (X) sobreposto no topo direito */}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowConfirmationModal(false)}
              activeOpacity={0.8}
            >
              <Feather name="x" size={20} color="#111827" />
            </TouchableOpacity>

            <Text style={styles.confirmationModalTitle}>
              Parabéns, aventureiro!
            </Text>
            <Text style={styles.confirmationModalSubtitle}>
              Você acabou de se inscrever na {event.title}.
            </Text>

            <Text style={styles.confirmationModalBody}>
              Preparamos uma lista de{' '}
              <Text style={styles.highlightTextGreen}>
                dicas e informações importantes
              </Text>{' '}
              para ajudar você a se preparar e aproveitar a trilha com mais segurança.
            </Text>

            <TouchableOpacity
              style={styles.viewTipsButton}
              onPress={handleShowTips}
              activeOpacity={0.8}
            >
              <Text style={styles.viewTipsButtonText}>Ver dicas</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ============================================================ */}
      {/* MODAL DE CANCELAMENTO DA TRILHA (Image 4) */}
      {/* ============================================================ */}
      <Modal
        visible={showCancelModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCancelModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.cancelModalCard}>
            {/* Botão circular de fechar (X) no topo direito */}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowCancelModal(false)}
              activeOpacity={0.8}
            >
              <Feather name="x" size={20} color="#111827" />
            </TouchableOpacity>

            <Text style={styles.cancelModalTitle}>
              Tem certeza que deseja cancelar sua inscrição?
            </Text>
            <Text style={styles.cancelModalSubtitle}>
              Ao cancelar, o valor pago será estornado em até 3 dias úteis.
            </Text>

            <TouchableOpacity
              style={[styles.confirmCancelButton, isCancelling && styles.confirmCancelButtonDisabled]}
              onPress={handleConfirmCancellation}
              activeOpacity={0.85}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <ActivityIndicator color="#C85A17" size="small" />
              ) : (
                <>
                  <Feather name="x" size={16} color="#C85A17" style={{ marginRight: 6 }} />
                  <Text style={styles.confirmCancelButtonText}>
                    cancelar participação
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },

  /* Hero / Header Imagem */
  heroContainer: {
    width: '100%',
    height: 270,
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

  /* Cartão de Conteúdo Sobreposto */
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -32,
    paddingTop: 22,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },

  /* Título, Badge e Rating */
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventTitle: {
    fontSize: 23,
    fontWeight: 'bold',
    color: colors.text,
    letterSpacing: -0.3,
    flex: 1,
  },
  subscribedBadge: {
    color: '#264A31',
    fontWeight: 'bold',
    fontSize: 13,
    letterSpacing: 0.6,
    marginLeft: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },

  /* Guia */
  guideRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 6,
  },
  guideAvatar: {
    marginRight: 8,
  },
  guideText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },

  /* Seções de Texto */
  sectionHeaderGreen: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 14,
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#4B5563',
    fontWeight: '400',
  },

  /* Local de Saída */
  departureBox: {
    marginTop: 12,
  },
  departureLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.text,
  },
  departureValue: {
    fontSize: 13,
    color: '#4B5563',
    marginTop: 2,
  },

  /* Grid de Estatísticas (Data, Horário, Duração, Distância) */
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingVertical: 4,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '500',
  },

  /* Badge de Vagas Restantes */
  spotsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 14,
  },
  overlappingAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantAvatar: {
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  spotsBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#374151',
    marginLeft: 10,
    letterSpacing: 0.5,
  },

  /* Galeria de Fotos */
  gallerySection: {
    marginTop: 16,
  },
  galleryScrollContent: {
    paddingRight: 10,
  },
  uploadCard: {
    width: 140,
    height: 155,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  uploadIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoCard: {
    width: 140,
    height: 155,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    marginRight: 12,
    backgroundColor: '#E5E7EB',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
  },
  galleryNextIndicator: {
    position: 'absolute',
    right: 8,
    top: '50%',
    transform: [{ translateY: -12 }],
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },

  /* Quadro de Avisos / Perguntas */
  commentsSection: {
    marginTop: 12,
  },
  commentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  commentAvatar: {
    marginRight: 12,
    marginTop: 2,
  },
  commentBody: {
    flex: 1,
  },
  commentAuthor: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.text,
  },
  commentText: {
    fontSize: 12,
    color: '#4B5563',
    marginTop: 2,
    lineHeight: 17,
  },
  commentDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    backgroundColor: '#FFFFFF',
    marginTop: 12,
  },
  commentTextInput: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    paddingVertical: 4,
  },
  sendButton: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Barra de Inscrição e Preço (Antes de inscrito) */
  registrationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 8,
    backgroundColor: '#F9FAFB',
    gap: 12,
  },
  stepperButton: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    minWidth: 18,
    textAlign: 'center',
  },
  subscribeButton: {
    flex: 1,
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: 12,
    marginLeft: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  subscribeButtonDisabled: {
    backgroundColor: colors.primaryMuted,
    opacity: 0.7,
  },
  subscribeButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  subscribeButtonPrice: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },

  /* Botão Cancelar Inscrição (Tela Depois de Inscrito - Image 2) */
  cancelSubscriptionButton: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#C85A17',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  cancelSubscriptionText: {
    color: '#C85A17',
    fontSize: 15,
    fontWeight: '600',
  },

  /* Utilitários de Avatar */
  avatarFallback: {
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: '#374151',
    fontWeight: 'bold',
  },

  /* Overlay dos Modais */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  /* Botão Circular Fechar (X) sobreposto no topo direito do modal */
  modalCloseButton: {
    position: 'absolute',
    top: -18,
    right: -10,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },

  /* Card do Modal de Confirmação da Trilha (Image 3) */
  confirmationModalCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#F5F7F5',
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
    overflow: 'visible',
  },
  confirmationModalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 6,
  },
  confirmationModalSubtitle: {
    fontSize: 13,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 12,
  },
  confirmationModalBody: {
    fontSize: 12,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 6,
  },
  highlightTextGreen: {
    color: colors.primary,
    fontWeight: '700',
  },
  viewTipsButton: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 34,
    backgroundColor: '#F9FAF9',
  },
  viewTipsButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },

  /* Card do Modal de Cancelamento da Trilha (Image 4) */
  cancelModalCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#F5F7F5',
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
    overflow: 'visible',
  },
  cancelModalTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  cancelModalSubtitle: {
    fontSize: 12,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 17,
    paddingHorizontal: 6,
  },
  confirmCancelButton: {
    borderWidth: 1.5,
    borderColor: '#C85A17',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 22,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  confirmCancelButtonDisabled: {
    opacity: 0.6,
  },
  confirmCancelButtonText: {
    color: '#C85A17',
    fontSize: 14,
    fontWeight: '600',
  },
});
