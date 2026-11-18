import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  KeyboardAvoidingView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../constants/colors';
import { auth } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { updateGuideTrail, getTrailById } from '../services/trailService';
import { uploadImageToStorage } from '../services/storageService';
import { resolveTrailImage } from '../services/trailImages';
import MenuGuia from '../components/MenuGuia';

export default function EditarEventoGuia({ navigation, route }) {
  const { user, userProfile, guideProfile, isGuide, loading: authLoading } = useAuth();
  const guideUid = auth.currentUser?.uid || user?.uid || user?.id || 'guide_default';
  const guideName = guideProfile?.name || userProfile?.name || 'Guia profissional';

  // Proteção de rota e regra de negócio: apenas Guias podem editar eventos
  useEffect(() => {
    if (!authLoading && !isGuide) {
      Alert.alert(
        'Acesso Restrito',
        'Apenas guias credenciados têm permissão para editar eventos.',
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
  }, [authLoading, isGuide, navigation]);

  const initialItem = route?.params?.item;
  const trailId = route?.params?.trailId || initialItem?.id;

  const [coverImageUri, setCoverImageUri] = useState(null);
  const [trailName, setTrailName] = useState(initialItem?.title || initialItem?.name || '');
  const [description, setDescription] = useState(initialItem?.description || '');
  const [difficulty, setDifficulty] = useState(initialItem?.difficulty || 'Fácil');
  const [departureLocation, setDepartureLocation] = useState(initialItem?.departureLocation || '');
  const [date, setDate] = useState(initialItem?.date || '');
  const [departureTime, setDepartureTime] = useState(initialItem?.departureTime || '');
  const [distanceKm, setDistanceKm] = useState(
    initialItem?.distance ? String(initialItem.distance).replace('km', '').trim() : ''
  );
  const [duration, setDuration] = useState(initialItem?.duration || '');
  const [capacity, setCapacity] = useState(String(initialItem?.capacity || initialItem?.totalSpots || '12'));
  const [price, setPrice] = useState(String(initialItem?.price || '10.00'));

  const [isSaving, setIsSaving] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(!initialItem);

  const [isDateModalVisible, setIsDateModalVisible] = useState(false);
  const [isTimeModalVisible, setIsTimeModalVisible] = useState(false);

  // Verificação estrita de propriedade da trilha (Guia só edita seus próprios eventos)
  const checkOwnership = (itemData) => {
    if (!itemData) return false;
    const currentUid = auth.currentUser?.uid || user?.uid || user?.id;
    const currentGuideName = (guideProfile?.name || userProfile?.name || '').trim().toLowerCase();
    const trailGuideId = itemData.guideId;
    const trailAuthor = (itemData.author || '').trim().toLowerCase();
    const trailGuideName = (itemData.guideName || '').trim().toLowerCase();

    const matchesUid = Boolean(currentUid && trailGuideId && trailGuideId === currentUid);
    const matchesAuthor = Boolean(currentGuideName && trailAuthor && trailAuthor === currentGuideName);
    const matchesGuideName = Boolean(currentGuideName && trailGuideName && trailGuideName === currentGuideName);

    if (!matchesUid && !matchesAuthor && !matchesGuideName) {
      Alert.alert(
        'Permissão Negada',
        'Você só tem permissão para editar eventos criados por você.',
        [{ text: 'OK', onPress: () => navigation?.goBack() }]
      );
      return false;
    }
    return true;
  };

  useEffect(() => {
    async function loadData() {
      if (initialItem) {
        if (!checkOwnership(initialItem)) return;
        const rawImg = initialItem.imageUrl || 
          (typeof initialItem.image === 'string' ? initialItem.image : initialItem.image?.uri) || 
          initialItem.imageKey || 
          initialItem.coverImage;
        if (rawImg) {
          setCoverImageUri(typeof rawImg === 'string' ? rawImg : rawImg?.uri);
        }
        return;
      }

      if (trailId) {
        setLoadingInitial(true);
        try {
          const fetched = await getTrailById(trailId);
          if (fetched) {
            if (!checkOwnership(fetched)) return;

            setTrailName(fetched.title || fetched.name || '');
            setDescription(fetched.description || '');
            setDifficulty(fetched.difficulty || 'Fácil');
            setDepartureLocation(fetched.departureLocation || '');
            setDate(fetched.date || '');
            setDepartureTime(fetched.departureTime || '');
            setDistanceKm(fetched.distance ? String(fetched.distance).replace('km', '').trim() : '');
            setDuration(fetched.duration || '');
            setCapacity(String(fetched.capacity || fetched.totalSpots || '12'));
            setPrice(String(fetched.price || '10.00'));
            const fetchedImg = fetched.imageUrl || 
              (typeof fetched.image === 'string' ? fetched.image : fetched.image?.uri) || 
              fetched.imageKey || 
              fetched.coverImage;
            if (fetchedImg) {
              setCoverImageUri(typeof fetchedImg === 'string' ? fetchedImg : fetchedImg?.uri);
            }
          }
        } catch (_e) {
        } finally {
          setLoadingInitial(false);
        }
      }
    }
    loadData();
  }, [trailId, initialItem, guideUid, guideName]);

  const handlePickCoverImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permissão necessária', 'Permita o acesso à galeria para alterar a foto.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setCoverImageUri(result.assets[0].uri);
      }
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível acessar a galeria de imagens.');
    }
  };

  // Digitação manual com máscara de Data (DD/MM/AAAA) e limites de dia/mês
  const handleDateManualChange = (text) => {
    const digits = text.replace(/\D/g, '').slice(0, 8);
    let day = digits.slice(0, 2);
    let month = digits.slice(2, 4);
    let year = digits.slice(4, 8);

    if (day.length === 2) {
      let dayNum = parseInt(day, 10);
      if (dayNum > 31) day = '31';
      if (dayNum === 0) day = '01';
    }

    if (month.length === 2) {
      let monthNum = parseInt(month, 10);
      if (monthNum > 12) month = '12';
      if (monthNum === 0) month = '01';
    }

    let formatted = day;
    if (month.length > 0) formatted += `/${month}`;
    if (year.length > 0) formatted += `/${year}`;

    setDate(formatted);
  };

  // Digitação manual com máscara de Horário (HH:MM) e limites de hora/minuto
  const handleTimeManualChange = (text) => {
    const digits = text.replace(/\D/g, '').slice(0, 4);
    let hours = digits.slice(0, 2);
    let mins = digits.slice(2, 4);

    if (hours.length === 2) {
      let hNum = parseInt(hours, 10);
      if (hNum > 23) hours = '23';
    }

    if (mins.length === 2) {
      let mNum = parseInt(mins, 10);
      if (mNum > 59) mins = '59';
    }

    let formatted = hours;
    if (mins.length > 0) formatted += `:${mins}`;

    setDepartureTime(formatted);
  };

  const handleSalvarEdicao = async () => {
    if (!trailName.trim()) {
      Alert.alert('Campo Obrigatório', 'Informe o nome da trilha.');
      return;
    }

    // Validação estrita de Data
    const partsDate = date.trim().split('/');
    if (partsDate.length !== 3) {
      Alert.alert('Data Inválida', 'Informe uma data válida no formato dia/mês/ano (ex: 27/10/2026).');
      return;
    }
    const dayVal = parseInt(partsDate[0], 10);
    const monthVal = parseInt(partsDate[1], 10);
    const yearVal = parseInt(partsDate[2], 10);
    const daysInMonth = new Date(yearVal, monthVal, 0).getDate();

    if (
      isNaN(dayVal) || isNaN(monthVal) || isNaN(yearVal) ||
      monthVal < 1 || monthVal > 12 ||
      dayVal < 1 || dayVal > daysInMonth ||
      yearVal < 2024 || yearVal > 2035
    ) {
      Alert.alert('Data Inválida', 'Por favor, informe uma data válida no formato dia/mês/ano.');
      return;
    }

    // Validação estrita de Horário
    const partsTime = departureTime.trim().split(':');
    if (partsTime.length !== 2) {
      Alert.alert('Horário Inválido', 'Informe o horário de saída no formato HH:MM (ex: 07:30).');
      return;
    }
    const hourVal = parseInt(partsTime[0], 10);
    const minuteVal = parseInt(partsTime[1], 10);
    if (
      isNaN(hourVal) || isNaN(minuteVal) ||
      hourVal < 0 || hourVal > 23 ||
      minuteVal < 0 || minuteVal > 59
    ) {
      Alert.alert('Horário Inválido', 'Informe um horário válido entre 00:00 e 23:59.');
      return;
    }

    setIsSaving(true);
    try {
      let finalImageUrl = coverImageUri || initialItem?.imageUrl || initialItem?.imageKey;
      if (!finalImageUrl && initialItem?.image) {
        finalImageUrl = typeof initialItem.image === 'string' ? initialItem.image : initialItem.image?.uri;
      }

      // Se a imagem for um arquivo local novo do dispositivo, faz o upload seguro para o Storage
      if (coverImageUri && !coverImageUri.startsWith('http://') && !coverImageUri.startsWith('https://')) {
        const coverPath = `trails/${guideUid}/cover_${Date.now()}.jpg`;
        finalImageUrl = await uploadImageToStorage(coverImageUri, coverPath);
      }

      const formattedDistance = distanceKm ? `${distanceKm} km` : distanceKm;

      await updateGuideTrail(trailId, guideUid, {
        title: trailName.trim(),
        name: trailName.trim(),
        description: description.trim(),
        difficulty: difficulty || 'Fácil',
        departureLocation: departureLocation.trim(),
        date: date.trim(),
        departureTime: departureTime.trim(),
        distance: formattedDistance,
        duration: duration.trim(),
        time: duration.trim(),
        capacity: parseInt(capacity.replace(/\D/g, ''), 10) || 12,
        totalSpots: parseInt(capacity.replace(/\D/g, ''), 10) || 12,
        price: parseFloat(price.replace('R$', '').replace(',', '.').trim()) || 0.0,
        imageUrl: finalImageUrl,
        guideName,
      });

      Alert.alert('Sucesso', 'Informações da trilha atualizadas com sucesso!', [
        {
          text: 'OK',
          onPress: () => {
            if (navigation?.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('HomeGuia', { initialTab: 'cadastradas' });
            }
          },
        },
      ]);
    } catch (err) {
      console.error('Erro ao atualizar trilha:', err);
      Alert.alert('Erro', err?.message || 'Não foi possível atualizar a trilha.');
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || !isGuide) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 12, color: '#6B7280', fontSize: 14 }}>
          Verificando permissões...
        </Text>
      </View>
    );
  }

  if (loadingInitial) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF9F6" />

      {/* Cabeçalho */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Feather name="chevron-left" size={28} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Evento</Text>
        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.sectionTitle}>Detalhes da Trilha</Text>

          {/* Foto de Capa */}
          <Text style={styles.label}>Foto de Capa</Text>
          <TouchableOpacity
            style={styles.coverPreviewCard}
            activeOpacity={0.8}
            onPress={handlePickCoverImage}
          >
            {coverImageUri ? (
              <Image
                source={
                  coverImageUri.startsWith('http') || coverImageUri.startsWith('file:')
                    ? { uri: coverImageUri }
                    : resolveTrailImage(coverImageUri)
                }
                style={styles.coverPreviewImage}
              />
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Feather name="upload" size={18} color="#6B7280" />
                <Text style={styles.uploadText}>Selecionar foto da galeria</Text>
              </View>
            )}
            <View style={styles.coverChangeBtn}>
              <Feather name="refresh-cw" size={14} color="#111827" />
              <Text style={styles.coverChangeText}>Trocar foto</Text>
            </View>
          </TouchableOpacity>

          {/* Nome da Trilha */}
          <Text style={styles.label}>Nome da Trilha *</Text>
          <TextInput
            style={styles.input}
            placeholder="Nome da Trilha"
            placeholderTextColor="#9CA3AF"
            value={trailName}
            onChangeText={setTrailName}
          />

          {/* Descrição */}
          <Text style={styles.label}>Descrição *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Insira a descrição"
            placeholderTextColor="#9CA3AF"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />

          {/* Nível de Dificuldade */}
          <Text style={styles.label}>Nível de Dificuldade *</Text>
          <View style={styles.difficultyContainer}>
            {['Fácil', 'Médio', 'Difícil'].map((lvl) => (
              <TouchableOpacity
                key={lvl}
                style={[
                  styles.difficultyOption,
                  difficulty === lvl && styles.difficultyOptionSelected,
                ]}
                onPress={() => setDifficulty(lvl)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.difficultyOptionText,
                    difficulty === lvl && styles.difficultyOptionTextSelected,
                  ]}
                >
                  {lvl}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Local de Saída */}
          <Text style={styles.label}>Local de Saída *</Text>
          <TextInput
            style={styles.input}
            placeholder="Insira um local"
            placeholderTextColor="#9CA3AF"
            value={departureLocation}
            onChangeText={setDepartureLocation}
          />

          {/* Linha Data e Horário */}
          <View style={styles.rowInputs}>
            <View style={styles.halfCol}>
              <Text style={styles.label}>Data *</Text>
              <TextInput
                style={styles.input}
                placeholder="DD/MM/AAAA"
                placeholderTextColor="#9CA3AF"
                value={date}
                onChangeText={handleDateManualChange}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>

            <View style={styles.halfCol}>
              <Text style={styles.label}>Horário de Saída *</Text>
              <TextInput
                style={styles.input}
                placeholder="00:00"
                placeholderTextColor="#9CA3AF"
                value={departureTime}
                onChangeText={handleTimeManualChange}
                keyboardType="numeric"
                maxLength={5}
              />
            </View>
          </View>

          {/* Linha Distância e Duração */}
          <View style={styles.rowInputs}>
            <View style={styles.halfCol}>
              <Text style={styles.label}>Distância</Text>
              <View style={styles.inputWithUnitContainer}>
                <TextInput
                  style={styles.inputInside}
                  placeholder="0.0"
                  placeholderTextColor="#9CA3AF"
                  value={distanceKm}
                  onChangeText={(text) => {
                    const clean = text.replace(/[^0-9.,]/g, '').replace(',', '.');
                    setDistanceKm(clean);
                  }}
                  keyboardType="decimal-pad"
                />
                <View style={styles.unitBadge}>
                  <Text style={styles.unitBadgeText}>km</Text>
                </View>
              </View>
            </View>

            <View style={styles.halfCol}>
              <Text style={styles.label}>Duração</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: 22 min ou 2h"
                placeholderTextColor="#9CA3AF"
                value={duration}
                onChangeText={setDuration}
              />
            </View>
          </View>

          {/* SEÇÃO 2: Detalhes das Inscrições */}
          <Text style={[styles.sectionTitle, { marginTop: 22 }]}>
            Detalhes das Inscrições
          </Text>

          <View style={styles.rowInputs}>
            <View style={styles.halfCol}>
              <Text style={styles.label}>Capacidade de Pessoas *</Text>
              <TextInput
                style={styles.input}
                placeholder="12"
                placeholderTextColor="#9CA3AF"
                value={capacity}
                onChangeText={(text) => setCapacity(text.replace(/\D/g, ''))}
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.halfCol}>
              <Text style={styles.label}>Valor por pessoa *</Text>
              <View style={styles.inputWithCurrencyContainer}>
                <Text style={styles.currencyPrefix}>R$</Text>
                <TextInput
                  style={styles.inputInsideCurrency}
                  placeholder="0,00"
                  placeholderTextColor="#9CA3AF"
                  value={price}
                  onChangeText={(text) => {
                    const clean = text.replace(/[^0-9.,]/g, '').replace(',', '.');
                    setPrice(clean);
                  }}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          </View>

          {/* Botão Salvar Alterações */}
          <TouchableOpacity
            style={[styles.submitButton, isSaving && styles.submitButtonDisabled]}
            activeOpacity={0.88}
            onPress={handleSalvarEdicao}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Salvar Alterações</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <MenuGuia activeTab="Trilhas" navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 20 : 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FAF9F6',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  headerRight: {
    width: 36,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginTop: 10,
    marginBottom: 6,
  },
  difficultyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  difficultyOption: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  difficultyOptionSelected: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  difficultyOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  difficultyOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 14,
    color: '#111827',
  },
  textArea: {
    height: 72,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  coverPreviewCard: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
  },
  coverPreviewImage: {
    width: '100%',
    height: '100%',
  },
  coverChangeBtn: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  coverChangeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  uploadPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  uploadText: {
    fontSize: 13.5,
    color: '#6B7280',
    fontWeight: '500',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  halfCol: {
    flex: 1,
  },
  inputWithUnitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    height: 48,
    paddingLeft: 14,
    paddingRight: 10,
  },
  inputInside: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: '#111827',
  },
  unitBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  unitBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  inputWithCurrencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    height: 48,
    paddingLeft: 14,
  },
  currencyPrefix: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginRight: 6,
  },
  inputInsideCurrency: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: '#111827',
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 25,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 26,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
