import React, { useState, useRef, useEffect } from 'react';
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
} from 'react-native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { MOCK_GUIDE_PROFILE, getGuideById } from '../constants/mockGuideProfile';
import Menu from '../components/Menu';
import TrailCard from '../components/TrailCard';
import UserAvatar from '../components/UserAvatar';

export default function PerfilGuia({ navigation, route }) {
  const guide =
    route?.params?.guide ||
    getGuideById(route?.params?.guideId) ||
    MOCK_GUIDE_PROFILE;
  const activeTab = route?.params?.activeTab || 'Guias';

  // Estados funcionais da tela
  const [savedTrails, setSavedTrails] = useState({});
  const [comments, setComments] = useState(guide.comments || []);
  const [newComment, setNewComment] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const mainScrollRef = useRef(null);

  // Sincroniza a lista de comentários caso o guia mude
  useEffect(() => {
    setComments(guide.comments || []);
  }, [guide.id]);

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

  // Enviar novo comentário / experiência
  const handleSendComment = () => {
    const textTrimmed = newComment.trim();
    if (!textTrimmed) return;

    // BACKEND INTEGRATION:
    // POST /api/v1/guides/:id/comments
    // Payload: { text: textTrimmed, guideId: guide.id }
    const newEntry = {
      id: `c_${Date.now()}`,
      name: 'Você',
      avatar: null,
      text: textTrimmed,
    };

    setComments((prev) => [...prev, newEntry]);
    setNewComment('');
    Keyboard.dismiss();
  };

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
              source={guide.coverImage}
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
                source={guide.avatar}
                name={guide.displayName || guide.name}
                size={96}
                style={styles.avatarImage}
              />
            </View>

            {/* Identificação do Guia */}
            <View style={styles.guideHeader}>
              <Text style={styles.guideName}>
                {guide.name}{' '}
                <Text style={styles.guideRole}>• {guide.role}</Text>
              </Text>

              {/* Especialidades */}
              <Text style={styles.specialtiesTitle}>Especialidades:</Text>
              <Text style={styles.specialtiesList}>{guide.specialties}</Text>

              {/* Biografia */}
              <Text style={styles.bioText}>
                {guide.bioPrefix}
                <Text style={styles.bioHighlight}>{guide.bioHighlight}</Text>
                {guide.bioSuffix}
              </Text>

              {/* Indicador de Trilhas Realizadas */}
              <View style={styles.trailsCountBadge}>
                <FontAwesome5 name="hiking" size={14} color={colors.primary} />
                <Text style={styles.trailsCountText}>
                  {guide.trailsCount} Trilhas Realizadas
                </Text>
              </View>
            </View>

            {/* Divisor */}
            <View style={styles.divider} />

            {/* Seção: Trilhas Disponíveis */}
            {guide.availableTrails && guide.availableTrails.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Trilhas Disponíveis</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalScrollContent}
                >
                  {guide.availableTrails.map((trail) => (
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

            {/* Seção: Fotos Compartilhadas */}
            {guide.sharedPhotos && guide.sharedPhotos.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Fotos Compartilhadas</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalScrollContent}
                >
                  {guide.sharedPhotos.map((photo) => (
                    <View key={photo.id} style={styles.photoCard}>
                      <Image
                        source={photo.image}
                        style={styles.sharedPhoto}
                        resizeMode="cover"
                      />
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Seção: Comentários */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Comentários</Text>

              {/* Lista de Comentários */}
              {comments.map((comment, index) => (
                <View key={comment.id || index}>
                  <View style={styles.commentItem}>
                    <UserAvatar
                      source={comment.avatar}
                      name={comment.name}
                      size={42}
                      style={styles.commentAvatar}
                    />
                    <View style={styles.commentBody}>
                      <Text style={styles.commentAuthor}>{comment.name}</Text>
                      <Text style={styles.commentText}>{comment.text}</Text>
                    </View>
                  </View>
                  {index < comments.length - 1 && (
                    <View style={styles.commentDivider} />
                  )}
                </View>
              ))}

              {/* Campo para Adicionar Experiência */}
              <View style={styles.commentInputContainer}>
                <TextInput
                  style={styles.commentTextInput}
                  placeholder="Fale sobre sua Experiência..."
                  placeholderTextColor="#6B7280"
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
                    color={newComment.trim() ? colors.primary : '#111827'}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Menu Inferior Fixo com Opções: Trilhas, Guias, Salvos e Perfil */}
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
    paddingBottom: 20,
  },

  /* Hero / Header Imagem */
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

  /* Cartão de Conteúdo Sobreposto */
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -32,
    paddingHorizontal: 20,
    paddingBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },

  /* Foto de Perfil Circular Sobreposta */
  avatarWrapper: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignSelf: 'center',
    marginTop: -52,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
    zIndex: 5,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },

  /* Cabeçalho de Informações do Guia */
  guideHeader: {
    marginTop: 14,
  },
  guideName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    letterSpacing: -0.2,
  },
  guideRole: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  specialtiesTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 10,
  },
  specialtiesList: {
    fontSize: 13,
    color: '#374151',
    marginTop: 2,
  },
  bioText: {
    fontSize: 12.5,
    lineHeight: 18,
    color: '#374151',
    marginTop: 10,
  },
  bioHighlight: {
    fontWeight: '700',
    color: '#111827',
  },

  /* Badge de Trilhas Realizadas */
  trailsCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.2,
    borderColor: colors.primary,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 12,
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
  },
  trailsCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },

  /* Linha Divisória */
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 14,
  },

  /* Seções */
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
  },
  horizontalScrollContent: {
    paddingRight: 8,
  },

  /* Fotos Compartilhadas */
  photoCard: {
    width: 155,
    height: 165,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 12,
    backgroundColor: '#E5E7EB',
  },
  sharedPhoto: {
    width: '100%',
    height: '100%',
  },

  /* Comentários */
  commentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 4,
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
    fontWeight: '700',
    color: '#111827',
  },
  commentText: {
    fontSize: 12,
    lineHeight: 17,
    color: '#374151',
    marginTop: 2,
  },
  commentDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },

  /* Input de Experiência */
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#9CA3AF',
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 46,
    marginTop: 14,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  commentTextInput: {
    flex: 1,
    fontSize: 13,
    color: '#111827',
    paddingVertical: 0,
  },
  sendButton: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
