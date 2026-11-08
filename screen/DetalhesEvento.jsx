import React, { useState, useEffect, useRef } from 'react';
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
  Keyboard,
} from 'react-native';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { getEventDetails } from '../constants/mockEvents';
import Menu from '../components/Menu';
import UserAvatar from '../components/UserAvatar';
import { useSubscriptions } from '../contexts/SubscriptionsContext';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../services/firebase';
import { getTrailById, cancelTrailSubscription } from '../services/trailService';

export default function DetalhesEvento({ navigation, route }) {
  // Parâmetros passados via rota
  const routeParams = route?.params || {};
  const eventId = routeParams.eventId || routeParams.item?.id || 'f1';
  const initialItem = routeParams.item;
  const isHistory = Boolean(
    routeParams.isHistory ||
    initialItem?.status === 'concluida' ||
    eventId === 'hist-galinha-choca'
  );

  // Carrega os dados da trilha
  const [event, setEvent] = useState(() => getEventDetails(eventId, initialItem));
  const { user } = useAuth();
  const { isSubscribed: checkIsSubscribed, cancelSubscription: removeSubscription } = useSubscriptions();

  // Estados funcionais da tela
  const [ticketCount, setTicketCount] = useState(1);
  const [remainingSpots, setRemainingSpots] = useState(event.remainingSpots || 10);
  const [isSubscribed, setIsSubscribed] = useState(() =>
    checkIsSubscribed(eventId) || checkIsSubscribed(event?.id)
  );

  // Estados dos modais
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Estados para o Quadro de Avisos / Perguntas
  const [comments, setComments] = useState(event.comments || []);
  const [newComment, setNewComment] = useState('');

  // Refs e estados para ajuste do teclado
  const mainScrollRef = useRef(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Refs e estados para o carrossel de fotos
  const galleryScrollRef = useRef(null);
  const [galleryScrollX, setGalleryScrollX] = useState(0);
  const [galleryLayoutWidth, setGalleryLayoutWidth] = useState(0);
  const [galleryContentWidth, setGalleryContentWidth] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Monitora abertura e fechamento do teclado
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onKeyboardShow = (e) => {
      const height = e?.endCoordinates?.height || 280;
      setKeyboardHeight(height);
      setTimeout(() => {
        mainScrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    };

    const onKeyboardHide = () => {
      setKeyboardHeight(0);
    };

    const showSub = Keyboard.addListener(showEvent, onKeyboardShow);
    const hideSub = Keyboard.addListener(hideEvent, onKeyboardHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Sincroniza estado de inscrição com contexto
  useEffect(() => {
    const currentlySubscribed =
      routeParams.justSubscribed ||
      checkIsSubscribed(eventId) ||
      checkIsSubscribed(event?.id);

    setIsSubscribed(currentlySubscribed);

    if (routeParams.justSubscribed) {
      setShowConfirmationModal(true);
      const bookedCount = routeParams.ticketCount || ticketCount;
      setRemainingSpots((prev) => Math.max(0, prev - bookedCount));
    }
  }, [eventId, event?.id, routeParams.justSubscribed, routeParams.ticketCount, checkIsSubscribed]);

  // Busca dados atualizados da trilha no Cloud Firestore
  useEffect(() => {
    let isMounted = true;
    async function fetchFromFirestore() {
      if (!eventId) return;
      try {
        const fetched = await getTrailById(eventId);
        if (fetched && isMounted) {
          const total = fetched.capacity || fetched.totalSpots || 12;
          const filled = fetched.filledSpots || 0;
          const spotsLeft = Math.max(0, total - filled);

          setEvent((prev) => ({
            ...prev,
            ...fetched,
            title: fetched.title || fetched.name || prev.title,
            description: fetched.description || prev.description,
            departureLocation: fetched.departureLocation || prev.departureLocation,
            date: fetched.date || prev.date,
            departureTime: fetched.departureTime || prev.departureTime,
            duration: fetched.duration || fetched.time || prev.duration,
            distance: fetched.distance || prev.distance,
            difficulty: fetched.difficulty || prev.difficulty,
            price: typeof fetched.price === 'number'
              ? fetched.price
              : (parseFloat(String(fetched.price || '10').replace('R$', '').replace(',', '.')) || prev.price),
            totalSpots: total,
            remainingSpots: spotsLeft,
            guide: {
              id: fetched.guideId || prev.guide?.id,
              name: fetched.guideName || fetched.author || prev.guide?.name,
              role: fetched.guideRole || prev.guide?.role || 'Guia profissional',
              avatar: fetched.guideAvatar || prev.guide?.avatar,
            },
            coverImage: fetched.imageUrl
              ? { uri: fetched.imageUrl }
              : (fetched.image || prev.coverImage),
          }));
          setRemainingSpots(spotsLeft);
        }
      } catch (err) {
        console.warn('Aviso ao carregar detalhes do Firestore:', err?.message);
      }
    }
    fetchFromFirestore();
    return () => {
      isMounted = false;
    };
  }, [eventId]);

  // Trata botão voltar do dispositivo
  useEffect(() => {
    const onBackPress = () => {
      if (navigation?.canGoBack()) {
        navigation.goBack();
      } else {
        navigation?.navigate('Trilhas');
      }
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

  // Abre a tela de pagamento
  const handleOpenPayment = () => {
    if (remainingSpots <= 0) {
      Alert.alert('Esgotado', 'Desculpe, não há mais vagas disponíveis para este evento.');
      return;
    }

    if (ticketCount > remainingSpots) {
      Alert.alert('Aviso', `Só restam ${remainingSpots} vagas.`);
      return;
    }

    navigation?.navigate('PagamentoTrilha', {
      event,
      ticketCount,
      totalPrice: (event.price * ticketCount).toFixed(2).replace('.', ','),
    });
  };

  // Confirmar cancelamento da participação no Firestore e no app
  const handleConfirmCancellation = async () => {
    setIsCancelling(true);

    try {
      const trailId = event.id || eventId;
      const currentUserId = auth.currentUser?.uid || user?.uid;

      if (trailId && currentUserId) {
        await cancelTrailSubscription(trailId, currentUserId, ticketCount);
      }

      removeSubscription(event.id);
      removeSubscription(eventId);
      setIsSubscribed(false);
      setShowCancelModal(false);
      setRemainingSpots((prev) => prev + ticketCount);

      Alert.alert(
        'Inscrição Cancelada',
        'Sua participação foi cancelada com sucesso. O valor pago será estornado em até 3 dias úteis.'
      );
    } catch (err) {
      console.warn('Erro ao cancelar participação no Firestore:', err?.message);
      // Garante desinscrição na interface
      removeSubscription(event.id);
      removeSubscription(eventId);
      setIsSubscribed(false);
      setShowCancelModal(false);
      setRemainingSpots((prev) => prev + ticketCount);

      Alert.alert(
        'Inscrição Cancelada',
        'Sua participação foi cancelada com sucesso. O valor pago será estornado em até 3 dias úteis.'
      );
    } finally {
      setIsCancelling(false);
    }
  };

  // Envio de nova pergunta no quadro
  const handleSendComment = () => {
    const textTrimmed = newComment.trim();
    if (!textTrimmed) return;

    const newEntry = {
      id: `c_${Date.now()}`,
      userName: 'Você',
      avatar: null,
      text: textTrimmed,
      createdAt: 'Agora',
    };

    setComments((prev) => [...prev, newEntry]);
    setNewComment('');
    Keyboard.dismiss();
  };

  // Rolagem suave do carrossel de fotos
  const handleScrollLeft = () => {
    const targetX = Math.max(0, galleryScrollX - 152);
    galleryScrollRef.current?.scrollTo({ x: targetX, animated: true });
  };

  const handleScrollRight = () => {
    const targetX = galleryScrollX + 152;
    galleryScrollRef.current?.scrollTo({ x: targetX, animated: true });
  };

  const handleGalleryScroll = (e) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const layoutW = e.nativeEvent.layoutMeasurement.width;
    const contentW = e.nativeEvent.contentSize.width;

    setGalleryScrollX(offsetX);
    setCanScrollLeft(offsetX > 20);
    setCanScrollRight(offsetX + layoutW < contentW - 15);
  };

  const handleClose = () => {
    if (navigation?.canGoBack()) {
      navigation.goBack();
    } else {
      navigation?.navigate('Trilhas');
    }
  };

  const handleShowTips = () => {
    setShowConfirmationModal(false);
    navigation?.navigate('DicasTrilha', {
      eventId: event.id,
      title: event.title,
    });
  };

  const totalPrice = (event.price * ticketCount).toFixed(2).replace('.', ',');

  return (
    <View style={styles.screenContainer}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={mainScrollRef}
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            keyboardHeight > 0 && {
              paddingBottom: keyboardHeight + (Platform.OS === 'ios' ? 40 : 80),
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {/* Header com Capa */}
          <View style={styles.heroContainer}>
            <Image
              source={event.coverImage}
              style={styles.heroImage}
              resizeMode="cover"
            />

            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              activeOpacity={0.8}
            >
              <Feather name="x" size={20} color="#111827" />
            </TouchableOpacity>
          </View>

          {/* Conteúdo Principal */}
          <View style={styles.cardContainer}>
            {/* Título e Badges */}
            <View style={styles.titleRow}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              {isHistory ? (
                <Text style={styles.historyBadge}>CONCLUÍDA</Text>
              ) : isSubscribed ? (
                <Text style={styles.subscribedBadge}>INSCRITO</Text>
              ) : null}
            </View>

            {/* Avaliação */}
            <View style={styles.ratingRow}>
              <FontAwesome name="star" size={13} color="#264A31" />
              <Text style={styles.ratingText}>
                {event.rating || '4.3'} ({event.reviews || '190'})
              </Text>
            </View>

            {/* Guia */}
            <TouchableOpacity
              style={styles.guideRow}
              activeOpacity={0.7}
              onPress={() =>
                navigation?.navigate('PerfilGuia', {
                  guide: event.guide,
                  guideId: event.guide?.id,
                })
              }
            >
              <UserAvatar
                source={event.guide?.avatar}
                name={event.guide?.name}
                size={26}
                style={styles.guideAvatar}
              />
              <Text style={styles.guideText}>
                {event.guide?.name} • {event.guide?.role}
              </Text>
            </TouchableOpacity>

            {/* Descrição */}
            <Text style={styles.sectionHeaderGreen}>Descrição</Text>
            <Text style={styles.descriptionText}>{event.description}</Text>

            {/* ATALHO PARA TELA DE DICAS */}
            <TouchableOpacity
              style={styles.tipsShortcutButton}
              onPress={() =>
                navigation?.navigate('DicasTrilha', {
                  eventId: event.id,
                  title: event.title,
                })
              }
              activeOpacity={0.8}
            >
              <View style={styles.tipsShortcutContent}>
                <Feather name="info" size={18} color={colors.primary} />
                <Text style={styles.tipsShortcutText}>
                  Ver recomendações e o que levar
                </Text>
              </View>
              <Feather name="chevron-right" size={18} color={colors.primary} />
            </TouchableOpacity>

            {/* Local de Saída */}
            <View style={styles.departureBox}>
              <Text style={styles.departureLabel}>Local de Saída</Text>
              <Text style={styles.departureValue}>{event.departureLocation}</Text>
            </View>

            {/* Grid de Informações */}
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

            {/* Badge de Vagas Restantes */}
            {!isHistory && (
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
            )}

            {/* Galeria de Fotos */}
            <View style={styles.gallerySection}>
              <View style={styles.galleryCarouselWrapper}>
                <ScrollView
                  ref={galleryScrollRef}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.galleryScrollContent}
                  onScroll={handleGalleryScroll}
                  scrollEventThrottle={16}
                  onContentSizeChange={(w) => {
                    setGalleryContentWidth(w);
                    if (galleryLayoutWidth > 0) {
                      setCanScrollRight(galleryScrollX + galleryLayoutWidth < w - 15);
                    } else {
                      setCanScrollRight(w > 320);
                    }
                  }}
                  onLayout={(e) => {
                    const w = e.nativeEvent.layout.width;
                    setGalleryLayoutWidth(w);
                    if (galleryContentWidth > 0) {
                      setCanScrollRight(galleryScrollX + w < galleryContentWidth - 15);
                    }
                  }}
                >
                  {(event.photos || [])
                    .filter((p) => !p.isUploadAction && p.image)
                    .map((photo, index) => (
                      <View key={photo.id || index} style={styles.photoCard}>
                        <Image
                          source={photo.image}
                          style={styles.galleryImage}
                          resizeMode="cover"
                        />
                      </View>
                    ))}
                </ScrollView>

                {canScrollLeft && (
                  <TouchableOpacity
                    style={[styles.galleryNavButton, styles.galleryNavButtonLeft]}
                    onPress={handleScrollLeft}
                    activeOpacity={0.8}
                  >
                    <Feather name="chevron-left" size={16} color="#374151" />
                  </TouchableOpacity>
                )}

                {canScrollRight && (
                  <TouchableOpacity
                    style={[styles.galleryNavButton, styles.galleryNavButtonRight]}
                    onPress={handleScrollRight}
                    activeOpacity={0.8}
                  >
                    <Feather name="chevron-right" size={16} color="#374151" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Quadro de Avisos / Perguntas */}
            <View style={styles.commentsSection}>
              <Text style={styles.sectionHeaderGreen}>
                Quadro de Avisos/ Perguntas
              </Text>

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

              <View style={styles.commentInputContainer}>
                <TextInput
                  style={styles.commentTextInput}
                  placeholder="Digite..."
                  placeholderTextColor="#9CA3AF"
                  value={newComment}
                  onChangeText={setNewComment}
                  onSubmitEditing={handleSendComment}
                  returnKeyType="send"
                  onFocus={() => {
                    setTimeout(() => {
                      mainScrollRef.current?.scrollToEnd({ animated: true });
                    }, 150);
                  }}
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

            {/* Barra de Ação Inferior */}
            {isHistory ? (
              <View style={styles.registrationBar}>
                <TouchableOpacity
                  style={[styles.subscribeButton, styles.historyButtonDisabled]}
                  disabled={true}
                  activeOpacity={1}
                >
                  <Text style={styles.historyButtonText}>Inscrições Encerradas</Text>
                </TouchableOpacity>
              </View>
            ) : isSubscribed ? (
              <TouchableOpacity
                style={styles.cancelSubscriptionButton}
                onPress={() => setShowCancelModal(true)}
                activeOpacity={0.8}
              >
                <Feather name="x" size={16} color="#C85A17" style={{ marginRight: 6 }} />
                <Text style={styles.cancelSubscriptionText}>Cancelar Inscrição</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.registrationBar}>
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

      {/* Menu Inferior */}
      {keyboardHeight === 0 && (
        <Menu activeTab="Trilhas" navigation={navigation} />
      )}

      {/* Modal de Confirmação */}
      <Modal
        visible={showConfirmationModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmationModalCard}>
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

            <TouchableOpacity
              style={[styles.viewTipsButton, { backgroundColor: '#F3F4F6', marginTop: 10 }]}
              onPress={() => {
                setShowConfirmationModal(false);
                navigation?.navigate('MinhasTrilhas');
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.viewTipsButtonText, { color: '#1F2937' }]}>
                Minhas Trilhas
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de Cancelamento */}
      <Modal
        visible={showCancelModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCancelModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.cancelModalCard}>
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

  /* Cartão de Conteúdo */
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

  /* Título e Badges */
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
  historyBadge: {
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 0.6,
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden',
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

  /* Descrição */
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

  /* Atalho de Dicas */
  tipsShortcutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F4F7F4',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 14,
  },
  tipsShortcutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tipsShortcutText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 10,
  },

  /* Local de Saída */
  departureBox: {
    marginTop: 14,
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

  /* Grid de Informações */
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

  /* Vagas Restantes */
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

  /* Galeria */
  gallerySection: {
    marginTop: 16,
  },
  galleryCarouselWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  galleryScrollContent: {
    paddingRight: 10,
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
  galleryNavButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -14 }],
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
    zIndex: 20,
  },
  galleryNavButtonLeft: {
    left: 8,
  },
  galleryNavButtonRight: {
    right: 8,
  },

  /* Quadro de Avisos */
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

  /* Barra de Inscrição */
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
  historyButtonDisabled: {
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 0,
    width: '100%',
    shadowOpacity: 0,
    elevation: 0,
    opacity: 1,
  },
  historyButtonText: {
    color: '#9CA3AF',
    fontSize: 15,
    fontWeight: 'bold',
  },

  /* Botão Cancelar Inscrição */
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

  /* Modais */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
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