import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  KeyboardAvoidingView,
  Keyboard,
  BackHandler,
  ActivityIndicator,
} from 'react-native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { getGuideProfile, addGuideComment } from '../services/guideService';
import { getGuideTrails } from '../services/trailService';
import Menu from '../components/Menu';
import TrailCard from '../components/TrailCard';
import UserAvatar from '../components/UserAvatar';

export default function PerfilGuia({ navigation, route }) {
  const initialGuide = route?.params?.guide || null;
  const guideId = route?.params?.guideId || initialGuide?.id;
  const activeTab = route?.params?.activeTab || 'Guias';

  const [guide, setGuide] = useState(initialGuide);
  const [guideTrails, setGuideTrails] = useState(initialGuide?.availableTrails || []);
  const [loading, setLoading] = useState(!initialGuide);
  const [savedTrails, setSavedTrails] = useState({});
  const [comments, setComments] = useState(initialGuide?.comments || []);
  const [newComment, setNewComment] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const mainScrollRef = useRef(null);

  // Carrega os dados reais do guia e suas trilhas diretamente do Firestore
  const loadGuideData = useCallback(async () => {
    if (!guideId) {
      setLoading(false);
      return;
    }

    try {
      const [fetchedGuide, fetchedTrails] = await Promise.all([
        getGuideProfile(guideId),
        getGuideTrails(guideId, initialGuide?.name || initialGuide?.displayName),
      ]);

      if (fetchedGuide) {
        setGuide(fetchedGuide);
        if (fetchedGuide.comments) {
          setComments(fetchedGuide.comments);
        }
      }

      if (fetchedTrails && fetchedTrails.length > 0) {
        setGuideTrails(fetchedTrails);
      } else if (fetchedGuide?.availableTrails) {
        setGuideTrails(fetchedGuide.availableTrails);
      }
    } catch (err) {
      console.warn('Erro ao carregar dados do guia no Firestore:', err?.message);
    } finally {
      setLoading(false);
    }
  }, [guideId, initialGuide?.name, initialGuide?.displayName]);

  useEffect(() => {
    loadGuideData();
  }, [loadGuideData]);

  // Monitora abertura e fechamento do teclado para evitar sobreposição
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

  // Fechar tela (retorna para a listagem de guias ou tela anterior)
  const handleClose = () => {
    if (navigation?.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Guias');
    }
  };

  // Garante que o botão voltar nativo do Android retorne para a tela de Guias
  useEffect(() => {
    const onBackPress = () => {
      handleClose();
      return true;
    };

    const backHandlerSubscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress
    );

    return () => backHandlerSubscription.remove();
  }, [navigation]);

  // Alterna salvar trilha
  const toggleSave = (id) => {
    setSavedTrails((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Enviar novo comentário / experiência no perfil do guia
  const handleSendComment = async () => {
    const textTrimmed = newComment.trim();
    if (!textTrimmed) return;

    const newEntry = {
      id: `c_${Date.now()}`,
      name: 'Você',
      avatar: null,
      text: textTrimmed,
    };

    setComments((prev) => [...prev, newEntry]);
    setNewComment('');
    Keyboard.dismiss();

    try {
      if (guideId) {
        await addGuideComment(guideId, { text: textTrimmed, name: 'Você' });
      }
    } catch (_e) {}
  };

  if (loading && !guide) {
    return (
      <View style={[styles.screenContainer, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 12, color: colors.textSecondary }}>Carregando perfil do guia...</Text>
      </View>
    );
  }

  const guideDisplayName = guide?.displayName || guide?.name || 'Guia Arroche';
  const guideRole = guide?.role || 'Guia Profissional';
  const guideSpecialties = guide?.specialties || 'Trilhas • Ecoturismo • Turismo de Aventura';
  const bio = guide?.bio || guide?.bioPrefix
    ? `${guide?.bioPrefix || ''}${guide?.bioHighlight || ''}${guide?.bioSuffix || ''}`
    : 'Guia cadastrado no aplicativo Arroche com foco em segurança, preservação e aventura.';
  const trailsCount = guideTrails.length || guide?.trailsCount || 0;
  const coverImage = guide?.coverImage || require('../assets/back-arroche.png');

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
          {/* Header com Imagem de Capa do Guia */}
          <View style={styles.heroContainer}>
            <Image
              source={typeof coverImage === 'string' ? { uri: coverImage } : coverImage}
              style={styles.heroImage}
              resizeMode="cover"
            />

            {/* Botão circular de fechar (X) no topo direito para voltar */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              activeOpacity={0.8}
            >
              <Feather name="x" size={20} color="#111827" />
            </TouchableOpacity>
          </View>

          {/* Cartão Branco Sobreposto */}
          <View style={styles.cardContainer}>
            {/* Foto de Perfil Circular Sobreposta */}
            <View style={styles.avatarWrapper}>
              <UserAvatar
                source={guide?.avatar}
                name={guideDisplayName}
                size={96}
                style={styles.avatarImage}
              />
            </View>

            {/* Identificação do Guia */}
            <View style={styles.guideHeader}>
              <Text style={styles.guideName}>
                {guideDisplayName}{' '}
                <Text style={styles.guideRole}>• {guideRole}</Text>
              </Text>

              {/* Especialidades */}
              <Text style={styles.specialtiesTitle}>Especialidades:</Text>
              <Text style={styles.specialtiesList}>{guideSpecialties}</Text>

              {/* Biografia */}
              <Text style={styles.bioText}>{bio}</Text>

              {/* Indicador de Trilhas Realizadas */}
              <View style={styles.trailsCountBadge}>
                <FontAwesome5 name="hiking" size={14} color={colors.primary} />
                <Text style={styles.trailsCountText}>
                  {trailsCount} {trailsCount === 1 ? 'Trilha Disponível' : 'Trilhas Disponíveis'}
                </Text>
              </View>
            </View>

            {/* Divisor */}
            <View style={styles.divider} />

            {/* Seção: Trilhas Disponíveis */}
            {guideTrails && guideTrails.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Trilhas Disponíveis</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalScrollContent}
                >
                  {guideTrails.map((trail) => (
                    <TrailCard
                      key={trail.id}
                      item={trail}
                      isSaved={!!savedTrails[trail.id]}
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
            )}

            {/* Divisor */}
            {guideTrails && guideTrails.length > 0 && <View style={styles.divider} />}

            {/* Seção: Fotos Compartilhadas */}
            {guide?.sharedPhotos && guide.sharedPhotos.length > 0 && (
              <>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Fotos Compartilhadas</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalScrollContent}
                  >
                    {guide.sharedPhotos.map((photo, index) => (
                      <View key={photo.id || index} style={styles.photoCard}>
                        <Image
                          source={typeof photo.image === 'string' ? { uri: photo.image } : photo.image}
                          style={styles.photoImage}
                          resizeMode="cover"
                        />
                      </View>
                    ))}
                  </ScrollView>
                </View>
                <View style={styles.divider} />
              </>
            )}

            {/* Seção: Experiências e Comentários */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Experiências</Text>

              {comments.map((comment, index) => (
                <View key={comment.id || index}>
                  <View style={styles.commentItem}>
                    <UserAvatar
                      source={comment.avatar}
                      name={comment.name || comment.userName}
                      size={42}
                      style={styles.commentAvatar}
                    />
                    <View style={styles.commentBody}>
                      <Text style={styles.commentAuthor}>{comment.name || comment.userName}</Text>
                      <Text style={styles.commentText}>{comment.text}</Text>
                    </View>
                  </View>
                  {index < comments.length - 1 && (
                    <View style={styles.commentDivider} />
                  )}
                </View>
              ))}

              {comments.length === 0 && (
                <Text style={styles.emptyCommentsText}>
                  Ainda não há avaliações para este guia. Seja o primeiro a comentar!
                </Text>
              )}

              {/* Input para Adicionar Novo Comentário */}
              <View style={styles.commentInputContainer}>
                <TextInput
                  style={styles.commentTextInput}
                  placeholder="Deixe uma pergunta ou experiência..."
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
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Menu Inferior */}
      {keyboardHeight === 0 && (
        <Menu activeTab={activeTab} navigation={navigation} />
      )}
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
    paddingBottom: 24,
  },
  heroContainer: {
    width: '100%',
    height: 220,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'android' ? (StatusBar.currentHeight || 20) + 12 : 48,
    right: 18,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  cardContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -32,
    paddingTop: 16,
    paddingHorizontal: 20,
  },
  avatarWrapper: {
    alignSelf: 'center',
    marginTop: -58,
    padding: 3,
    backgroundColor: '#FFFFFF',
    borderRadius: 54,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  avatarImage: {
    borderRadius: 48,
  },
  guideHeader: {
    alignItems: 'center',
    marginTop: 8,
  },
  guideName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
  },
  guideRole: {
    fontSize: 14,
    fontWeight: 'normal',
    color: colors.textSecondary,
  },
  specialtiesTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 8,
    textAlign: 'center',
  },
  specialtiesList: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  bioText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  trailsCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    gap: 6,
  },
  trailsCountText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 18,
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 12,
  },
  horizontalScrollContent: {
    paddingRight: 10,
    gap: 12,
  },
  photoCard: {
    width: 140,
    height: 100,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  commentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  commentAvatar: {
    marginRight: 12,
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
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  commentDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 4,
  },
  emptyCommentsText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginVertical: 8,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    marginTop: 14,
    backgroundColor: '#F9FAFB',
  },
  commentTextInput: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
  },
  sendButton: {
    padding: 6,
  },
});
